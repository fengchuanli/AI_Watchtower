import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple


CacheKey = Tuple[str, str, str, str]


class EmbeddingCacheError(Exception):
    """Base error for embedding cache failures."""


class EmbeddingCacheRecordError(EmbeddingCacheError):
    """Raised when a cache record is missing required fields or has invalid values."""


@dataclass(frozen=True)
class EmbeddingCacheRecord:
    chunk_id: str
    text_hash: str
    embedding_deployment: str
    api_version: str
    vector: List[float]
    created_at: str
    updated_at: str

    @property
    def key(self) -> CacheKey:
        return (
            self.chunk_id,
            self.text_hash,
            self.embedding_deployment,
            self.api_version,
        )

    def to_json(self) -> Dict:
        return {
            "chunk_id": self.chunk_id,
            "text_hash": self.text_hash,
            "embedding_deployment": self.embedding_deployment,
            "api_version": self.api_version,
            "vector": self.vector,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def hash_text(text: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"sha256:{digest}"


def validate_vector(vector: object, record_id: str) -> List[float]:
    if not isinstance(vector, list) or not vector:
        raise EmbeddingCacheRecordError(f"{record_id} vector must be a non-empty list")

    invalid_indexes = [
        index for index, value in enumerate(vector) if isinstance(value, bool) or not isinstance(value, (int, float))
    ]
    if invalid_indexes:
        raise EmbeddingCacheRecordError(f"{record_id} vector contains a non-number at index {invalid_indexes[0]}")

    return [float(value) for value in vector]


def record_from_json(raw: Dict, line_number: int) -> EmbeddingCacheRecord:
    required_fields = [
        "chunk_id",
        "text_hash",
        "embedding_deployment",
        "api_version",
        "vector",
        "created_at",
        "updated_at",
    ]
    missing_fields = [field for field in required_fields if field not in raw]
    record_id = str(raw.get("chunk_id", f"line-{line_number}"))
    if missing_fields:
        raise EmbeddingCacheRecordError(f"{record_id} missing fields: {', '.join(missing_fields)}")

    return EmbeddingCacheRecord(
        chunk_id=str(raw["chunk_id"]),
        text_hash=str(raw["text_hash"]),
        embedding_deployment=str(raw["embedding_deployment"]),
        api_version=str(raw["api_version"]),
        vector=validate_vector(raw["vector"], record_id),
        created_at=str(raw["created_at"]),
        updated_at=str(raw["updated_at"]),
    )


def load_jsonl(path: Path) -> Iterable[Dict]:
    with path.open("r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, start=1):
            stripped = line.strip()
            if not stripped:
                continue
            try:
                yield json.loads(stripped)
            except json.JSONDecodeError as error:
                raise EmbeddingCacheRecordError(f"{path} line {line_number} is not valid JSON") from error


class EmbeddingCache:
    def __init__(self, records: Optional[Sequence[EmbeddingCacheRecord]] = None) -> None:
        self.records: Dict[CacheKey, EmbeddingCacheRecord] = {}
        self.records_by_chunk_deployment: Dict[Tuple[str, str, str], List[EmbeddingCacheRecord]] = {}
        for record in records or []:
            self.add(record)

    @classmethod
    def read(cls, path: Path) -> "EmbeddingCache":
        if not path.exists():
            return cls()

        records = []
        for line_number, raw in enumerate(load_jsonl(path), start=1):
            records.append(record_from_json(raw, line_number))
        return cls(records)

    def add(self, record: EmbeddingCacheRecord) -> None:
        self.records[record.key] = record
        chunk_key = (record.chunk_id, record.embedding_deployment, record.api_version)
        self.records_by_chunk_deployment.setdefault(chunk_key, []).append(record)

    def get(
        self,
        chunk_id: str,
        text: str,
        embedding_deployment: str,
        api_version: str,
    ) -> Optional[EmbeddingCacheRecord]:
        key = (chunk_id, hash_text(text), embedding_deployment, api_version)
        return self.records.get(key)

    def has_chunk_for_deployment(self, chunk_id: str, embedding_deployment: str, api_version: str) -> bool:
        return (chunk_id, embedding_deployment, api_version) in self.records_by_chunk_deployment

    def upsert(
        self,
        chunk_id: str,
        text: str,
        embedding_deployment: str,
        api_version: str,
        vector: List[float],
        now: Optional[str] = None,
    ) -> EmbeddingCacheRecord:
        timestamp = now or utc_now_iso()
        text_hash = hash_text(text)
        existing = self.records.get((chunk_id, text_hash, embedding_deployment, api_version))
        created_at = existing.created_at if existing else timestamp
        record = EmbeddingCacheRecord(
            chunk_id=chunk_id,
            text_hash=text_hash,
            embedding_deployment=embedding_deployment,
            api_version=api_version,
            vector=validate_vector(vector, chunk_id),
            created_at=created_at,
            updated_at=timestamp,
        )
        self.add(record)
        return record

    def write(self, path: Path) -> int:
        path.parent.mkdir(parents=True, exist_ok=True)
        records = sorted(self.records.values(), key=lambda record: record.key)
        with path.open("w", encoding="utf-8") as file:
            for record in records:
                file.write(json.dumps(record.to_json(), ensure_ascii=False) + "\n")
        return len(records)


def classify_chunk(cache: EmbeddingCache, chunk: Dict, embedding_deployment: str, api_version: str) -> str:
    chunk_id = str(chunk.get("id", ""))
    text = str(chunk.get("text", ""))
    if cache.get(chunk_id, text, embedding_deployment, api_version):
        return "hit"
    if cache.has_chunk_for_deployment(chunk_id, embedding_deployment, api_version):
        return "changed"
    return "miss"


def inspect_chunks(
    chunks: Iterable[Dict],
    cache: EmbeddingCache,
    embedding_deployment: str,
    api_version: str,
) -> Dict[str, int]:
    report = {
        "total_chunks": 0,
        "cache_hits": 0,
        "cache_misses": 0,
        "changed_chunks": 0,
    }

    for chunk in chunks:
        report["total_chunks"] += 1
        classification = classify_chunk(cache, chunk, embedding_deployment, api_version)
        if classification == "hit":
            report["cache_hits"] += 1
        elif classification == "changed":
            report["changed_chunks"] += 1
            report["cache_misses"] += 1
        else:
            report["cache_misses"] += 1

    return report
