# 📖 FoFo 个人工作台：AI 开发者接手全景指南 (Master Handover & Dev Manual)

> **致后续接手的 AI / 开发者**：  
> 本文档旨在为你提供关于 **FoFo 个人工作台** 的全景上下文。阅读本文档后，你将完全掌握本项目的**产品起源、设计理念、技术架构、目录职责、核心数据字典、服务端接口规范、历史需求演进历程与后续待办事项**，无需从零翻阅全部代码即可无缝承接后续开发与优化。

---

## 目录
1. [项目背景与产品哲学](#1-项目背景与产品哲学)
2. [技术栈与架构设计](#2-技术栈与架构设计)
3. [目录与文件职责矩阵](#3-目录与文件职责矩阵)
4. [核心数据模型与字典 (Data Schema)](#4-核心数据模型与字典-data-schema)
5. [服务端 API 接口规范](#5-服务端-api-接口规范)
6. [前端组件与交互流](#6-前端组件与交互流)
7. [历史迭代与用户反馈追踪表 (User Comments)](#7-历史迭代与用户反馈追踪表-user-comments)
8. [运行、调试与交接指引](#8-运行调试与交接指引)
9. [未来演进建议 (Backlog & Roadmap)](#9-未来演进建议-backlog--roadmap)

---

## 1. 项目背景与产品哲学

### 1.1 起源与痛点
用户过往习惯**完全依赖单一 Markdown 文档**记录全月的工作流（包括月目标、周重点、每日工作流、待办事项、会议纪要、随笔灵感）。  
但经过数月实践，暴露出致命的“单文档膨胀”痛点：
- **目标容易被淹没**：写到月中/月末时，月度目标和周目标被成百上千行每日待办挤到最顶端，日常根本看不到；
- **缺乏时间感知与专注反馈**：纯文本无法与番茄钟倒计时联动，无法统计每日专注工时；
- **缺乏视觉成就感**：缺乏类似 GitHub commit 贡献热力图的每日产出正反馈；
- **翻阅与检索繁琐**：一个月几千行混杂在一起，难以快速跳转到某天的会议或某天的待办。

### 1.2 核心产品哲学
1. **替代长文档，而非替代纯文本**：不搞 Obsidian 式复杂的网状双链或图谱，只做结构清晰的**个人工作管理台（Personal WorkStation）**；
2. **时间线为主轴（年 -> 月 -> 周 -> 日）**：每个维度有其专属的空间感知；
3. **极速、轻量、100% 纯本地离线**：绝不依赖云端，数据完全留存在用户本机磁盘；
4. **保留 Markdown 安全感**：平时在图形化面板高效操作，月底支持**一键导出成标准的月度完整 Markdown 归档文件**。

---

## 2. 技术栈与架构设计

为了让软件**零门槛秒开、永久不坏、无环境配置包袱**，本项目采用了极为精简优雅的技术选型：

```
+-----------------------------------------------------------------------------------+
| 前端展示层 (Browser):                                                              |
| HTML5 + Tailwind CSS (CDN/本地化样式) + 原生 ES6 响应式控制器 + Canvas 粒子系统       |
|                                                                                   |
| 核心组件:                                                                          |
| - PomodoroTimer (纯前端计时, 支持静音/Toast提醒)                                    |
| - ActivityHeatmap (SVG 动态渲染过去 18 周贡献热力图)                                |
| - CalendarWidget (交互式月历, 支持单日多事件标记)                                   |
| - MarkdownExporter (月度结构化 Markdown 归档生成器)                                |
+-----------------------------------------------------------------------------------+
                                         │
                   双通道数据持久化 (Dual-Persistence Bridge)
                                         ▼
+------------------------------------+          +------------------------------------+
| 通道 A: 本地服务端 (Python 原生)      |          | 通道 B: 纯浏览器模式 (Fallback)     |
| server.py (内置 http.server)       |          | 直接双击 index.html                 |
| - 物理直存: data/workspace.json     |          | - 数据持久化在 LocalStorage        |
| - 待阅归档: documents/reading_*.json|          | - 导出 Markdown 触发浏览器下载     |
| - 系统唤起: os.startfile() 打开文件 |          +------------------------------------+
| - 网页唤起: webbrowser.open()      |
+------------------------------------+
```

- **为何不使用重量级框架（如 Vue CLI / Create React App / Electron）**？  
  避免 `node_modules` 动辄占用上千兆磁盘、依赖过时报错。当前架构无需安装 Node.js，借助 Windows 自带 Python 环境，双击 `start.bat` 即可 1 秒秒开。

---

## 3. 目录与文件职责矩阵

```text
F:\FoFo\
├── index.html            # 主界面骨架与模态框容器
├── start.bat             # Windows 一键启动批处理脚本
├── server.py             # 极轻量原生本地服务 (提供文件读写、系统应用调用)
├── README.md             # 用户向快速上手指南
│
├── css/
│   └── style.css         # 自定义样式：卡片毛玻璃质感、热力图深浅配色、Toast浮窗、待阅便签等
│
├── js/
│   ├── app.js            # 主业务控制器与状态机（数据绑定、事件分发、优先级排序）
│   └── components/
│       ├── pomodoro.js   # 番茄钟引擎 (计时状态机、任务绑定、Toast回调)
│       ├── heatmap.js    # GitHub 风格活跃度热力图组件
│       ├── calendar.js   # 交互式月历组件 (单日多日程徽标指示)
│       └── export.js     # Markdown 结构化生成与导出引擎
│
├── data/
│   └── workspace.json    # 主工作空间物理数据 (目标、待办、笔记、热力统计全量快照)
│
├── documents/            # 今日待阅文档与索引归档目录
│   └── reading_YYYY-MM-DD.json  # 每日待阅文档与网页路径按天归档
│
├── exports/              # 生成的月度 Markdown 归档输出目录
│   └── FoFo_Work_Report_YYYY-MM.md
│
├── user_comment/         # 用户历次真实体验反馈文档
│   └── commentV1.md      # 第一期用户建议（已全部落实于 v1.1）
│
└── docs/                 # 开发者技术与交接文档库
    ├── AI_HANDOVER_AND_DEV_MANUAL.md  # 【本文档】AI 接手全景指南
    ├── implementation_plan_v1.0.md    # MVP 阶段实施计划存档
    ├── implementation_plan_v1.1.md    # v1.1 优化升级实施计划存档
    └── walkthrough_v1.1.md            # v1.1 功能验收总结
```

---

## 4. 核心数据模型与字典 (Data Schema)

数据主文件位于 `F:\FoFo\data\workspace.json`（浏览器端同步镜像在 `localStorage['fofo_workspace_v1']`）。

### 4.1 数据结构全景 JSON Schema
```json
{
  "currentDate": "2026-09-18",
  "theme": "midnight",
  "bgOpacity": 82,
  "bgBlur": 6,
  "userAvatar": "data:image/png;base64,...",
  "customBgImage": "data:image/jpeg;base64,...",
  "monthlyGoals": [
    {
      "id": "mg-1726620000000",
      "month": "2026-09",
      "text": "完成 FoFo 工作台优化与升级",
      "progress": 100,
      "done": true
    }
  ],
  "weeklyGoals": [
    {
      "id": "wg-1726620000000",
      "week": "2026-W38",
      "weekTitle": "第 38 周攻坚",
      "text": "熟练使用番茄钟与今日待阅联动",
      "done": true,
      "summary": "本周核心交付已完成，各模块运行平稳。"
    }
  ],
  "bulletin": [
    {
      "id": "b-1726620000000",
      "text": "每日饮水目标：保持在 1500ml 以上",
      "createdAt": "2026-09-18"
    }
  ],
  "scratchpad": [
    {
      "id": "sp-1726620000000",
      "text": "灵感闪念，尚未排期的事项",
      "createdAt": "2026-09-18"
    }
  ],
  "dailyData": {
    "2026-09-18": {
      "waterIntake": 750,
      "readingList": [
        {
          "id": "r-1",
          "title": "FoFo 架构设计规范",
          "type": "doc",
          "path": "F:\\FoFo\\README.md"
        },
        {
          "id": "r-2",
          "title": "项目代码仓",
          "type": "url",
          "path": "https://github.com"
        }
      ],
      "tasks": [
        {
          "id": "t-1",
          "text": "处理紧急关键交付",
          "done": false,
          "priority": "P0",
          "pomodoros": 2
        },
        {
          "id": "t-2",
          "text": "审阅今日待阅文档",
          "done": false,
          "priority": "P1",
          "pomodoros": 0
        }
      ],
      "notes": "### 会议纪要\n- 讨论要点 1\n- 结论 2",
      "milestones": [
        { "id": "m-1", "text": "10:00 方案答辩" },
        { "id": "m-2", "text": "16:00 提交预算表" }
      ]
    }
  }
}
```

### 4.2 字段说明与设计考量
- **`waterIntake`**：数字，单位为毫升（ml），每日目标值设为 1500ml。
- **`tasks` 排序机制**：优先级严格按照权重 `P0 (紧急) = 0` > `P1 (重要) = 1` > `P2 (普通) = 2`。每次新增任务或切换状态后均执行加权稳定重排。
- **`milestones`**：单日支持多个日程节点数组，彻底取代旧版本的单字符串 `milestone`。
- **`readingList`**：按天管理待阅项，并双重持久化到 `documents/reading_YYYY-MM-DD.json`。

---

## 5. 服务端 API 接口规范

服务端基于 Python 标准库 `http.server.SimpleHTTPRequestHandler` 编写，零第三方库依赖。

| 路由 Endpoint | 方法 | 功能描述 | 请求参数 / Body | 响应格式 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/data` | `GET` | 读取工作区全量配置 | 无 | JSON 格式的 `workspace.json` 全量数据 |
| `/api/data` | `POST` | 保存全量数据至物理磁盘 | `workspace.json` 字符串 | `{"status": "saved", "path": "..."}` |
| `/api/reading` | `GET` | 读取指定日期的待阅列表 | Query 参数 `?date=YYYY-MM-DD` | 包含该日待阅项的 JSON 数组 |
| `/api/reading` | `POST` | 保存指定日期的待阅列表 | `{"date": "...", "items": [...]}` | `{"status": "saved", "path": "..."}` |
| `/api/open` | `POST` | **唤起系统本地文件或网页** | `{"type": "file"\|"url", "path": "..."}` | `{"status": "ok"\|"error", "message": "..."}` |
| `/api/export` | `POST` | 导出 Markdown 文件到磁盘 | `{"filename": "...", "content": "..."}` | `{"status": "exported", "filepath": "..."}` |

> [!NOTE]
> **`/api/open` 实现细节**：
> - `type == "file"`：使用 Windows 原生 `os.startfile(os.path.normpath(path))`。无论是 Word、Excel、PDF 还是 Markdown，系统会自动调起用户默认安装的桌面软件打开。
> - `type == "url"`：自动补全 `https://` 并调用 `webbrowser.open(url)` 在系统默认浏览器打开。

---

## 6. 前端组件与交互流

### 6.0 顶部导航与状态栏 (Header Layout Standards)
- **严格单行排版 (Single-Row `flex-nowrap`)**：顶部栏固定高度（约 64px 舒适尺寸），绝不折行至第二行，确保将绝大部分垂直空间留给下方三栏。
- **左侧**：**52px 醒目圆形头像**（呼吸边框，支持点击直接上传头像图片） + 大字号“FoFo 工作台”粗体标题与公历/周数日期。
- **中间**：**上下紧凑堆叠结构**（上半部分番茄钟倒计时与控制，下半部分喝水打卡与快捷加水），横向宽度紧凑（约 300px），**彻底避免横向挤占**。
- **右侧**：GitHub 贡献热力图与右侧全部操作选项按钮（【🎨 配色/背景】【📦 导出月报】【📋 周复盘】【⚙️】）**完整文字宽敞平铺同行展现**，无任何挤压或遮挡。

### 6.1 左侧规划区 (Goals & Calendar)
- **选项卡轮换 (Tab Switcher)**：`[ 📌 本周重点 ]` 与 `[ 🎯 本月目标 ]` 互相切换，大幅压缩垂直高度。
- **调序机制**：每个条目右侧均有 `↑` 与 `↓` 按钮，点击直接与数组相邻项交换位置并持久化。
- **日历与多日程**：下方迷你日历固定常驻，当某天有多个日程时，格子上呈现金色徽标。点击后下方列表完整罗列当日所有日程节点并支持单独删除。

### 6.2 中间工作流 (Today's Workflow)
- **今日待阅卡片**：
  - 点击卡片：直接触发 `/api/open` 打开本地文档或网页。
  - 右侧提供 `↑` `↓` 调序与 `✕` 删除。
- **待办清单 (Tasks)**：
  - 优先级选择框（P0/P1/P2），回车秒级录入。
  - 点击任务旁的 `🍅 专注` 按钮，自动将该任务文本绑定到顶部番茄钟，并开启倒计时。
  - 勾选完成触发全屏粒子彩花（Confetti）。

### 6.3 顶部状态栏 (Pomodoro & Water)
- **番茄钟**：支持 25m 专注 / 5m 短休 / 15m 长休。倒计时归零静音，并触发右上角 Toast 浮窗提醒。
- **饮水打卡**：快捷按钮 `+150ml`、`+250ml`、`+350ml`、`↺`，进度条动态计算达到 1.5L 目标。
- **GitHub 贡献热力图**：根据每天完成的任务数和番茄数（1完成=1点热力）动态渲染 SVG 颜色深浅，支持悬浮 Tooltip 及点击日期穿梭。

### 6.4 右侧板块 (Notes & Bulletin)
- **Tab 1: 工作日志与会议纪要**：原生 Markdown 编辑，实时预览切换，一键插入时间戳（`#### ⏱ HH:MM`）。
- **Tab 2: 备忘公告栏 + 灵感备忘**：
  - 上层：公告栏（常驻团队原则与重要备忘）；
  - 下层：灵感随手记，支持一键 `⚡ 转为今日待办`。

---

## 7. 历史迭代与用户反馈追踪表 (User Comments)

下表记录了用户在 `user_comment/commentV1.md` 中提出的原始意见及对应落地的技术方案：

| 模块 | 用户原始反馈需求 (`commentV1.md`) | v1.1 落地实现方案 | 涉及关键代码 |
| :--- | :--- | :--- | :--- |
| **UI 布局** | 月/周目标较多时挤占日历，需滚动查看 | 重构为 **Tab 轮换式**（默认周重点，切月目标），节省 60% 空间，日历永久常驻左下角 | `index.html#tab-btn-weekly`, `js/app.js:switchGoalsTab` |
| **番茄钟** | 倒计时结束不需声音，改为小浮窗提醒 | 移除音频播放，封装 **Toast 浮窗组件**（毛玻璃、滑入滑出、5秒自动淡出） | `style.css:.toast-item`, `js/app.js:showToast` |
| **饮水记录** | 番茄钟下方增加每日饮水打卡，目标 ≥ 1.5L | 番茄钟卡片下方新增饮水条，提供快捷加水按钮与满标彩花激励，按天自动归档 | `js/app.js:addWater`, `index.html#water-progress-bar` |
| **右侧板块** | 灵感盒子分出公告栏，上下结构 | 分割为 **上部【备忘公告栏】+ 下部【灵感备忘】** | `index.html#bulletin-list`, `js/app.js:renderBulletin` |
| **今日待阅** | 原核心3件事改为【今日待阅】，支持 md/doc/docx/pdf 和网页，按天在 `documents/` 归档并可点击打开 | 重构为**待阅卡片流**，弹窗选择文件/网址，后端通过 `os.startfile` 秒开本地文件，按日保存至 `documents/reading_*.json` | `server.py:/api/open`, `js/app.js:renderReadingList` |
| **月目标排序** | 支持目标上下调序，管理优先级 | 增加 `↑` 与 `↓` 交互按钮，即时交换数组索引并保存 | `js/app.js:renderMonthlyGoals` |
| **周任务排序** | 支持周任务上下调序 | 增加 `↑` 与 `↓` 交互按钮，即时交换数组索引并保存 | `js/app.js:renderWeeklyGoals` |
| **任务优先级** | 新增任务未按 P0/P1/P2 排序，建议由高到低 | 待办清单建立加权排序算法（`P0 > P1 > P2`），添加/变更时自动重排 | `js/app.js:sortTasks` |
| **日程与节点** | 支持单日标记多个事件，避免覆盖 | 数据模型重构为 `milestones: [...]` 数组，日历增加多事件指示，支持单项删除 | `js/components/calendar.js`, `js/app.js:renderMilestones` |

---

## 8. 运行、调试与交接指引

### 8.1 快速启动
在 Windows 命令行或资源管理器中：
```cmd
cd /d F:\FoFo
start.bat
```
或者手动执行：
```cmd
python server.py
```
终端将输出：
```text
[FoFo Personal WorkStation] 服务已启动: http://localhost:3210
[存储目录] 数据自动保存在: F:\FoFo\data
[待阅目录] 待阅文档保存在: F:\FoFo\documents
[导出目录] Markdown 导出在: F:\FoFo\exports
```

### 8.2 调试要点
1. **浏览器控制台**：所有数据变动均会自动打印至 Chrome/Edge 控制台，方便追踪状态；
2. **数据重置**：如果开发过程中需要重置状态，可直接删除 `F:\FoFo\data\workspace.json`，并清理浏览器 LocalStorage 中的 `fofo_workspace_v1`；
3. **接口扩展**：如果需要新增后端原生功能，直接在 `server.py` 的 `do_GET` / `do_POST` 中添加对应路由即可。

---

## 9. 未来演进建议 (Backlog & Roadmap)

后续若有新需求，可优先参考以下方向进行扩展：

1. **待阅文档历史收藏夹 (Reading Archives)**：
   - 目前待阅是按天管理的，未来可以提供一个“常备文献/高频参考手册”全局固定置顶栏；
2. **全局快捷键呼出 (Global Hotkey)**：
   - 借助 Python 的 `keyboard` 模块或桌面包装器，实现任意界面下一键呼出小输入框记待办；
3. **Git 自动版本管理 (Auto Git Backup)**：
   - 在 `server.py` 中增加定时或按日调用 `git commit`，将 `data/` 和 `exports/` 自动提交，实现全自动化版本回溯；
4. **月报样式自定义模板**：
   - 允许用户在设置中自定义导出的 Markdown 标题格式与汇总章节。
