(() => {
  "use strict";

  const STORAGE_KEY = "neox-ai-canvas-v1";
  const ASSET_TYPES = new Set(["image", "video", "audio", "text", "character", "scene", "action", "expression", "effect"]);
  const DURATION = 5;
  const ASPECT = "16:9";

  const PROJECTS = [
    { id: "p1", name: "项目一", canvases: [{ id: "c1", name: "画布 1" }, { id: "c2", name: "画布 2" }] },
    { id: "p2", name: "演示项目", canvases: [{ id: "c1", name: "主画布" }] }
  ];

  const TYPES = {
    image: { label: "图片资产", name: "未命名图片", desc: "本地图片" },
    video: { label: "视频资产", name: "未命名视频", desc: "本地视频" },
    audio: { label: "音频资产", name: "未命名音频", desc: "本地音频" },
    text: { label: "文本要求", name: "文本要求", desc: "提示与约束" },
    character: { label: "人物资产", name: "未命名人物", desc: "人物参考" },
    scene: { label: "场景资产", name: "未命名场景", desc: "场景参考" },
    action: { label: "动作参考", name: "未命名动作", desc: "动作与运镜" },
    expression: { label: "表情资产", name: "未命名表情", desc: "表情参考" },
    effect: { label: "特效资产", name: "未命名特效", desc: "特效参考" },
    library: { label: "NEOX 素材库", name: "NEOX 素材库", desc: "打开素材库" },
    shot: { label: "镜头选择", name: "镜头选择", desc: "打开镜头库" },
    light: { label: "专业光影台", name: "专业光影台", desc: "布光示意" },
    story: { label: "小说故事构思", name: "小说故事构思", desc: "故事卡片" },
    model: { label: "视频模型", name: "NEOX Video Mock", desc: "模拟生成" },
    output: { label: "视频输出", name: "视频输出", desc: "结果节点" },
    start: { label: "开始使用", name: "开始使用", desc: "操作引导" }
  };

  const MODELS = {
    video: { name: "NEOX Video Mock", desc: "综合画面生成" },
    motion: { name: "NEOX Motion Mock", desc: "侧重动作与运镜" },
    lipsync: { name: "NEOX LipSync Mock", desc: "侧重口型与音频" }
  };

  const STATUS_TEXT = {
    idle: "未运行",
    analyzing: "分析中",
    generating: "生成中",
    done: "已完成",
    failed: "失败"
  };

  const RESULT_TEXT = { adopted: "已采用", partial: "部分采用", ignored: "未采用" };

  const STAGES = [
    { label: "检查连接", status: "analyzing" },
    { label: "读取关联资产", status: "analyzing" },
    { label: "AI 自动选择有效资产", status: "analyzing" },
    { label: "分析人物与场景", status: "analyzing" },
    { label: "整理提示要求", status: "analyzing" },
    { label: "模拟生成视频", status: "generating" },
    { label: "输出结果", status: "generating" }
  ];

  const TOUR = [
    { title: "添加第一个节点", text: "点击 +，选择你需要的工具" },
    { title: "拖动空白处", text: "按住画布空白区域即可平移" },
    { title: "滚轮缩放", text: "滚动鼠标滚轮放大或缩小画布" },
    { title: "运行工作流", text: "打开视频模型节点，点击运行工作流" }
  ];

  const ACCEPT = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*",
    character: "image/*",
    scene: "image/*",
    action: "video/*,image/*",
    expression: "image/*",
    effect: "image/*"
  };

  const LIBRARY_CATS = [
    { id: "all", label: "全部", icon: "library" },
    { id: "character", label: "人物", icon: "character" },
    { id: "scene", label: "场景", icon: "scene" },
    { id: "action", label: "动作", icon: "action" },
    { id: "expression", label: "表情", icon: "expression" },
    { id: "effect", label: "特效", icon: "effect" }
  ];

  const MINE_KINDS = {
    character: { node: "character", kind: "人物图片" },
    scene: { node: "scene", kind: "场景图片" },
    action: { node: "action", kind: "动作参考" },
    expression: { node: "expression", kind: "表情参考" },
    effect: { node: "effect", kind: "特效素材" },
    image: { node: "image", kind: "本地图片" }
  };

  const CATALOG = [
    { id: "rain-city", name: "雨夜城市", category: "scene", kind: "场景图片", aspect: "16:9", licensed: true },
    { id: "warm-office", name: "温暖办公室", category: "scene", kind: "场景图片", aspect: "16:9", licensed: false },
    { id: "future-lab", name: "未来实验室", category: "scene", kind: "场景图片", aspect: "16:9", licensed: false },
    { id: "young-lead", name: "少年主角", category: "character", kind: "人物图片", aspect: "3:4", licensed: false },
    { id: "cool-profile", name: "冷色侧脸", category: "character", kind: "人物图片", aspect: "3:4", licensed: false },
    { id: "sprint", name: "冲刺动作", category: "action", kind: "动作参考", aspect: "16:9", licensed: true },
    { id: "smile", name: "微笑表情", category: "expression", kind: "表情参考", aspect: "1:1", licensed: false },
    { id: "blue-particle", name: "蓝色粒子", category: "effect", kind: "特效素材", aspect: "1:1", licensed: false }
  ];

  const MINE_KEY = "neox-ai-mylib-v1";
  const LIBRARY_TOUR_KEY = "neox-ai-library-tour";

  const SHOTS = [
    { id: "aerial-establish", file: "01-aerial-establish.png", name: "航拍建立", group: "开场与场景", scale: "大远景", angle: "高空俯拍", move: "航拍下降", hint: "镜头示意", arrow: "down" },
    { id: "city-push-in", file: "02-city-push-in.png", name: "城市推进", group: "开场与场景", scale: "远景", angle: "街道入口平视", move: "向前推进", hint: "镜头示意", arrow: "forward" },
    { id: "rise-reveal", file: "03-rise-reveal.png", name: "上升揭示", group: "开场与场景", scale: "全景", angle: "低机位升起", move: "上升揭示", hint: "镜头示意", arrow: "up" },
    { id: "rainy-establishing", file: "04-rainy-establishing.png", name: "雨夜空镜", group: "开场与场景", scale: "远景", angle: "平视", move: "固定", hint: "", arrow: "" },
    { id: "hero-entrance", file: "05-hero-entrance.png", name: "人物出场", group: "人物与对白", scale: "全身", angle: "低机位", move: "固定", hint: "", arrow: "" },
    { id: "emotion-closeup", file: "06-emotion-closeup.png", name: "情绪特写", group: "人物与对白", scale: "特写", angle: "平视近景", move: "固定", hint: "", arrow: "" },
    { id: "over-shoulder-dialogue", file: "07-over-shoulder-dialogue.png", name: "过肩对话", group: "人物与对白", scale: "中近景", angle: "过肩", move: "固定", hint: "", arrow: "" },
    { id: "reverse-reaction", file: "08-reverse-reaction.png", name: "视线反打", group: "人物与对白", scale: "近景", angle: "反打", move: "固定", hint: "", arrow: "" },
    { id: "low-chase", file: "09-low-chase.png", name: "低位冲刺", group: "动作与追逐", scale: "中全景", angle: "贴地低机位", move: "向前跟拍", hint: "镜头示意", arrow: "forward" },
    { id: "side-tracking", file: "10-side-tracking.png", name: "侧向追逐", group: "动作与追逐", scale: "中景", angle: "侧面平视", move: "横向跟拍", hint: "镜头示意", arrow: "right" },
    { id: "fight-orbit", file: "11-fight-orbit.png", name: "打斗环绕", group: "动作与追逐", scale: "中全景", angle: "斜侧方", move: "环绕", hint: "镜头示意", arrow: "orbit" },
    { id: "whip-impact", file: "12-whip-impact.png", name: "冲击甩镜", group: "动作与追逐", scale: "中近景", angle: "平视", move: "甩镜", hint: "镜头示意", arrow: "whip" },
    { id: "suspense-peek", file: "13-suspense-peek.png", name: "窥视推进", group: "悬疑与情绪", scale: "中景", angle: "门框后窥视", move: "缓慢推进", hint: "镜头示意", arrow: "forward" },
    { id: "walk-away", file: "14-walk-away.png", name: "背影远离", group: "悬疑与情绪", scale: "全景", angle: "背后平视", move: "背后跟随", hint: "镜头示意", arrow: "forward" },
    { id: "dutch-danger", file: "15-dutch-danger.png", name: "倾斜危机", group: "悬疑与情绪", scale: "中景", angle: "荷兰角", move: "倾斜固定", hint: "", arrow: "" },
    { id: "dolly-zoom", file: "16-dolly-zoom.png", name: "眩晕变焦", group: "悬疑与情绪", scale: "中景", angle: "平视居中", move: "滑动变焦", hint: "效果示意", arrow: "" },
    { id: "character-showcase", file: "17-character-showcase.png", name: "角色定妆", group: "展示与细节", scale: "全身", angle: "平视", move: "固定", hint: "", arrow: "" },
    { id: "product-orbit", file: "18-product-orbit.png", name: "产品环绕", group: "展示与细节", scale: "产品特写", angle: "45度", move: "环绕", hint: "镜头示意", arrow: "orbit" },
    { id: "material-macro", file: "19-material-macro.png", name: "材质微距", group: "展示与细节", scale: "微距", angle: "平视微距", move: "固定", hint: "", arrow: "" },
    { id: "turn-reveal", file: "20-turn-reveal.png", name: "转身亮相", group: "展示与细节", scale: "中景", angle: "平视", move: "固定", hint: "", arrow: "" },
    { id: "particle-slowmo", file: "21-particle-slowmo.png", name: "粒子慢镜", group: "奇幻与科幻", scale: "中景", angle: "平视", move: "慢动作", hint: "", arrow: "" },
    { id: "first-person-travel", file: "22-first-person-travel.png", name: "主观穿越", group: "奇幻与科幻", scale: "主观镜头", angle: "第一人称", move: "向前穿越", hint: "镜头示意", arrow: "forward" },
    { id: "hologram-overhead", file: "23-hologram-overhead.png", name: "全息俯视", group: "奇幻与科幻", scale: "全景", angle: "正上方俯拍", move: "固定俯视", hint: "", arrow: "" },
    { id: "teleport-reveal", file: "24-teleport-reveal.png", name: "瞬移揭示", group: "奇幻与科幻", scale: "中全景", angle: "平视", move: "光效揭示", hint: "", arrow: "" }
  ];

  const SHOT_GROUPS = ["开场与场景", "人物与对白", "动作与追逐", "悬疑与情绪", "展示与细节", "奇幻与科幻"];
  const SHOT_SCALES = ["远景", "全景", "中景", "近景", "特写"];
  const SHOT_HORIZ = ["正面", "左前", "侧面", "右前", "背面", "过肩"];
  const SHOT_HEIGHTS = ["俯拍", "平视", "仰拍", "贴地"];
  const SHOT_MOTIONS = ["固定", "推", "拉", "摇", "移", "跟随", "环绕", "升降"];
  const SHOT_SPEEDS = ["慢", "中", "快"];
  const SHOT_DIRS = {
    固定: [],
    推: ["向前", "向后"],
    拉: ["向后", "向前"],
    摇: ["向左", "向右", "向上", "向下"],
    移: ["向左", "向右", "向上", "向下"],
    跟随: ["向前", "向后", "向左", "向右"],
    环绕: ["顺时针", "逆时针"],
    升降: ["上升", "下降"]
  };
  const SHOT_INPUT_TYPES = new Set(["character", "scene", "image"]);
  const MY_SHOT_KEY = "neox-ai-my-shots-v1";
  const SHOT_SETUP = {
    "aerial-establish": { desc: "高空俯看雨夜街道，人物很小，突出城市规模。", scale: "远景", horiz: "正面", height: "俯拍", motion: "升降", direction: "下降", speed: "慢", duration: 5 },
    "city-push-in": { desc: "从街口望向远处的人，建筑和霓虹拉出纵深。", scale: "远景", horiz: "正面", height: "平视", motion: "推", direction: "向前", speed: "中", duration: 5 },
    "rise-reveal": { desc: "前景是屋顶上的人，身后展开整座天际线。", scale: "全景", horiz: "背面", height: "平视", motion: "升降", direction: "上升", speed: "中", duration: 5 },
    "rainy-establishing": { desc: "没有主要人物，用雨、倒影和霓虹交代气氛。", scale: "远景", horiz: "正面", height: "平视", motion: "固定", direction: "", speed: "慢", duration: 4 },
    "hero-entrance": { desc: "人物全身入画，低机位，背后有轮廓光。", scale: "全景", horiz: "正面", height: "仰拍", motion: "固定", direction: "", speed: "中", duration: 4 },
    "emotion-closeup": { desc: "同一人物的面部近景，眼神和表情清楚。", scale: "特写", horiz: "正面", height: "平视", motion: "固定", direction: "", speed: "慢", duration: 3 },
    "over-shoulder-dialogue": { desc: "前景是一人肩背，焦点落在对面人物。", scale: "近景", horiz: "过肩", height: "平视", motion: "固定", direction: "", speed: "中", duration: 4 },
    "reverse-reaction": { desc: "同一段对话，改拍另一人的反应。", scale: "近景", horiz: "过肩", height: "平视", motion: "固定", direction: "", speed: "中", duration: 3 },
    "low-chase": { desc: "贴地低机位，人物朝前冲刺，路面反光明显。", scale: "中景", horiz: "正面", height: "贴地", motion: "跟随", direction: "向前", speed: "快", duration: 4 },
    "side-tracking": { desc: "人物横向奔跑，能看到完整动作和侧面街道。", scale: "中景", horiz: "侧面", height: "平视", motion: "移", direction: "向右", speed: "快", duration: 4 },
    "fight-orbit": { desc: "两人斜侧对峙，画面留出环绕的空间。", scale: "中景", horiz: "侧面", height: "平视", motion: "环绕", direction: "顺时针", speed: "中", duration: 5 },
    "whip-impact": { desc: "击中的一刻主体清楚，边缘带方向性动势。", scale: "近景", horiz: "正面", height: "平视", motion: "摇", direction: "向右", speed: "快", duration: 2 },
    "suspense-peek": { desc: "从门框后观察人物，往前靠近。", scale: "中景", horiz: "正面", height: "平视", motion: "推", direction: "向前", speed: "慢", duration: 5 },
    "walk-away": { desc: "人物背对镜头走向街道深处，环境留得很大。", scale: "全景", horiz: "背面", height: "平视", motion: "跟随", direction: "向后", speed: "慢", duration: 5 },
    "dutch-danger": { desc: "地平线倾斜，人物处于紧张站姿。", scale: "中景", horiz: "正面", height: "平视", motion: "固定", direction: "", speed: "中", duration: 3 },
    "dolly-zoom": { desc: "人物留在画面中心，背景透视被拉开。这是效果示意。", scale: "中景", horiz: "正面", height: "平视", motion: "推", direction: "向前", speed: "中", duration: 4 },
    "character-showcase": { desc: "人物从头到脚清楚可见，背景简洁，突出造型。", scale: "全景", horiz: "正面", height: "平视", motion: "固定", direction: "", speed: "慢", duration: 4 },
    "product-orbit": { desc: "蓝色六边形装置以约 45 度展示立体结构。", scale: "特写", horiz: "左前", height: "平视", motion: "环绕", direction: "顺时针", speed: "慢", duration: 5 },
    "material-macro": { desc: "装置表面的金属、水珠和青色光缝。", scale: "特写", horiz: "正面", height: "平视", motion: "固定", direction: "", speed: "慢", duration: 3 },
    "turn-reveal": { desc: "人物转头看向镜头的瞬间。", scale: "中景", horiz: "左前", height: "平视", motion: "摇", direction: "向左", speed: "慢", duration: 3 },
    "particle-slowmo": { desc: "动作停在半空，蓝色粒子悬浮，主体仍然清楚。", scale: "中景", horiz: "正面", height: "平视", motion: "固定", direction: "", speed: "慢", duration: 4 },
    "first-person-travel": { desc: "以人物视角穿过有纵深的雨夜街道。", scale: "远景", horiz: "正面", height: "平视", motion: "推", direction: "向前", speed: "快", duration: 4 },
    "hologram-overhead": { desc: "正上方俯拍人物和脚下的蓝色全息圆环。", scale: "全景", horiz: "正面", height: "俯拍", motion: "固定", direction: "", speed: "慢", duration: 4 },
    "teleport-reveal": { desc: "人物从青色光柱中出现，轮廓仍然可辨。", scale: "中景", horiz: "正面", height: "平视", motion: "固定", direction: "", speed: "中", duration: 3 }
  };
  const myShots = [];
  const shotEditor = { tab: "preset", query: "", draft: null };

  const LIGHT_ROLES = ["主光", "补光", "轮廓光", "背景光", "环境光"];
  const LIGHT_SOURCES = ["太阳", "窗户", "灯具", "屏幕", "霓虹", "火焰", "自定义"];
  const LIGHT_TIMES = ["保持不变", "渐亮", "渐暗", "闪烁"];
  const LIGHT_FIGURES = ["lit", "rim", "silhouette", "half", "eyes", "uplight"];
  const MY_LIGHT_KEY = "neox-ai-my-lights-v1";
  const LIGHT_INPUT_TYPES = new Set(["character", "scene", "image"]);
  const myLights = [];
  const lightEditor = { tab: "ref", draft: null, selectedId: "", compare: false, baseline: null, dragging: "", baseOpen: "" };

  function lx(role, source, x, z, height, brightness, spread, softness, shadow, color, time) {
    return { role, source, x, z, height, brightness, spread, softness, shadow, color, time: time || "保持不变", on: true, kelvin: 0 };
  }
  function lk(sky0, sky1, figure, shadowLen, fog, window, blinds, dapple, rain, rays, neon, moon, fire, bolt, holo, door, wet, lamp, trees, propX) {
    return { sky: [sky0, sky1], figure, shadowLen, fog, window, blinds, dapple, rain, rays, neon, moon, fire, bolt, holo, door, wet, lamp, trees, propX };
  }
  const LIGHT_BASES = [
    { id: "dawn-soft", group: "自然光", name: "清晨柔光", desc: "清晨的光很柔，偏蓝，或刚被窗边暖到。", variants: [
      { id: "dawn-mist", name: "晨雾蓝", desc: "蓝灰晨雾把远处压平。", look: lk("#8eafd4", "#24364c", "lit", 8, 0.62, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0, 0, 0, 0, 70), lights: [lx("主光", "太阳", 58, 22, 38, 48, 78, 86, 12, "#b7d4ff"), lx("环境光", "自定义", 50, 70, 18, 28, 90, 92, 6, "#6d8caf")] },
      { id: "dawn-window", name: "窗边暖光", desc: "左侧窗户送进一块暖光。", look: lk("#243044", "#101820", "lit", 16, 0.08, 2, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 28), lights: [lx("主光", "窗户", 16, 40, 48, 72, 46, 58, 28, "#ffb56a"), lx("补光", "自定义", 78, 55, 40, 22, 50, 70, 10, "#8ea4c4")] },
      { id: "dawn-back", name: "晨光逆光", desc: "人在亮处前面，轮廓被晨光勾出。", look: lk("#ffd7a8", "#6a4a32", "rim", 36, 0.12, 0, 0, 0, 0, 2, "", 0, 0, 0, 0, 0, 0, 0, 0, 250), lights: [lx("轮廓光", "太阳", 70, 82, 46, 86, 40, 30, 48, "#ffe0b0"), lx("补光", "自定义", 40, 24, 30, 18, 40, 60, 10, "#c4b39a")] }
    ]},
    { id: "noon-hard", group: "自然光", name: "正午硬光", desc: "顶光很硬，影子短而清楚。", variants: [
      { id: "noon-top", name: "顶部直射", desc: "光从正上方砸下来。", look: lk("#9ecfff", "#1a3348", "lit", 6, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "太阳", 50, 48, 92, 90, 22, 12, 70, "#fff6d8")] },
      { id: "noon-dapple", name: "树影斑驳", desc: "树叶把硬光切成碎块。", look: lk("#7fbf7a", "#163028", "lit", 10, 0, 0, 0, 11, 0, 1, "", 0, 0, 0, 0, 0, 0, 0, 1, 40), lights: [lx("主光", "太阳", 46, 30, 84, 78, 34, 18, 55, "#fff1c2")] },
      { id: "noon-grid", name: "窗格锐影", desc: "窗格在脸上和地上切出硬边。", look: lk("#d7e6f5", "#1c2c3c", "half", 14, 0, 3, 6, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 36), lights: [lx("主光", "窗户", 22, 42, 55, 84, 28, 8, 72, "#fffaf0")] }
    ]},
    { id: "dusk-gold", group: "自然光", name: "黄昏金光", desc: "低角度的金色光，影子被拉长。", variants: [
      { id: "dusk-rim", name: "金色轮廓", desc: "金边包住头发和肩膀。", look: lk("#ffb15a", "#3a2418", "rim", 28, 0.05, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0, 0, 0, 0, 230), lights: [lx("轮廓光", "太阳", 78, 74, 36, 80, 36, 28, 40, "#ffb03a")] },
      { id: "dusk-cut", name: "落日剪影", desc: "橙红天空前只剩剪影。", look: lk("#ff7a3c", "#4a1c14", "silhouette", 40, 0, 0, 0, 0, 0, 0, "", 1, 0, 0, 0, 0, 0, 0, 0, 250), lights: [lx("背景光", "太阳", 62, 88, 28, 92, 70, 40, 20, "#ff6a2a")] },
      { id: "dusk-long", name: "地面长影", desc: "贴地的光把影子拉过地面。", look: lk("#e8a060", "#2a1c14", "lit", 72, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 20), lights: [lx("主光", "太阳", 12, 70, 16, 76, 50, 22, 80, "#ffc27a")] }
    ]},
    { id: "overcast", group: "自然光", name: "阴天漫射", desc: "没有明确方向，反差很低。", variants: [
      { id: "over-rain", name: "雨前冷灰", desc: "冷灰天空，雨丝已经下来。", look: lk("#8d97a3", "#2a3138", "lit", 4, 0.2, 0, 0, 0, 1, 0, "", 0, 0, 0, 0, 0, 1, 0, 0, 40), lights: [lx("环境光", "自定义", 50, 20, 70, 42, 90, 88, 8, "#c5ced6")] },
      { id: "over-fog", name: "薄雾低反差", desc: "雾把明暗差吃掉。", look: lk("#b7c0c8", "#4a555c", "lit", 2, 0.72, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 80), lights: [lx("环境光", "自定义", 48, 40, 50, 36, 96, 94, 4, "#d5dde4")] },
      { id: "over-sky", name: "柔和天光", desc: "大面积天光，几乎没有影子。", look: lk("#d5e4f2", "#243848", "lit", 3, 0.15, 1, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 150), lights: [lx("主光", "太阳", 50, 16, 64, 50, 88, 90, 6, "#e7f2ff"), lx("补光", "自定义", 50, 60, 30, 24, 70, 80, 4, "#b7c8da")] }
    ]},
    { id: "front-soft", group: "人物布光", name: "正面柔光", desc: "脸被均匀照亮，适合看清五官。", variants: [
      { id: "front-even", name: "均匀明亮", desc: "正面大软光，脸上几乎没有硬影。", look: lk("#1c3048", "#0c1828", "lit", 6, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "灯具", 50, 18, 52, 74, 62, 82, 14, "#fff4e4"), lx("补光", "灯具", 50, 30, 40, 36, 70, 84, 8, "#d5e4ff")] },
      { id: "front-sidewin", name: "侧窗柔光", desc: "窗光从左侧柔和包过来。", look: lk("#1a2838", "#101820", "lit", 12, 0, 1, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 24), lights: [lx("主光", "窗户", 14, 36, 48, 66, 54, 74, 22, "#ffe0bf")] },
      { id: "front-eyes", name: "眼部亮点", desc: "环境压暗，只在眼睛里留两个亮点。", look: lk("#0c1420", "#070d16", "eyes", 8, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "灯具", 42, 22, 48, 40, 16, 40, 30, "#fff8ea"), lx("补光", "灯具", 60, 22, 48, 28, 12, 36, 20, "#d7e8ff")] }
    ]},
    { id: "side-45", group: "人物布光", name: "45°侧光", desc: "从斜前方来，脸开始有明暗交界。", variants: [
      { id: "side-mild", name: "轻微立体", desc: "交界线很轻，立体感刚刚出来。", look: lk("#16283c", "#0c1624", "lit", 16, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 40), lights: [lx("主光", "灯具", 28, 30, 52, 70, 40, 48, 36, "#fff1d8"), lx("补光", "灯具", 74, 36, 46, 28, 36, 60, 12, "#9eb6d4")] },
      { id: "side-half", name: "半脸明暗", desc: "亮的一半和暗的一半分开。", look: lk("#121c2c", "#080e16", "half", 20, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 30), lights: [lx("主光", "灯具", 22, 34, 50, 82, 32, 24, 62, "#ffe7c4")] },
      { id: "side-strong", name: "强烈侧影", desc: "暗面几乎黑掉，只留一条亮边。", look: lk("#101820", "#060a10", "half", 24, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 18), lights: [lx("主光", "灯具", 12, 40, 48, 88, 24, 10, 84, "#fff6e8"), lx("轮廓光", "灯具", 86, 60, 50, 30, 18, 16, 40, "#7eb6ff")] }
    ]},
    { id: "back-rim", group: "人物布光", name: "逆光轮廓", desc: "脸在暗处，边缘被光勾出来。", variants: [
      { id: "rim-warm", name: "暖色发丝", desc: "头发边缘是一圈暖金。", look: lk("#2a1c14", "#100c0a", "rim", 18, 0, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0, 0, 0, 0, 250), lights: [lx("轮廓光", "太阳", 50, 86, 58, 84, 30, 22, 24, "#ffb15a")] },
      { id: "rim-cold", name: "冷蓝边缘", desc: "轮廓是冷蓝色，像夜色里的边光。", look: lk("#102033", "#070d16", "rim", 16, 0.1, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0, 0, 0, 0, 250), lights: [lx("轮廓光", "自定义", 64, 84, 52, 80, 26, 18, 20, "#7ef6ff")] },
      { id: "rim-cut", name: "人物剪影", desc: "背景很亮，人物完全变成剪影。", look: lk("#d7e8ff", "#3a73ff", "silhouette", 10, 0, 1, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 200), lights: [lx("背景光", "窗户", 50, 90, 50, 94, 80, 30, 8, "#e7f4ff")] }
    ]},
    { id: "top-spot", group: "人物布光", name: "顶部聚光", desc: "光从头顶下来，周围比较暗。", variants: [
      { id: "top-stage", name: "舞台独光", desc: "一块小而亮的舞台光。", look: lk("#070b12", "#05070c", "lit", 12, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "灯具", 50, 46, 94, 92, 18, 14, 60, "#fff6d2")] },
      { id: "top-soft", name: "柔和顶光", desc: "顶光摊开，边缘发虚。", look: lk("#121c2c", "#0c1420", "lit", 8, 0.08, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "灯具", 50, 40, 86, 64, 58, 78, 22, "#ffe8c8")] },
      { id: "top-hard", name: "狭窄硬顶光", desc: "很窄的硬光，眼窝容易发黑。", look: lk("#0c1218", "#06080c", "lit", 14, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "灯具", 50, 44, 96, 88, 10, 6, 78, "#fffaf0")] }
    ]},
    { id: "room-window", group: "室内光", name: "窗边自然光", desc: "人靠窗，光的软硬由天气决定。", variants: [
      { id: "win-sun", name: "晴天直射", desc: "阳光直接切进室内。", look: lk("#1a2838", "#101820", "lit", 22, 0, 2, 0, 0, 0, 2, "", 0, 0, 0, 0, 0, 0, 0, 0, 26), lights: [lx("主光", "窗户", 18, 38, 52, 86, 30, 12, 64, "#fff3d2")] },
      { id: "win-cloud", name: "阴天漫射", desc: "同一扇窗，光变成一整块软光。", look: lk("#243240", "#141c24", "lit", 8, 0.18, 1, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 26), lights: [lx("主光", "窗户", 18, 36, 50, 58, 64, 80, 16, "#d5e2ef")] },
      { id: "win-blind", name: "百叶窗影", desc: "百叶在人物和墙上留下条纹。", look: lk("#1c2834", "#10161c", "half", 16, 0, 3, 8, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 22), lights: [lx("主光", "窗户", 16, 40, 48, 74, 36, 16, 58, "#ffe6c4")] }
    ]},
    { id: "room-warm", group: "室内光", name: "室内暖灯", desc: "人造暖光，范围小，颜色偏橙。", variants: [
      { id: "warm-desk", name: "台灯", desc: "左侧台灯打出一块暖池。", look: lk("#1a140e", "#100c0a", "lit", 14, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 1, 0, 48), lights: [lx("主光", "灯具", 24, 46, 42, 76, 34, 40, 40, "#ffb15a")] },
      { id: "warm-pend", name: "吊灯", desc: "暖光从天花板中间落下来。", look: lk("#24180f", "#120e0c", "lit", 12, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 2, 0, 160), lights: [lx("主光", "灯具", 50, 42, 88, 70, 40, 36, 36, "#ffc27a")] },
      { id: "warm-candle", name: "烛光", desc: "很小的橙色火光，边缘在跳。", look: lk("#140e0c", "#0c0808", "uplight", 10, 0, 0, 0, 0, 0, 0, "", 0, 1, 0, 0, 0, 0, 3, 0, 70), lights: [lx("主光", "火焰", 38, 62, 12, 54, 22, 48, 30, "#ff8a3a", "闪烁")] }
    ]},
    { id: "screen-cool", group: "室内光", name: "屏幕冷光", desc: "脸被屏幕的冷光从前方或侧方打亮。", variants: [
      { id: "scr-phone", name: "手机", desc: "一小块青色光从下方偏前打到下巴。", look: lk("#0c1420", "#070c14", "uplight", 8, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 120), lights: [lx("主光", "屏幕", 56, 22, 18, 62, 16, 28, 24, "#7ef6ff")] },
      { id: "scr-pc", name: "电脑", desc: "比手机更宽的蓝色光铺在脸上。", look: lk("#101828", "#080e16", "lit", 8, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 200), lights: [lx("主光", "屏幕", 62, 28, 36, 58, 40, 34, 18, "#4aa3ff")] },
      { id: "scr-tv", name: "电视闪动", desc: "侧面大屏幕一明一暗。", look: lk("#10141c", "#080a10", "half", 10, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 250), lights: [lx("主光", "屏幕", 82, 40, 42, 70, 48, 30, 22, "#d7e8ff", "闪烁"), lx("补光", "屏幕", 78, 48, 36, 24, 30, 20, 10, "#3a73ff", "闪烁")] }
    ]},
    { id: "door-beam", group: "室内光", name: "门缝光束", desc: "光从门的缝或打开的门口进来。", variants: [
      { id: "door-slit", name: "窄光", desc: "一条很窄的竖直光。", look: lk("#100e0c", "#080808", "lit", 18, 0.05, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0.18, 0, 0, 0, 250), lights: [lx("主光", "自定义", 78, 48, 50, 80, 8, 10, 50, "#fff6e0")] },
      { id: "door-open", name: "开门扩光", desc: "门开大后，光楔变宽。", look: lk("#1a160f", "#0c0c0c", "lit", 20, 0, 0, 0, 0, 0, 2, "", 0, 0, 0, 0, 0.55, 0, 0, 0, 236), lights: [lx("主光", "太阳", 80, 55, 48, 84, 36, 22, 42, "#ffe7c2")] },
      { id: "door-hall", name: "走廊背光", desc: "走廊尽头很亮，人物背对那盏光。", look: lk("#141820", "#080a0e", "rim", 16, 0.12, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0.8, 0, 0, 0, 250), lights: [lx("背景光", "灯具", 50, 92, 46, 78, 28, 20, 16, "#fff1d4"), lx("轮廓光", "灯具", 50, 84, 50, 40, 20, 16, 12, "#ffe0a8")] }
    ]},
    { id: "moon-cool", group: "夜景光", name: "冷月光", desc: "夜间的冷色月光，影子偏蓝。", variants: [
      { id: "moon-side", name: "侧面月光", desc: "月亮在左上，照到人物一侧。", look: lk("#0e1c33", "#070d16", "half", 22, 0.08, 0, 0, 0, 0, 0, "", 1, 0, 0, 0, 0, 0, 0, 0, 46), lights: [lx("主光", "自定义", 22, 30, 72, 58, 36, 34, 40, "#c5dcff")] },
      { id: "moon-win", name: "窗外月影", desc: "月光穿过窗户，在地上留一块冷光。", look: lk("#101828", "#070c14", "lit", 18, 0, 1, 4, 0, 0, 1, "", 1, 0, 0, 0, 0, 0, 0, 0, 30), lights: [lx("主光", "窗户", 24, 42, 60, 52, 30, 28, 36, "#d0e4ff")] },
      { id: "moon-halo", name: "雾中月晕", desc: "雾把月亮晕成一圈。", look: lk("#1a2a40", "#0c1624", "lit", 8, 0.55, 0, 0, 0, 0, 0, "", 1, 0, 0, 0, 0, 0, 0, 0, 200), lights: [lx("主光", "自定义", 68, 24, 70, 46, 60, 70, 14, "#d7e6ff"), lx("环境光", "自定义", 50, 50, 30, 20, 80, 90, 4, "#6e86a8")] }
    ]},
    { id: "rain-neon", group: "夜景光", name: "雨夜霓虹", desc: "彩色霓虹打在雨和湿地上。", variants: [
      { id: "neon-pb", name: "蓝粉交错", desc: "左侧粉、右侧蓝，中间的人被两边染色。", look: lk("#120818", "#07060e", "lit", 12, 0.1, 0, 0, 0, 1, 0, "pb", 0, 0, 0, 0, 0, 1, 0, 0, 40), lights: [lx("主光", "霓虹", 16, 40, 48, 70, 40, 36, 24, "#ff4f9a"), lx("补光", "霓虹", 84, 42, 46, 64, 38, 34, 20, "#3aa0ff")] },
      { id: "neon-rc", name: "红青对比", desc: "红和青对撞，脸色被撕成两块。", look: lk("#1a080c", "#061016", "half", 14, 0, 0, 0, 0, 1, 0, "rc", 0, 0, 0, 0, 0, 0, 0, 0, 30), lights: [lx("主光", "霓虹", 18, 36, 50, 74, 32, 22, 40, "#ff3b4e"), lx("轮廓光", "霓虹", 82, 40, 52, 68, 30, 20, 30, "#14e0d0")] },
      { id: "neon-wet", name: "路面反射", desc: "霓虹主要亮在湿漉漉的路面上。", look: lk("#100818", "#07060c", "lit", 10, 0.16, 0, 0, 0, 1, 0, "pb", 0, 0, 0, 0, 0, 1, 0, 0, 70), lights: [lx("背景光", "霓虹", 30, 70, 30, 66, 50, 40, 16, "#ff5fa8"), lx("背景光", "霓虹", 74, 74, 28, 60, 48, 40, 14, "#3ad0ff")] }
    ]},
    { id: "lone-lamp", group: "夜景光", name: "孤独路灯", desc: "夜里只有一盏路灯。", variants: [
      { id: "lamp-cone", name: "头顶光锥", desc: "光锥从正上方罩住人物。", look: lk("#10151c", "#07090c", "lit", 16, 0.12, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 2, 0, 160), lights: [lx("主光", "灯具", 50, 42, 90, 78, 26, 18, 58, "#ffe6b0")] },
      { id: "lamp-back", name: "侧后街灯", desc: "路灯在侧后方，脸的大部分在暗处。", look: lk("#12161c", "#080a0e", "rim", 20, 0.08, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0, 0, 2, 0, 250), lights: [lx("主光", "灯具", 82, 72, 78, 74, 30, 20, 46, "#ffd98a")] },
      { id: "lamp-fog", name: "雾中灯晕", desc: "雾把路灯晕开。", look: lk("#1a2228", "#0c1216", "lit", 8, 0.6, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0, 0, 2, 0, 200), lights: [lx("主光", "灯具", 62, 36, 80, 60, 48, 70, 18, "#ffe7c0"), lx("环境光", "自定义", 50, 50, 20, 16, 80, 90, 4, "#8a939c")] }
    ]},
    { id: "rb-cross", group: "夜景光", name: "红蓝对打光", desc: "红和蓝从不同方向打在同一个人身上。", variants: [
      { id: "rb-lr", name: "左右对打", desc: "左红右蓝。", look: lk("#120810", "#081018", "half", 12, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 40), lights: [lx("主光", "霓虹", 14, 40, 48, 76, 34, 24, 36, "#ff3355"), lx("主光", "霓虹", 86, 40, 48, 74, 34, 24, 34, "#2f7bff")] },
      { id: "rb-fb", name: "前后对打", desc: "前面红，后面蓝。", look: lk("#16080e", "#071018", "rim", 12, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "霓虹", 48, 16, 42, 70, 36, 28, 30, "#ff4060"), lx("轮廓光", "霓虹", 52, 86, 48, 68, 30, 22, 18, "#3a7bff")] },
      { id: "rb-flash", name: "交替闪烁", desc: "两盏灯轮流闪。", look: lk("#10080e", "#070c14", "lit", 10, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 80), lights: [lx("主光", "霓虹", 22, 36, 50, 72, 30, 20, 30, "#ff3355", "闪烁"), lx("补光", "霓虹", 78, 38, 50, 70, 30, 20, 28, "#2f7bff", "闪烁")] }
    ]},
    { id: "drama-sil", group: "戏剧光", name: "强逆光剪影", desc: "人物压成黑色轮廓。", variants: [
      { id: "sil-full", name: "全黑轮廓", desc: "身体完全黑，只看见外形。", look: lk("#f2f6ff", "#8ea4c8", "silhouette", 8, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("背景光", "太阳", 50, 90, 50, 96, 90, 20, 4, "#ffffff")] },
      { id: "sil-edge", name: "半身边线", desc: "大半是剪影，只有一侧还剩一条边。", look: lk("#d0d8e6", "#5c6c84", "rim", 14, 0, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0, 0, 0, 0, 230), lights: [lx("背景光", "窗户", 70, 84, 48, 88, 50, 16, 10, "#e7eef8"), lx("轮廓光", "自定义", 82, 60, 50, 40, 12, 8, 20, "#ffffff")] },
      { id: "sil-door", name: "门口剪影", desc: "亮着的门口里站着一个黑影。", look: lk("#0c0c0c", "#070707", "silhouette", 10, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0.7, 0, 0, 0, 160), lights: [lx("背景光", "太阳", 50, 88, 46, 94, 36, 18, 6, "#fff6e4")] }
    ]},
    { id: "low-key", group: "戏剧光", name: "低调暗光", desc: "画面大部分沉在黑里。", variants: [
      { id: "low-side", name: "单侧微光", desc: "只有一侧一条很窄的光。", look: lk("#0a0c10", "#050608", "half", 12, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 20), lights: [lx("主光", "灯具", 16, 40, 48, 36, 14, 18, 50, "#d7c4a4")] },
      { id: "low-eyes", name: "眼部留光", desc: "只看得见眼睛附近。", look: lk("#07080c", "#040506", "eyes", 6, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "灯具", 48, 24, 46, 32, 10, 22, 40, "#fff4dd")] },
      { id: "low-black", name: "背景沉黑", desc: "背景几乎没有层次，主体也只剩一点。", look: lk("#050506", "#020203", "lit", 4, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "自定义", 40, 36, 44, 22, 20, 30, 20, "#8a8074"), lx("背景光", "自定义", 70, 80, 20, 8, 30, 40, 4, "#1a1c20")] }
    ]},
    { id: "horror-up", group: "戏剧光", name: "底部惊悚光", desc: "光从下方打上来，脸的明暗是反的。", variants: [
      { id: "up-flash", name: "手电上照", desc: "手电从下巴往上打。", look: lk("#100e0c", "#070606", "uplight", 10, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 150), lights: [lx("主光", "灯具", 50, 18, 8, 78, 24, 16, 55, "#fff6ea")] },
      { id: "up-candle", name: "烛火下照", desc: "烛火在画面下方跳动。", look: lk("#1a100c", "#0c0808", "uplight", 8, 0, 0, 0, 0, 0, 0, "", 0, 2, 0, 0, 0, 0, 3, 0, 150), lights: [lx("主光", "火焰", 46, 28, 6, 64, 28, 42, 36, "#ff8a32", "闪烁")] },
      { id: "up-move", name: "移动底光", desc: "底光不稳定，像在移动。", look: lk("#100c10", "#07060a", "uplight", 12, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 80), lights: [lx("主光", "灯具", 36, 22, 10, 70, 22, 18, 48, "#f0e6ff", "闪烁")] }
    ]},
    { id: "reveal", group: "戏剧光", name: "强光揭示", desc: "暗处被突然或逐渐照亮。", variants: [
      { id: "reveal-door", name: "开门爆亮", desc: "门打开的一瞬间非常亮。", look: lk("#0e0e0e", "#070707", "lit", 16, 0, 0, 0, 0, 0, 3, "", 0, 0, 0, 0, 0.85, 0, 0, 0, 230), lights: [lx("主光", "太阳", 78, 50, 48, 96, 48, 16, 30, "#fffaf2", "渐亮")] },
      { id: "reveal-snap", name: "灯光瞬亮", desc: "顶灯突然打开。", look: lk("#10141a", "#080a0e", "lit", 10, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 0, 0, 0, 2, 0, 160), lights: [lx("主光", "灯具", 50, 40, 86, 90, 40, 20, 34, "#fff8ee", "渐亮")] },
      { id: "reveal-fade", name: "暗处渐亮", desc: "从几乎全黑慢慢亮起来。", look: lk("#08090c", "#050608", "lit", 8, 0.2, 0, 0, 0, 0, 1, "", 0, 0, 0, 0, 0, 0, 0, 0, 120), lights: [lx("主光", "灯具", 40, 36, 46, 48, 36, 40, 22, "#d7e2f2", "渐亮"), lx("环境光", "自定义", 60, 60, 20, 16, 60, 70, 6, "#3a4554", "渐亮")] }
    ]},
    { id: "volume", group: "特殊光", name: "体积光束", desc: "能看见空气里的光柱。", variants: [
      { id: "vol-window", name: "窗间光柱", desc: "窗户之间落下几道光柱。", look: lk("#1a2430", "#10161c", "lit", 14, 0.28, 2, 0, 0, 0, 4, "", 0, 0, 0, 0, 0, 0, 0, 0, 36), lights: [lx("主光", "窗户", 28, 34, 60, 70, 18, 20, 30, "#fff1d4")] },
      { id: "vol-forest", name: "林中光束", desc: "树干之间漏下光柱。", look: lk("#1a2820", "#0c1612", "lit", 12, 0.34, 0, 0, 5, 0, 4, "", 0, 0, 0, 0, 0, 0, 0, 1, 80), lights: [lx("主光", "太阳", 54, 24, 74, 68, 16, 18, 26, "#e7f6c8")] },
      { id: "vol-stage", name: "舞台尘雾", desc: "舞台光柱里有灰尘。", look: lk("#100818", "#07060c", "lit", 10, 0.4, 0, 0, 0, 0, 3, "", 0, 0, 0, 0, 0, 0, 0, 0, 160), lights: [lx("主光", "灯具", 50, 36, 88, 80, 20, 16, 28, "#fff6ea"), lx("背景光", "霓虹", 20, 70, 30, 24, 30, 40, 8, "#ff4f9a")] }
    ]},
    { id: "fire-move", group: "特殊光", name: "火焰跳动", desc: "火光不稳定，颜色很暖。", variants: [
      { id: "fire-torch", name: "火把", desc: "侧面的火把照亮半张脸。", look: lk("#1a100c", "#0c0808", "half", 14, 0.08, 0, 0, 0, 0, 0, "", 0, 2, 0, 0, 0, 0, 0, 0, 28), lights: [lx("主光", "火焰", 20, 40, 46, 72, 28, 36, 40, "#ff7a2a", "闪烁")] },
      { id: "fire-camp", name: "篝火", desc: "低处的篝火从前方烤亮人物。", look: lk("#1c100c", "#0c0806", "uplight", 12, 0.1, 0, 0, 0, 0, 0, "", 0, 3, 0, 0, 0, 0, 0, 0, 150), lights: [lx("主光", "火焰", 50, 22, 8, 76, 40, 44, 32, "#ff6a1a", "闪烁"), lx("补光", "火焰", 36, 30, 12, 30, 24, 40, 16, "#ffb15a", "闪烁")] },
      { id: "fire-blast", name: "爆炸余光", desc: "背后留下一大片橙色余光。", look: lk("#3a140c", "#100806", "rim", 20, 0.05, 0, 0, 0, 0, 2, "", 0, 3, 0, 0, 0, 0, 0, 0, 230), lights: [lx("背景光", "火焰", 60, 84, 40, 92, 70, 30, 16, "#ff5a1a", "渐暗"), lx("轮廓光", "火焰", 70, 70, 48, 50, 30, 24, 12, "#ffd0a0", "渐暗")] }
    ]},
    { id: "lightning", group: "特殊光", name: "闪电瞬亮", desc: "极短的白闪，平时画面是暗的。", variants: [
      { id: "bolt-one", name: "单次闪", desc: "一道闪电把人和天同时照亮。", look: lk("#141820", "#07090c", "lit", 8, 0.1, 0, 0, 0, 1, 0, "", 0, 0, 1, 0, 0, 0, 0, 0, 200), lights: [lx("主光", "自定义", 62, 16, 86, 90, 70, 10, 20, "#f4f8ff", "闪烁")] },
      { id: "bolt-multi", name: "连续闪", desc: "几道闪电接连亮起。", look: lk("#10141c", "#06080c", "lit", 6, 0.16, 0, 0, 0, 1, 0, "", 0, 0, 3, 0, 0, 0, 0, 0, 80), lights: [lx("主光", "自定义", 30, 12, 90, 86, 40, 8, 16, "#ffffff", "闪烁"), lx("补光", "自定义", 74, 18, 84, 70, 36, 8, 12, "#d7e6ff", "闪烁")] },
      { id: "bolt-far", name: "远处闪", desc: "闪在很远的天边，人物几乎还是暗的。", look: lk("#10141a", "#080a0e", "silhouette", 4, 0.2, 0, 0, 0, 0, 0, "", 0, 0, 1, 0, 0, 0, 0, 0, 280), lights: [lx("背景光", "自定义", 78, 12, 70, 48, 30, 16, 8, "#e7f0ff", "闪烁")] }
    ]},
    { id: "holo-blue", group: "特殊光", name: "全息蓝光", desc: "青色的全息光打在人或轮廓上。", variants: [
      { id: "holo-face", name: "面部投射", desc: "青色网格投在脸上。", look: lk("#071018", "#05080e", "lit", 6, 0, 0, 0, 0, 0, 0, "", 0, 0, 0, 1, 0, 0, 0, 0, 150), lights: [lx("主光", "屏幕", 50, 24, 48, 64, 28, 22, 16, "#14e0d0")] },
      { id: "holo-rim", name: "轮廓光", desc: "全息光只勾边，脸的中间仍暗。", look: lk("#061018", "#04080c", "rim", 8, 0, 0, 0, 0, 0, 1, "", 0, 0, 0, 2, 0, 0, 0, 0, 200), lights: [lx("轮廓光", "屏幕", 70, 60, 52, 72, 22, 18, 12, "#00d7ff")] },
      { id: "holo-scan", name: "扫描流光", desc: "一条青色扫描线上下移动。", look: lk("#07141c", "#04080c", "lit", 6, 0.08, 0, 0, 0, 0, 0, "", 0, 0, 0, 3, 0, 0, 0, 0, 160), lights: [lx("主光", "屏幕", 50, 36, 50, 58, 34, 20, 14, "#7ef6ff", "保持不变"), lx("环境光", "屏幕", 50, 50, 20, 18, 60, 40, 4, "#123044")] }
    ]}
  ];

  const viewport = document.getElementById("viewport");
  const world = document.getElementById("world");
  const edgeGroup = document.getElementById("edgeGroup");
  const zoomLabel = document.getElementById("zoomLabel");
  const pointsEl = document.getElementById("points");
  const savePill = document.getElementById("savePill");
  const saveLabel = document.getElementById("saveLabel");
  const saveBtn = document.getElementById("saveBtn");
  const accountBtn = document.getElementById("accountBtn");
  const accountMenu = document.getElementById("accountMenu");
  const avatarImg = document.getElementById("avatarImg");
  const avatarFallback = document.getElementById("avatarFallback");
  const projectBtn = document.getElementById("projectBtn");
  const canvasBtn = document.getElementById("canvasBtn");
  const projectMenu = document.getElementById("projectMenu");
  const canvasMenu = document.getElementById("canvasMenu");
  const addMenu = document.getElementById("addMenu");
  const assetPanel = document.getElementById("assetPanel");
  const assetList = document.getElementById("assetList");
  const detailPanel = document.getElementById("detailPanel");
  const detailBody = document.getElementById("detailBody");
  const emptyHint = document.getElementById("emptyHint");
  const tourEl = document.getElementById("tour");
  const edgeDelete = document.getElementById("edgeDelete");
  const libraryEl = document.getElementById("library");
  const shotLibEl = document.getElementById("shotLibrary");
  const lightEl = document.getElementById("lightStudio");
  const storyEl = document.getElementById("storyStudio");
  const modal = document.getElementById("modal");
  const toastEl = document.getElementById("toast");
  const fileInput = document.getElementById("fileInput");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");

  const state = {
    nodes: [],
    edges: [],
    view: { x: 40, y: 40, scale: 1 },
    tool: "select",
    selectedNodeId: null,
    selectedEdgeId: null
  };

  const doc = {
    v: 1,
    points: 1422,
    activeKey: "p1:c1",
    projectCanvas: { p1: "c1", p2: "c1" },
    canvases: {}
  };

  const histories = {};
  const sessionUrls = new Map();
  let dirty = false;
  const ACCOUNT_KEY = "neox-ai-account-v1";
  const account = { name: "演示用户", email: "demo@neox.ai", avatar: "", loggedIn: true };
  const library = {
    query: "",
    category: "all",
    licensedOnly: false,
    view: "catalog",
    selectedId: "rain-city",
    mine: [],
    tour: true,
    mineSaved: true
  };
  let toastTimer = null;
  let textTimer = null;
  let storyTimer = null;
  let runToken = 0;
  let runningId = null;
  let detailModelId = null;
  let tourIndex = 0;
  let shouldFit = false;
  let modalResolve = null;
  let fileTargetId = null;
  let shotTargetId = null;
  let lightTargetId = null;
  const storyEditor = { nodeId: null, draft: null };
  let playTimer = null;

  let interaction = null;

  function uid(prefix) {
    return `${prefix || "n"}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function getNode(id) { return state.nodes.find((n) => n.id === id); }

  function projectOf(key) {
    const [pid] = String(key).split(":");
    return PROJECTS.find((p) => p.id === pid) || PROJECTS[0];
  }

  function canvasOf(key) {
    const [pid, cid] = String(key).split(":");
    const project = PROJECTS.find((p) => p.id === pid);
    return project?.canvases.find((c) => c.id === cid) || project?.canvases[0];
  }

  function keyOf(pid, cid) { return `${pid}:${cid}`; }

  const MIN_W = 220;
  const MAX_W = 720;
  const MIN_H = 150;
  const MAX_H = 920;

  function nodeSize(type) {
    if (type === "model") return { w: 328, h: 470 };
    if (type === "output") return { w: 328, h: 390 };
    if (type === "start") return { w: 280, h: 270 };
    if (type === "text") return { w: 280, h: 250 };
    if (type === "library") return { w: 280, h: 196 };
    if (type === "shot") return { w: 300, h: 340 };
    if (type === "light") return { w: 300, h: 360 };
    if (type === "story") return { w: 300, h: 250 };
    return { w: 280, h: 248 };
  }

  function frameOf(node) {
    const base = nodeSize(node.type);
    return {
      w: node.w || base.w,
      h: node.h || base.h
    };
  }

  function icon(name) {
    const paths = {
      image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.3"/><path d="M4 16l4.2-3.2 3 2.2 2.2-1.8L20 16"/>',
      video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-2v8l-5-2z"/>',
      audio: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
      text: '<path d="M5 6h14M5 12h14M5 18h9"/>',
      character: '<circle cx="12" cy="8" r="3"/><path d="M5 19c1.4-3 3.6-4.5 7-4.5S17.6 16 19 19"/>',
      scene: '<path d="M4 18l5-7 4 4 2-2 5 5"/><path d="M4 18h16"/>',
      action: '<path d="M4 15c3-6 6-6 8 0s5 6 8 0"/><path d="M14 6l3-2 3 3"/>',
      expression: '<circle cx="12" cy="12" r="8"/><path d="M8.5 10h.01M15.5 10h.01M8.5 14c1.2 1.4 2.3 2 3.5 2s2.3-.6 3.5-2"/>',
      effect: '<path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8z"/>',
      library: '<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>',
      shot: '<rect x="4" y="7" width="16" height="11" rx="2"/><circle cx="12" cy="12.5" r="3"/><path d="M9 7l1.2-2h3.6L15 7"/>',
      light: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.2l1.6 1.6M17.6 16.2l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.8l1.6-1.6M17.6 7.8l1.6-1.6"/>',
      story: '<path d="M6 4.5h8.5A2.5 2.5 0 0 1 17 7v12.5H8.2A2.2 2.2 0 0 0 6 21.7z"/><path d="M6 4.5v14.8A2.2 2.2 0 0 1 8.2 17H17"/><path d="M9 8.5h5M9 12h5"/>',
      model: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
      output: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M10 9.5v5l5-2.5z"/>',
      start: '<path d="M7 4h7l5 5v11H7z"/><path d="M14 4v5h5"/><path d="M9 13h6M9 17h4"/>',
      trash: '<path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
  }

  let paintSeq = 0;

  function thumbSvg(kind) {
    const gid = `tg${paintSeq++}`;
    const sky = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16345f"/><stop offset="1" stop-color="#07111f"/></linearGradient></defs><rect width="320" height="180" fill="url(#${gid})"/><circle cx="268" cy="34" r="12" fill="#dff8ff" opacity="0.9"/><path d="M0 128h320v52H0z" fill="#071422"/>`;
    const city = `<g fill="#102848"><path d="M14 128V74h26v54z"/><path d="M46 128V42h22v86z"/><path d="M74 128V80h40v48z"/><path d="M122 128V36h16v92z"/><path d="M146 128V68h36v60z"/><path d="M190 128V88h28v40z"/></g><g fill="#00d7ff" opacity="0.9"><rect x="22" y="84" width="4" height="3"/><rect x="32" y="96" width="4" height="3"/><rect x="54" y="54" width="4" height="3"/><rect x="62" y="70" width="4" height="3"/><rect x="86" y="92" width="4" height="3"/><rect x="100" y="104" width="4" height="3"/><rect x="128" y="48" width="4" height="3"/><rect x="158" y="80" width="4" height="3"/><rect x="174" y="96" width="4" height="3"/><rect x="200" y="100" width="4" height="3"/></g><path d="M0 128h320" stroke="#00d7ff" stroke-width="2" opacity="0.45"/>`;
    if (kind === "character") {
      return `<svg viewBox="0 0 320 180">${sky}${city}<g transform="translate(196 46)"><circle cx="36" cy="18" r="14" fill="#e7f2ff"/><path d="M14 92c2-28 10-40 22-40s20 12 22 40" fill="#16345c" stroke="#00d7ff" stroke-width="2"/><path d="M8 92h56" stroke="#3a73ff" stroke-width="2"/></g></svg>`;
    }
    if (kind === "scene" || kind === "output" || kind === "image") {
      return `<svg viewBox="0 0 320 180">${sky}${city}<path d="M0 150h320" stroke="#00d7ff" opacity="0.35"/></svg>`;
    }
    if (kind === "video" || kind === "action") {
      return `<svg viewBox="0 0 320 180">${sky}${city}<path d="M20 120c40-36 70-20 100 0s70 30 110-10 60-20 70 8" fill="none" stroke="#00d7ff" stroke-width="3"/><polygon points="146,78 146,108 172,93" fill="#fff"/></svg>`;
    }
    if (kind === "audio") {
      return `<svg viewBox="0 0 320 180">${sky}<g fill="#3a73ff">${[40, 58, 76, 94, 112, 130, 148, 166, 184, 202, 220, 238].map((x, i) => `<rect x="${x}" y="${90 - ((i % 5) + 2) * 8}" width="10" height="${((i % 5) + 2) * 16}" rx="2"/>`).join("")}</g></svg>`;
    }
    return `<svg viewBox="0 0 320 180">${sky}${city}</svg>`;
  }

  function catalogSvg(id) {
    const gid = `cg${paintSeq++}`;
    const sky = `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16345f"/><stop offset="1" stop-color="#07111f"/></linearGradient></defs><rect width="320" height="180" fill="url(#${gid})"/>`;
    const scenes = {
      "rain-city": `${sky}<g fill="#102848"><path d="M18 150V78h28v72z"/><path d="M52 150V40h24v110z"/><path d="M84 150V86h46v64z"/><path d="M140 150V34h18v116z"/><path d="M168 150V70h40v80z"/><path d="M216 150V96h34v54z"/><path d="M258 150V60h40v90z"/></g><g fill="#7ef6ff"><rect x="28" y="92" width="4" height="4"/><rect x="40" y="108" width="4" height="4"/><rect x="60" y="56" width="4" height="4"/><rect x="98" y="100" width="4" height="4"/><rect x="148" y="50" width="4" height="4"/><rect x="180" y="88" width="4" height="4"/><rect x="270" y="78" width="4" height="4"/></g><g stroke="#9fdfff" stroke-width="1" opacity="0.55"><path d="M30 20l-8 18M70 8l-8 18M120 24l-8 18M190 12l-8 18M250 28l-8 18"/></g><path d="M0 150h320" stroke="#00d7ff" opacity="0.7"/>`,
      "warm-office": `${sky}<rect x="18" y="28" width="150" height="90" rx="6" fill="#16345c"/><rect x="28" y="38" width="130" height="70" fill="#ffb15a" opacity="0.85"/><rect x="180" y="96" width="110" height="14" rx="3" fill="#24507a"/><rect x="196" y="70" width="46" height="40" rx="4" fill="#0e2744"/><circle cx="250" cy="58" r="10" fill="#ffd27a"/>`,
      "future-lab": `${sky}<ellipse cx="160" cy="150" rx="70" ry="12" fill="#0a2038"/><rect x="132" y="36" width="56" height="110" rx="28" fill="none" stroke="#7ef6ff" stroke-width="3"/><ellipse cx="160" cy="78" rx="16" ry="22" fill="#7ef6ff" opacity="0.85"/><path d="M118 150h84" stroke="#3a73ff"/>`,
      "young-lead": `${sky}<circle cx="168" cy="62" r="28" fill="#d7e6ff"/><path d="M124 150c6-36 20-52 44-52s38 16 44 52" fill="#16345c" stroke="#7ef6ff"/><path d="M150 58c6 8 18 8 28 0" fill="none" stroke="#24507a"/>`,
      "cool-profile": `${sky}<circle cx="150" cy="70" r="26" fill="#c5d7ee"/><path d="M118 150c4-28 16-44 34-44 10 0 18 4 24 12" fill="#102848" stroke="#7ef6ff"/><path d="M168 62h16" stroke="#24507a"/>`,
      sprint: `${sky}<path d="M40 120h240" stroke="#00d7ff" opacity="0.4"/><circle cx="118" cy="58" r="14" fill="#e7f2ff"/><path d="M96 92l28-16 18 20 26-8-10 28-30 8-16 22" fill="none" stroke="#7ef6ff" stroke-width="4" stroke-linejoin="round"/><path d="M40 70h36M48 86h28M36 102h24" stroke="#3a73ff" stroke-width="3"/>`,
      smile: `${sky}<circle cx="160" cy="90" r="52" fill="#d7e6ff"/><circle cx="142" cy="78" r="5" fill="#16345c"/><circle cx="178" cy="78" r="5" fill="#16345c"/><path d="M138 102c8 12 36 12 44 0" fill="none" stroke="#24507a" stroke-width="3"/>`,
      "blue-particle": `${sky}<g fill="#7ef6ff">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const a = i / 12 * Math.PI * 2;
        const r = 18 + (i % 4) * 16;
        return `<circle cx="${160 + Math.cos(a) * r}" cy="${90 + Math.sin(a) * r * 0.72}" r="${3 + (i % 3)}" opacity="${0.45 + (i % 3) * 0.15}"/>`;
      }).join("")}</g><circle cx="160" cy="90" r="8" fill="#fff"/>`
    };
    return `<svg viewBox="0 0 320 180">${scenes[id] || scenes["rain-city"]}</svg>`;
  }

  function coverSvg(modelKey) {
    const gid = `cg${paintSeq++}`;
    const accent = modelKey === "lipsync" ? "#7ee7ff" : modelKey === "motion" ? "#8eb6ff" : "#00d7ff";
    return `<svg viewBox="0 0 320 180">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16345c"/><stop offset="1" stop-color="#07111f"/></linearGradient></defs>
      <rect width="320" height="180" fill="url(#${gid})"/>
      <g fill="#0c2340"><rect x="16" y="70" width="34" height="110"/><rect x="58" y="40" width="26" height="140"/><rect x="96" y="84" width="50" height="96"/><rect x="160" y="30" width="30" height="150"/><rect x="202" y="64" width="44" height="116"/><rect x="256" y="92" width="46" height="88"/></g>
      <g fill="${accent}"><rect x="24" y="86" width="5" height="4"/><rect x="68" y="58" width="5" height="4"/><rect x="172" y="48" width="5" height="4"/><rect x="220" y="80" width="5" height="4"/></g>
      <circle cx="210" cy="78" r="10" fill="#e7f0ff"/>
      <path d="M196 130c3-18 8-26 14-26s11 8 14 26" fill="#123055" stroke="${accent}"/>
      <text x="16" y="28" fill="#d7e6ff" font-size="14" font-family="Microsoft YaHei, sans-serif">NEOX 模拟成片</text>
    </svg>`;
  }

  function createNode(type, x, y, extra = {}) {
    const meta = TYPES[type];
    return {
      id: uid("n"),
      type,
      x, y,
      name: extra.name || meta.name,
      text: extra.text || "",
      fileName: extra.fileName || "",
      mime: extra.mime || "",
      fileStatus: extra.fileStatus || (ASSET_TYPES.has(type) && type !== "text" ? "empty" : ""),
      thumb: extra.thumb || "",
      catalogId: extra.catalogId || "",
      libraryCategory: extra.libraryCategory || "",
      shotId: extra.shotId || "",
      shot: null,
      shotInputs: [],
      light: null,
      lightInputs: [],
      story: null,
      modelKey: extra.modelKey || "video",
      status: "idle",
      progress: 0,
      progressLabel: "",
      error: "",
      lastRun: null,
      runs: [],
      result: null
    };
  }

  function createEdge(from, to) {
    return { id: uid("e"), from, to };
  }

  function buildDemo() {
    const character = createNode("character", 48, 36, { name: "主角 · 林澈", fileStatus: "demo" });
    const scene = createNode("scene", 48, 330, { name: "霓虹都市", fileStatus: "demo" });
    const text = createNode("text", 48, 624, {
      name: "视频要求",
      text: "夜雨中的霓虹都市，主角林澈从巷口冲出，镜头低角度跟随，冷色电影光，5 秒，16:9。"
    });
    const model = createNode("model", 420, 180, { modelKey: "video" });
    const output = createNode("output", 830, 210);
    const start = createNode("start", 830, 700);
    return {
      nodes: [start, character, scene, text, model, output],
      edges: [
        createEdge(character.id, model.id),
        createEdge(scene.id, model.id),
        createEdge(text.id, model.id),
        createEdge(model.id, output.id)
      ]
    };
  }

  function history() {
    if (!histories[doc.activeKey]) histories[doc.activeKey] = { past: [], future: [] };
    return histories[doc.activeKey];
  }

  function serializeNode(node) {
    const copy = { ...node, runs: node.runs || [], lastRun: node.lastRun || null, result: node.result || null };
    if (copy.status === "analyzing" || copy.status === "generating") {
      copy.status = "idle";
      copy.progress = 0;
      copy.progressLabel = "";
    }
    if (copy.thumb && copy.thumb.length > 160000) copy.thumb = "";
    return copy;
  }

  function snapshot() {
    return JSON.stringify({
      nodes: state.nodes.map(serializeNode),
      edges: state.edges
    });
  }

  function commit() {
    const snap = snapshot();
    const h = history();
    if (h.past[h.past.length - 1] === snap) {
      updateUndo();
      return;
    }
    h.past.push(snap);
    if (h.past.length > 80) h.past.shift();
    h.future = [];
    scheduleSave();
    updateUndo();
  }

  function applySnapshot(raw) {
    const data = JSON.parse(raw);
    state.nodes = data.nodes || [];
    state.edges = data.edges || [];
    state.selectedNodeId = null;
    state.selectedEdgeId = null;
  }

  function undo() {
    const h = history();
    if (h.past.length < 2) return;
    h.future.push(h.past.pop());
    applySnapshot(h.past[h.past.length - 1]);
    scheduleSave();
    render();
  }

  function redo() {
    const h = history();
    if (!h.future.length) return;
    const snap = h.future.pop();
    h.past.push(snap);
    applySnapshot(snap);
    scheduleSave();
    render();
  }

  function updateUndo() {
    const h = history();
    undoBtn.disabled = h.past.length < 2;
    redoBtn.disabled = h.future.length === 0;
  }

  function persistCurrent() {
    doc.canvases[doc.activeKey] = {
      nodes: state.nodes.map(serializeNode),
      edges: state.edges,
      view: state.view
    };
  }

  function scheduleSave() {
    dirty = true;
    setSave("dirty");
  }

  function writeStorage() {
    persistCurrent();
    const payload = JSON.parse(JSON.stringify(doc));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      dirty = false;
      setSave("saved");
      return true;
    } catch (err) {
      payload.canvases[doc.activeKey].nodes.forEach((n) => { n.thumb = ""; });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        dirty = false;
        setSave("saved");
        toast("画布已保存，部分预览图过大已省略");
        return true;
      } catch (e2) {
        dirty = true;
        setSave("dirty");
        toast("保存失败，浏览器存储空间不足");
        return false;
      }
    }
  }

  function saveCanvas() {
    if (!dirty) {
      toast("没有需要保存的修改");
      return;
    }
    setSave("saving");
    if (writeStorage()) toast("画布已保存");
  }

  function setSave(mode) {
    savePill.classList.toggle("saving", mode === "saving");
    savePill.classList.toggle("dirty", mode === "dirty");
    saveBtn.classList.toggle("primary", mode === "dirty");
    saveBtn.classList.toggle("ghost", mode !== "dirty");
    if (mode === "saving") saveLabel.textContent = "保存中…";
    else if (mode === "dirty") saveLabel.textContent = "未保存";
    else saveLabel.textContent = "已保存";
  }

  function loadAccount() {
    try {
      const raw = localStorage.getItem(ACCOUNT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.name === "string" && data.name.trim()) account.name = data.name.trim().slice(0, 20);
      if (typeof data.email === "string" && data.email.trim()) account.email = data.email.trim().slice(0, 40);
      if (typeof data.avatar === "string" && data.avatar.startsWith("data:image/")) account.avatar = data.avatar;
      account.loggedIn = data.loggedIn !== false;
    } catch (err) {
      account.loggedIn = true;
    }
  }

  function saveAccount() {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify({
      name: account.name,
      email: account.email,
      avatar: account.avatar,
      loggedIn: account.loggedIn
    }));
  }

  function renderAvatar() {
    const letter = (account.name || "用").slice(0, 1);
    if (account.loggedIn && account.avatar) {
      avatarImg.src = account.avatar;
      avatarImg.hidden = false;
      avatarFallback.hidden = true;
    } else {
      avatarImg.hidden = true;
      avatarFallback.hidden = false;
      avatarFallback.textContent = account.loggedIn ? letter : "登";
    }
    accountBtn.title = account.loggedIn ? `${account.name} · 账户管理` : "登录";
  }

  function avatarMarkup(large) {
    const letter = esc((account.name || "用").slice(0, 1));
    if (account.avatar) return `<span class="${large ? "account-avatar" : ""}"><img alt="" src="${account.avatar}" /></span>`;
    return `<span class="${large ? "account-avatar" : ""}">${letter}</span>`;
  }

  function renderAccountMenu() {
    if (!account.loggedIn) {
      accountMenu.innerHTML = `<h3>账户管理</h3><p class="muted">当前未登录。登录信息只保存在本机浏览器。</p><div class="stack"><button type="button" class="btn primary" data-action="login">登录</button></div>`;
      return;
    }
    accountMenu.innerHTML = `
      <h3>账户管理</h3>
      <div class="account-hd">
        ${avatarMarkup(true)}
        <div><b>${esc(account.name)}</b><div class="muted">${esc(account.email)}</div></div>
      </div>
      <label>昵称<input id="accountNameInput" maxlength="20" value="${esc(account.name)}" /></label>
      <label>账号<input id="accountEmailInput" maxlength="40" value="${esc(account.email)}" /></label>
      <div class="stack">
        <button type="button" class="btn ghost" data-action="pick-avatar">更换头像</button>
        <button type="button" class="btn ghost" data-action="clear-avatar">使用文字头像</button>
        <button type="button" class="btn primary" data-action="save-account">保存资料</button>
        <button type="button" class="btn ghost" data-action="logout">退出登录</button>
      </div>`;
  }

  function loadCanvas(key, seedDemo) {
    const saved = doc.canvases[key];
    if (saved) {
      state.nodes = saved.nodes || [];
      state.edges = saved.edges || [];
      state.view = saved.view || { x: 40, y: 40, scale: 1 };
      shouldFit = !saved.view;
    } else if (seedDemo) {
      const demo = buildDemo();
      state.nodes = demo.nodes;
      state.edges = demo.edges;
      state.view = { x: 40, y: 40, scale: 1 };
      shouldFit = true;
    } else {
      state.nodes = [];
      state.edges = [];
      state.view = { x: 80, y: 80, scale: 1 };
      shouldFit = false;
    }
    state.selectedNodeId = null;
    state.selectedEdgeId = null;
    state.nodes = state.nodes.filter((n) => n && TYPES[n.type]);
    state.nodes.forEach((n) => {
      if (n.status === "analyzing" || n.status === "generating") {
        n.status = "idle";
        n.progress = 0;
        n.progressLabel = "";
      }
      n.runs = n.runs || [];
      n.mime = n.mime || "";
      if (typeof n.thumb !== "string" || !n.thumb.startsWith("data:image/")) n.thumb = "";
      if (n.type === "shot") {
        n.shotInputs = Array.isArray(n.shotInputs) ? n.shotInputs.filter((id) => typeof id === "string") : [];
        n.shot = n.shot && typeof n.shot === "object" ? sanitizeShot(n.shot) : null;
        if (!n.shot && shotById(n.shotId)) n.shot = configFromPreset(shotById(n.shotId));
        if (!n.shot) n.shotId = "";
        else n.shotId = n.shot.presetId || n.shotId || "";
        if (n.lighting && typeof n.lighting === "object") n.lighting = sanitizeLight(n.lighting);
      }
      if (n.type === "light") {
        n.lightInputs = Array.isArray(n.lightInputs) ? n.lightInputs.filter((id) => typeof id === "string") : [];
        n.light = n.light && typeof n.light === "object" ? sanitizeLight(n.light) : null;
      }
      if (n.type === "story") n.story = n.story && typeof n.story === "object" ? sanitizeStory(n.story) : null;
      if (Number.isFinite(n.w)) n.w = clamp(n.w, MIN_W, MAX_W);
      else delete n.w;
      if (Number.isFinite(n.h)) n.h = clamp(n.h, MIN_H, MAX_H);
      else delete n.h;
    });
    const ids = new Set(state.nodes.map((n) => n.id));
    state.edges = (state.edges || []).filter((edge) => edge && ids.has(edge.from) && ids.has(edge.to) && edge.from !== edge.to);
    if (!histories[key]) histories[key] = { past: [snapshot()], future: [] };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        doc.activeKey = "p1:c1";
        loadCanvas(doc.activeKey, true);
        return;
      }
      const data = JSON.parse(raw);
      if (!data || data.v !== 1) throw new Error("bad");
      doc.points = data.points || 1422;
      doc.activeKey = data.activeKey || "p1:c1";
      doc.projectCanvas = data.projectCanvas || { p1: "c1", p2: "c1" };
      doc.canvases = data.canvases || {};
      loadCanvas(doc.activeKey, !doc.canvases[doc.activeKey] && doc.activeKey === "p1:c1");
    } catch (err) {
      doc.activeKey = "p1:c1";
      doc.canvases = {};
      loadCanvas(doc.activeKey, true);
    }
  }

  function switchTo(pid, cid) {
    stopRun(true);
    persistCurrent();
    doc.activeKey = keyOf(pid, cid);
    doc.projectCanvas[pid] = cid;
    const seed = !doc.canvases[doc.activeKey] && (doc.activeKey === "p1:c1" || doc.activeKey === "p2:c1");
    loadCanvas(doc.activeKey, seed);
    closeMenus();
    detailPanel.hidden = true;
    render();
    if (shouldFit) requestAnimationFrame(() => fitView(true));
    scheduleSave();
  }

  function fileStatusText(node) {
    if (node.type === "text") return node.text.trim() ? "已填写" : "未填写";
    if (node.fileStatus === "story") return "来自故事构思";
    if (node.type === "library") return "素材库";
    if (node.fileStatus === "catalog") {
      const item = CATALOG.find((entry) => entry.id === node.catalogId);
      return item && item.licensed === true ? "素材库 · 已授权" : "素材库 · 未授权";
    }
    if (node.fileStatus === "mine") return node.thumb ? "本地压缩预览" : "本地预览未保留";
    if (node.fileStatus === "demo") return "演示素材";
    if (node.fileStatus === "local") return node.thumb ? "已保存缩略图" : "已选择本地文件";
    if (node.fileStatus === "empty") return "未添加文件";
    return "就绪";
  }

  function upstreamAssets(modelId) {
    const result = [];
    const seen = new Set([modelId]);
    const stack = [modelId];
    while (stack.length) {
      const cur = stack.pop();
      state.edges.forEach((edge) => {
        if (edge.to === cur && !seen.has(edge.from)) {
          seen.add(edge.from);
          stack.push(edge.from);
          const node = getNode(edge.from);
          if (node && ASSET_TYPES.has(node.type)) result.push(node);
        }
      });
    }
    return result;
  }

  function upstreamShots(modelId) {
    const result = [];
    const seen = new Set([modelId]);
    const stack = [modelId];
    while (stack.length) {
      const cur = stack.pop();
      state.edges.forEach((edge) => {
        if (edge.to === cur && !seen.has(edge.from)) {
          seen.add(edge.from);
          stack.push(edge.from);
          const node = getNode(edge.from);
          if (node && node.type === "shot") result.push(node);
        }
      });
    }
    return result;
  }

  function shotById(id) {
    return SHOTS.find((shot) => shot.id === id) || null;
  }

  function knownShotFile(file) {
    return SHOTS.some((shot) => shot.file === file) ? file : "";
  }

  function pickEnum(value, list, fallback) {
    return list.includes(value) ? value : fallback;
  }

  function sanitizeShot(raw) {
    if (!raw || typeof raw !== "object") return null;
    const motion = pickEnum(raw.motion, SHOT_MOTIONS, "固定");
    const dirs = SHOT_DIRS[motion] || [];
    const preset = shotById(raw.presetId);
    return {
      name: String(raw.name || "未命名镜头").slice(0, 24),
      desc: String(raw.desc || "").slice(0, 80),
      presetId: preset ? preset.id : "",
      file: knownShotFile(raw.file) || (preset ? preset.file : ""),
      scale: pickEnum(raw.scale, SHOT_SCALES, "中景"),
      horiz: pickEnum(raw.horiz, SHOT_HORIZ, "正面"),
      height: pickEnum(raw.height, SHOT_HEIGHTS, "平视"),
      motion,
      direction: dirs.includes(raw.direction) ? raw.direction : (dirs[0] || ""),
      speed: pickEnum(raw.speed, SHOT_SPEEDS, "中"),
      duration: clamp(Math.round(Number(raw.duration) || 5), 1, 15),
      customId: typeof raw.customId === "string" ? raw.customId : ""
    };
  }

  function configFromPreset(shot) {
    const setup = SHOT_SETUP[shot.id] || {};
    return sanitizeShot({ ...setup, name: shot.name, presetId: shot.id, file: shot.file, customId: "" });
  }

  function blankShot() {
    return sanitizeShot({ name: "未命名镜头", desc: "自由组合的镜头，画面为效果示意。", presetId: "", file: "", scale: "中景", horiz: "正面", height: "平视", motion: "固定", direction: "", speed: "中", duration: 5 });
  }

  function resolveShot(node) {
    if (!node || node.type !== "shot") return null;
    if (node.shot) return node.shot;
    const preset = shotById(node.shotId);
    return preset ? configFromPreset(preset) : null;
  }

  function shotMoveText(cfg) {
    if (!cfg) return "";
    if (cfg.motion === "固定") return `固定 · ${cfg.speed} · ${cfg.duration} 秒`;
    return `${cfg.motion} · ${cfg.direction} · ${cfg.speed} · ${cfg.duration} 秒`;
  }

  function shotParams(node) {
    const cfg = resolveShot(node);
    if (!cfg) return null;
    return {
      id: cfg.presetId || node.shotId || "",
      name: cfg.name,
      scale: cfg.scale,
      angle: `${cfg.horiz} · ${cfg.height}`,
      move: shotMoveText(cfg),
      file: cfg.file || ""
    };
  }

  function downstreamOutputs(modelId) {
    const result = [];
    const seen = new Set();
    const stack = [modelId];
    while (stack.length) {
      const cur = stack.pop();
      state.edges.forEach((edge) => {
        if (edge.from === cur && !seen.has(edge.to)) {
          seen.add(edge.to);
          const node = getNode(edge.to);
          if (!node) return;
          if (node.type === "output") result.push(node);
          else stack.push(edge.to);
        }
      });
    }
    return result;
  }

  function hashId(id) {
    let h = 0;
    for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return h;
  }

  function judgeAssets(assets, modelKey) {
    return assets.map((asset) => {
      const base = {
        character: 0.93,
        scene: 0.88,
        text: 0.86,
        action: modelKey === "motion" ? 0.91 : 0.66,
        image: 0.78,
        video: modelKey === "motion" ? 0.84 : 0.63,
        audio: modelKey === "lipsync" ? 0.94 : 0.33,
        expression: 0.82,
        effect: 0.7
      }[asset.type] ?? 0.4;
      const siblings = assets.filter((item) => item.type === asset.type);
      const index = siblings.findIndex((item) => item.id === asset.id);
      let score = base - (index > 0 ? 0.46 : 0);
      score += ((hashId(asset.id) % 7) - 3) * 0.008;
      let result = "ignored";
      if (score >= 0.75) result = "adopted";
      else if (score >= 0.52) result = "partial";
      return {
        id: asset.id,
        type: asset.type,
        name: asset.name,
        catalogId: asset.catalogId || "",
        fileStatus: asset.fileStatus || "",
        result,
        reason: reasonFor(asset, result, index > 0)
      };
    });
  }

  function reasonFor(asset, result, duplicate) {
    if (result === "ignored") {
      if (duplicate && asset.type === "scene") return "与场景内容重复";
      if (duplicate && asset.type === "character") return "与已采用人物重复";
      if (duplicate) return "与已连接的同类资产重复";
      if (asset.type === "audio") return "当前模型暂不支持该格式";
      return "相关度较低，已自动忽略";
    }
    if (result === "partial") {
      if (asset.type === "action") return "仅提取部分动作特征";
      if (asset.type === "effect") return "特效作为画面点缀部分采用";
      if (asset.type === "expression") return "表情只采用了部分特征";
      if (asset.type === "video") return "提取片段作为运动参考";
      if (asset.type === "text") return "文本要求已纳入提示，画面仅部分采用";
      if (asset.type === "audio") return "仅参考部分音频节奏";
      return "作为辅助参考部分采用";
    }
    if (asset.type === "character") return "作为人物主体采用";
    if (asset.type === "scene") return "与视频主题高度相关";
    if (asset.type === "text") return "文本要求已纳入生成提示";
    if (asset.type === "action") return "动作参考与镜头运动匹配";
    if (asset.type === "image") return "画面参考与主题一致";
    if (asset.type === "video") return "视频片段与主题高度相关";
    if (asset.type === "audio") return "音频与当前模型匹配";
    if (asset.type === "expression") return "表情参考已纳入人物表现";
    if (asset.type === "effect") return "特效与画面氛围匹配";
    return "与视频主题高度相关";
  }

  function summarize(items) {
    const adopted = items.filter((item) => item.result === "adopted").length;
    const partial = items.filter((item) => item.result === "partial").length;
    const ignored = items.filter((item) => item.result === "ignored").length;
    return { total: items.length, adopted, partial, ignored, used: adopted + partial };
  }

  function nowLabel() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }

  function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  function stageDelay() { return 800 + Math.floor(Math.random() * 700); }

  async function runWorkflow(modelId) {
    const model = getNode(modelId);
    if (!model || model.type !== "model") return;
    if (runningId) {
      toast("工作流正在运行");
      return;
    }
    const token = ++runToken;
    runningId = modelId;
    model.error = "";
    model.status = "analyzing";
    model.progress = 0;
    model.progressLabel = STAGES[0].label;
    const log = [];
    render();

    const assets = upstreamAssets(modelId);
    const outputs = downstreamOutputs(modelId);
    await wait(stageDelay());
    if (token !== runToken) return;

    if (!outputs.length || !assets.length) {
      const message = !outputs.length
        ? "请将视频模型连接到视频输出节点"
        : "未找到可识别的上游资产";
      model.status = "failed";
      model.error = message;
      model.progress = 12;
      model.progressLabel = "检查连接失败";
      log.push({ time: nowLabel(), message });
      const record = {
        id: uid("r"),
        at: Date.now(),
        time: nowLabel(),
        modelKey: model.modelKey,
        modelName: MODELS[model.modelKey].name,
        items: [],
        summary: summarize([]),
        log,
        ok: false,
        message
      };
      model.lastRun = record;
      model.runs = [record, ...(model.runs || [])].slice(0, 5);
      runningId = null;
      commit();
      render();
      toast(message);
      return;
    }

    log.push({ time: nowLabel(), message: "检查连接完成" });
    const shotSnap = upstreamShots(modelId).map((node) => {
      const params = shotParams(node);
      return params
        ? { nodeId: node.id, ready: true, ...params }
        : { nodeId: node.id, ready: false, name: node.name || "镜头选择" };
    });
    if (shotSnap.length) {
      log.push({ time: nowLabel(), message: `已读取 ${shotSnap.filter((item) => item.ready).length} 个镜头参数` });
    }
    const lightSnap = upstreamLights(modelId).map((node) => lightParams(node)).filter(Boolean);
    upstreamShots(modelId).forEach((shot) => {
      if (!shot.lighting) return;
      if (state.edges.some((edge) => edge.to === shot.id && getNode(edge.from) && getNode(edge.from).type === "light")) return;
      const params = lightParams(shot);
      if (params) lightSnap.push(params);
    });
    if (lightSnap.length) log.push({ time: nowLabel(), message: `已读取 ${lightSnap.length} 组光影参数` });
    const items = judgeAssets(assets, model.modelKey);
    const summary = summarize(items);

    for (let i = 1; i < STAGES.length; i += 1) {
      model.status = STAGES[i].status;
      model.progress = Math.round(((i + 1) / STAGES.length) * 100);
      model.progressLabel = STAGES[i].label;
      render();
      await wait(stageDelay());
      if (token !== runToken) return;
      log.push({ time: nowLabel(), message: `${STAGES[i].label}完成` });
    }

    const fresh = getNode(modelId);
    if (!fresh) {
      runningId = null;
      return;
    }
    const record = {
      id: uid("r"),
      at: Date.now(),
      time: nowLabel(),
      modelKey: fresh.modelKey,
      modelName: MODELS[fresh.modelKey].name,
      items,
      summary,
      shots: shotSnap,
      lights: lightSnap,
      log,
      ok: true,
      message: "生成完成"
    };
    fresh.status = "done";
    fresh.progress = 100;
    fresh.progressLabel = "输出结果";
    fresh.error = "";
    fresh.lastRun = record;
    fresh.runs = [record, ...(fresh.runs || [])].slice(0, 5);
    const names = items.filter((item) => item.result !== "ignored").map((item) => item.name);
    downstreamOutputs(modelId).forEach((output) => {
      output.result = {
        status: "done",
        duration: DURATION,
        aspect: ASPECT,
        adopted: summary.used,
        total: summary.total,
        modelName: record.modelName,
        modelKey: fresh.modelKey,
        names,
        at: record.at
      };
    });
    runningId = null;
    commit();
    render();
    toast(`生成完成，AI 自动采用 ${summary.used} 个资产`);
  }

  function stopRun(silent) {
    if (!runningId) return;
    runToken += 1;
    const node = runningId ? getNode(runningId) : null;
    runningId = null;
    if (node && (node.status === "analyzing" || node.status === "generating")) {
      node.status = "idle";
      node.progress = 0;
      node.progressLabel = "";
    }
    if (!silent) {
      toast("已停止运行");
      commit();
      render();
    }
  }

  function clientToWorld(cx, cy) {
    const rect = viewport.getBoundingClientRect();
    return {
      x: (cx - rect.left - state.view.x) / state.view.scale,
      y: (cy - rect.top - state.view.y) / state.view.scale
    };
  }

  function worldToScreen(x, y) {
    return {
      x: x * state.view.scale + state.view.x,
      y: y * state.view.scale + state.view.y
    };
  }

  function getPortWorld(nodeId, side) {
    const el = document.querySelector(`.node[data-id="${nodeId}"] .port.${side}`);
    if (!el) {
      const node = getNode(nodeId);
      if (!node) return { x: 0, y: 0 };
      const size = frameOf(node);
      return { x: node.x + (side === "out" ? size.w : 0), y: node.y + size.h / 2 };
    }
    const rect = el.getBoundingClientRect();
    return clientToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function curve(x1, y1, x2, y2) {
    const dx = Math.max(48, Math.abs(x2 - x1) * 0.45);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  function applyView() {
    world.style.transform = `translate(${state.view.x}px, ${state.view.y}px) scale(${state.view.scale})`;
    const size = 22 * state.view.scale;
    viewport.style.backgroundSize = `${size}px ${size}px`;
    viewport.style.backgroundPosition = `${state.view.x}px ${state.view.y}px`;
    zoomLabel.textContent = `${Math.round(state.view.scale * 100)}%`;
  }

  function drawEdges() {
    const parts = [];
    state.edges.forEach((edge) => {
      const a = getPortWorld(edge.from, "out");
      const b = getPortWorld(edge.to, "in");
      const p1 = worldToScreen(a.x, a.y);
      const p2 = worldToScreen(b.x, b.y);
      const d = curve(p1.x, p1.y, p2.x, p2.y);
      const selected = edge.id === state.selectedEdgeId ? "selected" : "";
      parts.push(`<g class="edge-group ${selected}"><path class="edge-glow" d="${d}"></path><path class="edge" d="${d}"></path><path class="hit" data-id="${edge.id}" d="${d}"></path></g>`);
    });
    if (interaction && interaction.kind === "link") {
      const port = getPortWorld(interaction.nodeId, interaction.side);
      const p1 = worldToScreen(port.x, port.y);
      const rect = viewport.getBoundingClientRect();
      const x2 = interaction.clientX - rect.left;
      const y2 = interaction.clientY - rect.top;
      const d = interaction.side === "out" ? curve(p1.x, p1.y, x2, y2) : curve(x2, y2, p1.x, p1.y);
      parts.push(`<g class="edge-group temp"><path class="edge-glow" d="${d}"></path><path class="edge" d="${d}"></path></g>`);
    }
    edgeGroup.innerHTML = parts.join("");
    updateEdgeDelete();
  }

  function updateEdgeDelete() {
    if (!state.selectedEdgeId) {
      edgeDelete.hidden = true;
      return;
    }
    const edge = state.edges.find((item) => item.id === state.selectedEdgeId);
    if (!edge) {
      edgeDelete.hidden = true;
      return;
    }
    const a = getPortWorld(edge.from, "out");
    const b = getPortWorld(edge.to, "in");
    const p1 = worldToScreen(a.x, a.y);
    const p2 = worldToScreen(b.x, b.y);
    const dx = Math.max(48, Math.abs(p2.x - p1.x) * 0.45);
    const c1x = p1.x + dx;
    const c2x = p2.x - dx;
    const t = 0.5;
    const u = 0.5;
    const x = u * u * u * p1.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * p2.x;
    const y = u * u * u * p1.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p2.y;
    const rect = viewport.getBoundingClientRect();
    edgeDelete.hidden = false;
    edgeDelete.style.left = `${rect.left + x}px`;
    edgeDelete.style.top = `${rect.top + y}px`;
  }

  function safeThumb(src) {
    return typeof src === "string" && src.startsWith("data:image/") ? src : "";
  }

  function thumbBlock(node) {
    const thumb = safeThumb(node.thumb);
    if (thumb) return `<div class="thumb"><img alt="" src="${thumb}" /></div>`;
    if (node.catalogId && CATALOG.some((entry) => entry.id === node.catalogId)) {
      return `<div class="thumb">${catalogSvg(node.catalogId)}</div>`;
    }
    if (node.fileStatus === "demo" || node.type === "character" || node.type === "scene" || node.type === "action") {
      return `<div class="thumb">${thumbSvg(node.type)}</div>`;
    }
    if (node.fileStatus === "local" && node.type === "audio") return `<div class="thumb">${thumbSvg("audio")}</div>`;
    if (node.fileStatus === "local") return `<div class="thumb">${thumbSvg(node.type)}</div>`;
    return `<div class="thumb empty">尚未选择文件</div>`;
  }

  function assetBody(node) {
    const canUpload = ACCEPT[node.type];
    return `
      <input class="name-input" data-field="name" maxlength="40" value="${esc(node.name)}" aria-label="资产名称" />
      ${node.type === "text" ? "" : thumbBlock(node)}
      ${node.type === "text" ? `<textarea class="text-input" data-field="text" maxlength="500" spellcheck="false" aria-label="文本要求">${esc(node.text)}</textarea>` : ""}
      ${node.type !== "text" && node.text ? `<p class="story-bound">${esc(node.text)}</p>` : ""}
      <div class="row">
        <span class="muted">${esc(fileStatusText(node))}${node.fileName ? " · " + esc(node.fileName) : ""}${node.fileStatus === "mine" ? " · 原始文件不保存" : ""}</span>
        <span class="btn-row">
          ${canUpload ? `<button type="button" class="btn ghost sm" data-action="pick-file">${node.fileStatus === "empty" ? "选择文件" : "更换"}</button>` : ""}
          <button type="button" class="btn ghost sm" data-action="preview">预览</button>
        </span>
      </div>`;
  }

  function modelBody(node) {
    const model = MODELS[node.modelKey] || MODELS.video;
    const assets = upstreamAssets(node.id);
    const summary = node.lastRun?.summary;
    const running = node.status === "analyzing" || node.status === "generating";
    const options = Object.entries(MODELS).map(([key, item]) => (
      `<option value="${key}" ${key === node.modelKey ? "selected" : ""}>${item.name}</option>`
    )).join("");
    return `
      <select class="model-select" data-field="model" aria-label="模型">${options}</select>
      <div class="row">
        <span class="badge ${node.status}">${STATUS_TEXT[node.status] || "未运行"}</span>
        <span class="muted">模式：自动识别</span>
      </div>
      <div class="muted">${esc(model.desc)} · 采用数量由 AI 自动判断</div>
      <div class="stats">
        <div class="stat"><span>已连接资产</span><b>${assets.length}</b></div>
        <div class="stat"><span>AI 实际采用</span><b>${summary ? summary.used : "—"}</b></div>
        <div class="stat"><span>视频时长</span><b>${DURATION} 秒</b></div>
        <div class="stat"><span>画幅比例</span><b>${ASPECT}</b></div>
      </div>
      ${shotPassBlock(node)}
      ${lightPassBlock(node)}
      ${running || node.status === "failed" ? `<div><div class="bar"><span style="width:${node.progress || 0}%"></span></div><div class="muted">${esc(node.progressLabel || "")}</div></div>` : ""}
      ${node.error ? `<p class="error">${esc(node.error)}</p>` : ""}
      ${summary && !running && node.status !== "failed" ? `<div class="summary"><p>共发现 ${summary.total} 个关联资产</p><p>AI 自动采用 ${summary.used} 个</p><p class="muted">忽略 ${summary.ignored} 个低相关资产</p></div>` : ""}
      <div class="btn-row">
        <button type="button" class="btn primary" data-action="run" ${running ? "disabled" : ""}>运行工作流</button>
        <button type="button" class="btn ghost" data-action="stop" ${running ? "" : "disabled"}>停止</button>
      </div>
      <button type="button" class="btn ghost block" data-action="details">查看识别详情</button>`;
  }

  function outputBody(node) {
    const result = node.result;
    if (!result) {
      return `
        <div class="thumb empty">等待视频模型输出</div>
        <div class="muted">连接视频模型并运行后，这里会显示模拟成片。</div>
        <div class="btn-row">
          <button type="button" class="btn ghost sm" data-action="preview">预览</button>
          <button type="button" class="btn ghost sm" data-action="download">下载</button>
        </div>`;
    }
    return `
      <div class="thumb">${coverSvg(result.modelKey)}</div>
      <div class="row">
        <b>生成完成</b>
        <span class="badge done">${esc(result.modelName)}</span>
      </div>
      <div class="muted">${result.duration} 秒 · ${esc(result.aspect)} · 本次采用 ${result.adopted} 个资产</div>
      <div class="chips">${(result.names || []).map((name) => `<span class="chip">${esc(name)}</span>`).join("")}</div>
      <div class="btn-row">
        <button type="button" class="btn primary sm" data-action="regen">重新生成</button>
        <button type="button" class="btn ghost sm" data-action="preview">预览</button>
        <button type="button" class="btn ghost sm" data-action="download">下载</button>
      </div>`;
  }

  function shotPassBlock(node) {
    const shots = upstreamShots(node.id);
    if (!shots.length) return `<p class="muted">未连接镜头选择。把镜头选择节点连到这个模型后，这里会显示该片段自己的镜头参数。</p>`;
    return `<div class="shot-pass">${shots.map((item) => {
      const params = shotParams(item);
      if (!params) return `<p>镜头节点「${esc(item.name)}」尚未选择</p>`;
      return `<p><b>${esc(params.name)}</b><span>${esc(params.scale)} · ${esc(params.angle)} · ${esc(params.move)}</span></p>`;
    }).join("")}</div>`;
  }

  function shotRunBlock(list) {
    if (!list || !list.length) return "";
    return `<div class="detail-block"><h3>传入视频模型的镜头参数</h3>${list.map((item) => item.ready
      ? `<div class="link-item">${esc(item.name)} · ${esc(item.scale)} · ${esc(item.angle)} · ${esc(item.move)}</div>`
      : `<div class="link-item">${esc(item.name)}：尚未选择镜头</div>`).join("")}</div>`;
  }

  function shotArrow(shot) {
    if (!shot.arrow && !shot.hint) return "";
    const paths = {
      forward: '<path d="M2 12h36M30 6l8 6-8 6"/>',
      right: '<path d="M2 12h36M30 6l8 6-8 6"/>',
      down: '<path d="M12 2v36M6 30l6 8 6-8"/>',
      up: '<path d="M12 38V2M6 10l6-8 6 8"/>',
      orbit: '<path d="M16 4a10 10 0 1 1-7 3"/><path d="M8 3v6H3"/>',
      whip: '<path d="M2 16c8-10 14 10 22 0s12 8 18-4"/><path d="M36 8l6 4-6 2"/>'
    };
    const label = shot.arrow ? shot.move : "";
    const svg = shot.arrow ? `<svg viewBox="${shot.arrow === "orbit" ? "0 0 24 24" : shot.arrow === "up" || shot.arrow === "down" ? "0 0 24 44" : "0 0 44 24"}" aria-hidden="true">${paths[shot.arrow] || ""}</svg>` : "";
    return `${shot.hint ? `<span class="shot-hint">${esc(shot.hint)}</span>` : ""}${svg || label ? `<span class="shot-arrow ${esc(shot.arrow)}">${svg}<em>${esc(label || shot.hint)}</em></span>` : ""}`;
  }

  function libraryBody(node) {
    return `
      <input class="name-input" data-field="name" maxlength="40" value="${esc(node.name)}" aria-label="素材库名称" />
      <p class="muted">打开 NEOX 素材库，把人物、场景、动作等素材复制到当前画布。底部「素材管理」打开的是同一个库。</p>
      <button type="button" class="btn primary block" data-action="open-library">打开素材库</button>`;
  }

  function shotBody(node) {
    const cfg = resolveShot(node);
    if (!cfg) {
      return `
        <p class="muted">双击此节点，设置参考镜头或自由组合。应用到画布后，可以连到视频模型。</p>
        <button type="button" class="btn primary block" data-action="open-shots">打开镜头选择</button>`;
    }
    const preview = cfg.file
      ? `<img alt="${esc(cfg.name)}" src="assets/shots/${cfg.file}" />`
      : `<span class="shot-blank">自由镜头</span>`;
    const inputs = (node.shotInputs || []).map(getNode).filter((item) => item && SHOT_INPUT_TYPES.has(item.type));
    return `
      <button type="button" class="thumb shot-node-thumb" data-action="open-shots">${preview}<span class="shot-hint">效果示意</span></button>
      <b>${esc(cfg.name)}</b>
      <div class="muted">${esc(cfg.scale)} · ${esc(cfg.horiz)} · ${esc(cfg.height)} · ${esc(shotMoveText(cfg))}</div>
      ${inputs.length ? `<div class="muted">输入：${inputs.map((item) => esc(item.name)).join("、")}</div>` : ""}
      <button type="button" class="btn ghost block" data-action="open-shots">编辑镜头</button>`;
  }

  function lightBody(node) {
    const cfg = node.light;
    if (!cfg) {
      return `
        <p class="muted">双击此节点，选择参考光影或自己加灯。应用到镜头后，可以继续连到视频模型。</p>
        <button type="button" class="btn primary block" data-action="open-lights">打开专业光影台</button>`;
    }
    const inputs = (node.lightInputs || []).map(getNode).filter((item) => item && LIGHT_INPUT_TYPES.has(item.type));
    return `
      <button type="button" class="thumb shot-node-thumb" data-action="open-lights">${lightStageSvg(cfg, false)}<span class="shot-hint">光影效果示意</span></button>
      <b>${esc(cfg.name)}</b>
      <div class="muted">${esc(lightSummary(cfg))}</div>
      ${inputs.length ? `<div class="muted">素材：${inputs.map((item) => esc(item.name)).join("、")}</div>` : ""}
      <button type="button" class="btn ghost block" data-action="open-lights">编辑光影</button>`;
  }

  function startBody() {
    return `
      <ol class="steps">
        <li><i>1</i>拖动空白处</li>
        <li><i>2</i>滚轮缩放</li>
        <li><i>3</i>点击 + 添加节点</li>
        <li><i>4</i>双击打开节点</li>
      </ol>
      <button type="button" class="btn primary block" data-action="tour">开始引导</button>`;
  }

  function renderNodes() {
    world.innerHTML = state.nodes.map((node) => {
      const running = node.status === "analyzing" || node.status === "generating" ? "is-running" : "";
      const failed = node.status === "failed" ? "is-failed" : "";
      const done = node.type === "output" && node.result ? "is-done" : "";
      const selected = node.id === state.selectedNodeId ? "selected" : "";
      const sized = node.h ? "is-sized" : "";
      const width = node.w || nodeSize(node.type).w;
      const height = node.h ? `height:${node.h}px;` : "";
      let body = "";
      if (node.type === "model") body = modelBody(node);
      else if (node.type === "output") body = outputBody(node);
      else if (node.type === "start") body = startBody();
      else if (node.type === "library") body = libraryBody(node);
      else if (node.type === "shot") body = shotBody(node);
      else if (node.type === "light") body = lightBody(node);
      else if (node.type === "story") body = storyBody(node);
      else body = assetBody(node);
      return `<article class="node ${node.type} ${selected} ${running} ${failed} ${done} ${sized}" data-id="${node.id}" style="left:${node.x}px;top:${node.y}px;width:${width}px;${height}">
        <div class="port in" data-side="in" title="输入"></div>
        <div class="port out" data-side="out" title="输出"></div>
        <header class="node-hd">
          <span class="ico">${icon(node.type)}</span>
          <span class="type">${esc(TYPES[node.type].label)}</span>
          <button type="button" class="icon-btn trash-btn" data-action="delete-node" title="删除" aria-label="删除">${icon("trash")}</button>
        </header>
        <div class="node-bd">${body}</div>
        ${["n", "s", "e", "w", "nw", "ne", "sw", "se"].map((edge) => `<div class="resize ${edge}" data-edge="${edge}" title="拖动调整大小，双击恢复默认"></div>`).join("")}
      </article>`;
    }).join("");
  }

  function renderAssetPanel() {
    if (assetPanel.hidden) return;
    const assets = state.nodes.filter((node) => ASSET_TYPES.has(node.type));
    if (!assets.length) {
      assetList.innerHTML = `<p class="muted">还没有素材节点。点击底部「＋」添加图片、视频、音频、人物、场景或文本。</p>`;
      return;
    }
    const groups = ["character", "scene", "action", "expression", "effect", "text", "image", "video", "audio"];
    assetList.innerHTML = groups.map((type) => {
      const list = assets.filter((node) => node.type === type);
      if (!list.length) return "";
      return `<div class="group-label">${TYPES[type].label}</div>` + list.map((node) => `
        <button type="button" class="asset-item" data-action="focus-node" data-id="${node.id}">
          <span class="ico">${icon(type)}</span>
          <span class="meta"><b>${esc(node.name)}</b><span class="muted">${esc(fileStatusText(node))}</span></span>
        </button>`).join("");
    }).join("");
  }

  function renderDetails() {
    const model = getNode(detailModelId);
    if (!model || model.type !== "model") {
      detailBody.innerHTML = `<p class="muted">未找到视频模型节点。</p>`;
      return;
    }
    const run = model.lastRun;
    if (!run) {
      detailBody.innerHTML = `<p class="muted">尚未运行工作流。采用数量由 AI 自动判断，请先点击「运行工作流」。</p>`;
      return;
    }
    const summary = run.summary || summarize(run.items || []);
    const items = run.items || [];
    const section = (title, list) => `
      <div class="detail-block">
        <h3>${title}</h3>
        ${list.length ? list.map(assetCard).join("") : `<p class="muted">暂无</p>`}
      </div>`;
    const involved = new Set([model.id, ...items.map((item) => item.id), ...downstreamOutputs(model.id).map((n) => n.id)]);
    upstreamAssets(model.id).forEach((node) => involved.add(node.id));
    upstreamShots(model.id).forEach((node) => involved.add(node.id));
    upstreamLights(model.id).forEach((node) => involved.add(node.id));
    const links = state.edges.filter((edge) => involved.has(edge.from) && involved.has(edge.to));
    detailBody.innerHTML = `
      <div class="detail-block">
        <h3>${esc(run.modelName)} · ${esc(run.time)} · 由 AI 自动判断</h3>
        <div class="kpi">
          <div><b>${summary.total}</b><span>关联资产</span></div>
          <div><b>${summary.used}</b><span>AI 采用</span></div>
          <div><b>${summary.ignored}</b><span>已忽略</span></div>
        </div>
        <p class="muted">共发现 ${summary.total} 个关联资产，AI 自动采用 ${summary.used} 个，忽略 ${summary.ignored} 个低相关资产。完全采用 ${summary.adopted} 个，部分采用 ${summary.partial} 个。</p>
        ${run.ok ? "" : `<p class="error">${esc(run.message || "")}</p>`}
      </div>
      ${shotRunBlock(run.shots)}
      ${lightRunBlock(run.lights)}
      ${section("全部关联资产", items)}
      ${section("AI 已采用资产", items.filter((item) => item.result === "adopted" || item.result === "partial"))}
      ${section("AI 未采用资产", items.filter((item) => item.result === "ignored"))}
      <div class="detail-block">
        <h3>连接关系</h3>
        ${links.length ? links.map((edge) => {
          const from = getNode(edge.from);
          const to = getNode(edge.to);
          if (!from || !to) return "";
          return `<div class="link-item">${esc(TYPES[from.type].label)}「${esc(from.name)}」 → ${esc(TYPES[to.type].label)}「${esc(displayName(to))}」</div>`;
        }).join("") : `<p class="muted">暂无连接</p>`}
      </div>
      <div class="detail-block">
        <h3>本次工作流运行记录</h3>
        ${(model.runs || []).map((entry) => `
          <div class="log-item"><b>${esc(entry.time)} · ${entry.ok ? "完成" : "失败"}</b><span>${esc(entry.modelName)}</span></div>
          ${(entry.log || []).map((line) => `<div class="log-item"><span>${esc(line.time)}</span><span>${esc(line.message)}</span></div>`).join("")}
        `).join("")}
      </div>`;
  }

  function assetCard(item) {
    return `<div class="asset-card">
      <div class="top"><b>${esc(item.name)}</b><span class="tag ${item.result}">${RESULT_TEXT[item.result]}</span></div>
      <div class="muted">${esc(TYPES[item.type]?.label || item.type)}${item.catalogId ? " · 来自素材库" : ""}${item.fileStatus === "mine" ? " · 来自本地素材" : ""} · ${esc(item.reason)}</div>
    </div>`;
  }

  function displayName(node) {
    if (node.type === "model") return (MODELS[node.modelKey] || MODELS.video).name;
    return node.name;
  }

  function updateEmpty() {
    emptyHint.hidden = state.nodes.length > 0;
  }

  function updateChrome() {
    const project = projectOf(doc.activeKey);
    const canvas = canvasOf(doc.activeKey);
    projectBtn.textContent = project.name;
    canvasBtn.textContent = canvas.name;
    pointsEl.textContent = doc.points.toLocaleString("zh-CN");
    document.getElementById("toolSelect").classList.toggle("active", state.tool === "select");
    document.getElementById("toolConnect").classList.toggle("active", state.tool === "connect");
    document.body.classList.toggle("tool-connect", state.tool === "connect");
    updateUndo();
  }

  function render() {
    renderNodes();
    applyView();
    drawEdges();
    renderAssetPanel();
    if (!detailPanel.hidden && detailModelId) renderDetails();
    updateEmpty();
    updateChrome();
    markPorts();
  }

  function fitView(save) {
    const rect = viewport.getBoundingClientRect();
    if (!state.nodes.length) {
      state.view = { x: 80, y: 80, scale: 1 };
    } else {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      state.nodes.forEach((node) => {
        const el = document.querySelector(`.node[data-id="${node.id}"]`);
        const w = el ? el.offsetWidth : nodeSize(node.type).w;
        const h = el ? el.offsetHeight : nodeSize(node.type).h;
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + w);
        maxY = Math.max(maxY, node.y + h);
      });
      const padX = 70;
      const padTop = 84;
      const padBottom = 110;
      const availW = Math.max(200, rect.width - padX * 2);
      const availH = Math.max(200, rect.height - padTop - padBottom);
      const bw = Math.max(1, maxX - minX);
      const bh = Math.max(1, maxY - minY);
      const scale = clamp(Math.min(availW / bw, availH / bh), 0.25, 1.15);
      state.view.scale = scale;
      state.view.x = (rect.width - bw * scale) / 2 - minX * scale;
      state.view.y = padTop + (availH - bh * scale) / 2 - minY * scale;
    }
    applyView();
    drawEdges();
    if (save) scheduleSave();
  }

  function zoomAt(sx, sy, factor) {
    const next = clamp(state.view.scale * factor, 0.25, 2.2);
    const worldX = (sx - state.view.x) / state.view.scale;
    const worldY = (sy - state.view.y) / state.view.scale;
    state.view.scale = next;
    state.view.x = sx - worldX * next;
    state.view.y = sy - worldY * next;
    applyView();
    drawEdges();
    scheduleSave();
  }

  function spawnPos() {
    const rect = viewport.getBoundingClientRect();
    let x = (rect.width / 2 - state.view.x) / state.view.scale - 140;
    let y = (rect.height / 2 - state.view.y) / state.view.scale - 90;
    while (state.nodes.some((node) => Math.abs(node.x - x) < 20 && Math.abs(node.y - y) < 20)) {
      x += 28;
      y += 28;
    }
    return { x, y };
  }

  function addNode(type) {
    const pos = spawnPos();
    const node = createNode(type, pos.x, pos.y);
    if (type === "text") node.text = "";
    state.nodes.push(node);
    state.selectedNodeId = node.id;
    state.selectedEdgeId = null;
    addMenu.hidden = true;
    commit();
    render();
    if (type === "shot" || type === "story") writeStorage();
  }

  function deleteNode(id) {
    if (runningId === id) stopRun(true);
    const node = getNode(id);
    const url = sessionUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    sessionUrls.delete(id);
    state.nodes = state.nodes.filter((item) => item.id !== id);
    state.edges = state.edges.filter((edge) => edge.from !== id && edge.to !== id);
    if (state.selectedNodeId === id) state.selectedNodeId = null;
    if (storyEditor.nodeId === id && storyEl && !storyEl.hidden) closeStoryStudio(false);
    if (detailModelId === id) detailPanel.hidden = true;
    commit();
    render();
    if (node && (node.type === "shot" || node.type === "story")) writeStorage();
    if (node) toast(`已删除${TYPES[node.type].label}`);
  }

  function deleteEdge(id) {
    const edge = state.edges.find((item) => item.id === id);
    const touchesShot = edge && (getNode(edge.from)?.type === "shot" || getNode(edge.to)?.type === "shot");
    state.edges = state.edges.filter((item) => item.id !== id);
    if (state.selectedEdgeId === id) state.selectedEdgeId = null;
    commit();
    render();
    if (touchesShot) writeStorage();
  }

  function createsCycle(from, to) {
    const seen = new Set();
    const stack = [to];
    while (stack.length) {
      const cur = stack.pop();
      if (cur === from) return true;
      if (seen.has(cur)) continue;
      seen.add(cur);
      state.edges.forEach((edge) => {
        if (edge.from === cur) stack.push(edge.to);
      });
    }
    return false;
  }

  function finishLink(srcId, srcSide, dstId, dstSide) {
    let from = srcId;
    let to = dstId;
    if (srcSide === "out" && dstSide === "in") {
      from = srcId;
      to = dstId;
    } else if (srcSide === "in" && dstSide === "out") {
      from = dstId;
      to = srcId;
    } else {
      toast("请从输出端口连接到输入端口");
      return;
    }
    if (from === to) {
      toast("不能将节点连接到自身");
      return;
    }
    if (state.edges.some((edge) => edge.from === from && edge.to === to)) {
      toast("连接已存在");
      return;
    }
    if (createsCycle(from, to)) {
      toast("不能形成循环连接");
      return;
    }
    state.edges.push(createEdge(from, to));
    state.selectedEdgeId = state.edges[state.edges.length - 1].id;
    state.selectedNodeId = null;
    commit();
    render();
    if (getNode(from)?.type === "shot" || getNode(to)?.type === "shot") writeStorage();
  }

  function markPorts() {
    document.querySelectorAll(".port").forEach((port) => port.classList.remove("hot"));
    if (!interaction || interaction.kind !== "link") return;
    document.querySelectorAll(".port").forEach((port) => {
      const nodeId = port.closest(".node").dataset.id;
      if (port.dataset.side !== interaction.side && nodeId !== interaction.nodeId) port.classList.add("hot");
    });
  }

  function clearCanvas() {
    if (runningId) stopRun(true);
    state.nodes = [];
    state.edges = [];
    state.selectedNodeId = null;
    state.selectedEdgeId = null;
    detailPanel.hidden = true;
    commit();
    render();
    toast("画布已清空");
  }

  function restoreDemo() {
    if (runningId) stopRun(true);
    const demo = buildDemo();
    state.nodes = demo.nodes;
    state.edges = demo.edges;
    state.selectedNodeId = null;
    state.selectedEdgeId = null;
    detailPanel.hidden = true;
    commit();
    render();
    requestAnimationFrame(() => fitView(true));
    toast("已恢复演示流程");
  }

  function focusNode(id) {
    const node = getNode(id);
    if (!node) return;
    state.selectedNodeId = id;
    state.selectedEdgeId = null;
    const rect = viewport.getBoundingClientRect();
    const size = frameOf(node);
    state.view.x = rect.width / 2 - (node.x + size.w / 2) * state.view.scale;
    state.view.y = rect.height / 2 - (node.y + size.h / 2) * state.view.scale;
    scheduleSave();
    render();
  }

  function openDetails(id) {
    detailModelId = id;
    detailPanel.hidden = false;
    assetPanel.hidden = true;
    renderDetails();
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
  }

  function openModal(html) {
    modal.innerHTML = `<div class="modal-backdrop" data-action="modal-cancel"></div><div class="modal-card">${html}</div>`;
    modal.hidden = false;
  }

  function closeModal() {
    modal.hidden = true;
    modal.innerHTML = "";
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    if (modalResolve) {
      modalResolve(false);
      modalResolve = null;
    }
  }

  function confirmBox(message) {
    return new Promise((resolve) => {
      modalResolve = resolve;
      openModal(`<h2>请确认</h2><p>${esc(message)}</p><div class="actions"><button type="button" class="btn ghost" data-action="modal-cancel">取消</button><button type="button" class="btn primary" data-action="modal-ok">确定</button></div>`);
    });
  }

  function openAssetPreview(id) {
    const node = getNode(id);
    if (!node) return;
    const url = sessionUrls.get(id);
    let media = thumbBlock(node);
    if (url && node.type === "video") media = `<video src="${url}" controls></video>`;
    if (url && node.type === "audio") media = `<audio src="${url}" controls></audio>`;
    if (url && (node.type === "image" || node.type === "character" || node.type === "scene" || node.type === "expression" || node.type === "effect")) media = `<img alt="" src="${url}" />`;
    if (node.type === "action" && url) media = String(node.mime).startsWith("image/") ? `<img alt="" src="${url}" />` : `<video src="${url}" controls></video>`;
    const text = node.type === "text"
      ? `<p class="story-bound">${esc(node.text || "尚未填写文本要求")}</p>`
      : (node.text ? `<p class="story-bound">${esc(node.text)}</p>` : "");
    const mineNote = node.fileStatus === "mine"
      ? `<p class="muted">这是压缩后的本地预览。原始文件不会保存；若刷新前没有点击右上角「保存」，这张预览也会丢失。</p>`
      : "";
    openModal(`<h2>${esc(node.name)}</h2><p class="muted">${esc(TYPES[node.type].label)} · ${esc(fileStatusText(node))}</p><div class="player-stage">${media}</div>${text}${mineNote}<div class="actions"><button type="button" class="btn primary" data-action="modal-cancel">关闭</button></div>`);
  }

  function openOutputPreview(id) {
    const node = getNode(id);
    if (!node) return;
    if (!node.result) {
      openModal(`<h2>预览</h2><p>尚未生成结果，请先运行工作流。</p><div class="actions"><button type="button" class="btn primary" data-action="modal-cancel">关闭</button></div>`);
      return;
    }
    const result = node.result;
    openModal(`<h2>模拟预览</h2><div class="player"><div class="player-stage" id="playStage">${coverSvg(result.modelKey)}</div><div class="bar"><span id="playBar" style="width:0%"></span></div><div class="row"><span id="playTime">00:00 / 00:05</span><button type="button" class="btn primary sm" data-action="play-sim">播放</button></div><p class="muted">${result.duration} 秒 · ${esc(result.aspect)} · 采用 ${result.adopted} 个资产 · ${esc(result.modelName)}</p></div><div class="actions"><button type="button" class="btn ghost" data-action="modal-cancel">关闭</button></div>`);
  }

  function playSim() {
    if (playTimer) clearInterval(playTimer);
    const bar = document.getElementById("playBar");
    const label = document.getElementById("playTime");
    const started = Date.now();
    playTimer = setInterval(() => {
      const t = Math.min(5, (Date.now() - started) / 1000);
      if (bar) bar.style.width = `${(t / 5) * 100}%`;
      if (label) label.textContent = `00:0${Math.floor(t)} / 00:05`;
      if (t >= 5) {
        clearInterval(playTimer);
        playTimer = null;
      }
    }, 100);
  }

  function showDownload() {
    openModal(`<h2>无法下载</h2><p>当前为前端演示版本，暂未生成真实视频。</p><div class="actions"><button type="button" class="btn primary" data-action="modal-cancel">知道了</button></div>`);
  }

  function showShortcuts() {
    const rows = [
      ["滚轮", "缩放画布"],
      ["拖拽空白", "平移画布"],
      ["拖拽节点", "移动节点"],
      ["拖拽边或角", "从任意方向放大或缩小"],
      ["双击边或角", "恢复默认大小"],
      ["拖拽端口", "创建连线"],
      ["Delete", "删除选中节点或连线"],
      ["Ctrl + Z", "撤销"],
      ["Ctrl + Y", "重做"],
      ["V", "选择工具"],
      ["C", "连线工具"],
      ["Esc", "取消连线或关闭面板"]
    ];
    openModal(`<h2>快捷键</h2><div class="shortcut-list">${rows.map(([k, v]) => `<div><kbd>${k}</kbd><span>${v}</span></div>`).join("")}</div><div class="actions"><button type="button" class="btn primary" data-action="modal-cancel">关闭</button></div>`);
  }

  function showHelp() {
    openModal(`<h2>帮助</h2>
      <p>这是纯前端演示。文件只在浏览器本地预览，识别、生成和进度都是模拟结果，不会上传，也不会调用真实 AI。</p>
      <p>默认画布已经连好一条可运行流程：人物、场景、文本接入 NEOX Video Mock，再接到视频输出。点击模型上的「运行工作流」即可看到完整过程。</p>
      <p>采用哪些资产由模拟算法按类型、连接关系和相关度自动决定，不能手动指定数量。音频在非口型模型上通常会被忽略，重复的场景会被判定为低相关。</p>
      <p>拖动节点任意一条边或一个角都可以放大、缩小。双击边或角恢复默认大小。画布改动后需要点击右上角「保存」才会写入本机浏览器。可用「清空画布」或「恢复演示流程」重置当前画布，这两项都可以撤销。</p>
      <p>底部「素材管理」和「NEOX 素材库」节点打开的是同一个素材库。复制到画布的素材会生成新的资产节点，可连接到视频模型。本地上传的图片只保留压缩预览，原始文件不会保存。</p>
      <p>双击「镜头选择」可在参考镜头、自由设置和我的镜头之间编辑。点「应用到画布」后，只保存当前这个节点，并可以连到视频模型。画面上的运动是效果示意，不是生成出来的视频。</p>
      <p>双击「专业光影台」可选择参考光影或自己加灯。中间的画面是光影效果示意，不会对照片做真实重打光。应用到当前镜头后，把光影节点连到视频模型，运行时会带上这组布光参数。</p>
      <p>点击「小说故事构思」卡片可在当前画布上写故事。示例模板只是填好的起步内容，梗概也是按填写内容整理的，不是 AI 生成，不扣积分。拆成画布节点后，原来的构思仍留在这张卡片里。</p>
      <div class="actions"><button type="button" class="btn primary" data-action="modal-cancel">知道了</button></div>`);
  }

  function positionTour() {
    const anchor = document.getElementById("btnAdd").getBoundingClientRect();
    tourEl.hidden = false;
    tourEl.style.left = `${anchor.left + anchor.width / 2}px`;
    tourEl.style.top = `${anchor.top - 16}px`;
    tourEl.style.transform = "translate(-50%, -100%)";
    const step = TOUR[tourIndex];
    document.getElementById("tourTitle").textContent = step.title;
    document.getElementById("tourText").textContent = step.text;
    document.getElementById("tourStep").textContent = `${tourIndex + 1} / ${TOUR.length}`;
    document.querySelector("[data-action='tour-next']").textContent = tourIndex === TOUR.length - 1 ? "完成" : "下一步";
  }

  function startTour() {
    tourIndex = 0;
    positionTour();
  }

  function closeMenus() {
    projectMenu.hidden = true;
    canvasMenu.hidden = true;
    addMenu.hidden = true;
    accountMenu.hidden = true;
  }

  function openAccountMenu() {
    closeMenus();
    renderAccountMenu();
    accountMenu.hidden = false;
    const rect = accountBtn.getBoundingClientRect();
    const width = accountMenu.offsetWidth || 300;
    accountMenu.style.left = `${Math.max(12, rect.right - width)}px`;
    accountMenu.style.top = `${rect.bottom + 8}px`;
  }

  function openProjectMenu() {
    closeMenus();
    projectMenu.innerHTML = PROJECTS.map((project) => `<button type="button" data-action="project" data-id="${project.id}" class="${doc.activeKey.startsWith(project.id + ":") ? "active" : ""}">${project.name}</button>`).join("");
    const rect = projectBtn.getBoundingClientRect();
    projectMenu.style.left = `${rect.left}px`;
    projectMenu.style.top = `${rect.bottom + 8}px`;
    projectMenu.hidden = false;
  }

  function openCanvasMenu() {
    closeMenus();
    const project = projectOf(doc.activeKey);
    const current = canvasOf(doc.activeKey).id;
    projectMenu.hidden = true;
    canvasMenu.innerHTML = project.canvases.map((canvas) => `<button type="button" data-action="canvas" data-id="${canvas.id}" class="${canvas.id === current ? "active" : ""}">${canvas.name}</button>`).join("")
      + `<hr /><button type="button" class="danger" data-action="clear">清空画布</button><button type="button" data-action="restore">恢复演示流程</button>`;
    const rect = canvasBtn.getBoundingClientRect();
    canvasMenu.style.left = `${rect.left}px`;
    canvasMenu.style.top = `${rect.bottom + 8}px`;
    canvasMenu.hidden = false;
  }

  function openAddMenu() {
    const cards = Object.entries(TYPES).filter(([type]) => type !== "start" && type !== "expression" && type !== "effect").map(([type, meta]) => `
      <button type="button" class="type-card" data-action="add-node" data-type="${type}">
        <span class="ico">${icon(type)}</span>
        <b>${meta.label}</b>
        <span>${meta.desc}</span>
      </button>`).join("");
    addMenu.innerHTML = `<h3>添加节点</h3><p class="muted">选择一个节点放到画布中心</p><div class="grid-types">${cards}</div>`;
    const rect = document.getElementById("btnAdd").getBoundingClientRect();
    addMenu.hidden = false;
    const width = addMenu.offsetWidth;
    let left = rect.left + rect.width / 2 - width / 2;
    left = clamp(left, 12, window.innerWidth - width - 12);
    addMenu.style.left = `${left}px`;
    addMenu.style.top = `${rect.top - 10}px`;
    addMenu.style.transform = "translateY(-100%)";
  }

  function regenFromOutput(outputId) {
    const incoming = state.edges.filter((edge) => edge.to === outputId);
    const modelEdge = incoming.map((edge) => getNode(edge.from)).find((node) => node && node.type === "model");
    let model = modelEdge;
    if (!model) {
      const stack = incoming.map((edge) => edge.from);
      const seen = new Set(stack);
      while (stack.length && !model) {
        const cur = stack.pop();
        state.edges.forEach((edge) => {
          if (edge.to === cur && !seen.has(edge.from)) {
            seen.add(edge.from);
            const node = getNode(edge.from);
            if (node?.type === "model") model = node;
            else stack.push(edge.from);
          }
        });
      }
    }
    if (!model) {
      toast("请先把视频模型连接到这个输出节点");
      return;
    }
    runWorkflow(model.id);
  }

  function onPickFile(id) {
    const node = getNode(id);
    if (!node || !ACCEPT[node.type]) return;
    fileTargetId = id;
    fileInput.accept = ACCEPT[node.type];
    fileInput.value = "";
    fileInput.click();
  }

  function compressImage(dataUrl, maxW = 480, quality = 0.72) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ url: canvas.toDataURL("image/jpeg", quality), width: img.width, height: img.height });
      };
      img.onerror = () => resolve({ url: "", width: 0, height: 0 });
      img.src = dataUrl;
    });
  }

  function captureVideoFrame(url) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.src = url;
      const fail = () => resolve("");
      video.onerror = fail;
      video.onloadeddata = () => {
        try { video.currentTime = Math.min(0.2, (video.duration || 1) / 4); }
        catch (err) { fail(); }
      };
      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = 180;
          canvas.getContext("2d").drawImage(video, 0, 0, 320, 180);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } catch (err) { fail(); }
      };
    });
  }

  async function onFile(file) {
    const node = getNode(fileTargetId);
    fileTargetId = null;
    if (!node || !file) return;
    const prev = sessionUrls.get(node.id);
    if (prev) URL.revokeObjectURL(prev);
    const url = URL.createObjectURL(file);
    sessionUrls.set(node.id, url);
    node.fileName = file.name;
    node.mime = file.type || "";
    node.fileStatus = "local";
    node.thumb = "";
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = async () => {
        const packed = await compressImage(String(reader.result || ""));
        node.thumb = packed.url || "";
        commit();
        render();
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      node.thumb = await captureVideoFrame(url);
      commit();
      render();
    } else {
      commit();
      render();
    }
    toast("已使用本地文件，不会上传");
  }

  function nearestAspect(width, height) {
    const ratio = width / Math.max(1, height);
    const options = [["16:9", 16 / 9], ["9:16", 9 / 16], ["1:1", 1], ["4:3", 4 / 3], ["3:4", 3 / 4]];
    options.sort((a, b) => Math.abs(a[1] - ratio) - Math.abs(b[1] - ratio));
    return options[0][0];
  }

  function catalogById(id) {
    return CATALOG.find((item) => item.id === id) || null;
  }

  function mineById(id) {
    return library.mine.find((item) => item.id === id) || null;
  }

  function libraryItem(id) {
    const catalog = catalogById(id);
    if (catalog) return catalog;
    const mine = mineById(id);
    return mine ? { ...mine, mine: true, licensed: false } : null;
  }

  function visibleLibraryItems() {
    const query = library.query.trim().toLowerCase();
    let list = library.view === "mine"
      ? library.mine.map((item) => ({ ...item, mine: true, licensed: false }))
      : CATALOG;
    if (library.view === "catalog" && library.category !== "all") {
      list = list.filter((item) => item.category === library.category);
    }
    if (library.licensedOnly) list = list.filter((item) => item.licensed === true);
    if (query) {
      list = list.filter((item) => `${item.name} ${item.kind}`.toLowerCase().includes(query));
    }
    return list;
  }

  function libraryThumb(item) {
    if (item.mine && safeThumb(item.thumb)) return `<img alt="" src="${item.thumb}" />`;
    return catalogSvg(item.id);
  }

  function loadMine() {
    try {
      const raw = localStorage.getItem(MINE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const items = Array.isArray(data.items) ? data.items : [];
      library.mine = items.filter((item) => item && typeof item.id === "string" && typeof item.name === "string").map((item) => ({
        id: item.id,
        name: String(item.name).slice(0, 24),
        category: MINE_KINDS[item.category] ? item.category : "scene",
        kind: MINE_KINDS[item.category] ? MINE_KINDS[item.category].kind : "场景图片",
        aspect: typeof item.aspect === "string" ? item.aspect : "16:9",
        thumb: safeThumb(item.thumb),
        fileName: typeof item.fileName === "string" ? item.fileName.slice(0, 80) : "",
        licensed: false,
        mine: true
      })).slice(0, 24);
    } catch (err) {
      library.mine = [];
    }
  }

  function saveMine() {
    try {
      localStorage.setItem(MINE_KEY, JSON.stringify({
        items: library.mine.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          aspect: item.aspect,
          thumb: safeThumb(item.thumb),
          fileName: item.fileName || ""
        }))
      }));
      library.mineSaved = true;
      return true;
    } catch (err) {
      library.mineSaved = false;
      return false;
    }
  }

  function loadLibraryTour() {
    library.tour = localStorage.getItem(LIBRARY_TOUR_KEY) !== "1";
  }

  function dismissLibraryTour() {
    library.tour = false;
    localStorage.setItem(LIBRARY_TOUR_KEY, "1");
    renderLibraryGrid();
  }

  function renderLibraryNav() {
    const nav = document.getElementById("libraryNav");
    nav.innerHTML = LIBRARY_CATS.map((cat) => `
      <button type="button" class="${library.view === "catalog" && library.category === cat.id ? "active" : ""}" data-action="library-cat" data-id="${cat.id}">
        <span class="ico">${icon(cat.icon)}</span>${cat.label}
      </button>`).join("");
  }

  function renderLibraryGrid() {
    const grid = document.getElementById("libraryGrid");
    const note = document.getElementById("libraryNote");
    const items = visibleLibraryItems();
    if (library.view === "mine") {
      note.hidden = false;
      note.textContent = library.mineSaved
        ? "本地图片只在本机浏览器保存压缩预览，不会上传。原始文件刷新后不会保留。复制到画布的节点会随画布保存；如果预览太大被省略，刷新后需要重新选择。"
        : "这批本地图片没能写入浏览器存储，刷新后会丢失。原始文件也不会保留。";
    } else {
      note.hidden = true;
      note.textContent = "";
    }
    if (!items.length) {
      const empty = library.view === "mine"
        ? "还没有本地素材。选择一张图片后可以在这里预览，再复制到画布。"
        : (library.licensedOnly ? "当前没有已授权素材。关闭「仅显示已授权素材」可查看全部演示素材。" : "没有匹配的素材。");
      grid.innerHTML = `<p class="lib-empty">${empty}</p>${library.view === "mine" ? `<button type="button" class="btn primary" data-action="library-upload">选择本地图片</button>` : ""}`;
      return;
    }
    grid.innerHTML = items.map((item, index) => `
      <article class="lib-card ${item.id === library.selectedId ? "is-selected" : ""}" data-action="library-select" data-id="${item.id}">
        <div class="lib-thumb">${libraryThumb(item)}${item.licensed === true ? `<span class="lib-check" aria-label="已授权">✓</span>` : ""}</div>
        <b>${esc(item.name)}</b>
        <div class="lib-actions">
          <button type="button" class="btn ghost sm" data-action="library-preview" data-id="${item.id}">预览</button>
          <button type="button" class="btn primary sm" data-action="library-copy" data-id="${item.id}">复制到画布</button>
        </div>
        ${library.tour && library.view === "catalog" && index === 0 ? `
          <div class="lib-tour">
            <b>使用NEOX素材</b>
            <p>点击这里，把素材复制到你的画布</p>
            <div class="lib-actions">
              <button type="button" class="btn ghost sm" data-action="library-tour-skip">跳过</button>
              <button type="button" class="btn primary sm" data-action="library-tour-ok">知道了</button>
            </div>
          </div>` : ""}
      </article>`).join("") + (library.view === "mine" ? `<button type="button" class="btn ghost" data-action="library-upload">继续选择本地图片</button>` : "");
  }

  function renderLibraryPreview() {
    const panel = document.getElementById("libraryPreview");
    const items = visibleLibraryItems();
    let item = libraryItem(library.selectedId);
    if (!item || !items.some((entry) => entry.id === item.id)) item = items[0] || null;
    if (item) library.selectedId = item.id;
    if (!item) {
      panel.innerHTML = `<h3>素材预览</h3><p class="muted">选择一张素材后，这里会显示大图、类型和画幅。</p>`;
      return;
    }
    const kindOptions = Object.entries(MINE_KINDS).map(([key, meta]) => (
      `<option value="${key}" ${key === item.category ? "selected" : ""}>${meta.kind}</option>`
    )).join("");
    panel.innerHTML = `
      <h3>素材预览</h3>
      <div class="lib-stage">${libraryThumb(item)}${item.licensed === true ? `<span class="lib-badge">NEOX已授权</span>` : ""}</div>
      <strong>${esc(item.name)}</strong>
      ${item.licensed === true ? "" : `<p class="muted">未标记授权。只有明确授权的素材才会显示“已授权”。</p>`}
      <div class="library-meta"><span>类型</span><b>${esc(item.kind)}</b></div>
      <div class="library-meta"><span>画幅</span><b>${esc(item.aspect)}</b></div>
      ${item.mine ? `<label>复制到画布的类型<select id="mineCategory" aria-label="复制到画布的类型">${kindOptions}</select></label>` : `<div class="library-meta"><span>来源</span><b>NEOX 演示素材</b></div>`}
      <button type="button" class="btn primary block" data-action="library-copy" data-id="${item.id}">复制到当前画布</button>
      <p class="muted">复制后会生成一个新素材节点，不会覆盖已经在画布上的节点。</p>
      <button type="button" class="btn ghost block" data-action="library-preview" data-id="${item.id}">预览</button>`;
  }

  function renderLibraryCanvas() {
    const box = document.getElementById("libraryCanvas");
    const assets = state.nodes.filter((node) => ASSET_TYPES.has(node.type));
    if (!assets.length) {
      box.innerHTML = `<h3>画布中的素材</h3><p class="muted">复制后的素材会出现在这里，点击可定位到画布。底部「素材管理」打开的也是这个库。</p>`;
      return;
    }
    box.innerHTML = `<h3>画布中的素材</h3><div class="library-on-canvas">${assets.map((node) => `
      <button type="button" data-action="library-focus" data-id="${node.id}">
        <b>${esc(node.name)}</b><span>${esc(TYPES[node.type].label)}</span>
      </button>`).join("")}</div>`;
  }

  function syncLibrarySelection() {
    const items = visibleLibraryItems();
    if (!items.some((item) => item.id === library.selectedId)) {
      library.selectedId = items[0] ? items[0].id : "";
    }
  }

  function renderLibrary() {
    syncLibrarySelection();
    libraryEl.hidden = false;
    if (storyEl && !storyEl.hidden) storyEl.hidden = true;
    document.getElementById("libraryLicensed").checked = library.licensedOnly;
    document.getElementById("libraryMineBtn").classList.toggle("primary", library.view === "mine");
    document.getElementById("libraryMineBtn").classList.toggle("ghost", library.view !== "mine");
    document.getElementById("libraryHeading").textContent = library.view === "mine" ? "我的素材" : "NEOX精选素材";
    const search = document.getElementById("librarySearch");
    if (search.value !== library.query) search.value = library.query;
    renderLibraryNav();
    renderLibraryGrid();
    renderLibraryPreview();
    renderLibraryCanvas();
  }

  function openLibrary() {
    closeMenus();
    assetPanel.hidden = true;
    detailPanel.hidden = true;
    if (modal && !modal.hidden) closeModal();
    renderLibrary();
  }

  function closeLibrary() {
    libraryEl.hidden = true;
  }

  function selectLibrary(id) {
    library.selectedId = id;
    renderLibraryGrid();
    renderLibraryPreview();
  }

  function previewLibrary(id) {
    const item = libraryItem(id);
    if (!item) return;
    library.selectedId = id;
    renderLibraryPreview();
    const license = item.licensed === true ? "NEOX已授权" : "未标记授权";
    openModal(`<h2>${esc(item.name)}</h2><p class="muted">${esc(item.kind)} · ${esc(item.aspect)} · ${license}</p><div class="player-stage">${libraryThumb(item)}</div><p class="muted">${item.mine ? "本地图片只显示压缩预览，原始文件不会保存。" : "这是前端演示素材，不会上传。"}</p><div class="actions"><button type="button" class="btn ghost" data-action="modal-cancel">关闭</button><button type="button" class="btn primary" data-action="library-copy" data-id="${item.id}">复制到当前画布</button></div>`);
  }

  function copyLibraryItem(id) {
    const item = libraryItem(id);
    if (!item) return;
    const type = item.mine ? (MINE_KINDS[item.category]?.node || "image") : (MINE_KINDS[item.category]?.node || "image");
    const pos = spawnPos();
    const node = createNode(type, pos.x, pos.y, {
      name: item.name,
      fileStatus: item.mine ? "mine" : "catalog",
      thumb: item.mine ? safeThumb(item.thumb) : "",
      fileName: item.mine ? (item.fileName || "") : "",
      catalogId: item.mine ? "" : item.id,
      libraryCategory: item.category
    });
    state.nodes.push(node);
    state.selectedNodeId = node.id;
    state.selectedEdgeId = null;
    closeModal();
    closeLibrary();
    commit();
    render();
    if (writeStorage()) toast(`已将「${item.name}」复制到画布`);
  }

  async function onLibraryFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      toast("请选择图片文件");
      return;
    }
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
    if (!dataUrl) {
      toast("这张图片无法读取");
      return;
    }
    const packed = await compressImage(dataUrl, 360, 0.62);
    if (!packed.url) {
      toast("这张图片无法预览");
      return;
    }
    if (packed.url.length > 120000) {
      toast("这张图片压缩后仍然过大，本次不能保存预览");
      return;
    }
    const item = {
      id: uid("m"),
      name: file.name.replace(/\.[^.]+$/, "").slice(0, 24) || "本地图片",
      category: "scene",
      kind: "场景图片",
      aspect: nearestAspect(packed.width, packed.height),
      thumb: packed.url,
      fileName: file.name,
      licensed: false,
      mine: true
    };
    library.mine.unshift(item);
    library.mine = library.mine.slice(0, 24);
    library.view = "mine";
    library.selectedId = item.id;
    const saved = saveMine();
    renderLibrary();
    toast(saved ? "已加入我的素材，可以预览并复制到画布" : "已加入本次预览，但浏览器未能保存，刷新后会丢失");
  }

  function kelvinToHex(k) {
    const t = clamp(k, 2000, 9000);
    const mix = (a, b, u) => {
      const pick = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
      const A = pick(a);
      const B = pick(b);
      return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join("");
    };
    if (t <= 4500) return mix("#ff7a2a", "#ffe0b0", (t - 2000) / 2500);
    if (t <= 6500) return mix("#ffe0b0", "#f4f7ff", (t - 4500) / 2000);
    return mix("#f4f7ff", "#9ecbff", (t - 6500) / 2500);
  }

  function hexColor(value, fallback) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : fallback;
  }

  function findVariant(id) {
    if (!id) return null;
    for (let i = 0; i < LIGHT_BASES.length; i += 1) {
      const variant = LIGHT_BASES[i].variants.find((item) => item.id === id);
      if (variant) return { base: LIGHT_BASES[i], variant };
    }
    return null;
  }

  function sanitizeLook(raw) {
    const fallback = { sky: ["#10243f", "#07111f"], figure: "lit", shadowLen: 14, fog: 0, window: 0, blinds: 0, dapple: 0, rain: 0, rays: 0, neon: "", moon: 0, fire: 0, bolt: 0, holo: 0, door: 0, wet: 0, lamp: 0, trees: 0, propX: 160 };
    if (!raw || typeof raw !== "object") return fallback;
    const fog = Number(raw.fog);
    const door = Number(raw.door);
    return {
      sky: [hexColor(raw.sky && raw.sky[0], fallback.sky[0]), hexColor(raw.sky && raw.sky[1], fallback.sky[1])],
      figure: LIGHT_FIGURES.includes(raw.figure) ? raw.figure : "lit",
      shadowLen: clamp(Math.round(Number(raw.shadowLen) || 0), 0, 80),
      fog: Number.isFinite(fog) ? clamp(fog, 0, 1) : 0,
      window: clamp(Math.round(Number(raw.window) || 0), 0, 3),
      blinds: clamp(Math.round(Number(raw.blinds) || 0), 0, 12),
      dapple: clamp(Math.round(Number(raw.dapple) || 0), 0, 14),
      rain: raw.rain ? 1 : 0,
      rays: clamp(Math.round(Number(raw.rays) || 0), 0, 6),
      neon: raw.neon === "pb" || raw.neon === "rc" ? raw.neon : "",
      moon: raw.moon ? 1 : 0,
      fire: clamp(Math.round(Number(raw.fire) || 0), 0, 3),
      bolt: clamp(Math.round(Number(raw.bolt) || 0), 0, 3),
      holo: clamp(Math.round(Number(raw.holo) || 0), 0, 3),
      door: Number.isFinite(door) ? clamp(door, 0, 1) : 0,
      wet: raw.wet ? 1 : 0,
      lamp: clamp(Math.round(Number(raw.lamp) || 0), 0, 3),
      trees: raw.trees ? 1 : 0,
      propX: clamp(Math.round(Number(raw.propX) || 160), 0, 300)
    };
  }

  function sanitizeBulb(raw) {
    if (!raw || typeof raw !== "object") return null;
    const kelvin = clamp(Math.round(Number(raw.kelvin) || 0), 0, 9000);
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : uid("lt"),
      on: raw.on !== false,
      role: pickEnum(raw.role, LIGHT_ROLES, "主光"),
      source: pickEnum(raw.source, LIGHT_SOURCES, "灯具"),
      x: clamp(Math.round(Number(raw.x) || 50), 0, 100),
      z: clamp(Math.round(Number(raw.z) || 40), 0, 100),
      height: clamp(Math.round(Number(raw.height) || 50), 0, 100),
      brightness: clamp(Math.round(Number(raw.brightness) || 50), 0, 100),
      spread: clamp(Math.round(Number(raw.spread) || 40), 4, 100),
      softness: clamp(Math.round(Number(raw.softness) || 40), 0, 100),
      shadow: clamp(Math.round(Number(raw.shadow) || 30), 0, 100),
      color: kelvin >= 2000 ? kelvinToHex(kelvin) : hexColor(raw.color, "#fff1d6"),
      kelvin: kelvin >= 2000 ? kelvin : 0,
      time: pickEnum(raw.time, LIGHT_TIMES, "保持不变")
    };
  }

  function sanitizeLight(raw) {
    if (!raw || typeof raw !== "object") return null;
    const found = findVariant(raw.variantId);
    const lights = (Array.isArray(raw.lights) ? raw.lights : []).map(sanitizeBulb).filter(Boolean).slice(0, 8);
    return {
      name: String(raw.name || "未命名光影").slice(0, 24),
      desc: String(raw.desc || "").slice(0, 80),
      baseId: found ? found.base.id : (LIGHT_BASES.some((item) => item.id === raw.baseId) ? raw.baseId : ""),
      variantId: found ? found.variant.id : "",
      look: sanitizeLook(raw.look || (found ? found.variant.look : null)),
      lights,
      customId: typeof raw.customId === "string" ? raw.customId : ""
    };
  }

  function blankLightConfig() {
    return sanitizeLight({
      name: "未命名光影",
      desc: "从空白方案开始，光位和颜色都可以自己加。",
      baseId: "",
      variantId: "",
      look: { sky: ["#10243f", "#07111f"], figure: "lit", shadowLen: 12, fog: 0, window: 0, blinds: 0, dapple: 0, rain: 0, rays: 0, neon: "", moon: 0, fire: 0, bolt: 0, holo: 0, door: 0, wet: 0, lamp: 0, trees: 0, propX: 160 },
      lights: [],
      customId: ""
    });
  }

  function lightSummary(cfg) {
    const on = ((cfg && cfg.lights) || []).filter((item) => item.on);
    if (!on.length) return "没有开启的光源";
    return on.map((item) => `${item.role}·${item.source}`).join("、");
  }

  function lightPlaceText(light) {
    const side = light.x < 40 ? "左" : light.x > 60 ? "右" : "正";
    const depth = light.z < 40 ? "前" : light.z > 60 ? "后" : "中";
    const high = light.height < 34 ? "低" : light.height > 66 ? "高" : "中";
    return `${side}${depth} · 高度${high}`;
  }

  function lightBlobs(cfg, gid) {
    return ((cfg && cfg.lights) || []).filter((item) => item.on).map((light, index) => {
      const sx = 28 + light.x / 100 * 264;
      const sy = 26 + (100 - light.height) / 100 * 70 + light.z / 100 * 26;
      const rx = 14 + light.spread * 0.85;
      const ry = Math.max(12, rx * (0.34 + (100 - light.softness) / 420));
      const blur = (1 + (100 - light.softness) / 16).toFixed(1);
      const op = (0.16 + light.brightness / 150).toFixed(2);
      const anim = light.time === "闪烁" ? "is-flicker" : light.time === "渐亮" ? "is-rise" : light.time === "渐暗" ? "is-fall" : "";
      const fid = `${gid}b${index}`;
      return `<defs><filter id="${fid}"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><ellipse class="${anim}" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${light.color}" opacity="${op}" filter="url(#${fid})"/>`;
    }).join("");
  }

  function lightStageSvg(cfg, overlay) {
    const look = sanitizeLook(cfg && cfg.look);
    const gid = `lg${paintSeq++}`;
    const lights = ((cfg && cfg.lights) || []).filter((item) => item.on);
    const key = lights.slice().sort((a, b) => b.brightness - a.brightness)[0];
    const dx = key ? (key.x - 50) * look.shadowLen / 28 : 0;
    const shadow = key ? (0.08 + key.shadow / 180).toFixed(2) : "0.12";
    let scene = "";
    if (!overlay) {
      const x = look.propX;
      scene += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${look.sky[0]}"/><stop offset="1" stop-color="${look.sky[1]}"/></linearGradient></defs>`;
      scene += `<rect width="320" height="180" fill="url(#${gid})"/>`;
      if (look.moon) scene += `<circle cx="${x}" cy="34" r="${look.fog > 0.4 ? 26 : 13}" fill="#e7f2ff" opacity="${look.fog > 0.4 ? 0.35 : 0.95}"/><circle cx="${x}" cy="34" r="11" fill="#f7fbff"/>`;
      if (look.trees) scene += `<path d="M18 150 L48 78 L78 150 Z" fill="#0c2418"/><path d="M70 150 L108 62 L146 150 Z" fill="#12341f"/><path d="M210 150 L246 70 L286 150 Z" fill="#0e2818"/>`;
      if (look.window) {
        const glow = look.window === 1 ? 0.42 : 0.88;
        scene += `<rect x="${x}" y="26" width="52" height="84" rx="2" fill="${look.window === 1 ? "#d5e6f4" : "#ffe7c4"}" opacity="${glow}"/>`;
      }
      if (look.blinds) {
        for (let i = 0; i < look.blinds; i += 1) scene += `<rect x="0" y="${36 + i * (110 / look.blinds)}" width="320" height="3" fill="#05070c" opacity="0.45"/>`;
      }
      if (look.door) scene += `<rect x="${250 - look.door * 28}" y="28" width="${18 + look.door * 70}" height="122" fill="#fff6e8" opacity="${0.45 + look.door * 0.5}"/>`;
      if (look.rays) {
        for (let i = 0; i < look.rays; i += 1) scene += `<polygon points="${x + i * 18},20 ${x + 10 + i * 18},20 ${x - 20 + i * 28},150 ${x - 36 + i * 28},150" fill="#fff6dd" opacity="0.18"/>`;
      }
      if (look.dapple) {
        for (let i = 0; i < look.dapple; i += 1) scene += `<ellipse cx="${40 + (i * 47) % 250}" cy="${48 + (i * 29) % 90}" rx="${8 + (i % 3) * 4}" ry="${5 + (i % 2) * 3}" fill="#05080c" opacity="0.38"/>`;
      }
      if (look.rain) {
        for (let i = 0; i < 14; i += 1) scene += `<path d="M${18 + i * 22} ${8 + (i % 4) * 10} l-6 16" stroke="#d5e6f4" stroke-width="1" opacity="0.45"/>`;
      }
      if (look.neon === "pb") scene += `<rect x="18" y="48" width="36" height="14" fill="#ff4f9a"/><rect x="262" y="58" width="40" height="12" fill="#3aa0ff"/>`;
      if (look.neon === "rc") scene += `<rect x="16" y="52" width="34" height="16" fill="#ff3b4e"/><rect x="266" y="44" width="36" height="14" fill="#14e0d0"/>`;
      if (look.lamp === 1) scene += `<rect x="${x}" y="96" width="16" height="28" fill="#3a2a18"/><rect x="${x - 10}" y="84" width="36" height="8" rx="2" fill="#ffb15a"/>`;
      if (look.lamp === 2) scene += `<path d="M${x} 18 v24" stroke="#c9a27a"/><path d="M${x - 16} 42 h32 l-6 10 h-20 z" fill="#ffc27a"/>`;
      if (look.lamp === 3) scene += `<rect x="${x}" y="118" width="6" height="16" fill="#f2efe6"/><ellipse cx="${x + 3}" cy="112" rx="7" ry="10" fill="#ff8a32" opacity="0.9"/>`;
      if (look.fire) scene += `<ellipse cx="${look.fire === 3 ? 230 : 70}" cy="${look.fire === 3 ? 70 : 132}" rx="${20 + look.fire * 10}" ry="${12 + look.fire * 6}" fill="#ff6a1a" opacity="0.75"/>`;
      if (look.bolt) {
        const bolts = look.bolt === 1 ? [210] : look.bolt === 3 ? [48, 120, 230] : [250];
        bolts.forEach((bx) => { scene += `<polyline points="${bx},16 ${bx - 10},48 ${bx + 4},48 ${bx - 14},92" fill="none" stroke="#f4f8ff" stroke-width="2"/>`; });
      }
      if (look.holo === 1) scene += `<g stroke="#14e0d0" opacity="0.7">${[0, 1, 2, 3].map((i) => `<path d="M150 ${70 + i * 8} h36"/>`).join("")}${[0, 1, 2].map((i) => `<path d="M${156 + i * 12} 68 v28"/>`).join("")}</g>`;
      if (look.holo === 2) scene += `<path d="M120 150 C130 90 150 70 168 78 C190 88 200 120 214 150" fill="none" stroke="#00d7ff" stroke-width="3"/>`;
      if (look.holo === 3) scene += `<rect class="is-scan" x="0" y="70" width="320" height="8" fill="#7ef6ff" opacity="0.55"/>`;
      if (look.fog) scene += `<rect width="320" height="180" fill="#d5e2ee" opacity="${(look.fog * 0.38).toFixed(2)}"/>`;
      scene += `<rect y="132" width="320" height="48" fill="#071018"/>`;
      if (look.wet) scene += `<ellipse cx="170" cy="150" rx="90" ry="10" fill="#ff4f9a" opacity="0.25"/><ellipse cx="210" cy="156" rx="70" ry="7" fill="#3aa0ff" opacity="0.28"/>`;
      const fill = look.figure === "silhouette" ? "#05070a" : look.figure === "rim" || look.figure === "uplight" ? "#1a2433" : "#d7e4f4";
      const suit = look.figure === "silhouette" ? "#05070a" : "#16345c";
      const rim = look.figure === "rim" ? `stroke="${lights[0] ? lights[0].color : "#ffe0a8"}" stroke-width="3"` : "";
      scene += `<g transform="translate(168 74)"><circle cx="0" cy="0" r="16" fill="${fill}" ${rim}/><path d="M-28 78c4-34 14-46 28-46s24 12 28 46" fill="${suit}" ${rim}/>`;
      if (look.figure === "eyes") scene += `<circle cx="-6" cy="-1" r="2.3" fill="#fff"/><circle cx="7" cy="-1" r="2.3" fill="#fff"/>`;
      scene += `</g>`;
      if (look.figure === "half") scene += `<rect x="168" y="56" width="46" height="96" fill="#05070a" opacity="0.78"/>`;
      if (look.figure === "uplight") scene += `<ellipse cx="168" cy="132" rx="34" ry="16" fill="${lights[0] ? lights[0].color : "#fff6ea"}" opacity="0.35"/>`;
      scene += `<ellipse cx="${(168 + dx).toFixed(1)}" cy="148" rx="${(18 + look.shadowLen * 0.45).toFixed(1)}" ry="7" fill="#020308" opacity="${shadow}"/>`;
    }
    return `<svg class="light-svg" viewBox="0 0 320 180" aria-hidden="true">${scene}${lightBlobs(cfg, gid)}</svg>`;
  }

  function lightAssetMarkup() {
    const ids = (lightEditor.draft && lightEditor.draft.inputIds) || [];
    const nodes = ids.map(getNode).filter((node) => node && LIGHT_INPUT_TYPES.has(node.type));
    const node = nodes[0];
    if (!node) return "";
    const thumb = safeThumb(node.thumb);
    if (thumb) return `<img alt="${esc(node.name)}" src="${thumb}" />`;
    if (node.catalogId && CATALOG.some((entry) => entry.id === node.catalogId)) return catalogSvg(node.catalogId);
    if (node.fileStatus === "demo" || node.fileStatus === "local" || node.type === "character" || node.type === "scene" || node.type === "image") return thumbSvg(node.type);
    return "";
  }

  function lightStageMarkup(cfg) {
    const asset = cfg === lightEditor.draft ? lightAssetMarkup() : "";
    const svg = lightStageSvg(cfg, !!asset);
    if (!asset) return svg;
    return `<div class="light-photo">${asset}${svg}</div>`;
  }

  function renderLightSide() {
    const side = document.getElementById("lightSide");
    const draft = lightEditor.draft;
    if (!side || !draft) return;
    if (lightEditor.tab === "free") {
      const rows = draft.lights.map((light) => `
        <div class="light-bulb ${light.id === lightEditor.selectedId ? "is-on" : ""} ${light.on ? "" : "is-off"}">
          <button type="button" data-action="light-select" data-id="${esc(light.id)}"><i style="background:${light.color}"></i><span><b>${esc(light.role)}</b><small>${esc(light.source)} · ${esc(lightPlaceText(light))}</small></span></button>
          <label><input type="checkbox" data-light-field="on" data-light-id="${esc(light.id)}" ${light.on ? "checked" : ""} />开</label>
          <button type="button" class="icon-btn" data-action="light-delete" data-id="${esc(light.id)}" aria-label="删除光源">×</button>
        </div>`).join("");
      side.innerHTML = `<div class="shot-free-note"><h3>自由布光</h3><p>可以不选参考。每盏灯单独调位置、颜色和时间变化。</p><button type="button" class="btn ghost block" data-action="light-blank">从空白开始</button><button type="button" class="btn primary block" data-action="light-add">添加光源</button></div>${rows || `<p class="lib-empty">还没有光源。</p>`}`;
      return;
    }
    if (lightEditor.tab === "mine") {
      side.innerHTML = myLights.length ? myLights.map((item) => `
        <div class="shot-row-wrap ${draft.customId === item.customId ? "is-on" : ""}">
          <button type="button" class="shot-row" data-action="light-pick-custom" data-id="${esc(item.customId)}"><span class="shot-mini">光</span><span><b>${esc(item.name)}</b><small>${esc(lightSummary(item))}</small></span></button>
          <button type="button" class="icon-btn" data-action="light-delete-custom" data-id="${esc(item.customId)}" aria-label="删除自定义光影">×</button>
        </div>`).join("") : `<p class="lib-empty">还没有自定义光影。调好之后点底部「保存到我的光影」。</p>`;
      return;
    }
    const base = LIGHT_BASES.find((item) => item.id === lightEditor.baseOpen);
    if (!base) {
      side.innerHTML = ["自然光", "人物布光", "室内光", "夜景光", "戏剧光", "特殊光"].map((group) => {
        const list = LIGHT_BASES.filter((item) => item.group === group);
        return `<section class="shot-group"><h3>${group}</h3><div class="light-cards">${list.map((item) => {
          const cfg = { name: item.name, look: item.variants[0].look, lights: item.variants[0].lights };
          return `<button type="button" class="light-card ${draft.baseId === item.id ? "is-on" : ""}" data-action="light-base" data-id="${item.id}">${lightStageSvg(cfg, false)}<b>${esc(item.name)}</b><small>${esc(item.desc)}</small></button>`;
        }).join("")}</div></section>`;
      }).join("");
      return;
    }
    side.innerHTML = `<button type="button" class="btn ghost block" data-action="light-bases">← 返回 24 种基础光影</button><h3 class="light-var-title">${esc(base.name)}</h3><div class="light-cards light-cards-one">${base.variants.map((item) => {
      const cfg = { look: item.look, lights: item.lights };
      return `<button type="button" class="light-card ${draft.variantId === item.id ? "is-on" : ""}" data-action="light-variant" data-base="${base.id}" data-id="${item.id}">${lightStageSvg(cfg, false)}<b>${esc(item.name)}</b><small>${esc(item.desc)}</small></button>`;
    }).join("")}</div>`;
  }

  function syncLightVisuals() {
    const host = document.getElementById("lightStage");
    const draft = lightEditor.draft;
    if (host && draft) host.innerHTML = lightStageMarkup(draft);
    if (!draft) return;
    draft.lights.forEach((light) => {
      const dot = document.querySelector(`[data-light-dot="${light.id}"]`);
      if (!dot) return;
      dot.style.left = `${light.x}%`;
      dot.style.top = `${light.z}%`;
      dot.style.background = light.color;
    });
    const current = draft.lights.find((item) => item.id === lightEditor.selectedId);
    const pos = document.getElementById("lightPosRead");
    if (pos && current) pos.textContent = lightPlaceText(current);
  }

  function renderLightPreview() {
    const panel = document.getElementById("lightPreview");
    const draft = lightEditor.draft;
    if (!panel || !draft) return;
    const compare = lightEditor.compare && lightEditor.baseline;
    const stage = compare
      ? `<div class="light-compare"><div><b>调整前</b><div class="light-stage-live"><span class="shot-hint">光影效果示意</span>${lightStageMarkup(lightEditor.baseline)}</div></div><div><b>调整后</b><div class="light-stage-live"><span class="shot-hint">光影效果示意</span><div id="lightStage">${lightStageMarkup(draft)}</div></div></div></div>`
      : `<div class="light-stage-live"><span class="shot-hint">光影效果示意</span><div id="lightStage">${lightStageMarkup(draft)}</div></div>`;
    const dots = draft.lights.map((light) => `<button type="button" class="light-dot ${light.id === lightEditor.selectedId ? "is-on" : ""}" data-light-dot="${esc(light.id)}" style="left:${light.x}%;top:${light.z}%;background:${light.color}" title="${esc(light.role)}"></button>`).join("");
    panel.innerHTML = `${stage}<h3>${esc(draft.name)}</h3><p>${esc(draft.desc || "拖动俯视图里的光点，或在右侧改参数。")}</p><p class="muted">光影效果示意。叠在素材上的颜色只说明光从哪里来，不是对照片做了真实重打光。</p><div class="light-plan" id="lightPlan"><span>前</span><span class="light-plan-back">后</span><i class="light-subject"></i>${dots}</div><p class="muted">俯视布光图。左右是画面的左和右，上下是前和后。高度在右侧调。</p>`;
  }

  function renderLightForm() {
    const form = document.getElementById("lightForm");
    const draft = lightEditor.draft;
    if (!form || !draft) return;
    const light = draft.lights.find((item) => item.id === lightEditor.selectedId) || null;
    const assets = state.nodes.filter((node) => LIGHT_INPUT_TYPES.has(node.type));
    const checks = assets.length ? assets.map((node) => `
      <label class="shot-check"><input type="checkbox" data-light-field="input" data-id="${node.id}" ${draft.inputIds.includes(node.id) ? "checked" : ""} /><span>${esc(TYPES[node.type].label)}</span><b>${esc(node.name)}</b></label>`).join("")
      : `<p class="muted">画布上还没有人物、场景或图片。可以先添加，再回到这里勾选。</p>`;
    const controls = light ? `
      <h3>当前光源</h3>
      <p class="muted" id="lightPosRead">${esc(lightPlaceText(light))}</p>
      <label>角色<select data-light-field="role">${optionList(LIGHT_ROLES, light.role)}</select></label>
      <label>来源<select data-light-field="source">${optionList(LIGHT_SOURCES, light.source)}</select></label>
      <label>高度 ${light.height}<input data-light-field="height" type="range" min="0" max="100" value="${light.height}" /></label>
      <label>亮度 ${light.brightness}<input data-light-field="brightness" type="range" min="0" max="100" value="${light.brightness}" /></label>
      <label>照射范围 ${light.spread}<input data-light-field="spread" type="range" min="4" max="100" value="${light.spread}" /></label>
      <label>光线软硬（越大越硬）${light.softness}<input data-light-field="softness" type="range" min="0" max="100" value="${light.softness}" /></label>
      <label>阴影强弱 ${light.shadow}<input data-light-field="shadow" type="range" min="0" max="100" value="${light.shadow}" /></label>
      <label>冷暖色温 ${light.kelvin || "自选"}<input data-light-field="kelvin" type="range" min="2000" max="9000" step="100" value="${light.kelvin || 5600}" /></label>
      <label>自选颜色<input data-light-field="color" type="color" value="${light.color}" /></label>
      <label>时间变化<select data-light-field="time">${optionList(LIGHT_TIMES, light.time)}</select></label>`
      : `<p class="muted">还没有选中的光源。在「自由布光」里点「添加光源」，或先选一个参考变化。</p>`;
    form.innerHTML = `
      <h3>方案</h3>
      <label>名称<input data-light-field="name" maxlength="24" value="${esc(draft.name)}" /></label>
      <label>说明<input data-light-field="desc" maxlength="80" value="${esc(draft.desc)}" /></label>
      ${controls}
      <div class="shot-inputs"><b>使用的素材</b><p class="muted">勾选人物、场景或图片后，中间会优先显示这些素材。</p>${checks}</div>
      <p class="muted">参考效果只是一组起点。之后每一盏灯都可以改、开关或删除。</p>`;
  }

  function renderLightStudio() {
    document.getElementById("lightTabRef").classList.toggle("is-on", lightEditor.tab === "ref");
    document.getElementById("lightTabFree").classList.toggle("is-on", lightEditor.tab === "free");
    document.getElementById("lightTabMine").classList.toggle("is-on", lightEditor.tab === "mine");
    const compareBtn = document.getElementById("lightCompareBtn");
    if (compareBtn) compareBtn.classList.toggle("primary", !!lightEditor.compare);
    renderLightSide();
    renderLightPreview();
    renderLightForm();
  }

  function openLightStudio(nodeId) {
    const node = getNode(nodeId);
    if (!node || node.type !== "light") return;
    lightTargetId = node.id;
    const existing = node.light ? sanitizeLight(node.light) : blankLightConfig();
    existing.inputIds = (node.lightInputs || []).filter((id) => {
      const item = getNode(id);
      return item && LIGHT_INPUT_TYPES.has(item.type);
    });
    lightEditor.draft = existing;
    lightEditor.baseline = JSON.parse(JSON.stringify(sanitizeLight(existing)));
    lightEditor.selectedId = existing.lights[0] ? existing.lights[0].id : "";
    lightEditor.compare = false;
    lightEditor.baseOpen = existing.baseId || "";
    lightEditor.tab = existing.baseId ? "ref" : existing.lights.length ? "free" : "ref";
    closeMenus();
    assetPanel.hidden = true;
    if (!libraryEl.hidden) libraryEl.hidden = true;
    if (!shotLibEl.hidden) shotLibEl.hidden = true;
    if (storyEl && !storyEl.hidden) storyEl.hidden = true;
    lightEl.hidden = false;
    renderLightStudio();
  }

  function closeLightStudio() {
    lightEl.hidden = true;
    lightEditor.dragging = "";
  }

  function fillLightVariant(baseId, variantId) {
    const found = findVariant(variantId);
    if (!found || found.base.id !== baseId || !lightEditor.draft) return;
    const inputs = lightEditor.draft.inputIds.slice();
    const next = sanitizeLight({
      name: found.variant.name,
      desc: found.variant.desc,
      baseId: found.base.id,
      variantId: found.variant.id,
      look: found.variant.look,
      lights: found.variant.lights.map((item) => ({ ...item })),
      customId: ""
    });
    next.inputIds = inputs;
    lightEditor.draft = next;
    lightEditor.baseline = JSON.parse(JSON.stringify(sanitizeLight(next)));
    lightEditor.selectedId = next.lights[0] ? next.lights[0].id : "";
    lightEditor.baseOpen = baseId;
    lightEditor.compare = false;
    renderLightStudio();
  }

  function updateLightDraft(target) {
    const draft = lightEditor.draft;
    if (!draft) return;
    const field = target.dataset.lightField;
    if (field === "input") {
      const id = target.dataset.id;
      draft.inputIds = draft.inputIds.filter((item) => item !== id);
      if (target.checked) draft.inputIds.push(id);
      renderLightPreview();
      return;
    }
    if (field === "name") {
      draft.name = target.value.slice(0, 24);
      const title = document.querySelector("#lightPreview h3");
      if (title) title.textContent = draft.name || "未命名光影";
      return;
    }
    if (field === "desc") {
      draft.desc = target.value.slice(0, 80);
      return;
    }
    const light = draft.lights.find((item) => item.id === (target.dataset.lightId || lightEditor.selectedId));
    if (!light) return;
    if (field === "on") light.on = target.checked;
    else if (field === "height" || field === "brightness" || field === "spread" || field === "softness" || field === "shadow") light[field] = clamp(Math.round(Number(target.value) || 0), 0, 100);
    else if (field === "kelvin") {
      light.kelvin = clamp(Math.round(Number(target.value) || 5600), 2000, 9000);
      light.color = kelvinToHex(light.kelvin);
      const color = document.querySelector('#lightForm input[data-light-field="color"]');
      if (color) color.value = light.color;
    } else if (field === "color") {
      light.color = hexColor(target.value, light.color);
      light.kelvin = 0;
    } else if (field === "role" || field === "source" || field === "time") light[field] = target.value;
    const clean = sanitizeBulb(light);
    Object.assign(light, clean, { id: light.id });
    if (field === "role" || field === "source" || field === "on") renderLightSide();
    syncLightVisuals();
  }

  function addLightSource() {
    const draft = lightEditor.draft;
    if (!draft) return;
    if (draft.lights.length >= 8) {
      toast("最多 8 盏灯");
      return;
    }
    const light = sanitizeBulb({ role: "补光", source: "灯具", x: 30, z: 34, height: 48, brightness: 62, spread: 42, softness: 48, shadow: 28, color: "#7eb6ff", time: "保持不变", on: true });
    draft.lights.push(light);
    lightEditor.selectedId = light.id;
    lightEditor.tab = "free";
    renderLightStudio();
  }

  function loadMyLights() {
    myLights.length = 0;
    try {
      const raw = localStorage.getItem(MY_LIGHT_KEY);
      const data = raw ? JSON.parse(raw) : null;
      const items = Array.isArray(data && data.items) ? data.items : [];
      items.forEach((item) => {
        const light = sanitizeLight(item);
        if (!light) return;
        light.customId = typeof item.customId === "string" && item.customId ? item.customId : uid("ml");
        myLights.push(light);
      });
    } catch (err) {
      myLights.length = 0;
    }
  }

  function saveMyLights() {
    localStorage.setItem(MY_LIGHT_KEY, JSON.stringify({ items: myLights.map((item) => ({ ...item, lights: item.lights.map((light) => ({ ...light })) })) }));
  }

  function saveCustomLight() {
    const draft = lightEditor.draft;
    if (!draft) return;
    const light = sanitizeLight(draft);
    if (!light.name.trim()) {
      toast("先写一个光影名称");
      return;
    }
    const existing = myLights.find((item) => item.customId && item.customId === draft.customId);
    if (existing) {
      light.customId = existing.customId;
      Object.assign(existing, light);
      toast("已更新这个自定义光影");
    } else {
      light.customId = uid("ml");
      myLights.unshift(light);
      if (myLights.length > 40) myLights.pop();
      lightEditor.draft.customId = light.customId;
      toast("已保存到我的光影");
    }
    saveMyLights();
    lightEditor.tab = "mine";
    renderLightStudio();
  }

  function linkedShotNodes(lightId) {
    const ids = new Set();
    state.edges.forEach((edge) => {
      if (edge.from === lightId) ids.add(edge.to);
      if (edge.to === lightId) ids.add(edge.from);
    });
    return [...ids].map(getNode).filter((node) => node && node.type === "shot");
  }

  function applyLightToCanvas() {
    const node = getNode(lightTargetId);
    const draft = lightEditor.draft ? sanitizeLight(lightEditor.draft) : null;
    if (!node || node.type !== "light" || !draft) {
      toast("请先打开一个专业光影台");
      return;
    }
    const inputIds = (lightEditor.draft.inputIds || []).filter((id) => {
      const item = getNode(id);
      return item && LIGHT_INPUT_TYPES.has(item.type);
    });
    node.light = draft;
    node.name = draft.name;
    const previous = new Set(node.lightInputs || []);
    state.edges = state.edges.filter((edge) => !(edge.to === node.id && previous.has(edge.from) && !inputIds.includes(edge.from)));
    inputIds.forEach((fromId) => {
      if (state.edges.some((edge) => edge.from === fromId && edge.to === node.id)) return;
      if (createsCycle(fromId, node.id)) return;
      state.edges.push(createEdge(fromId, node.id));
    });
    node.lightInputs = inputIds;
    const shots = linkedShotNodes(node.id);
    shots.forEach((shot) => { shot.lighting = JSON.parse(JSON.stringify(draft)); });
    closeLightStudio();
    commit();
    render();
    writeStorage();
    toast(shots.length ? `已写入「${draft.name}」，并同步到 ${shots.map((item) => item.name).join("、")}` : `「${draft.name}」已保存在这个光影节点上。把它连到镜头或视频模型后，工作流会带上这组参数。`);
  }

  function upstreamLights(modelId) {
    const result = [];
    const seen = new Set([modelId]);
    const stack = [modelId];
    while (stack.length) {
      const cur = stack.pop();
      state.edges.forEach((edge) => {
        if (edge.to === cur && !seen.has(edge.from)) {
          seen.add(edge.from);
          stack.push(edge.from);
          const node = getNode(edge.from);
          if (node && node.type === "light") result.push(node);
        }
      });
    }
    return result;
  }

  function lightParams(node) {
    const cfg = node && node.type === "light" ? node.light : node && node.lighting;
    if (!cfg || !cfg.name) return null;
    const base = LIGHT_BASES.find((item) => item.id === cfg.baseId);
    const found = findVariant(cfg.variantId);
    const on = (cfg.lights || []).filter((item) => item.on);
    return {
      name: cfg.name,
      base: base ? base.name : "自由布光",
      variant: found ? found.variant.name : "",
      summary: on.length ? on.map((item) => `${item.role}·${item.source}·${item.color}`).join("、") : "无光源",
      time: [...new Set(on.map((item) => item.time))].join("、") || "保持不变"
    };
  }

  function lightPassBlock(node) {
    const lights = upstreamLights(node.id);
    const carried = upstreamShots(node.id).filter((shot) => shot.lighting && !state.edges.some((edge) => edge.to === shot.id && getNode(edge.from) && getNode(edge.from).type === "light"));
    if (!lights.length && !carried.length) return `<p class="muted">未连接专业光影台。把光影节点连到这个模型，或先应用到镜头上，这里会显示布光参数。</p>`;
    const rows = lights.map((item) => {
      const params = lightParams(item);
      return params ? `<p><b>${esc(params.name)}</b><span>${esc(params.base)}${params.variant ? " · " + esc(params.variant) : ""} · ${esc(params.summary)}</span></p>` : "";
    }).concat(carried.map((shot) => {
      const params = lightParams(shot);
      return params ? `<p><b>${esc(params.name)}</b><span>来自镜头「${esc(shot.name)}」· ${esc(params.summary)}</span></p>` : "";
    }));
    return `<div class="shot-pass">${rows.join("")}</div>`;
  }

  function lightRunBlock(list) {
    if (!list || !list.length) return "";
    return `<div class="detail-block"><h3>传入视频模型的光影参数</h3>${list.map((item) => `<div class="link-item">${esc(item.name)} · ${esc(item.base || "")} ${item.variant ? "· " + esc(item.variant) : ""} · ${esc(item.summary || "")}</div>`).join("")}</div>`;
  }

  function loadMyShots() {
    myShots.length = 0;
    try {
      const raw = localStorage.getItem(MY_SHOT_KEY);
      const data = raw ? JSON.parse(raw) : null;
      const items = Array.isArray(data && data.items) ? data.items : [];
      items.forEach((item) => {
        const shot = sanitizeShot(item);
        if (!shot) return;
        shot.customId = typeof item.customId === "string" && item.customId ? item.customId : uid("ms");
        myShots.push(shot);
      });
    } catch (err) {
      myShots.length = 0;
    }
  }

  function saveMyShots() {
    localStorage.setItem(MY_SHOT_KEY, JSON.stringify({
      items: myShots.map((item) => ({ ...item }))
    }));
  }

  function visibleShots() {
    const query = shotEditor.query.trim().toLowerCase();
    if (!query) return SHOTS;
    return SHOTS.filter((shot) => {
      const setup = SHOT_SETUP[shot.id] || {};
      return `${shot.name} ${shot.group} ${setup.desc || ""}`.toLowerCase().includes(query);
    });
  }

  function motionMark(cfg) {
    const speed = cfg.speed === "快" ? "0.7s" : cfg.speed === "慢" ? "2.2s" : "1.3s";
    const dir = cfg.motion === "固定" ? "still" : (cfg.direction || "向前");
    const label = cfg.motion === "固定" ? "固定机位" : `${cfg.motion} ${cfg.direction}`;
    const glyph = cfg.motion === "固定"
      ? `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>`
      : `<svg viewBox="0 0 64 24"><path d="M4 12h46M40 5l12 7-12 7"/></svg>`;
    return `<span class="shot-anim" data-dir="${esc(dir)}" style="animation-duration:${speed}"><i>${glyph}</i><em>${esc(label)}</em></span>`;
  }

  function shotPreviewMedia(cfg) {
    if (cfg.file) return `<img alt="${esc(cfg.name)}" src="assets/shots/${cfg.file}" />`;
    const input = (shotEditor.draft && shotEditor.draft.inputIds || []).map(getNode).find((node) => node && safeThumb(node.thumb));
    if (input) return `<img alt="${esc(input.name)}" src="${safeThumb(input.thumb)}" />`;
    const linked = (shotEditor.draft && shotEditor.draft.inputIds || []).map(getNode).find((node) => node && node.catalogId);
    if (linked) return catalogSvg(linked.catalogId);
    return `<div class="shot-schematic"><b>${esc(cfg.scale)}</b><span>${esc(cfg.horiz)} · ${esc(cfg.height)}</span></div>`;
  }

  function renderShotSide() {
    const side = document.getElementById("shotSide");
    const searchWrap = document.getElementById("shotSearchWrap");
    searchWrap.hidden = shotEditor.tab !== "preset";
    if (shotEditor.tab === "free") {
      side.innerHTML = `<div class="shot-free-note"><h3>自由组合</h3><p>可以不选参考镜头。在右侧分别设置景别、机位、运镜、方向、速度和时长，这些选项可以任意搭配。</p><button type="button" class="btn ghost" data-action="shot-clear">从空白开始</button></div>`;
      return;
    }
    if (shotEditor.tab === "mine") {
      if (!myShots.length) {
        side.innerHTML = `<p class="lib-empty">还没有自定义镜头。调好右侧参数后，点「保存到我的镜头」。</p>`;
        return;
      }
      side.innerHTML = myShots.map((item) => `
        <div class="shot-row-wrap ${shotEditor.draft && shotEditor.draft.customId === item.customId ? "is-on" : ""}">
          <button type="button" class="shot-row" data-action="shot-pick-custom" data-id="${esc(item.customId)}">
            ${item.file ? `<img alt="" src="assets/shots/${item.file}" />` : `<span class="shot-mini">自由</span>`}
            <span><b>${esc(item.name)}</b><small>${esc(item.scale)} · ${esc(item.motion)}${item.direction ? " · " + esc(item.direction) : ""}</small></span>
          </button>
          <button type="button" class="icon-btn" data-action="shot-delete-custom" data-id="${esc(item.customId)}" aria-label="删除自定义镜头">×</button>
        </div>`).join("");
      return;
    }
    const shots = visibleShots();
    if (!shots.length) {
      side.innerHTML = `<p class="lib-empty">没有匹配的参考镜头。</p>`;
      return;
    }
    side.innerHTML = SHOT_GROUPS.map((group) => {
      const list = shots.filter((shot) => shot.group === group);
      if (!list.length) return "";
      return `<section class="shot-group"><h3>${esc(group)}</h3>${list.map((shot) => {
        const setup = SHOT_SETUP[shot.id] || {};
        const on = shotEditor.draft && shotEditor.draft.presetId === shot.id ? "is-on" : "";
        return `<button type="button" class="shot-row ${on}" data-action="shot-pick" data-shot="${shot.id}">
          <img alt="${esc(shot.name)}" src="assets/shots/${shot.file}" />
          <span><b>${esc(shot.name)}</b><small>${esc(setup.desc || "")}</small></span>
        </button>`;
      }).join("")}</section>`;
    }).join("");
  }

  function renderShotPreview() {
    const cfg = shotEditor.draft;
    const panel = document.getElementById("shotPreview");
    if (!cfg) {
      panel.innerHTML = "";
      return;
    }
    const source = cfg.file ? `参考画面：${cfg.name}` : "当前没有参考画面，下面是参数示意";
    panel.innerHTML = `
      <div class="shot-stage-live">
        <span class="shot-hint">效果示意</span>
        ${shotPreviewMedia(cfg)}
        ${motionMark(cfg)}
      </div>
      <h3>${esc(cfg.name)}</h3>
      <p>${esc(cfg.desc || "静态画面配上运镜箭头，用来说明运动方向。")}</p>
      <p class="muted">${esc(source)}。这不是已经生成的视频。</p>`;
  }

  function optionList(list, current) {
    return list.map((item) => `<option value="${esc(item)}" ${item === current ? "selected" : ""}>${esc(item)}</option>`).join("");
  }

  function renderShotForm() {
    const cfg = shotEditor.draft;
    const form = document.getElementById("shotForm");
    if (!cfg) {
      form.innerHTML = "";
      return;
    }
    const dirs = SHOT_DIRS[cfg.motion] || [];
    const assets = state.nodes.filter((node) => SHOT_INPUT_TYPES.has(node.type));
    const inputs = assets.length ? assets.map((node) => `
      <label class="shot-check"><input type="checkbox" data-shot-field="input" data-id="${node.id}" ${cfg.inputIds.includes(node.id) ? "checked" : ""} />
        <span>${esc(TYPES[node.type].label)}</span><b>${esc(node.name)}</b></label>`).join("")
      : `<p class="muted">画布上还没有人物、场景或图片资产。可以先添加，再回到这里勾选。</p>`;
    form.innerHTML = `
      <h3>镜头参数</h3>
      <label>名称<input data-shot-field="name" maxlength="24" value="${esc(cfg.name)}" /></label>
      <label>说明<input data-shot-field="desc" maxlength="80" value="${esc(cfg.desc)}" /></label>
      <label>景别<select data-shot-field="scale">${optionList(SHOT_SCALES, cfg.scale)}</select></label>
      <label>水平方向<select data-shot-field="horiz">${optionList(SHOT_HORIZ, cfg.horiz)}</select></label>
      <label>高低角度<select data-shot-field="height">${optionList(SHOT_HEIGHTS, cfg.height)}</select></label>
      <label>运镜<select data-shot-field="motion">${optionList(SHOT_MOTIONS, cfg.motion)}</select></label>
      <label>运镜方向<select data-shot-field="direction" ${dirs.length ? "" : "disabled"}>${dirs.length ? optionList(dirs, cfg.direction) : `<option value="">固定时不需要方向</option>`}</select></label>
      <label>速度<select data-shot-field="speed">${optionList(SHOT_SPEEDS, cfg.speed)}</select></label>
      <label>时长（秒）<input data-shot-field="duration" type="number" min="1" max="15" step="1" value="${cfg.duration}" /></label>
      <div class="shot-inputs"><b>镜头输入</b><p class="muted">勾选画布上的人物、场景或图片。应用到画布时会把它们连到这个镜头节点。</p>${inputs}</div>
      <button type="button" class="btn ghost block" data-action="shot-save-custom">保存到我的镜头</button>
      <button type="button" class="btn primary block" data-action="shot-apply">应用到画布</button>
      <p class="muted">只会写入当前这个镜头节点。其他镜头节点保持自己的设置。</p>`;
  }

  function renderShotEditor() {
    document.getElementById("shotTabPreset").classList.toggle("is-on", shotEditor.tab === "preset");
    document.getElementById("shotTabFree").classList.toggle("is-on", shotEditor.tab === "free");
    document.getElementById("shotTabMine").classList.toggle("is-on", shotEditor.tab === "mine");
    const search = document.getElementById("shotSearch");
    if (search.value !== shotEditor.query) search.value = shotEditor.query;
    renderShotSide();
    renderShotPreview();
    renderShotForm();
  }

  function openShotLibrary(nodeId) {
    const node = getNode(nodeId);
    if (!node || node.type !== "shot") return;
    shotTargetId = node.id;
    const existing = resolveShot(node);
    shotEditor.draft = existing ? sanitizeShot({ ...existing, customId: existing.customId || "" }) : blankShot();
    shotEditor.draft.inputIds = (node.shotInputs || []).filter((id) => {
      const item = getNode(id);
      return item && SHOT_INPUT_TYPES.has(item.type);
    });
    shotEditor.tab = existing && existing.presetId ? "preset" : (existing && existing.customId ? "mine" : "free");
    shotEditor.query = "";
    closeMenus();
    assetPanel.hidden = true;
    if (!libraryEl.hidden) libraryEl.hidden = true;
    if (!lightEl.hidden) lightEl.hidden = true;
    if (storyEl && !storyEl.hidden) storyEl.hidden = true;
    shotLibEl.hidden = false;
    renderShotEditor();
  }

  function closeShotLibrary() {
    shotLibEl.hidden = true;
  }

  function fillShotPreset(shotId) {
    const shot = shotById(shotId);
    if (!shot || !shotEditor.draft) return;
    const inputs = shotEditor.draft.inputIds.slice();
    shotEditor.draft = configFromPreset(shot);
    shotEditor.draft.inputIds = inputs;
    shotEditor.tab = "preset";
    renderShotEditor();
  }

  function fillCustomShot(customId) {
    const saved = myShots.find((item) => item.customId === customId);
    if (!saved || !shotEditor.draft) return;
    const inputs = shotEditor.draft.inputIds.slice();
    shotEditor.draft = sanitizeShot(saved);
    shotEditor.draft.customId = saved.customId;
    shotEditor.draft.inputIds = inputs;
    renderShotPreview();
    renderShotForm();
    renderShotSide();
  }

  function updateShotDraft(target) {
    const draft = shotEditor.draft;
    if (!draft) return;
    const field = target.dataset.shotField;
    if (field === "input") {
      const id = target.dataset.id;
      draft.inputIds = draft.inputIds.filter((item) => item !== id);
      if (target.checked) draft.inputIds.push(id);
      renderShotPreview();
      return;
    }
    if (field === "duration") {
      draft.duration = clamp(Math.round(Number(target.value) || 1), 1, 15);
      if (target.value !== "" && String(draft.duration) !== target.value) target.value = draft.duration;
    }
    else if (field === "name") draft.name = target.value.slice(0, 24);
    else if (field === "desc") draft.desc = target.value.slice(0, 80);
    else draft[field] = target.value;
    const clean = sanitizeShot({ ...draft, customId: draft.customId });
    clean.inputIds = draft.inputIds;
    shotEditor.draft = clean;
    if (field === "motion") renderShotForm();
    renderShotPreview();
  }

  function saveCustomShot() {
    const draft = shotEditor.draft;
    if (!draft) return;
    const shot = sanitizeShot(draft);
    if (!shot.name.trim()) {
      toast("先写一个镜头名称");
      return;
    }
    shot.customId = uid("ms");
    myShots.unshift(shot);
    if (myShots.length > 40) myShots.pop();
    saveMyShots();
    shotEditor.draft.customId = shot.customId;
    shotEditor.tab = "mine";
    renderShotEditor();
    toast("已保存到我的镜头，可在其他镜头节点里再次使用");
  }

  function deleteCustomShot(customId) {
    const index = myShots.findIndex((item) => item.customId === customId);
    if (index < 0) return;
    myShots.splice(index, 1);
    saveMyShots();
    if (shotEditor.draft && shotEditor.draft.customId === customId) shotEditor.draft.customId = "";
    renderShotSide();
  }

  function applyShotToCanvas() {
    const node = getNode(shotTargetId);
    const draft = shotEditor.draft ? sanitizeShot(shotEditor.draft) : null;
    if (!node || node.type !== "shot" || !draft) {
      toast("请先打开一个镜头选择节点");
      return;
    }
    const inputIds = (shotEditor.draft.inputIds || []).filter((id) => {
      const item = getNode(id);
      return item && SHOT_INPUT_TYPES.has(item.type);
    });
    node.shot = draft;
    node.shotId = draft.presetId || draft.customId || "free";
    node.name = draft.name;
    const previous = new Set(node.shotInputs || []);
    state.edges = state.edges.filter((edge) => !(edge.to === node.id && previous.has(edge.from) && !inputIds.includes(edge.from)));
    inputIds.forEach((fromId) => {
      if (state.edges.some((edge) => edge.from === fromId && edge.to === node.id)) return;
      if (createsCycle(fromId, node.id)) return;
      state.edges.push(createEdge(fromId, node.id));
    });
    node.shotInputs = inputIds;
    closeShotLibrary();
    commit();
    render();
    writeStorage();
    toast(`「${draft.name}」已应用到当前节点，可以连接到视频模型`);
  }

  function renderShotLibrary() {
    renderShotSide();
  }

  const STORY_SAMPLES = {
    suspense: {
      core: {
        title: "雨夜的最后一班地铁",
        logline: "末班地铁上，记者发现邻座的人已经死了，而下一站没有人上车。",
        genre: "悬疑",
        goal: "在到终点前找出谁动过这节车厢",
        obstacle: "车厢里每个人都有不在场证明，监控也刚好坏了",
        tone: "冷、紧、少对白"
      },
      characters: [
        { name: "周晚", role: "调查记者", look: "短发，深色风衣", trait: "较真，观察很细", flaw: "容易先入为主", want: "证明自己不是看错了", relation: "和乘务员阿宁是旧识，彼此不完全信任" },
        { name: "阿宁", role: "末班乘务员", look: "制服整齐，眼神很稳", trait: "冷静，话少", flaw: "不敢把异常上报", want: "平安结束这一班", relation: "认识周晚，但隐瞒了自己看见过死者" }
      ],
      scenes: [
        { place: "末班车厢", time: "凌晨一点", mood: "灯管闪，座位空了一半", event: "周晚发现邻座已经没有呼吸" },
        { place: "终点站台", time: "天还没亮", mood: "站台只有一盏灯", event: "死者的包被留在长椅上" }
      ],
      items: [
        { name: "旧录音笔", look: "银色外壳，上面有划痕", holder: "周晚", why: "里面有死者今晚打出的最后一段录音" },
        { name: "坏掉的监控硬盘", look: "黑色盒子，指示灯不亮", holder: "阿宁", why: "它能证明谁在上一站上过车" }
      ],
      plot: {
        opening: "周晚为了赶稿，坐上了最后一班地铁。",
        inciting: "她转头时发现邻座的人已经没有呼吸。",
        rising: "车厢里的人都说自己什么都没看见，阿宁却催她不要声张。",
        turn: "录音笔里传来死者叫出阿宁名字的声音。",
        ending: "列车进站，周晚把录音笔交到站台那盏灯下。"
      }
    },
    fantasy: {
      core: {
        title: "会下雨的图书馆",
        logline: "少年在闭馆后借到一本会下雨的书，书页里的城正在被淹没。",
        genre: "奇幻",
        goal: "在书页彻底浸湿前，把城里的人带到最后一页",
        obstacle: "每翻一页，现实里的图书馆也会下一场同样的雨",
        tone: "明亮、好奇，带一点着急"
      },
      characters: [
        { name: "林小满", role: "图书管理员的学徒", look: "圆眼镜，袖口总是湿的", trait: "胆小，但记得每一本书的位置", flaw: "不敢相信自己看见的事", want: "把书里的人救出来", relation: "管理员是他的师父，叮嘱他不要翻最后一页" },
        { name: "灯塔看守", role: "住在书页里的人", look: "旧斗篷，手里一盏不灭的灯", trait: "沉稳", flaw: "离开书页就会开始消失", want: "让小镇活过这场雨", relation: "只信任还愿意翻页的林小满" }
      ],
      scenes: [
        { place: "闭馆后的阅览室", time: "夜里", mood: "窗外没雨，室内却在滴水", event: "林小满第一次打开那本没有编号的书" },
        { place: "书页里的海岸镇", time: "黄昏", mood: "街道的水已经没到膝盖", event: "灯塔看守把钥匙交给林小满" }
      ],
      items: [
        { name: "会下雨的书", look: "深蓝色封面，摸上去是潮的", holder: "林小满", why: "翻页会把书里的雨带到现实的阅览室" },
        { name: "不灭的灯", look: "巴掌大的铜灯", holder: "灯塔看守", why: "灯还亮着，人就不会从书页里消失" }
      ],
      plot: {
        opening: "林小满被留下值夜，在禁区找到一本没有编号的书。",
        inciting: "书页里落下的雨，打湿了他的袖口。",
        rising: "他每救一个人出来，阅览室的水位就升高一寸。",
        turn: "师父说最后一页不是结局，而是把雨关回去的门。",
        ending: "林小满合上书，灯还亮着，阅览室恢复干燥。"
      }
    },
    city: {
      core: {
        title: "对面楼的灯",
        logline: "两个加班的人隔着一条街用关灯打招呼，直到其中一盏灯再也没亮。",
        genre: "都市情感",
        goal: "在对方离开这座城市前，把没有说出口的话送到对面",
        obstacle: "他们没有交换过联系方式，只认识对方窗口的位置",
        tone: "安静、温暖，有一点错过"
      },
      characters: [
        { name: "陈舟", role: "广告公司文案", look: "衬衫袖子卷到小臂，桌上总有一杯冷咖啡", trait: "嘴笨，习惯把话写成便条", flaw: "害怕当面被拒绝", want: "知道对面那个人是不是也在等他的灯", relation: "和对面的苏晚只隔着一条街，却没说过一句话" },
        { name: "苏晚", role: "对面楼的插画师", look: "长发，窗边有一盆快枯的绿植", trait: "独立，作息很晚", flaw: "不轻易把住址告诉别人", want: "在搬走前留下一个真实的再见", relation: "通过关灯认识陈舟，还不知道他的名字" }
      ],
      scenes: [
        { place: "陈舟的工位窗边", time: "工作日夜里十一点", mood: "整层只剩他的台灯", event: "陈舟第三次用关灯回应对面" },
        { place: "街角的面馆", time: "雨夜", mood: "玻璃上全是雾", event: "苏晚把一张画留在陈舟常坐的位置" }
      ],
      items: [
        { name: "没有署名的速写", look: "画的是一扇亮着灯的窗口", holder: "苏晚", why: "陈舟能从画里认出自己的工位" },
        { name: "冷掉的咖啡", look: "纸杯套上写着一句没寄出的话", holder: "陈舟", why: "这句话本来应该在灯灭之前送到对面" }
      ],
      plot: {
        opening: "陈舟加班到很晚，发现对面楼总有一盏灯和他一起亮着。",
        inciting: "对面先关了灯，又立刻打开，像在打招呼。",
        rising: "苏晚的窗户开始贴上封箱纸，陈舟仍然不敢下楼。",
        turn: "面馆老板转交那张速写，背面写着她离开的日期。",
        ending: "陈舟在最后一晚走下楼，把杯套上的那句话送到已经空了的窗口。"
      }
    }
  };

  function storyText(value, max) {
    return String(value ?? "").slice(0, max);
  }

  function blankStoryEntry(kind) {
    if (kind === "characters") return { id: uid("p"), nodeId: "", name: "", role: "", look: "", trait: "", flaw: "", want: "", relation: "" };
    if (kind === "scenes") return { id: uid("s"), nodeId: "", place: "", time: "", mood: "", event: "" };
    return { id: uid("i"), nodeId: "", name: "", look: "", holder: "", why: "" };
  }

  function blankStory() {
    return {
      template: "blank",
      core: { title: "", logline: "", genre: "", goal: "", obstacle: "", tone: "" },
      characters: [blankStoryEntry("characters")],
      scenes: [blankStoryEntry("scenes")],
      items: [blankStoryEntry("items")],
      plot: { opening: "", inciting: "", rising: "", turn: "", ending: "" }
    };
  }

  function sanitizeStory(raw) {
    const src = raw && typeof raw === "object" ? raw : {};
    const core = src.core && typeof src.core === "object" ? src.core : {};
    const plot = src.plot && typeof src.plot === "object" ? src.plot : {};
    const cleanList = (kind, list, fields) => {
      const rows = (Array.isArray(list) ? list : []).slice(0, 8).map((item) => {
        const row = blankStoryEntry(kind);
        row.id = typeof item.id === "string" && item.id ? item.id : row.id;
        row.nodeId = typeof item.nodeId === "string" ? item.nodeId : "";
        fields.forEach(([key, max]) => { row[key] = storyText(item[key], max); });
        return row;
      });
      return rows.length ? rows : [blankStoryEntry(kind)];
    };
    const template = ["blank", "suspense", "fantasy", "city"].includes(src.template) ? src.template : "blank";
    return {
      template,
      core: {
        title: storyText(core.title, 40),
        logline: storyText(core.logline, 160),
        genre: storyText(core.genre, 40),
        goal: storyText(core.goal, 120),
        obstacle: storyText(core.obstacle, 120),
        tone: storyText(core.tone, 40)
      },
      characters: cleanList("characters", src.characters, [["name", 40], ["role", 80], ["look", 120], ["trait", 120], ["flaw", 120], ["want", 120], ["relation", 160]]),
      scenes: cleanList("scenes", src.scenes, [["place", 40], ["time", 40], ["mood", 80], ["event", 160]]),
      items: cleanList("items", src.items, [["name", 40], ["look", 120], ["holder", 40], ["why", 160]]),
      plot: {
        opening: storyText(plot.opening, 240),
        inciting: storyText(plot.inciting, 240),
        rising: storyText(plot.rising, 240),
        turn: storyText(plot.turn, 240),
        ending: storyText(plot.ending, 240)
      }
    };
  }

  function storyFromTemplate(key, previous) {
    const prev = previous || { characters: [], scenes: [], items: [] };
    const sample = key === "blank" || !STORY_SAMPLES[key] ? blankStory() : JSON.parse(JSON.stringify(STORY_SAMPLES[key]));
    sample.template = key === "blank" || !STORY_SAMPLES[key] ? "blank" : key;
    ["characters", "scenes", "items"].forEach((group) => {
      const old = prev[group] || [];
      (sample[group] || []).forEach((item, index) => {
        item.id = old[index] && old[index].id ? old[index].id : uid(group === "characters" ? "p" : group === "scenes" ? "s" : "i");
        item.nodeId = old[index] && typeof old[index].nodeId === "string" ? old[index].nodeId : "";
      });
    });
    return sanitizeStory(sample);
  }

  function storyFilled(value) {
    return String(value || "").trim();
  }

  function storyEntryFilled(kind, item) {
    const keys = kind === "characters"
      ? ["name", "role", "look", "trait", "flaw", "want", "relation"]
      : kind === "scenes" ? ["place", "time", "mood", "event"] : ["name", "look", "holder", "why"];
    return keys.some((key) => storyFilled(item[key]));
  }

  function storyHasContent(story) {
    if (!story) return false;
    const core = Object.values(story.core || {}).some((value) => storyFilled(value));
    const plot = Object.values(story.plot || {}).some((value) => storyFilled(value));
    const lists = ["characters", "scenes", "items"].some((kind) => (story[kind] || []).some((item) => storyEntryFilled(kind, item)));
    return core || plot || lists;
  }

  function storyBody(node) {
    const story = node.story;
    if (!story || !storyHasContent(story)) {
      return `
        <button type="button" class="story-card" data-action="open-story">
          <b>从这里开始写故事</b>
          <span>点击卡片。可以先看悬疑、奇幻或都市情感示例，也可以从空白开始。填好后能整理成梗概，并拆成人物、场景和物品。</span>
        </button>
        <button type="button" class="btn primary block" data-action="open-story">打开故事构思</button>`;
    }
    const people = story.characters.filter((item) => storyEntryFilled("characters", item)).length;
    const places = story.scenes.filter((item) => storyEntryFilled("scenes", item)).length;
    const props = story.items.filter((item) => storyEntryFilled("items", item)).length;
    return `
      <button type="button" class="story-card" data-action="open-story">
        <b>${esc(story.core.title || "未命名故事")}</b>
        <span>${esc(story.core.logline || "还没有一句话故事")}</span>
        <span>人物 ${people} · 场景 ${places} · 物品 ${props}</span>
      </button>
      <button type="button" class="btn ghost block" data-action="open-story">编辑故事</button>`;
  }

  function storyField(path, value, placeholder, max, wide) {
    const label = String(placeholder).split(/：|，/)[0];
    const box = path.startsWith("plot.") || path.endsWith(".relation") || path.endsWith(".event") || path.endsWith(".why") || path.endsWith(".logline") || path.endsWith(".goal") || path.endsWith(".obstacle")
      ? `<textarea data-story-path="${path}" maxlength="${max}" rows="2" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
      : `<input data-story-path="${path}" maxlength="${max}" placeholder="${esc(placeholder)}" value="${esc(value)}" />`;
    return `<label class="${wide ? "wide" : ""}"><span>${esc(label)}</span>${box}</label>`;
  }

  function storyRows(kind, list, title, fields) {
    return list.map((item, index) => `
      <div class="story-row">
        <div class="story-row-hd"><b>${title} ${index + 1}</b><button type="button" class="btn ghost sm" data-action="story-remove" data-kind="${kind}" data-id="${item.id}">删除</button></div>
        <div class="story-grid">${fields.map(([key, placeholder, max, wide]) => storyField(`${kind}.${item.id}.${key}`, item[key], placeholder, max, wide)).join("")}</div>
      </div>`).join("");
  }

  function renderStoryStudio() {
    const draft = storyEditor.draft;
    if (!draft) return;
    const leads = {
      blank: "从「故事核心」的标题和一句话开始就行。灰色提示说明每一格该写什么。示例按钮只会填入样例，之后仍可以改。",
      suspense: "现在填着的是「悬疑」示例，用来告诉你每一格可以写什么。这是准备好的样例，不是 AI 生成，任何一句都能改。",
      fantasy: "现在填着的是「奇幻」示例。先看人物、场景和物品怎么连在一起，再改成你自己的故事。",
      city: "现在填着的是「都市情感」示例。可以先改人物关系，再顺着开端到结局往下写。"
    };
    const lead = document.getElementById("storyLead");
    if (lead) lead.textContent = leads[draft.template] || leads.blank;
    storyEl.querySelectorAll("[data-action='story-template']").forEach((btn) => {
      btn.classList.toggle("is-on", btn.dataset.template === draft.template);
    });
    const form = document.getElementById("storyForm");
    if (!form) return;
    const core = draft.core;
    form.innerHTML = `
      <section class="story-section">
        <h3>故事核心</h3>
        <p class="hint">先用一句话讲完这个故事。没有写过小说也可以从这里开始：谁，想做什么，被什么挡住了。</p>
        <div class="story-grid">
          ${storyField("core.title", core.title, "标题：给故事起一个名字", 40, false)}
          ${storyField("core.logline", core.logline, "一句话故事：谁，想做什么，遇到了什么", 160, true)}
          ${storyField("core.genre", core.genre, "题材，例如悬疑、奇幻", 40, false)}
          ${storyField("core.tone", core.tone, "故事基调，例如冷、紧、少对白", 40, false)}
          ${storyField("core.goal", core.goal, "主角目标：主角最想达成的一件事", 120, true)}
          ${storyField("core.obstacle", core.obstacle, "主要阻碍：谁或什么在拦着主角", 120, true)}
        </div>
      </section>
      <section class="story-section">
        <h3>人物</h3>
        <p class="hint">先写主角，再写一个会挡住主角或帮助主角的人。关系一栏写他们怎么认识。</p>
        ${storyRows("characters", draft.characters, "人物", [
          ["name", "姓名", 40, false],
          ["role", "身份，例如记者、学徒", 80, false],
          ["look", "外貌", 120, false],
          ["trait", "性格特点", 120, false],
          ["flaw", "弱点", 120, false],
          ["want", "想要得到什么", 120, false],
          ["relation", "与其他人物的关系", 160, true]
        ])}
        <button type="button" class="btn ghost sm story-add" data-action="story-add" data-kind="characters">添加人物</button>
      </section>
      <section class="story-section">
        <h3>场景</h3>
        <p class="hint">一个场景只写一件关键的事。地点、时间和气氛帮助读者看见这个地方。</p>
        ${storyRows("scenes", draft.scenes, "场景", [
          ["place", "地点", 40, false],
          ["time", "时间", 40, false],
          ["mood", "环境氛围", 80, false],
          ["event", "在这个场景发生的关键事件", 160, true]
        ])}
        <button type="button" class="btn ghost sm story-add" data-action="story-add" data-kind="scenes">添加场景</button>
      </section>
      <section class="story-section">
        <h3>关键物品</h3>
        <p class="hint">写一件会推动情节的东西，并写明它在谁手里、为什么重要。</p>
        ${storyRows("items", draft.items, "物品", [
          ["name", "名称", 40, false],
          ["holder", "持有人", 40, false],
          ["look", "外观", 120, true],
          ["why", "它为什么会影响故事", 160, true]
        ])}
        <button type="button" class="btn ghost sm story-add" data-action="story-add" data-kind="items">添加物品</button>
      </section>
      <section class="story-section">
        <h3>故事情节</h3>
        <p class="hint">按顺序写五步。每一步只要一两句，回答灰色框里的问题就够了。</p>
        <div class="story-grid">
          ${storyField("plot.opening", draft.plot.opening, "开端：故事开始时，主角正在做什么？", 240, true)}
          ${storyField("plot.inciting", draft.plot.inciting, "意外事件：哪一件突然的事打破了原来的日子？", 240, true)}
          ${storyField("plot.rising", draft.plot.rising, "冲突升级：阻碍怎样变得更难对付？", 240, true)}
          ${storyField("plot.turn", draft.plot.turn, "转折：哪个发现或选择改变了方向？", 240, true)}
          ${storyField("plot.ending", draft.plot.ending, "结局：最后主角得到了什么，或失去了什么？", 240, true)}
        </div>
      </section>`;
    const preview = document.getElementById("storySynopsis");
    const box = document.getElementById("storyPreview");
    if (preview && box && !box.hidden) preview.value = storySynopsis(draft);
  }

  function storySentence(name, parts) {
    const ready = parts.filter(Boolean);
    if (!ready.length) return `${name}出现在这个故事里。`;
    return `${name}${ready.join("，")}。`;
  }

  function storySynopsis(story) {
    const draft = sanitizeStory(story);
    if (!storyHasContent(draft)) return "还没有足够的内容。可以先点一个示例模板，或从「故事核心」里的一句话故事开始写。";
    const people = draft.characters.filter((item) => storyEntryFilled("characters", item));
    const places = draft.scenes.filter((item) => storyEntryFilled("scenes", item));
    const props = draft.items.filter((item) => storyEntryFilled("items", item));
    const core = draft.core;
    const blocks = [];
    const title = storyFilled(core.title) || "未命名故事";
    let opening = `《${title}》`;
    if (storyFilled(core.genre) || storyFilled(core.tone)) {
      opening += `${storyFilled(core.genre) ? "是一个" + storyFilled(core.genre) + "故事" : "这个故事"}`;
      if (storyFilled(core.tone)) opening += `，整体基调是${storyFilled(core.tone)}`;
      opening += "。";
    }
    blocks.push(opening);
    if (storyFilled(core.logline)) blocks.push(storyFilled(core.logline).replace(/。?$/, "。"));
    const lead = people.find((item) => storyFilled(item.name));
    const leadName = lead ? storyFilled(lead.name) : "主角";
    if (storyFilled(core.goal) || storyFilled(core.obstacle)) {
      let line = "";
      if (storyFilled(core.goal)) line += `${leadName}想要的是${storyFilled(core.goal).replace(/。$/, "")}`;
      if (storyFilled(core.obstacle)) line += `${line ? "。拦住这件事的是：" : ""}${storyFilled(core.obstacle).replace(/。$/, "")}`;
      blocks.push(line + "。");
    }
    if (people.length) {
      blocks.push(people.map((person) => {
        const name = storyFilled(person.name) || "一位还没起名的人";
        const line = storySentence(name, [
          storyFilled(person.role) ? `是${storyFilled(person.role)}` : "",
          storyFilled(person.look) ? `外貌是${storyFilled(person.look)}` : "",
          storyFilled(person.trait) ? `性格是${storyFilled(person.trait)}` : "",
          storyFilled(person.flaw) ? `弱点是${storyFilled(person.flaw)}` : "",
          storyFilled(person.want) ? `想要的是${storyFilled(person.want)}` : ""
        ]);
        const relation = storyFilled(person.relation) ? `${name}与其他人的关系：${storyFilled(person.relation).replace(/。$/, "")}。` : "";
        const held = props.filter((item) => {
          const holder = storyFilled(item.holder);
          const itemName = storyFilled(item.name);
          return holder && itemName && (holder === name || holder.includes(name) || name.includes(holder));
        });
        const heldText = held.map((item) => `${name}持有「${storyFilled(item.name)}」${storyFilled(item.look) ? "，它看起来是" + storyFilled(item.look) : ""}${storyFilled(item.why) ? "。这件东西会影响故事，因为" + storyFilled(item.why).replace(/。$/, "") : ""}。`).join("");
        return line + relation + heldText;
      }).join("\n"));
    }
    if (places.length) {
      blocks.push(places.map((scene) => {
        const place = storyFilled(scene.place) || "一个还没写名字的地方";
        const when = storyFilled(scene.time) ? `${storyFilled(scene.time)}的` : "";
        let line = `场景发生在${when}${place}`;
        if (storyFilled(scene.mood)) line += `，环境氛围是${storyFilled(scene.mood)}`;
        line += "。";
        if (storyFilled(scene.event)) {
          const names = people.map((item) => storyFilled(item.name)).filter((name) => name && storyFilled(scene.event).includes(name));
          line += `在这里发生的关键事件是：${storyFilled(scene.event).replace(/。$/, "")}${names.length ? "，和" + names.join("、") + "有关" : ""}。`;
        }
        return line;
      }).join("\n"));
    }
    const loose = props.filter((item) => {
      const holder = storyFilled(item.holder);
      if (!holder) return true;
      return !people.some((person) => {
        const name = storyFilled(person.name);
        return name && (holder === name || holder.includes(name) || name.includes(holder));
      });
    });
    if (loose.length) {
      blocks.push(loose.map((item) => {
        const name = storyFilled(item.name) || "一件还没起名的物品";
        let line = `关键物品「${name}」`;
        if (storyFilled(item.look)) line += `看起来是${storyFilled(item.look)}`;
        if (storyFilled(item.holder)) line += `${storyFilled(item.look) ? "，" : ""}由${storyFilled(item.holder)}持有`;
        line += "。";
        if (storyFilled(item.why)) line += `它会影响故事，因为${storyFilled(item.why).replace(/。$/, "")}。`;
        return line;
      }).join(""));
    }
    const steps = [
      ["开端", draft.plot.opening],
      ["意外事件", draft.plot.inciting],
      ["冲突升级", draft.plot.rising],
      ["转折", draft.plot.turn],
      ["结局", draft.plot.ending]
    ].filter(([, value]) => storyFilled(value));
    if (steps.length) blocks.push("情节这样连下来：" + steps.map(([label, value]) => `${label}，${storyFilled(value).replace(/。$/, "")}`).join("；") + "。");
    return blocks.join("\n\n");
  }

  function updateStoryPath(input) {
    const draft = storyEditor.draft;
    if (!draft) return;
    const parts = String(input.dataset.storyPath || "").split(".");
    if (parts[0] === "core" && parts[1]) draft.core[parts[1]] = input.value;
    else if (parts[0] === "plot" && parts[1]) draft.plot[parts[1]] = input.value;
    else if (draft[parts[0]]) {
      const row = draft[parts[0]].find((item) => item.id === parts[1]);
      if (row && parts[2]) row[parts[2]] = input.value;
    }
    const box = document.getElementById("storyPreview");
    const preview = document.getElementById("storySynopsis");
    if (box && preview && !box.hidden) preview.value = storySynopsis(draft);
    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => flushStory(true), 350);
  }

  function flushStory(refreshCanvas) {
    clearTimeout(storyTimer);
    storyTimer = null;
    const node = getNode(storyEditor.nodeId);
    if (!node || node.type !== "story" || !storyEditor.draft) return;
    node.story = sanitizeStory(storyEditor.draft);
    storyEditor.draft = node.story;
    const title = storyFilled(node.story.core.title);
    if (title) node.name = title.slice(0, 40);
    commit();
    writeStorage();
    if (refreshCanvas) render();
  }

  function openStoryStudio(nodeId) {
    const node = getNode(nodeId);
    if (!node || node.type !== "story") return;
    storyEditor.nodeId = node.id;
    node.story = node.story ? sanitizeStory(node.story) : storyFromTemplate("suspense");
    storyEditor.draft = node.story;
    closeMenus();
    assetPanel.hidden = true;
    detailPanel.hidden = true;
    if (!libraryEl.hidden) libraryEl.hidden = true;
    if (!shotLibEl.hidden) shotLibEl.hidden = true;
    if (!lightEl.hidden) lightEl.hidden = true;
    const preview = document.getElementById("storyPreview");
    const layout = document.getElementById("storyLayout");
    if (preview) preview.hidden = true;
    if (layout) layout.classList.remove("has-preview");
    storyEl.hidden = false;
    renderStoryStudio();
    flushStory(true);
  }

  function closeStoryStudio(save) {
    clearTimeout(storyTimer);
    storyTimer = null;
    if (save !== false && storyEditor.draft && getNode(storyEditor.nodeId)) flushStory(false);
    storyEl.hidden = true;
    if (save !== false) render();
  }

  function applyStoryTemplate(key) {
    if (!storyEditor.draft) return;
    storyEditor.draft = storyFromTemplate(key, storyEditor.draft);
    const node = getNode(storyEditor.nodeId);
    if (node) node.story = storyEditor.draft;
    renderStoryStudio();
    flushStory(true);
    toast(key === "blank" ? "已清空为空白起点，可以继续填写" : "已填入示例，可以直接修改");
  }

  function addStoryEntry(kind) {
    const draft = storyEditor.draft;
    if (!draft || !draft[kind]) return;
    if (draft[kind].length >= 8) {
      toast("这一组最多 8 条");
      return;
    }
    draft[kind].push(blankStoryEntry(kind));
    renderStoryStudio();
    flushStory(true);
  }

  function removeStoryEntry(kind, id) {
    const draft = storyEditor.draft;
    if (!draft || !draft[kind]) return;
    const row = draft[kind].find((item) => item.id === id);
    if (!row) return;
    if (draft[kind].length <= 1) {
      const kept = { id: row.id, nodeId: row.nodeId || "" };
      draft[kind][0] = Object.assign(blankStoryEntry(kind), kept);
    } else {
      draft[kind] = draft[kind].filter((item) => item.id !== id);
    }
    renderStoryStudio();
    flushStory(true);
  }

  function storyLines(pairs) {
    return pairs.filter(([, value]) => storyFilled(value)).map(([label, value]) => `${label}：${storyFilled(value)}`).join("\n");
  }

  function placeStoryNode(origin, index) {
    const size = frameOf(origin);
    let x = origin.x + size.w + 56;
    let y = origin.y + index * 280;
    while (state.nodes.some((node) => Math.abs(node.x - x) < 24 && Math.abs(node.y - y) < 24)) y += 36;
    return { x, y };
  }

  function splitStory() {
    const origin = getNode(storyEditor.nodeId);
    if (!origin || origin.type !== "story" || !storyEditor.draft) return;
    origin.story = sanitizeStory(storyEditor.draft);
    storyEditor.draft = origin.story;
    const jobs = [];
    origin.story.characters.forEach((item) => {
      if (!storyEntryFilled("characters", item)) return;
      jobs.push({
        entry: item,
        type: "character",
        name: storyFilled(item.name) || "未命名人物",
        text: storyLines([
          ["身份", item.role],
          ["外貌", item.look],
          ["性格", item.trait],
          ["弱点", item.flaw],
          ["想要", item.want],
          ["关系", item.relation]
        ])
      });
    });
    origin.story.scenes.forEach((item) => {
      if (!storyEntryFilled("scenes", item)) return;
      jobs.push({
        entry: item,
        type: "scene",
        name: storyFilled(item.place) || "未命名场景",
        text: storyLines([
          ["时间", item.time],
          ["氛围", item.mood],
          ["关键事件", item.event]
        ])
      });
    });
    origin.story.items.forEach((item) => {
      if (!storyEntryFilled("items", item)) return;
      jobs.push({
        entry: item,
        type: "text",
        name: storyFilled(item.name) || "未命名物品",
        text: storyLines([
          ["关键物品", item.name],
          ["外观", item.look],
          ["持有人", item.holder],
          ["影响", item.why]
        ])
      });
    });
    if (!jobs.length) {
      toast("先写一位人物、一个场景，或一件关键物品");
      return;
    }
    let created = 0;
    let updated = 0;
    let placed = 0;
    jobs.forEach((job) => {
      let node = job.entry.nodeId ? getNode(job.entry.nodeId) : null;
      if (!node || node.type !== job.type) {
        node = state.nodes.find((item) => item.type === job.type && item.storyOrigin === origin.id && item.storyEntry === job.entry.id) || null;
      }
      if (!node) {
        const pos = placeStoryNode(origin, placed);
        placed += 1;
        node = createNode(job.type, pos.x, pos.y, {
          name: job.name.slice(0, 40),
          text: job.text,
          fileStatus: job.type === "text" ? "" : "story"
        });
        node.storyOrigin = origin.id;
        node.storyEntry = job.entry.id;
        state.nodes.push(node);
        created += 1;
      } else {
        node.name = job.name.slice(0, 40);
        node.text = job.text;
        node.storyOrigin = origin.id;
        node.storyEntry = job.entry.id;
        if (job.type !== "text") node.fileStatus = "story";
        updated += 1;
      }
      job.entry.nodeId = node.id;
      const linked = state.edges.some((edge) => (
        (edge.from === origin.id && edge.to === node.id) || (edge.from === node.id && edge.to === origin.id)
      ));
      if (!linked && !createsCycle(origin.id, node.id)) state.edges.push(createEdge(origin.id, node.id));
    });
    commit();
    render();
    writeStorage();
    renderStoryStudio();
    const preview = document.getElementById("storySynopsis");
    const box = document.getElementById("storyPreview");
    if (preview && box && !box.hidden) preview.value = storySynopsis(origin.story);
    if (created && updated) toast(`已新增 ${created} 个节点，并更新 ${updated} 个已有节点`);
    else if (created) toast(`已拆出 ${created} 个节点，并连到这张故事卡片`);
    else toast(`已更新 ${updated} 个节点，没有重复创建`);
  }

  async function handleAction(action, el) {
    const nodeEl = el.closest(".node");
    const id = nodeEl ? nodeEl.dataset.id : el.dataset.id;
    if (action === "modal-ok") {
      const resolve = modalResolve;
      modalResolve = null;
      closeModal();
      if (resolve) resolve(true);
      return;
    }
    if (action === "modal-cancel") {
      closeModal();
      return;
    }
    if (action === "save-canvas") { saveCanvas(); return; }
    if (action === "pick-avatar") {
      document.getElementById("avatarInput").click();
      return;
    }
    if (action === "clear-avatar") {
      account.avatar = "";
      renderAvatar();
      renderAccountMenu();
      return;
    }
    if (action === "save-account") {
      const nameInput = document.getElementById("accountNameInput");
      const emailInput = document.getElementById("accountEmailInput");
      account.name = (nameInput && nameInput.value.trim()) || "演示用户";
      account.email = (emailInput && emailInput.value.trim()) || "demo@neox.ai";
      account.loggedIn = true;
      saveAccount();
      renderAvatar();
      renderAccountMenu();
      toast("资料已保存");
      return;
    }
    if (action === "logout") {
      account.loggedIn = false;
      saveAccount();
      renderAvatar();
      renderAccountMenu();
      toast("已退出登录");
      return;
    }
    if (action === "login") {
      account.loggedIn = true;
      saveAccount();
      renderAvatar();
      renderAccountMenu();
      toast("已登录");
      return;
    }
    if (action === "share") {
      const project = projectOf(doc.activeKey);
      const canvas = canvasOf(doc.activeKey);
      const text = `NEOX AI 演示画布「${project.name} / ${canvas.name}」已保存在本机浏览器。`;
      try {
        await navigator.clipboard.writeText(text);
        toast("已复制分享信息（演示）");
      } catch (err) {
        openModal(`<h2>分享</h2><p>${esc(text)}</p><div class="actions"><button type="button" class="btn primary" data-action="modal-cancel">关闭</button></div>`);
      }
      return;
    }
    if (action === "assets" || action === "open-library") { openLibrary(); return; }
    if (action === "open-shots") { openShotLibrary(id); return; }
    if (action === "open-lights") { openLightStudio(id); return; }
    if (action === "open-story") { openStoryStudio(id); return; }
    if (action === "close-story") { closeStoryStudio(); return; }
    if (action === "story-template") { applyStoryTemplate(el.dataset.template || "blank"); return; }
    if (action === "story-add") { addStoryEntry(el.dataset.kind); return; }
    if (action === "story-remove") { removeStoryEntry(el.dataset.kind, el.dataset.id); return; }
    if (action === "story-preview") {
      const box = document.getElementById("storyPreview");
      const layout = document.getElementById("storyLayout");
      const preview = document.getElementById("storySynopsis");
      if (!box || !storyEditor.draft) return;
      box.hidden = false;
      if (layout) layout.classList.add("has-preview");
      if (preview) preview.value = storySynopsis(storyEditor.draft);
      return;
    }
    if (action === "story-copy") {
      const preview = document.getElementById("storySynopsis");
      const text = preview ? preview.value : storySynopsis(storyEditor.draft);
      try {
        await navigator.clipboard.writeText(text);
        toast("梗概已复制");
      } catch (err) {
        openModal(`<h2>故事梗概</h2><textarea class="story-bound" readonly>${esc(text)}</textarea><div class="actions"><button type="button" class="btn primary" data-action="modal-cancel">关闭</button></div>`);
      }
      return;
    }
    if (action === "story-split") { splitStory(); return; }
    if (action === "close-lights") { closeLightStudio(); return; }
    if (action === "light-tab") {
      lightEditor.tab = el.dataset.tab || "ref";
      renderLightStudio();
      return;
    }
    if (action === "light-base") {
      lightEditor.baseOpen = el.dataset.id || "";
      lightEditor.tab = "ref";
      renderLightSide();
      return;
    }
    if (action === "light-bases") {
      lightEditor.baseOpen = "";
      renderLightSide();
      return;
    }
    if (action === "light-variant") { fillLightVariant(el.dataset.base, el.dataset.id); return; }
    if (action === "light-select") {
      lightEditor.selectedId = el.dataset.id || "";
      renderLightStudio();
      return;
    }
    if (action === "light-add") { addLightSource(); return; }
    if (action === "light-delete") {
      if (!lightEditor.draft) return;
      lightEditor.draft.lights = lightEditor.draft.lights.filter((item) => item.id !== el.dataset.id);
      if (!lightEditor.draft.lights.some((item) => item.id === lightEditor.selectedId)) {
        lightEditor.selectedId = lightEditor.draft.lights[0] ? lightEditor.draft.lights[0].id : "";
      }
      renderLightStudio();
      return;
    }
    if (action === "light-blank") {
      const inputs = lightEditor.draft && lightEditor.draft.inputIds ? lightEditor.draft.inputIds.slice() : [];
      lightEditor.draft = blankLightConfig();
      lightEditor.draft.inputIds = inputs;
      lightEditor.baseline = JSON.parse(JSON.stringify(lightEditor.draft));
      lightEditor.selectedId = "";
      lightEditor.baseOpen = "";
      lightEditor.tab = "free";
      lightEditor.compare = false;
      renderLightStudio();
      return;
    }
    if (action === "light-save") { saveCustomLight(); return; }
    if (action === "light-apply") { applyLightToCanvas(); return; }
    if (action === "light-compare") {
      lightEditor.compare = !lightEditor.compare;
      renderLightPreview();
      const compareBtn = document.getElementById("lightCompareBtn");
      if (compareBtn) compareBtn.classList.toggle("primary", !!lightEditor.compare);
      return;
    }
    if (action === "light-copy") {
      const shots = state.nodes.filter((node) => node.type === "shot");
      if (!shots.length || !lightEditor.draft) {
        toast("画布上还没有镜头选择节点");
        return;
      }
      openModal(`<h2>复制到其他镜头</h2><p>把当前这组光影复制到选中的镜头。这个光影节点本身保持不变。</p><div class="stack">${shots.map((shot) => `<button type="button" class="btn ghost block" data-action="light-copy-to" data-id="${shot.id}">${esc(shot.name)}</button>`).join("")}</div><div class="actions"><button type="button" class="btn ghost" data-action="modal-cancel">关闭</button></div>`);
      return;
    }
    if (action === "light-copy-to") {
      const shot = getNode(el.dataset.id);
      const draft = lightEditor.draft ? sanitizeLight(lightEditor.draft) : null;
      if (!shot || shot.type !== "shot" || !draft) return;
      shot.lighting = draft;
      closeModal();
      commit();
      render();
      writeStorage();
      toast(`已复制到镜头「${shot.name}」`);
      return;
    }
    if (action === "light-pick-custom") {
      const saved = myLights.find((item) => item.customId === el.dataset.id);
      if (!saved || !lightEditor.draft) return;
      const inputs = lightEditor.draft.inputIds.slice();
      const next = sanitizeLight(saved);
      next.customId = saved.customId;
      next.inputIds = inputs;
      lightEditor.draft = next;
      lightEditor.baseline = JSON.parse(JSON.stringify(sanitizeLight(next)));
      lightEditor.selectedId = next.lights[0] ? next.lights[0].id : "";
      lightEditor.baseOpen = next.baseId || "";
      renderLightStudio();
      return;
    }
    if (action === "light-delete-custom") {
      const index = myLights.findIndex((item) => item.customId === el.dataset.id);
      if (index >= 0) myLights.splice(index, 1);
      saveMyLights();
      if (lightEditor.draft && lightEditor.draft.customId === el.dataset.id) lightEditor.draft.customId = "";
      renderLightSide();
      return;
    }
    if (action === "close-shots") { closeShotLibrary(); return; }
    if (action === "shot-tab") {
      shotEditor.tab = el.dataset.tab || "preset";
      renderShotEditor();
      return;
    }
    if (action === "shot-pick") { fillShotPreset(el.dataset.shot); return; }
    if (action === "shot-pick-custom") { fillCustomShot(el.dataset.id); return; }
    if (action === "shot-delete-custom") { deleteCustomShot(el.dataset.id); return; }
    if (action === "shot-save-custom") { saveCustomShot(); return; }
    if (action === "shot-apply") { applyShotToCanvas(); return; }
    if (action === "shot-clear") {
      const inputs = shotEditor.draft && shotEditor.draft.inputIds ? shotEditor.draft.inputIds.slice() : [];
      shotEditor.draft = blankShot();
      shotEditor.draft.inputIds = inputs;
      shotEditor.tab = "free";
      renderShotEditor();
      return;
    }
    if (action === "close-library") { closeLibrary(); return; }
    if (action === "library-cat") {
      library.view = "catalog";
      library.category = el.dataset.id || "all";
      renderLibrary();
      return;
    }
    if (action === "library-mine") {
      library.view = library.view === "mine" ? "catalog" : "mine";
      renderLibrary();
      return;
    }
    if (action === "library-select") { selectLibrary(el.dataset.id); return; }
    if (action === "library-preview") { previewLibrary(el.dataset.id); return; }
    if (action === "library-copy") { copyLibraryItem(el.dataset.id); return; }
    if (action === "library-tour-skip" || action === "library-tour-ok") { dismissLibraryTour(); return; }
    if (action === "library-upload") {
      const input = document.getElementById("libraryFile");
      input.value = "";
      input.click();
      return;
    }
    if (action === "library-focus") {
      closeLibrary();
      focusNode(el.dataset.id);
      return;
    }
    if (action === "close-assets") { assetPanel.hidden = true; return; }
    if (action === "close-details") { detailPanel.hidden = true; return; }
    if (action === "zoom-in" || action === "zoom-out") {
      const rect = viewport.getBoundingClientRect();
      zoomAt(rect.width / 2, rect.height / 2, action === "zoom-in" ? 1.12 : 1 / 1.12);
      return;
    }
    if (action === "fit") { fitView(true); return; }
    if (action === "add-menu") {
      if (addMenu.hidden) openAddMenu();
      else addMenu.hidden = true;
      return;
    }
    if (action === "add-node") { addNode(el.dataset.type); return; }
    if (action === "tool-select") { state.tool = "select"; updateChrome(); return; }
    if (action === "tool-connect") { state.tool = "connect"; updateChrome(); toast("从端口拖出连线，或依次点击两个端口"); return; }
    if (action === "undo") { undo(); return; }
    if (action === "redo") { redo(); return; }
    if (action === "shortcuts") { showShortcuts(); return; }
    if (action === "help") { showHelp(); return; }
    if (action === "project") {
      const pid = el.dataset.id;
      const cid = doc.projectCanvas[pid] || projectOf(pid + ":").canvases[0].id;
      switchTo(pid, cid);
      return;
    }
    if (action === "canvas") {
      switchTo(projectOf(doc.activeKey).id, el.dataset.id);
      return;
    }
    if (action === "clear") {
      closeMenus();
      if (await confirmBox("确定清空当前画布？节点与连线都会移除，此操作可以撤销。")) clearCanvas();
      return;
    }
    if (action === "restore") {
      closeMenus();
      if (!state.nodes.length) {
        restoreDemo();
        return;
      }
      if (await confirmBox("将用演示流程替换当前画布，此操作可以撤销。")) restoreDemo();
      return;
    }
    if (action === "delete-node") { deleteNode(id); return; }
    if (action === "preview") {
      const node = getNode(id);
      if (!node) return;
      if (node.type === "output") openOutputPreview(id);
      else if (node.type === "model") openDetails(id);
      else openAssetPreview(id);
      return;
    }
    if (action === "pick-file") { onPickFile(id); return; }
    if (action === "run") { runWorkflow(id); return; }
    if (action === "stop") { stopRun(false); return; }
    if (action === "details") { openDetails(id); return; }
    if (action === "regen") { regenFromOutput(id); return; }
    if (action === "download") { showDownload(); return; }
    if (action === "tour") { startTour(); return; }
    if (action === "tour-skip") { tourEl.hidden = true; return; }
    if (action === "tour-next") {
      if (tourIndex >= TOUR.length - 1) tourEl.hidden = true;
      else { tourIndex += 1; positionTour(); }
      return;
    }
    if (action === "focus-node") { focusNode(el.dataset.id); return; }
    if (action === "play-sim") { playSim(); return; }
    if (action === "delete-edge") { deleteEdge(state.selectedEdgeId); }
  }

  function onPointerDown(event) {
    if (event.button !== 0 && event.button !== 1) return;
    if (event.target.closest(".modal, .drawer, .menu, .popover, .topbar, .bottombar, .tour, .edge-delete")) return;
    const port = event.target.closest(".port");
    const handle = event.target.closest(".resize");
    const node = event.target.closest(".node");
    const actionable = event.target.closest("button, textarea, input, select, a");
    if (handle && node && event.button === 0) {
      event.preventDefault();
      const id = node.dataset.id;
      const item = getNode(id);
      state.selectedNodeId = id;
      state.selectedEdgeId = null;
      edgeDelete.hidden = true;
      document.querySelectorAll(".node").forEach((el) => el.classList.toggle("selected", el.dataset.id === id));
      interaction = {
        kind: "resize",
        id,
        edge: handle.dataset.edge,
        clientX: event.clientX,
        clientY: event.clientY,
        originX: item.x,
        originY: item.y,
        originW: node.offsetWidth,
        originH: node.offsetHeight,
        moved: false
      };
      return;
    }
    if (port && event.button === 0) {
      event.preventDefault();
      interaction = {
        kind: "link",
        nodeId: port.closest(".node").dataset.id,
        side: port.dataset.side,
        clientX: event.clientX,
        clientY: event.clientY,
        moved: false,
        armed: interaction && interaction.kind === "arm" ? interaction : null
      };
      markPorts();
      return;
    }
    if (actionable && node) return;
    if (node && event.button === 0) {
      const id = node.dataset.id;
      state.selectedNodeId = id;
      state.selectedEdgeId = null;
      edgeDelete.hidden = true;
      document.querySelectorAll(".node").forEach((el) => el.classList.toggle("selected", el.dataset.id === id));
      const item = getNode(id);
      interaction = {
        kind: "node",
        id,
        clientX: event.clientX,
        clientY: event.clientY,
        originX: item.x,
        originY: item.y,
        moved: false
      };
      return;
    }
    if (event.target.closest(".hit")) return;
    interaction = {
      kind: "pan",
      clientX: event.clientX,
      clientY: event.clientY,
      originX: state.view.x,
      originY: state.view.y,
      moved: false
    };
  }

  function onPointerMove(event) {
    if (!interaction) return;
    const dx = event.clientX - interaction.clientX;
    const dy = event.clientY - interaction.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 4) interaction.moved = true;
    if (interaction.kind === "pan" && interaction.moved) {
      document.body.classList.add("is-panning");
      state.view.x = interaction.originX + dx;
      state.view.y = interaction.originY + dy;
      applyView();
      drawEdges();
    } else if (interaction.kind === "node" && interaction.moved) {
      const node = getNode(interaction.id);
      const el = document.querySelector(`.node[data-id="${interaction.id}"]`);
      node.x = interaction.originX + dx / state.view.scale;
      node.y = interaction.originY + dy / state.view.scale;
      if (el) {
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
      }
      drawEdges();
    } else if (interaction.kind === "resize" && interaction.moved) {
      document.body.classList.add(`is-resizing-${interaction.edge}`);
      const node = getNode(interaction.id);
      const el = document.querySelector(`.node[data-id="${interaction.id}"]`);
      const edge = interaction.edge;
      const worldDx = dx / state.view.scale;
      const worldDy = dy / state.view.scale;
      let w = interaction.originW;
      let h = interaction.originH;
      if (edge.includes("e")) w += worldDx;
      if (edge.includes("s")) h += worldDy;
      if (edge.includes("w")) w -= worldDx;
      if (edge.includes("n")) h -= worldDy;
      node.w = clamp(Math.round(w), MIN_W, MAX_W);
      node.h = clamp(Math.round(h), MIN_H, MAX_H);
      node.x = edge.includes("w") ? interaction.originX + (interaction.originW - node.w) : interaction.originX;
      node.y = edge.includes("n") ? interaction.originY + (interaction.originH - node.h) : interaction.originY;
      if (el) {
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        el.style.width = `${node.w}px`;
        el.style.height = `${node.h}px`;
        el.classList.add("is-sized");
      }
      drawEdges();
    } else if (interaction.kind === "link") {
      interaction.clientX = event.clientX;
      interaction.clientY = event.clientY;
      if (interaction.moved) drawEdges();
    }
  }

  function onPointerUp(event) {
    if (!interaction) return;
    const current = interaction;
    interaction = null;
    document.body.classList.remove("is-panning");
    ["n", "s", "e", "w", "nw", "ne", "sw", "se"].forEach((edge) => document.body.classList.remove(`is-resizing-${edge}`));
    if (current.kind === "pan") {
      if (!current.moved) {
        state.selectedNodeId = null;
        state.selectedEdgeId = null;
        document.querySelectorAll(".node").forEach((el) => el.classList.remove("selected"));
        edgeDelete.hidden = true;
        document.querySelectorAll(".edge-group").forEach((el) => el.classList.remove("selected"));
      } else scheduleSave();
      return;
    }
    if (current.kind === "node" || current.kind === "resize") {
      if (current.moved) commit();
      return;
    }
    if (current.kind === "link") {
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const port = hit && hit.closest ? hit.closest(".port") : null;
      if (current.moved) {
        if (port) {
          finishLink(current.nodeId, current.side, port.closest(".node").dataset.id, port.dataset.side);
        }
        markPorts();
        drawEdges();
        return;
      }
      if (state.tool === "connect") {
        if (current.armed && current.armed.nodeId !== current.nodeId) {
          finishLink(current.armed.nodeId, current.armed.side, current.nodeId, current.side);
        } else {
          interaction = { kind: "arm", nodeId: current.nodeId, side: current.side };
          toast("已选中端口，请点击另一个节点的端口");
        }
      }
      markPorts();
    }
  }

  function onWheel(event) {
    if (event.target.closest("textarea, select, .drawer, .modal, .menu, .popover")) return;
    event.preventDefault();
    let dy = event.deltaY;
    if (event.deltaMode === 1) dy *= 16;
    const rect = viewport.getBoundingClientRect();
    const factor = Math.exp(-dy * 0.0014);
    zoomAt(event.clientX - rect.left, event.clientY - rect.top, factor);
  }

  function onKey(event) {
    const typing = event.target.closest("input, textarea, select");
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveCanvas();
      return;
    }
    if (event.key === "Escape") {
      if (!modal.hidden) { closeModal(); return; }
      if (!shotLibEl.hidden) { closeShotLibrary(); return; }
      if (!lightEl.hidden) { closeLightStudio(); return; }
      if (!storyEl.hidden) { closeStoryStudio(); return; }
      if (!libraryEl.hidden) { closeLibrary(); return; }
      if (!tourEl.hidden) { tourEl.hidden = true; return; }
      closeMenus();
      interaction = null;
      markPorts();
      drawEdges();
      if (!detailPanel.hidden) detailPanel.hidden = true;
      else if (!assetPanel.hidden) assetPanel.hidden = true;
      return;
    }
    if (!modal.hidden && event.key !== "Escape") return;
    if (!libraryEl.hidden || !shotLibEl.hidden || !lightEl.hidden || !storyEl.hidden) return;
    if (typing) return;
    const meta = event.ctrlKey || event.metaKey;
    if (meta && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (meta && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      if (state.selectedEdgeId) deleteEdge(state.selectedEdgeId);
      else if (state.selectedNodeId) deleteNode(state.selectedNodeId);
      return;
    }
    if (event.key.toLowerCase() === "v") { state.tool = "select"; updateChrome(); }
    if (event.key.toLowerCase() === "c" && !meta) { state.tool = "connect"; updateChrome(); }
  }

  function onDblClick(event) {
    const nodeEl = event.target.closest(".node");
    if (nodeEl && event.target.closest(".resize")) {
      const node = getNode(nodeEl.dataset.id);
      if (!node) return;
      delete node.w;
      delete node.h;
      commit();
      render();
      toast("已恢复默认大小");
      return;
    }
    if (!nodeEl || event.target.closest("button, textarea, input, select")) return;
    const node = getNode(nodeEl.dataset.id);
    if (!node) return;
    if (node.type === "start") startTour();
    else if (node.type === "library") openLibrary();
    else if (node.type === "shot") openShotLibrary(node.id);
    else if (node.type === "light") openLightStudio(node.id);
    else if (node.type === "story") openStoryStudio(node.id);
    else if (node.type === "model") openDetails(node.id);
    else if (node.type === "output") openOutputPreview(node.id);
    else openAssetPreview(node.id);
  }

  function onInput(event) {
    if (event.target.dataset.storyPath) {
      updateStoryPath(event.target);
      return;
    }
    if (event.target.dataset.shotField) {
      updateShotDraft(event.target);
      return;
    }
    if (event.target.dataset.lightField) {
      updateLightDraft(event.target);
      return;
    }
    const field = event.target.dataset.field;
    const nodeEl = event.target.closest(".node");
    if (!field || !nodeEl) return;
    const node = getNode(nodeEl.dataset.id);
    if (!node) return;
    if (field === "name") node.name = event.target.value;
    if (field === "text") node.text = event.target.value;
    const status = nodeEl.querySelector(".row .muted");
    if (status && (field === "text" || field === "name")) {
      status.textContent = fileStatusText(node) + (node.fileName ? ` · ${node.fileName}` : "");
    }
    scheduleSave();
    clearTimeout(textTimer);
    textTimer = setTimeout(commit, 500);
  }

  function onChange(event) {
    if (event.target.dataset.shotField) {
      updateShotDraft(event.target);
      return;
    }
    if (event.target.dataset.lightField) {
      updateLightDraft(event.target);
      return;
    }
    if (event.target.id === "mineCategory") {
      const item = mineById(library.selectedId);
      if (!item || !MINE_KINDS[event.target.value]) return;
      item.category = event.target.value;
      item.kind = MINE_KINDS[item.category].kind;
      saveMine();
      renderLibraryGrid();
      renderLibraryPreview();
      return;
    }
    if (event.target.dataset.field !== "model") return;
    const node = getNode(event.target.closest(".node").dataset.id);
    if (!node) return;
    node.modelKey = event.target.value;
    node.name = MODELS[node.modelKey].name;
    commit();
    render();
  }

  function onClick(event) {
    const hit = event.target.closest(".hit");
    if (hit && hit.dataset.id) {
      state.selectedEdgeId = hit.dataset.id;
      state.selectedNodeId = null;
      drawEdges();
      document.querySelectorAll(".node").forEach((el) => el.classList.remove("selected"));
      return;
    }
    const actionEl = event.target.closest("[data-action]");
    if (actionEl) handleAction(actionEl.dataset.action, actionEl);
  }

  function bind() {
    viewport.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("keydown", onKey);
    document.addEventListener("dblclick", onDblClick);
    document.addEventListener("input", onInput);
    document.addEventListener("change", onChange);
    document.addEventListener("click", onClick);
    document.addEventListener("pointerdown", (event) => {
      if (!event.target.closest(".menu, .account-menu, #projectBtn, #canvasBtn, #accountBtn, #addMenu, #btnAdd")) closeMenus();
    });
    projectBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (projectMenu.hidden) openProjectMenu();
      else projectMenu.hidden = true;
    });
    canvasBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (canvasMenu.hidden) openCanvasMenu();
      else canvasMenu.hidden = true;
    });
    accountBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (accountMenu.hidden) openAccountMenu();
      else accountMenu.hidden = true;
    });
    document.getElementById("avatarInput").addEventListener("change", async () => {
      const file = document.getElementById("avatarInput").files && document.getElementById("avatarInput").files[0];
      document.getElementById("avatarInput").value = "";
      if (!file || !file.type.startsWith("image/")) return;
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 160;
        const side = Math.min(img.width, img.height);
        canvas.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 160, 160);
        account.avatar = canvas.toDataURL("image/jpeg", 0.8);
        renderAvatar();
        renderAccountMenu();
        toast("头像已更新，点击保存资料后写入本机");
      };
      img.src = dataUrl;
    });
    window.addEventListener("beforeunload", (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
    edgeDelete.addEventListener("click", () => deleteEdge(state.selectedEdgeId));
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (file) onFile(file);
    });
    document.getElementById("libraryLicensed").addEventListener("change", (event) => {
      library.licensedOnly = event.target.checked;
      renderLibrary();
    });
    lightEl.addEventListener("pointerdown", (event) => {
      const dot = event.target.closest("[data-light-dot]");
      if (!dot) return;
      event.preventDefault();
      event.stopPropagation();
      lightEditor.dragging = dot.dataset.lightDot;
      lightEditor.selectedId = dot.dataset.lightDot;
      if (dot.setPointerCapture) dot.setPointerCapture(event.pointerId);
    });
    lightEl.addEventListener("pointermove", (event) => {
      if (!lightEditor.dragging || !lightEditor.draft) return;
      const plan = document.getElementById("lightPlan");
      if (!plan) return;
      const rect = plan.getBoundingClientRect();
      const light = lightEditor.draft.lights.find((item) => item.id === lightEditor.dragging);
      if (!light || !rect.width || !rect.height) return;
      light.x = clamp(Math.round((event.clientX - rect.left) / rect.width * 100), 4, 96);
      light.z = clamp(Math.round((event.clientY - rect.top) / rect.height * 100), 4, 96);
      syncLightVisuals();
    });
    lightEl.addEventListener("pointerup", () => {
      if (!lightEditor.dragging) return;
      lightEditor.dragging = "";
      renderLightForm();
      renderLightSide();
    });
    document.getElementById("shotSearch").addEventListener("input", (event) => {
      shotEditor.query = event.target.value;
      if (!shotLibEl.hidden) renderShotSide();
    });
    document.getElementById("librarySearch").addEventListener("input", (event) => {
      library.query = event.target.value;
      syncLibrarySelection();
      renderLibraryGrid();
      renderLibraryPreview();
    });
    document.getElementById("libraryFile").addEventListener("change", () => {
      const file = document.getElementById("libraryFile").files && document.getElementById("libraryFile").files[0];
      if (file) onLibraryFile(file);
    });
    window.addEventListener("resize", () => {
      drawEdges();
      if (!tourEl.hidden) positionTour();
    });
  }

  function init() {
    load();
    loadAccount();
    loadMine();
    loadMyShots();
    loadMyLights();
    loadLibraryTour();
    renderAvatar();
    bind();
    render();
    requestAnimationFrame(() => {
      if (shouldFit) fitView(false);
      else {
        applyView();
        drawEdges();
      }
      world.classList.add("ready");
      viewport.classList.add("booted");
      shouldFit = false;
      setSave("saved");
    });
  }

  init();
})();
