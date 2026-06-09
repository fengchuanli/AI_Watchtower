const news = [
  {
    category: "model",
    label: "模型",
    title: "新一代推理模型把长任务拆解做成默认能力",
    body: "模型厂商正在把计划、工具调用、验证步骤做成基础体验，Agent 产品的门槛继续下降。",
    source: "官方模型发布",
    provenance: "需保留模型厂商原始公告链接；性能和价格变化以官方说明为准。",
    trustLevel: "官方确认",
    time: "09:20",
  },
  {
    category: "product",
    label: "产品",
    title: "AI 浏览器插件开始进入企业采购清单",
    body: "从个人效率工具转向团队级权限管理、审计日志和知识库连接，产品形态更接近工作台。",
    source: "产品与企业媒体",
    provenance: "可用媒体报道补充采购动向；企业采用结论需交叉验证案例或厂商材料。",
    trustLevel: "媒体背景",
    time: "10:45",
  },
  {
    category: "research",
    label: "研究",
    title: "小模型蒸馏方案降低垂直行业部署成本",
    body: "医疗、金融、制造行业更愿意接受可控的小模型组合，而不是所有任务都交给最大模型。",
    source: "研究论文与技术博客",
    provenance: "预印本和实验结果按技术方向解读，避免直接包装成已验证行业结论。",
    trustLevel: "研究线索",
    time: "11:10",
  },
  {
    category: "policy",
    label: "政策",
    title: "AI 生成内容标识要求继续细化",
    body: "平台需要把标识、申诉和检测流程接入发布链路，内容合规会成为基础设施问题。",
    source: "监管与政策来源",
    provenance: "优先引用法规、监管机构或平台政策原文；执行影响需标明适用地区。",
    trustLevel: "官方确认",
    time: "13:35",
  },
  {
    category: "product",
    label: "产品",
    title: "AI 视频剪辑从单点生成转向完整制作流程",
    body: "脚本、分镜、素材检索、配音、字幕和品牌模板正在被打包成连续工作流。",
    source: "产品发布与创作者社区",
    provenance: "社区热度只作为发现信号；功能成熟度需以产品文档或实测为依据。",
    trustLevel: "待验证信号",
    time: "14:05",
  },
  {
    category: "model",
    label: "模型",
    title: "本地端侧模型成为隐私场景的新默认选项",
    body: "客服质检、销售助手和会议纪要开始采用云端大模型加本地小模型的混合架构。",
    source: "基础设施厂商与案例",
    provenance: "部署趋势应区分厂商主张和真实客户案例，成本结论需等待可比数据。",
    trustLevel: "媒体背景",
    time: "15:40",
  },
];

const newsGrid = document.querySelector("#newsGrid");
const filterButtons = document.querySelectorAll("[data-filter]");

function renderNews(filter = "all") {
  const visibleNews = filter === "all" ? news : news.filter((item) => item.category === filter);

  newsGrid.innerHTML = visibleNews
    .map(
      (item) => `
        <article class="news-card">
          <span class="category">${item.label}</span>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
          <p class="source-note"><strong>${item.trustLevel}</strong>${item.provenance}</p>
          <footer>
            <span>${item.source}</span>
            <time>${item.time}</time>
          </footer>
        </article>
      `,
    )
    .join("");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderNews(button.dataset.filter);
  });
});

document.querySelector("#subscribe form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector("input");
  input.value = "";
  input.placeholder = "已收到，明天见";
});

renderNews();
