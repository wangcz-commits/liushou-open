# 视频工程

规格：1920×1080 / 30fps / 1800 帧（60.00 秒）

## 分镜

- shot-1：第 0–359 帧，文件 scene-0.tsx
- shot-2：第 360–719 帧，文件 scene-1.tsx
- shot-3：第 720–1079 帧，文件 scene-2.tsx
- shot-4：第 1080–1439 帧，文件 scene-3.tsx
- shot-5：第 1440–1799 帧，文件 scene-4.tsx

## 分镜表

- shot-1：钩子：正月初六清晨，班车带走一批大人，孩子站在村口数车；画面 村口土路、车灯扫过霜、大人提箱上车、车窗内外对视、手指数车、数字 1550.56 万滚出；文案 正月初六，清晨五点。/ 班车会带走一批大人。/ 他们不回头。/ 1550.56 万
- shot-2：机制：为什么带不走 —— 三道闸、撤点并校、寄宿制、那笔账；画面 表格红框“连续三个月”、三道闸落下、地图上学校图标熄灭、上学的线拉长、铁架床、熄灯、纸上数字被划掉；文案 父母离开满三个月就算留守 / 不是不想带，是带不走 / 留下，是算过的账。
- shot-3：一天：5:40 起床到睡前，全部是可数的细节；画面 摸黑起床、灶台两碗饭、签字栏写“奶”、奶奶语音转文字、快递拆包闻一下、反锁的门、47 条未接视频；文案 没有人叫他 / 两碗饭，一碗给奶奶 / 签字栏里写的是“奶” / 47 次没接通
- shot-4：懂事：大人给的最高评价，其实是“不添麻烦”；画面 三个大人在头顶冒出同一句夸奖、孩子手蹭裤缝、发烧自己找药、家长会监护人写“姑姑”、行李箱塞满、车开走；文案 “这孩子真懂事。” / 生病也是自己扛 / 来的是姑姑
- shot-5：代价与回收：手机、辍学、监护人栏、流水线，回到村口与 1550 万个点；画面 短视频无限下滑、教室最后一排趴睡、监护人栏笔尖悬着、流水线剪影、村口同机位、地图点阵；文案 手机是唯一的陪伴 / 该签的人不在 / 轮到他了 / 他们不缺吃穿，缺的是那个签字的人。

## 音频

（无音频）

## 约定

- 内置素材可用 motion_assets list 查看：builtin/paper.svg、builtin/grain.svg、builtin/grid.svg 可用 staticFile 引用；builtin/whoosh.wav、builtin/impact.wav 可通过 motion_audio add 加入时间轴。素材是 DrawAI 程序生成的通用素材，不是上游原片素材。
- 工程内置 Noto Sans SC、Noto Serif SC 及常用上游字体，场景可按字体名使用；个别字体与上游特定字重可能仍需补充。
- 需要纹理或乐器单音时，先看用户素材和 motion_assets {action:"list",nodeId}，再用 {action:"library",nodeId,query:"纸张"} 或 query:"钢琴" 搜索插件库；{action:"use",nodeId,assetId:id} 导入所选条目。图片用返回的 file 调 staticFile，声音须另用 motion_audio {action:"add",nodeId,file,role:"sfx",at:秒} 放入时间轴；先查看来源和许可，试听确认电平。单音不是完整配乐。
- 插件素材随安装包提供，素材 ID 不是工作区路径。不要猜路径、从其他工程拷贝素材或手写 manifest.json；使用 library 返回的 ID 调 use，失败时报告具体错误。
- 一场景一文件，单文件不超过 120 行；共享元素放 components/。
- 场景组件 default export，签名 ({ shot, anchors, assets, render }) => ReactNode；时间用 useCurrentFrame()，相对本段起点。
- scene-kit/ 是场景层脚手架：det.ts（确定性随机 + Halton 抖动，禁 Math.random）、grow.ts（弹簧/落体/生长曲线闭式解）、look.tsx（SSAA/软阴影/色调映射/颗粒/暗角）。要画质就先看这三件，别在场景里另写一套。
- 累积采样数与快门时长从 render.samples / render.shutter 读，不要写死数字。
- 改完先渲染 3 帧看图（motion_preview），确认后再跑全片（motion_render）。
- 配色主题：custom（颜色/字体从 theme.ts 取，别手写十六进制）。

- 时间轴改动只改 timeline.json 的 startFrame / durationFrames，不要改场景文件里的绝对帧号。

## 描述

留守儿童题材三分钟科普短片。扁平矢量、无脸白色剪影人物、冷蓝夜调 + 一点灯暖，大字幕驱动，无声。人物和场景为示意，来源于多个真实案例的合成。

