# 留守儿童 · 三分钟人物解说片（开源工程）

一个用**纯代码画出来**的短片工程：150 秒、59 个镜头、1920×1080 / 30fps、无声。
扁平矢量、无脸剪影、冷蓝夜色 + 一盏暖光，全部由 Canvas 2D 逐帧绘制。

> A 150-second, code-drawn documentary-style short about left-behind children in rural China.
> Flat vector, faceless silhouettes, one warm light in a cold night. No footage, no stock, no AI video — every frame is drawn by code.

---

## 三个子项目

| # | 目录 | 是什么 |
|---|---|---|
| 01 | [`projects/01-left-behind-film`](projects/01-left-behind-film) | **成片 + 全部分镜源码**：5 段 59 镜，150 秒 |
| 02 | [`projects/02-figure-kit`](projects/02-figure-kit) | **极简人形绘制组件**：人物、手、字幕、空气粒子，可复用到别的片 |
| 03 | [`projects/03-reference-study`](projects/03-reference-study) | **参考片拆解方法**：这类"人物解说片"为什么能成立 |

## 看片

- 成片：[`projects/01-left-behind-film/media/left-behind-150s.mp4`](projects/01-left-behind-film/media/left-behind-150s.mp4)（15 MB，可直接在 GitHub 页面播放）
- 封面：[横版](projects/01-left-behind-film/media/封面-横版-1920x1080.png) · [竖版](projects/01-left-behind-film/media/封面-竖版-1080x1920.png)

## 片子讲什么

| 段 | 时间 | 内容 |
|---|---|---|
| 1 | 0:00–0:26 | 正月初六清晨，班车带走一批大人；孩子站在原地数车。**1550.56 万** |
| 2 | 0:26–1:00 | 为什么带不走：三道闸、撤点并校、寄宿、那笔算过的账 |
| 3 | 1:00–1:33 | 一天：5:40 起床、两碗饭、签字栏里写"奶"、47 次没接通 |
| 4 | 1:33–2:00 | "这孩子真懂事"——懂事等于不添麻烦 |
| 5 | 2:00–2:30 | 代价：手机、趴桌睡、监护人栏空着、流水线上的同一个位置 |

数据来源：教育部 2023 年 8 月教育统计数据，义务教育阶段农村留守儿童 **1550.56 万人**。

## 技术

- 引擎：**Remotion**（React 逐帧渲染）+ **Canvas 2D**，没有 three.js / WebGL，也没有任何生成式视频
- 每一镜是一个 `draw(ctx, frame, duration)` 函数，画面完全确定，可以逐帧复现
- 共享绘制层：`components/stage.ts`（人形、手、光、颗粒）+ `components/captions.ts`（字幕、空气粒子）
- 字体：Noto Sans SC / Noto Serif SC（仓库内不含字体文件，见 [fonts 说明](projects/01-left-behind-film/docs/fonts.md)）

## 本地跑

```bash
cd projects/01-left-behind-film/src
# 这是 DrawAI / Remotion 工程结构：
#   timeline.json  时间轴（5 段，共 4500 帧）
#   scene-0..4.tsx 五段的镜头调度
#   components/    共享绘制层
# 用任意兼容 Remotion 的 runner 指向 index.jsx 即可预览与渲染
```

## 许可

- **代码**（`src/`、`components/`）：MIT，见 [LICENSE](LICENSE)
- **影片与图片**（`media/`）：CC BY-NC 4.0 —— 可转载、可二次创作，不可商用，需署名

## 说明

片中人物为多个真实案例的**合成形象**，不是具体某个人；场景为示意。
片子里出现的政策细节（居住证、社保年限、公办学位等）以拍摄时公开信息为准，转述时请自行核对。

---

## 参赛材料（Kiroween 2026）

这个仓库同时作为 **Kiroween 2026** 的参赛工程，赛道 **Resurrection**。

- 参赛文案（英文，可直接粘到 Devpost）：[\docs/devpost-submission.md\](docs/devpost-submission.md)
- Kiro 工程结构：

\\\
.kiro/
├─ steering/            product / visual-language / engineering —— 给 agent 的硬规则
├─ specs/film-pipeline/ requirements / design / tasks —— 从分镜到成片的管线
└─ hooks/               preview-edited-shot · guard-visual-rules
\\\

> .kiro 目录必须保留在仓库根目录，不能写进 .gitignore（Kiroween 硬性要求）。
