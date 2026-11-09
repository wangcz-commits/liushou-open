# 02 · figure-kit：极简人形绘制组件

从片子里抽出来的可复用绘制层。全部是 Canvas 2D 函数，没有依赖，可以直接复制到任何 Remotion / 原生 Canvas 工程。

```
src/stage.ts      人形、手、光、颗粒、字幕
src/captions.ts   每镜字幕表 + 空气粒子
```

## 设计原则

- **不画脸**。人物是无脸剪影，情绪由姿态、遮挡、速度表达。
- **一个镜头一个主光**。其余全是暗部。
- **不用纯黑**。背景用深蓝灰（`#0C141B` / `#101922` / `#0E1720`），只有极暗处才落到近黑。
- **留白**。每一镜都有不写字的镜头，让节奏沉下来。

## 快速上手

```ts
import { person, hand, caption, glow, vignette, grain, makeGrain } from './stage'

// 一个人：脚在 (x, y)，身高 h
person(ctx, {
  x: 960, y: 900, h: 480,
  hair: 'bob',        // 'none' | 'short' | 'bob' | 'cap'
  pose: 'walk',       // 'stand' | 'walk' | 'squat'
  step: 0.4,          // 迈步相位
  arm: 0.3,           // 摆臂
  lean: 0.05,         // 前倾
  back: true,         // 背影（后脑勺全暗）
  fill: '#EDE6D8',
})

// 一只手：len = 手腕到指尖，ang = 朝向
hand(ctx, {
  x: 1200, y: 700, len: 260, ang: -2.3,
  pose: 'point',      // 'open' | 'point' | 'relaxed' | 'grip'
  fill: '#EDE6D8',
})

// 左上角字幕：关键词换色
caption(ctx, {
  lines: [{ t: '签字栏里' }, { t: '写的是「奶」', c: '#E9A94B' }],
  f, start: 5, end: 75, size: 52,
})
```

## API

| 函数 | 用途 |
|---|---|
| `person(ctx, opts)` | 无脸剪影：站 / 走 / 蹲，可换发型、持物、背影 |
| `hand(ctx, opts)` | 手：张开 / 指 / 半松 / 握，两节手指 + 拇指 |
| `caption(ctx, opts)` | 左上角多行字幕，逐行淡入，关键词换色 |
| `glow / lg / vignette / grain` | 光晕、渐变、暗角、颗粒 |
| `atmosphere(ctx, f, seed)` | 空气里的细尘，让静止镜头也有呼吸 |
| `pool / hexA / clamp01 / eio / eout` | 地面光斑与缓动 |

## 用到它的片子

[`../01-left-behind-film`](../01-left-behind-film) —— 59 个镜头全部由这套组件拼出来。

## 许可

MIT。
