import {
  W, H, C, clamp01, lerp, eio, eout, ein, hexA, lg, glow, prng, pool,
  person, vignette, grain,
} from './stage'

const SANS = '"Noto Sans SC", sans-serif'

const WARM = '#FFC98A'
const WARM_D = '#E9A94B'
const PAPER = '#E7DFCF'
const INKC = '#22282e'
const RED = '#B5483B'

/* 一张表格：抬头、若干行、一行被红框圈住 */
function formSheet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  redBox: number,
  tone = PAPER,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.fillRect(10, 14, w, h)
  ctx.fillStyle = tone
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = hexA(INKC, 0.55)
  ctx.font = `600 ${Math.round(w * 0.036)}px ${SANS}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('农 村 留 守 儿 童 登 记 表', w * 0.09, h * 0.085)
  ctx.fillStyle = hexA(INKC, 0.16)
  ctx.fillRect(w * 0.09, h * 0.105, w * 0.82, 2)

  const rows = 14
  const top = h * 0.16
  const step = (h * 0.78) / rows
  for (let i = 0; i < rows; i++) {
    const yy = top + i * step
    ctx.fillStyle = hexA(INKC, 0.2)
    ctx.fillRect(w * 0.09, yy, w * 0.16, 7)
    const wl = w * (0.3 + ((i * 37) % 40) / 100)
    ctx.fillStyle = hexA(INKC, 0.1)
    ctx.fillRect(w * 0.29, yy, wl, 7)
  }

  const hy = top + 4 * step
  ctx.fillStyle = hexA(INKC, 0.72)
  ctx.font = `500 ${Math.round(w * 0.03)}px ${SANS}`
  ctx.fillText('连续三个月', w * 0.29, hy + 22)

  if (redBox > 0) {
    const bx = w * 0.27
    const by = hy - 14
    const bw = w * 0.19
    const bh = 52
    ctx.strokeStyle = hexA(RED, 0.95)
    ctx.lineWidth = 4
    ctx.lineJoin = 'round'
    const per = 2 * (bw + bh)
    const len = per * redBox
    ctx.beginPath()
    ctx.moveTo(bx, by)
    let acc = 0
    const segs: [number, number][] = [
      [bx + bw, by], [bx + bw, by + bh], [bx, by + bh], [bx, by],
    ]
    const lens = [bw, bh, bw, bh]
    for (let i = 0; i < 4; i++) {
      const segLen = lens[i]
      const take = Math.min(Math.max(len - acc, 0), segLen)
      if (take <= 0) break
      const [ex, ey] = segs[i]
      const px = i === 0 || i === 2 ? bx + (i === 0 ? take : bw - take) : bx + (i === 1 ? bw : 0)
      const py = i === 1 || i === 3 ? by + (i === 1 ? take : bh - take) : by + (i === 0 ? 0 : bh)
      void ex; void ey
      ctx.lineTo(px, py)
      acc += segLen
      if (acc >= len) break
    }
    ctx.stroke()
  }
  ctx.restore()
}

/* 镜 11｜一张表，一行被红框圈住 */
export function form(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#101922'], [1, '#080d12']])
  ctx.fillRect(0, 0, W, H)

  // 台灯从右上方压下来
  glow(ctx, 1620, 180, 1100, WARM, 0.07)
  glow(ctx, 1500, 300, 620, WARM, 0.05)

  const push = 1 + eio(clamp01(f / dur)) * 0.03
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.scale(push, push)
  ctx.translate(-W / 2, -H / 2)

  const boxP = clamp01((f - 12) / 52)
  formSheet(ctx, 300, 96, 1320, 888, boxP)

  // 纸纹：一层很淡的颗粒，免得像一块色块
  const r = prng(551)
  for (let i = 0; i < 900; i++) {
    const x = 300 + r() * 1320
    const y = 96 + r() * 888
    ctx.fillStyle = hexA(r() > 0.5 ? '#FFFFFF' : '#000000', 0.018)
    ctx.fillRect(x, y, 2, 1)
  }
  // 纸的右上角被灯照亮
  const lamp = ctx.createRadialGradient(1520, 200, 40, 1520, 200, 900)
  lamp.addColorStop(0, hexA(WARM, 0.09))
  lamp.addColorStop(1, hexA(WARM, 0))
  ctx.fillStyle = lamp
  ctx.fillRect(300, 96, 1320, 888)
  ctx.restore()

  // 红框的笔尖，描到哪亮到哪
  if (boxP > 0 && boxP < 0.999) {
    const tip = boxTip(300, 96, 1320, 888, boxP)
    glow(ctx, tip[0], tip[1], 120, '#E0685A', 0.3)
  }

  vignette(ctx, 0.45)
  grain(ctx, gr, f, 0.2)
}

// 红框的当前笔尖位置（和 formSheet 里的走法一致）
function boxTip(x: number, y: number, w: number, h: number, p: number): [number, number] {
  const rows = 14
  const top = h * 0.16
  const step = (h * 0.78) / rows
  const hy = top + 4 * step
  const bx = x + w * 0.27
  const by = y + hy - 14
  const bw = w * 0.19
  const bh = 52
  const per = 2 * (bw + bh)
  let len = per * p
  const segs: [number, number, number, number][] = [
    [bx, by, bx + bw, by],
    [bx + bw, by, bx + bw, by + bh],
    [bx + bw, by + bh, bx, by + bh],
    [bx, by + bh, bx, by],
  ]
  for (const [x0, y0, x1, y1] of segs) {
    const l = Math.hypot(x1 - x0, y1 - y0)
    if (len <= l) {
      const k = len / l
      return [lerp(x0, x1, k), lerp(y0, y1, k)]
    }
    len -= l
  }
  return [bx, by]
}

/* 镜 12｜拉开：这是一摞表中的一张 */
export function stack(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#111a23'], [1, '#070611']])
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1500, 240, 1000, WARM, 0.05)

  const t = clamp01(f / dur)
  const s = lerp(1.08, 0.8, eio(t))
  const reveal = eio(clamp01((t - 0.03) / 0.45))

  const cx = W / 2
  const blockW = 1060 * s
  const blockH = 430 * s * (0.22 + 0.78 * reveal)
  const baseY = 620

  // 桌面上的一摊影
  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.beginPath()
  ctx.ellipse(cx + 30, baseY + blockH + 26, blockW * 0.56, 40, 0, 0, Math.PI * 2)
  ctx.fill()

  // 一摞纸：一张张错开，边缘不齐
  ctx.fillStyle = '#161E25'
  ctx.fillRect(cx - blockW / 2, baseY, blockW, blockH)
  const n = 62
  const rr = prng(8821)
  for (let i = 0; i < n; i++) {
    const yy = baseY + (i * blockH) / n
    const off = (rr() - 0.5) * 16
    const shade = i % 5 === 0 ? '#8E897B' : '#EFE7D6'
    ctx.fillStyle = hexA(shade, 0.95)
    ctx.fillRect(cx - blockW / 2 + 2 + off, yy, blockW - 4 - off * 0.6, Math.max(1.6, (blockH / n) * 0.7))
  }
  // 侧面的一道冷边
  ctx.fillStyle = hexA('#9EC0DA', 0.16)
  ctx.fillRect(cx - blockW / 2, baseY, 4, blockH)
  // 底部压暗
  ctx.fillStyle = hexA('#000000', 0.35)
  ctx.fillRect(cx - blockW / 2, baseY + blockH - 26, blockW, 26)

  // 最上面那一张
  ctx.save()
  ctx.translate(cx - 550 * s, baseY - 754 * s + 4)
  ctx.scale(s, s)
  formSheet(ctx, 0, 0, 1100, 754, 1)
  // 纸角被压出的一点亮
  ctx.fillStyle = hexA(WARM, 0.06)
  ctx.fillRect(700, 0, 400, 754)
  ctx.restore()

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.2)
}
/* 镜 13｜城市清晨，电动车流 */
export function city(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  // 黎明前：天是深蓝偏紫，不是黑
  ctx.fillStyle = lg(ctx, 0, 0, 0, 760, [[0, '#141B2C'], [0.55, '#25304A'], [1, '#3A4460']])
  ctx.fillRect(0, 0, W, H)

  // 楼：深蓝灰，不是纯黑；顶上有一层天光
  const blds: [number, number, number, number][] = [
    [0, 190, 330, 520], [330, 90, 280, 620], [610, 250, 200, 460], [1240, 210, 300, 500], [1540, 120, 380, 590],
  ]
  blds.forEach(([bx, by, bw2, bh2]) => {
    ctx.fillStyle = lg(ctx, 0, by, 0, by + bh2, [[0, '#1C2735'], [1, '#141C27']])
    ctx.fillRect(bx, by, bw2, bh2)
    // 楼顶的天光轮廓
    ctx.fillStyle = hexA('#8FA9C4', 0.22)
    ctx.fillRect(bx, by, bw2, 3)
    ctx.fillStyle = hexA('#8FA9C4', 0.1)
    ctx.fillRect(bx, by, 3, bh2)
    // 零星亮着的窗
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        const lit = (r * 3 + c + Math.round(bx)) % 7 === 0
        if (lit) {
          ctx.fillStyle = hexA(WARM, 0.4)
          ctx.fillRect(bx + 26 + (c * (bw2 - 60)) / 3, by + 46 + r * 76, 44, 30)
          glow(ctx, bx + 48 + (c * (bw2 - 60)) / 3, by + 61 + r * 76, 70, WARM, 0.06)
        } else {
          ctx.fillStyle = hexA('#3A4C5E', 0.35)
          ctx.fillRect(bx + 26 + (c * (bw2 - 60)) / 3, by + 46 + r * 76, 44, 30)
        }
      }
    }
  })

  // 路面
  ctx.fillStyle = lg(ctx, 0, 720, 0, H, [[0, '#2A3746'], [0.45, '#1E2833'], [1, '#121920']])
  ctx.fillRect(0, 720, W, H - 720)
  ctx.fillStyle = hexA('#C9D8E2', 0.26)
  ctx.fillRect(0, 806, W, 6)
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = hexA('#C9D8E2', 0.14)
    ctx.fillRect(90 + i * 205, 862, 120, 26)
  }

  // 红灯
  glow(ctx, 1706, 596, 280, '#E04B3A', 0.32)
  ctx.fillStyle = '#1a222a'
  ctx.beginPath()
  ctx.roundRect(1678, 520, 56, 138, 14)
  ctx.fill()
  ctx.fillStyle = '#F0604F'
  ctx.beginPath()
  ctx.arc(1706, 552, 16, 0, Math.PI * 2)
  ctx.fill()

  // 一片尾灯聚成光带
  const band = lg(ctx, 0, 0, W, 0, [[0, hexA('#D4453A', 0)], [0.35, hexA('#D4453A', 0.16)], [0.72, hexA('#D4453A', 0.22)], [1, hexA('#D4453A', 0)]])
  ctx.fillStyle = band
  ctx.fillRect(0, 830, W, 90)
  const bl = prng(991)
  for (let i = 0; i < 26; i++) {
    const bx = bl() * W
    const by = 828 + bl() * 84
    glow(ctx, bx, by, 56, '#E4574A', 0.24)
  }

  // 电动车：三排
  const rr = prng(2231)
  for (let i = 0; i < 7; i++) {
    const lane = i % 3
    const spd = 0.8 + rr() * 0.5
    const sx = -320 + ((f * spd * 10 + i * 360) % 2600)
    const sy = 800 + lane * 92
    const sc = 0.86 + lane * 0.16
    ebike(ctx, sx, sy, sc, i % 2 === 0)
  }

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.24)
  void dur
}

function ebike(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, head: boolean) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  // 影子
  ctx.fillStyle = hexA('#000000', 0.4)
  ctx.beginPath()
  ctx.ellipse(0, 6, 96, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  // 轮子
  ctx.fillStyle = '#0F1720'
  ctx.beginPath()
  ctx.arc(-62, 0, 26, 0, Math.PI * 2)
  ctx.arc(62, 0, 26, 0, Math.PI * 2)
  ctx.fill()
  // 车身
  ctx.fillStyle = '#131C26'
  ctx.beginPath()
  ctx.roundRect(-86, -58, 172, 32, 16)
  ctx.fill()
  // 人：身体前倾，手臂伸向车把
  ctx.beginPath()
  ctx.moveTo(-34, -150)
  ctx.quadraticCurveTo(-48, -80, -44, -56)
  ctx.lineTo(26, -56)
  ctx.quadraticCurveTo(30, -110, 10, -156)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-6, -178, 30, 0, Math.PI * 2)
  ctx.fill()
  // 手臂
  ctx.strokeStyle = '#131C26'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(4, -140)
  ctx.lineTo(74, -96)
  ctx.stroke()
  // 车把
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.moveTo(70, -60)
  ctx.lineTo(80, -104)
  ctx.stroke()
  // 逆光边
  ctx.strokeStyle = hexA(WARM, 0.28)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-34, -148)
  ctx.quadraticCurveTo(-48, -80, -44, -58)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(-6, -178, 30, Math.PI * 0.85, Math.PI * 1.5)
  ctx.stroke()

  if (head) {
    glow(ctx, 100, -52, 180, WARM, 0.24)
    ctx.fillStyle = hexA('#FFF3DA', 0.9)
    ctx.beginPath()
    ctx.arc(98, -52, 8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = hexA('#F0604F', 0.9)
  ctx.beginPath()
  ctx.arc(-94, -50, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

/* 镜 14｜校门口：家长往里走，一个人站着不动 */
export function schoolGate(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#101A22'], [1, '#080D12']])
  ctx.fillRect(0, 0, W, H)

  // 门里：亮的
  ctx.fillStyle = lg(ctx, 0, 200, 0, 900, [[0, hexA(WARM, 0.36)], [1, hexA(WARM, 0.16)]])
  ctx.fillRect(1180, 200, 620, 700)
  glow(ctx, 1490, 520, 900, WARM, 0.2)

  // 门柱与门楣：受光的一侧亮
  ctx.fillStyle = '#121B23'
  ctx.fillRect(1130, 160, 50, 760)
  ctx.fillRect(1800, 160, 50, 760)
  ctx.fillRect(1130, 150, 720, 40)
  ctx.fillStyle = hexA(WARM, 0.3)
  ctx.fillRect(1130, 160, 4, 760)
  ctx.fillRect(1800, 160, 4, 760)
  ctx.fillRect(1130, 150, 720, 3)

  // 门扇（栏杆）
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = hexA('#0E161D', 0.95)
    ctx.fillRect(1190 + i * 34, 250, 9, 640)
    ctx.fillStyle = hexA(WARM, 0.14)
    ctx.fillRect(1190 + i * 34, 250, 2, 640)
  }
  ctx.fillStyle = '#121B23'
  ctx.fillRect(1180, 240, 620, 18)
  ctx.fillRect(1180, 880, 620, 16)

  // 地面
  ctx.fillStyle = '#151F27'
  ctx.fillRect(0, 890, W, H - 890)
  ctx.fillStyle = hexA(WARM, 0.2)
  ctx.fillRect(1180, 888, 620, 3)
  // 门里地上的光
  const pool2 = ctx.createRadialGradient(1490, 900, 20, 1490, 900, 520)
  pool2.addColorStop(0, hexA(WARM, 0.2))
  pool2.addColorStop(1, hexA(WARM, 0))
  ctx.fillStyle = pool2
  ctx.beginPath()
  ctx.ellipse(1490, 902, 520, 70, 0, 0, Math.PI * 2)
  ctx.fill()

  // 家长牵着孩子往里走
  const pairs = [
    { x0: 700, d: 0.0, spd: 320 },
    { x0: 560, d: 0.14, spd: 330 },
    { x0: 880, d: 0.3, spd: 300 },
  ]
  pairs.forEach((p) => {
    const k = clamp01((f / dur - p.d) / 0.6)
    if (k <= 0) return
    const x = p.x0 + k * p.spd
    if (x > 1540) return
    person(ctx, { x, y: 910, h: 380, hair: 'cap', pose: 'walk', step: Math.sin(f * 0.42) * 0.5, fill: hexA(C.cream, 0.82) })
    person(ctx, { x: x + 84, y: 912, h: 226, hair: 'bob', pose: 'walk', step: Math.sin(f * 0.42 + 1) * 0.5, fill: hexA(C.cream, 0.78) })
  })

  // 站着的那个人：给他一盏背后的光
  ctx.save()
  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.beginPath()
  ctx.ellipse(300, 912, 96, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  // 背光：在他身后铺一片暖雾
  glow(ctx, 390, 700, 360, WARM, 0.18)
  person(ctx, {
    x: 300, y: 910, h: 404, hair: 'cap', fill: hexA(C.cream, 0.96),
    carry: 'sack', headTilt: 0.04,
  })
  // 右缘的一道轮廓光
  ctx.strokeStyle = hexA(WARM, 0.55)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(300 + 0.03 * 404, 910 - 0.85 * 404, 0.086 * 404, Math.PI * 1.4, Math.PI * 2.05)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(300 + 0.09 * 404, 910 - 0.68 * 404)
  ctx.lineTo(300 + 0.11 * 404, 910 - 0.34 * 404)
  ctx.stroke()
  ctx.restore()

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.24)
}
/* 镜 15｜三道闸，一道一道压下来 */
export function threeGates(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#0E1720'], [1, '#070C11']])
  ctx.fillRect(0, 0, W, H)

  // 门里的暖光
  ctx.fillStyle = lg(ctx, 0, 0, W, 0, [[0, hexA(WARM, 0)], [0.45, hexA(WARM, 0.09)], [1, hexA(WARM, 0.22)]])
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1720, 560, 950, WARM, 0.16)

  // 人：被门光照着，右边一条亮边
  person(ctx, { x: 620, y: 906, h: 430, hair: 'cap', fill: hexA(C.cream, 0.96), carry: 'case' })
  ctx.strokeStyle = hexA(WARM, 0.5)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(620 + 13, 906 - 365, 37, Math.PI * 1.35, Math.PI * 2.1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(620 + 38, 906 - 292)
  ctx.lineTo(620 + 47, 906 - 146)
  ctx.stroke()

  ctx.fillStyle = hexA('#000000', 0.4)
  ctx.beginPath()
  ctx.ellipse(620, 908, 104, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  // 三块闸板
  const panels = [
    { to: 300, label: '居住证', at: 0.08 },
    { to: 560, label: '社保满一年', at: 0.32 },
    { to: 820, label: '公办学位', at: 0.56 },
  ]
  panels.forEach((pn) => {
    const k = clamp01((t - pn.at) / 0.15)
    if (k <= 0) return
    const hh = pn.to * ein(k)
    ctx.fillStyle = lg(ctx, 0, 0, 0, hh, [[0, '#0A121A'], [1, '#16202A']])
    ctx.fillRect(0, 0, W, hh)
    // 板下沿被门光擦亮
    ctx.fillStyle = hexA('#B9D2E6', 0.34)
    ctx.fillRect(0, hh - 5, W, 5)
    ctx.fillStyle = hexA('#0A1117', 0.55)
    for (let i = 1; i < 6; i++) {
      const yy = (hh / 6) * i
      if (yy < hh - 10) ctx.fillRect(0, yy, W, 2)
    }
    if (k > 0.4) {
      ctx.save()
      ctx.globalAlpha = clamp01((k - 0.4) / 0.4)
      ctx.font = `600 40px ${SANS}`
      ctx.textAlign = 'left'
      ctx.fillStyle = hexA(C.cream, 0.92)
      ctx.fillText(pn.label, 96, hh - 26)
      ctx.restore()
    }
  })

  const dark = clamp01((t - 0.76) / 0.2)
  if (dark > 0) {
    ctx.fillStyle = `rgba(4,7,10,${0.45 * dark})`
    ctx.fillRect(0, 0, W, H)
  }

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.24)
}

/* 镜 16｜座位一个个坐满，最后一个位子被放上书包 */
export function seatsFill(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#111A22'
  ctx.fillRect(0, 0, W, H)

  // 左边的窗光
  ctx.fillStyle = lg(ctx, 0, 0, 1000, 0, [[0, hexA('#9CBBD4', 0.16)], [1, hexA('#9CBBD4', 0)]])
  ctx.fillRect(0, 0, W, H)

  // 黑板
  ctx.fillStyle = '#15211B'
  ctx.fillRect(1180, 130, 680, 290)
  ctx.strokeStyle = hexA('#7C8F84', 0.45)
  ctx.lineWidth = 10
  ctx.strokeRect(1180, 130, 680, 290)
  ctx.fillStyle = hexA('#AFC0B6', 0.2)
  for (let i = 0; i < 3; i++) ctx.fillRect(1220, 190 + i * 64, 520 - i * 90, 10)

  const rows = 4
  const cols = 6
  const lastIdx = 3 * cols + 5
  for (let r = 0; r < rows; r++) {
    const sc = 1 - r * 0.12
    const yy = 480 + r * 132
    for (let c = 0; c < cols; c++) {
      const xx = 300 + c * 238 * sc + r * 30
      const idx = r * cols + c
      const at = 0.04 + idx * 0.032
      const k = idx === lastIdx ? 0 : clamp01((f / dur - at) / 0.07)
      deskSeat(ctx, xx, yy, sc, k)
    }
  }

  // 一束窗光斜切过几排桌子
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const shaft = ctx.createLinearGradient(0, 200, 900, 900)
  shaft.addColorStop(0, hexA('#A8C6DE', 0.1))
  shaft.addColorStop(1, hexA('#A8C6DE', 0))
  ctx.fillStyle = shaft
  ctx.beginPath()
  ctx.moveTo(0, 300)
  ctx.lineTo(420, 160)
  ctx.lineTo(980, 900)
  ctx.lineTo(360, 1080)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // 最后那个位子：空着，放上一个橙色的书包
  const lastK = clamp01((f / dur - 0.78) / 0.12)
  if (lastK > 0) {
    const sc = 1 - 3 * 0.12
    const xx = 300 + 5 * 238 * sc + 3 * 30
    const yy = 480 + 3 * 132
    const e = eout(lastK)
    ctx.fillStyle = hexA('#C9713F', 0.95)
    ctx.beginPath()
    ctx.roundRect(xx - 40, yy - 76 - 40 * e, 80, 50 * e + 6, 14)
    ctx.fill()
    ctx.fillStyle = hexA(WARM, 0.3)
    ctx.fillRect(xx - 40, yy - 76 - 40 * e, 80, 3)
    glow(ctx, xx, yy - 60, 120, '#C9713F', 0.12 * e)
  }

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}

function deskSeat(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, k: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)

  // 椅子靠背
  ctx.fillStyle = hexA('#1E2A35', 0.95)
  ctx.beginPath()
  ctx.roundRect(-34, -104, 68, 26, 10)
  ctx.fill()

  if (k > 0) {
    const e = eout(k)
    const rise = (1 - e) * 26
    ctx.fillStyle = hexA(C.cream, 0.94)
    ctx.beginPath()
    ctx.roundRect(-34, -96 + rise, 68, 78, 28)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(0, -114 + rise, 26, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = hexA('#141C23', 0.9)
    ctx.beginPath()
    ctx.arc(0, -120 + rise, 26, Math.PI * 0.98, Math.PI * 2.02)
    ctx.fill()
    // 肩上的窗光
    ctx.strokeStyle = hexA('#B9D8EE', 0.35)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, -114 + rise, 27, Math.PI * 1.15, Math.PI * 1.75)
    ctx.stroke()
  }

  // 课桌
  ctx.fillStyle = '#26333F'
  ctx.beginPath()
  ctx.roundRect(-78, -22, 156, 18, 6)
  ctx.fill()
  ctx.fillStyle = hexA('#A8C6DE', 0.18)
  ctx.fillRect(-78, -22, 156, 2)
  ctx.fillStyle = '#18222B'
  ctx.fillRect(-70, -6, 11, 52)
  ctx.fillRect(59, -6, 11, 52)
  ctx.fillStyle = hexA('#0E161D', 0.9)
  ctx.beginPath()
  ctx.roundRect(-46, -38, 76, 12, 4)
  ctx.fill()
  ctx.restore()
}
/* 镜 17｜村小：铁门落锁 */
export function villageSchool(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#0E1820'], [1, '#080D11']])
  ctx.fillRect(0, 0, W, H)

  // 教学楼：窗是暗的，但楼体有天光边
  ctx.fillStyle = lg(ctx, 0, 90, 0, 620, [[0, '#182430'], [1, '#121B24']])
  ctx.fillRect(140, 90, 1640, 520)
  ctx.fillStyle = hexA('#9CBBD4', 0.2)
  ctx.fillRect(140, 90, 1640, 4)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      ctx.fillStyle = hexA('#080E13', 0.95)
      ctx.fillRect(210 + c * 192, 150 + r * 150, 128, 96)
      ctx.fillStyle = hexA('#8FA9C4', 0.06)
      ctx.fillRect(210 + c * 192, 150 + r * 150, 128, 3)
    }
  }
  ctx.strokeStyle = hexA('#5E7180', 0.35)
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(250, 760)
  ctx.lineTo(250, 290)
  ctx.stroke()

  ctx.fillStyle = '#141E26'
  ctx.fillRect(0, 760, W, H - 760)

  // 铁门
  const gateTop = 430
  const gateBottom = 900
  ctx.fillStyle = '#0C141A'
  ctx.fillRect(560, 400, 40, 520)
  ctx.fillRect(1380, 400, 40, 520)
  ctx.fillRect(560, 400, 860, 34)
  ctx.fillStyle = hexA('#9CBBD4', 0.18)
  ctx.fillRect(560, 400, 860, 3)
  for (let i = 0; i < 24; i++) {
    const x = 620 + i * 32
    ctx.fillStyle = '#18222B'
    ctx.fillRect(x, gateTop, 11, gateBottom - gateTop)
    ctx.fillStyle = hexA('#A8C6DE', 0.22)
    ctx.fillRect(x, gateTop, 2, gateBottom - gateTop)
  }
  ctx.fillStyle = '#18222B'
  ctx.fillRect(610, 640, 700, 10)
  ctx.fillRect(610, 790, 700, 10)

  // 链子：亮一点，环环相扣
  for (let i = 0; i < 9; i++) {
    const k = i / 8
    const lx = 892 + k * 156
    const ly = 660 + Math.sin(k * Math.PI) * 54
    ctx.strokeStyle = hexA('#C6D5E0', 0.8)
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.ellipse(lx, ly, 12, 16, k * 0.6, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 锁：放大，给一道边走的高光
  const sh = 0.5 + 0.5 * Math.sin(f * 0.16)
  glow(ctx, 970, 724, 150 + sh * 90, '#EAF3FA', 0.25 + sh * 0.3)
  ctx.fillStyle = '#D8E3EC'
  ctx.beginPath()
  ctx.roundRect(930, 700, 80, 86, 14)
  ctx.fill()
  ctx.fillStyle = hexA('#FFFFFF', 0.5 * sh)
  ctx.beginPath()
  ctx.roundRect(940, 708, 12, 66, 6)
  ctx.fill()
  ctx.strokeStyle = '#D8E3EC'
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.arc(970, 700, 26, Math.PI, 0)
  ctx.stroke()
  // 钥匙孔
  ctx.fillStyle = '#5C6B77'
  ctx.beginPath()
  ctx.arc(970, 736, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(967, 736, 6, 16)

  // 光带：门里那一片地面是亮的
  const gp = ctx.createRadialGradient(970, 960, 30, 970, 960, 620)
  gp.addColorStop(0, hexA('#A8C6DE', 0.1))
  gp.addColorStop(1, hexA('#A8C6DE', 0))
  ctx.fillStyle = gp
  ctx.beginPath()
  ctx.ellipse(970, 962, 620, 86, 0, 0, Math.PI * 2)
  ctx.fill()

  // 孩子走过：走在亮的地方
  const x = lerp(-180, 2100, clamp01(f / dur))
  ctx.fillStyle = hexA('#000000', 0.4)
  ctx.beginPath()
  ctx.ellipse(x, 932, 96, 11, 0, 0, Math.PI * 2)
  ctx.fill()
  person(ctx, { x, y: 930, h: 400, hair: 'bob', back: true, pose: 'walk', step: Math.sin(f * 0.4) * 0.5, fill: C.cream })
  // 左缘的冷轮廓光
  ctx.strokeStyle = hexA('#B9D8EE', 0.45)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x - 3, 930 - 0.805 * 400, 0.086 * 400, Math.PI * 0.9, Math.PI * 1.6)
  ctx.stroke()

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.24)
}

/* 地图底子 */
function mapBase(ctx: CanvasRenderingContext2D, push: number) {
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.scale(push, push)
  ctx.translate(-W / 2, -H / 2)
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#101B26'], [1, '#0A1219']])
  ctx.fillRect(0, 0, W, H)
  // 网格：像电子地图的底
  ctx.strokeStyle = hexA('#6E93B0', 0.12)
  ctx.lineWidth = 1
  for (let i = 1; i < 12; i++) {
    ctx.beginPath()
    ctx.moveTo((i * W) / 12, 0)
    ctx.lineTo((i * W) / 12, H)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, (i * H) / 12)
    ctx.lineTo(W, (i * H) / 12)
    ctx.stroke()
  }
  // 河
  ctx.strokeStyle = hexA('#3E6A86', 0.55)
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.moveTo(-100, 760)
  ctx.bezierCurveTo(420, 660, 760, 880, 1300, 700)
  ctx.bezierCurveTo(1600, 600, 1800, 680, 2020, 560)
  ctx.stroke()
  // 路网
  ctx.strokeStyle = hexA('#8FAEC6', 0.3)
  ctx.lineWidth = 6
  ;[[120, 300, 1800, 250], [300, 120, 360, 980], [900, 100, 980, 1000], [1450, 160, 1520, 980]].forEach(([x0, y0, x1, y1]) => {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
  })
  ctx.restore()
}

const SCHOOLS = [
  [300, 300], [520, 430], [760, 250], [980, 470], [1180, 300],
  [1380, 540], [1560, 360], [1720, 640], [900, 760],
]

function schoolIcon(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, lit: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  if (lit > 0.02) {
    glow(ctx, 0, 0, 110, WARM, 0.28 * lit)
  } else {
    // 灭掉之后留一个灰点，别完全消失
    glow(ctx, 0, 0, 60, '#6E8496', 0.06)
  }
  ctx.fillStyle = lit > 0.02 ? hexA(WARM, 0.9 * lit + 0.1) : hexA('#4A5866', 0.75)
  ctx.beginPath()
  ctx.moveTo(-28, 8)
  ctx.lineTo(0, -24)
  ctx.lineTo(28, 8)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(-22, 8, 44, 28)
  // 亮的时候有一圈光边
  if (lit > 0.3) {
    ctx.strokeStyle = hexA(WARM, 0.6 * lit)
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(-28, 8)
    ctx.lineTo(0, -24)
    ctx.lineTo(28, 8)
    ctx.stroke()
  }
  ctx.restore()
}

/* 镜 18｜学校一个个熄灭 */
export function mapOut(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  mapBase(ctx, 1 + eio(clamp01(f / dur)) * 0.02)

  SCHOOLS.forEach(([x, y], i) => {
    const off = clamp01((f / dur - (0.08 + i * 0.075)) / 0.1)
    schoolIcon(ctx, x, y, 1, 1 - off)
    if (off > 0 && off < 1) {
      // 灭的一瞬：一圈扩开的光环
      ctx.strokeStyle = hexA(WARM, 0.5 * (1 - off))
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, 26 + off * 90, 0, Math.PI * 2)
      ctx.stroke()
    }
  })

  vignette(ctx, 0.52)
  grain(ctx, gr, f, 0.22)
}

/* 镜 19｜上学的线，被拉成八公里 */
export function mapDist(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  mapBase(ctx, 1.1)
  SCHOOLS.forEach(([x, y], i) => schoolIcon(ctx, x, y, 0.9, i === 7 ? 1 : 0))

  const home = [520, 700]
  const school = SCHOOLS[7]
  const k = clamp01((f / dur - 0.08) / 0.55)

  ctx.fillStyle = C.cream
  ctx.beginPath()
  ctx.arc(home[0], home[1], 12, 0, Math.PI * 2)
  ctx.fill()
  glow(ctx, home[0], home[1], 90, C.cream, 0.28)

  const pts: [number, number][] = [
    [home[0], home[1]], [640, 720], [760, 660], [880, 700], [1040, 690],
    [1200, 640], [1400, 660], [1560, 700], [school[0], school[1]],
  ]
  let total = 0
  const segs: number[] = []
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    segs.push(d)
    total += d
  }
  let acc = 0
  const target = total * eio(k)
  const path: [number, number][] = [[pts[0][0], pts[0][1]]]
  ctx.strokeStyle = hexA(WARM, 0.9)
  ctx.lineWidth = 5
  ctx.setLineDash([14, 12])
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) {
    if (acc + segs[i - 1] <= target) {
      ctx.lineTo(pts[i][0], pts[i][1])
      path.push([pts[i][0], pts[i][1]])
      acc += segs[i - 1]
    } else {
      const rem = (target - acc) / segs[i - 1]
      const ex = lerp(pts[i - 1][0], pts[i][0], rem)
      const ey = lerp(pts[i - 1][1], pts[i][1], rem)
      ctx.lineTo(ex, ey)
      path.push([ex, ey])
      acc = target
      break
    }
  }
  ctx.stroke()
  ctx.setLineDash([])

  // 一个走出的小光点，沿着线一直走到头
  if (path.length > 1) {
    const walkP = ((f / dur) * 2.4) % 1
    const d = walkP * (path.length - 1)
    const i0 = Math.floor(d)
    const i1 = Math.min(path.length - 1, i0 + 1)
    const lx = lerp(path[i0][0], path[i1][0], d - i0)
    const ly = lerp(path[i0][1], path[i1][1], d - i0)
    glow(ctx, lx, ly, 70, '#FFF3DA', 0.45)
    ctx.fillStyle = '#FFF8EC'
    ctx.beginPath()
    ctx.arc(lx, ly, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  if (k > 0.7) {
    const a = clamp01((k - 0.7) / 0.3)
    ctx.save()
    ctx.globalAlpha = a
    ctx.fillStyle = C.cream
    ctx.font = `600 52px ${SANS}`
    ctx.fillText('8 公里', 1050, 850)
    ctx.fillStyle = hexA(C.dust, 0.8)
    ctx.font = `400 28px ${SANS}`
    ctx.fillText('走路一个多小时', 1050, 896)
    ctx.restore()
  }

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}
/* 镜 20｜宿舍：一排铁架床 */
export function dorm(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0E171F'
  ctx.fillRect(0, 0, W, H)

  // 窗外的月光（冷）
  ctx.fillStyle = lg(ctx, 0, 0, 820, 0, [[0, hexA('#9CBBD4', 0.16)], [1, hexA('#9CBBD4', 0)]])
  ctx.fillRect(0, 0, W, H)
  // 走廊门缝透进来的冷白光
  ctx.fillStyle = hexA('#CFE0EC', 0.16)
  ctx.fillRect(1730, 250, 26, 660)
  glow(ctx, 1743, 580, 460, '#CFE0EC', 0.14)

  // 尽头那盏灯（暖）
  glow(ctx, 1560, 380, 420, WARM, 0.1)
  ctx.fillStyle = hexA(WARM, 0.7)
  ctx.beginPath()
  ctx.arc(1560, 366, 13, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 5; i++) {
    const s = 1 - i * 0.13
    bunk(ctx, 260 + i * 330, 930, s, i)
  }

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.24)
  void f
  void dur
}

function bunk(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, idx: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)

  // 后立柱（往里退一点，暗）
  ctx.fillStyle = '#2E3B47'
  ctx.fillRect(-118, -418, 11, 418)
  ctx.fillRect(126, -418, 11, 418)
  // 后横杆
  ctx.fillRect(-118, -418, 255, 9)

  // 下铺：床垫有厚度（顶面 + 侧面）
  ctx.fillStyle = '#26333F'
  ctx.beginPath()
  ctx.roundRect(-124, -246, 248, 34, 4)
  ctx.fill()
  ctx.fillStyle = '#1A242D'
  ctx.fillRect(-124, -212, 248, 10)
  // 上铺床垫
  ctx.fillStyle = '#26333F'
  ctx.beginPath()
  ctx.roundRect(-124, -432, 248, 30, 4)
  ctx.fill()
  ctx.fillStyle = '#1A242D'
  ctx.fillRect(-124, -402, 248, 9)

  // 被子：铺在上面，垂下来一角
  ctx.fillStyle = hexA(C.cream, 0.88)
  ctx.beginPath()
  ctx.roundRect(-118, -286, 236, 44, 10)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-118, -244)
  ctx.lineTo(-46, -244)
  ctx.lineTo(-52, -196)
  ctx.lineTo(-118, -200)
  ctx.closePath()
  ctx.fill()
  // 枕头
  ctx.fillStyle = hexA('#F2EADA', 0.95)
  ctx.beginPath()
  ctx.roundRect(-112, -246, 80, 26, 10)
  ctx.fill()
  // 上铺的被子
  ctx.fillStyle = hexA(C.cream, 0.82)
  ctx.beginPath()
  ctx.roundRect(-112, -470, 214, 40, 10)
  ctx.fill()

  // 梯子
  ctx.strokeStyle = '#46586A'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(146, -410)
  ctx.lineTo(146, -10)
  ctx.moveTo(186, -410)
  ctx.lineTo(186, -10)
  ctx.stroke()
  for (let i = 0; i < 3; i++) {
    const ry = -120 - i * 96
    ctx.beginPath()
    ctx.moveTo(146, ry)
    ctx.lineTo(186, ry)
    ctx.stroke()
  }

  // 前立柱：受光的一面
  ctx.fillStyle = '#4C5F70'
  ctx.fillRect(-132, -430, 15, 430)
  ctx.fillRect(117, -430, 15, 430)
  ctx.fillStyle = hexA('#B9D8EE', 0.5)
  ctx.fillRect(-132, -430, 4, 430)
  ctx.fillRect(117, -430, 4, 430)
  // 前横杆
  ctx.fillStyle = '#4C5F70'
  ctx.fillRect(-132, -430, 264, 12)
  ctx.fillStyle = hexA('#B9D8EE', 0.42)
  ctx.fillRect(-132, -430, 264, 3)

  // 床头挂的塑料袋
  if (idx % 2 === 0) {
    ctx.fillStyle = hexA('#D6E3EC', 0.32)
    ctx.beginPath()
    ctx.ellipse(140, -320, 17, 27, 0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = hexA('#EAF3FA', 0.55)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(140, -320, 17, 27, 0.08, Math.PI * 1.1, Math.PI * 1.9)
    ctx.stroke()
  }
  ctx.restore()
}
/* 镜 21｜自己铺床：四个角一个一个掖进去 */
export function makeBed(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0E171F'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = lg(ctx, 0, 0, 760, 0, [[0, hexA('#9CBBD4', 0.12)], [1, hexA('#9CBBD4', 0)]])
  ctx.fillRect(0, 0, W, H)

  const k = clamp01((f / dur - 0.06) / 0.6)
  const fold = eio(k)

  // 床：有床腿、有床头的铁架床
  ctx.fillStyle = '#46586A'
  ctx.fillRect(296, 560, 14, 400)
  ctx.fillRect(1424, 560, 14, 400)
  ctx.fillStyle = hexA('#B9D8EE', 0.4)
  ctx.fillRect(296, 560, 4, 400)
  ctx.fillRect(1424, 560, 4, 400)
  // 床头栏杆
  ctx.fillStyle = '#46586A'
  ctx.fillRect(1424, 470, 14, 100)
  ctx.fillRect(1350, 480, 88, 12)
  // 床垫：顶面 + 侧面
  ctx.fillStyle = '#26333F'
  ctx.beginPath()
  ctx.roundRect(282, 574, 1160, 56, 6)
  ctx.fill()
  ctx.fillStyle = '#17212A'
  ctx.fillRect(282, 630, 1160, 16)

  // 床单：从铺开到掖好
  ctx.fillStyle = hexA(C.cream, 0.92)
  ctx.beginPath()
  ctx.moveTo(320, 566)
  ctx.lineTo(1400, 566)
  ctx.lineTo(1400 - 70 * fold, 566 + 120)
  ctx.lineTo(320 + 70 * fold, 566 + 120)
  ctx.closePath()
  ctx.fill()
  // 床单的褶皱
  ctx.strokeStyle = hexA('#000000', 0.1)
  ctx.lineWidth = 3
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(430 + i * 230, 590)
    ctx.lineTo(430 + i * 230 + 20, 580 + 108)
    ctx.stroke()
  }

  // 床单前缘垂下来的一条
  ctx.fillStyle = hexA('#CFC7B6', 0.9)
  ctx.beginPath()
  ctx.moveTo(320 + 70 * fold, 580 + 116)
  ctx.lineTo(1400 - 70 * fold, 580 + 116)
  ctx.lineTo(1400 - 86 * fold, 580 + 148)
  ctx.lineTo(320 + 86 * fold, 580 + 148)
  ctx.closePath()
  ctx.fill()

  // 掖进去的两个角
  ;[320, 1400].forEach((cx, i) => {
    const kk = clamp01((k - (i === 0 ? 0.1 : 0.45)) / 0.28)
    if (kk <= 0) return
    ctx.fillStyle = hexA(C.cream, 0.98)
    ctx.beginPath()
    ctx.ellipse(cx + (i === 0 ? 46 : -46) * fold, 586 + 100 * kk, 54, 20 * kk + 8, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  // 枕头（最后拍两下）
  const pat = clamp01((f / dur - 0.74) / 0.2)
  const patY = -Math.abs(Math.sin(pat * Math.PI * 3)) * 14
  ctx.fillStyle = hexA('#F2EADA', 0.98)
  ctx.beginPath()
  ctx.roundRect(372, 536 + patY, 176, 48, 20)
  ctx.fill()

  // 台灯照在床上的那一摊暖光
  const lamp = ctx.createRadialGradient(760, 620, 20, 760, 620, 480)
  lamp.addColorStop(0, hexA(WARM, 0.16))
  lamp.addColorStop(1, hexA(WARM, 0))
  ctx.fillStyle = lamp
  ctx.beginPath()
  ctx.ellipse(760, 620, 480, 200, 0, 0, Math.PI * 2)
  ctx.fill()

  // 孩子：弯腰压在床边，手在掖角
  const dip = 0.03 * Math.sin(f * 0.1)
  person(ctx, {
    x: 1790, y: 1010, h: 560, hair: 'bob',
    lean: 0.26 + dip, headTilt: 0.22, fill: C.cream,
  })
  // 手落在床单上
  const handX = 1392 - 22 * fold
  const handY = 690 + 14 * Math.sin(f * 0.12)
  ctx.fillStyle = C.cream
  ctx.beginPath()
  ctx.arc(handX, handY, 22, 0, Math.PI * 2)
  ctx.fill()
  glow(ctx, handX, handY, 140, WARM, 0.14)

  ctx.fillStyle = hexA('#000000', 0.4)
  ctx.beginPath()
  ctx.ellipse(1760, 1012, 90, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  vignette(ctx, 0.48)
  grain(ctx, gr, f, 0.22)
}
/* 镜 22｜熄灯，横移过一排床，最里面那张眼睛还睁着 */
export function lightsOut(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#0A121A'
  ctx.fillRect(0, 0, W, H)

  const lampOn = 1 - eio(clamp01((t - 0.16) / 0.12))

  // 月光：熄灯之后反而更清楚
  ctx.fillStyle = lg(ctx, 0, 0, 1100, 0, [[0, hexA('#A9C8E0', 0.2 + (1 - lampOn) * 0.06)], [1, hexA('#A9C8E0', 0)]])
  ctx.fillRect(0, 0, W, H)

  // 门口那盏
  glow(ctx, 1700, 360, 640, WARM, 0.18 * lampOn)
  ctx.fillStyle = hexA(WARM, 0.9 * lampOn)
  ctx.beginPath()
  ctx.arc(1700, 336, 14, 0, Math.PI * 2)
  ctx.fill()
  // 灯灭了以后，门槛那里还剩一条冷光
  ctx.fillStyle = hexA('#CFE0EC', 0.1 * (1 - lampOn))
  ctx.fillRect(1706, 250, 18, 660)

  const pan = eio(t) * 240
  for (let i = 0; i < 5; i++) {
    drawBunkRow(ctx, 200 + i * 386 - pan, 900, 1 - i * 0.05, i, 1 - lampOn, t)
  }

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.26)
}

function drawBunkRow(
  ctx: CanvasRenderingContext2D, x: number, y: number, s: number, idx: number, dark: number, t: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)

  // 床架：管子上有一条月光边
  ctx.fillStyle = hexA('#46586A', 0.85 - dark * 0.2)
  ctx.fillRect(-150, -420, 11, 420)
  ctx.fillRect(138, -420, 11, 420)
  ctx.fillRect(-150, -420, 300, 10)
  ctx.fillStyle = hexA('#A9C8E0', 0.5 - dark * 0.15)
  ctx.fillRect(-150, -420, 3, 420)
  ctx.fillRect(138, -420, 3, 420)

  // 床垫
  ctx.fillStyle = hexA('#1A2531', 0.98)
  ctx.fillRect(-140, -250, 280, 22)

  // 被子：月光压在上面
  ctx.fillStyle = hexA(C.cream, 0.72 - dark * 0.12)
  ctx.beginPath()
  ctx.roundRect(-136, -292, 272, 50, 14)
  ctx.fill()
  ctx.fillStyle = hexA('#A9C8E0', 0.18)
  ctx.fillRect(-136, -292, 272, 8)
  // 枕头
  ctx.fillStyle = hexA('#F2EADA', 0.82 - dark * 0.12)
  ctx.beginPath()
  ctx.roundRect(-132, -266, 80, 22, 9)
  ctx.fill()

  // 被子下露出的脑袋
  ctx.fillStyle = hexA(C.cream, 0.86 - dark * 0.1)
  ctx.beginPath()
  ctx.arc(-88, -272, 23, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hexA('#0C1218', 0.9)
  ctx.beginPath()
  ctx.arc(-88, -278, 23, Math.PI * 0.95, Math.PI * 2.05)
  ctx.fill()
  // 头顶的月光边
  ctx.strokeStyle = hexA('#CFE8FF', 0.5)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(-88, -272, 24, Math.PI * 1.15, Math.PI * 1.85)
  ctx.stroke()

  // 最里面那张：眼睛还睁着
  if (idx === 4) {
    const open = clamp01((t - 0.5) / 0.22)
    if (open > 0.15) {
      // 眼里的一点反光
      ctx.fillStyle = hexA('#F2F8FF', 0.95 * open)
      ctx.beginPath()
      ctx.ellipse(-97, -272, 7, 5.5, 0, 0, Math.PI * 2)
      ctx.ellipse(-79, -272, 7, 5.5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = hexA('#0B1116', 0.9 * open)
      ctx.beginPath()
      ctx.arc(-97, -272, 3.2, 0, Math.PI * 2)
      ctx.arc(-79, -272, 3.2, 0, Math.PI * 2)
      ctx.fill()
      glow(ctx, -88, -272, 70, '#EAF6FF', 0.18 * open)
    }
  }
  ctx.restore()
}

/* 镜 23｜那笔账：笔一行一行划掉，只剩"留" */
export function ledger(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#0C131A'
  ctx.fillRect(0, 0, W, H)
  // 台灯：暖，压在纸上
  glow(ctx, 1440, 240, 900, WARM, 0.16)
  glow(ctx, 1440, 240, 300, WARM, 0.2)

  const px = 480
  const py = 190
  const pw = 940
  const ph = 720

  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(-0.012)
  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.fillRect(16, 20, pw, ph)
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, pw, ph)
  // 灯从右上照下来，纸有明暗
  const lit = ctx.createRadialGradient(pw * 0.82, 60, 40, pw * 0.82, 60, pw * 0.95)
  lit.addColorStop(0, hexA(WARM, 0.2))
  lit.addColorStop(1, hexA('#000000', 0.12))
  ctx.fillStyle = lit
  ctx.fillRect(0, 0, pw, ph)

  const rows = [
    { label: '房租', v: '800' },
    { label: '学费', v: '2 400' },
    { label: '路费', v: '360' },
    { label: '打工', v: '4 500' },
    { label: '留', v: '' },
  ]
  rows.forEach((r, i) => {
    const yy = 150 + i * 114
    ctx.fillStyle = hexA(INKC, i === 4 ? 0.95 : 0.75)
    ctx.font = `${i === 4 ? 700 : 400} 54px ${SANS}`
    ctx.fillText(r.label, 96, yy)
    if (r.v) {
      ctx.font = `400 48px ${SANS}`
      ctx.fillStyle = hexA(INKC, 0.66)
      ctx.fillText(r.v, 340, yy)
      ctx.fillStyle = hexA(INKC, 0.16)
      ctx.fillRect(330, yy + 18, 330, 2)
    }
  })
  ctx.restore()

  // 四行，一行一行划掉
  const at = [0.08, 0.24, 0.4, 0.56]
  for (let i = 0; i < 4; i++) {
    const k = clamp01((t - at[i]) / 0.1)
    if (k <= 0) continue
    const yy = py + 150 + i * 114 - 16
    const x0 = px + 310
    const x1 = px + 700
    ctx.strokeStyle = hexA(INKC, 0.85)
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x0, yy)
    ctx.lineTo(lerp(x0, x1, eout(k)), yy - 6)
    ctx.stroke()
  }

  // 笔
  const p = clamp01((t - 0.05) / 0.66)
  const idx = Math.min(3, Math.floor(p * 4))
  const inner = clamp01(p * 4 - idx)
  const penX = px + 310 + 390 * eout(inner)
  const penY = py + 150 + idx * 114 - 16 - 6 * eout(inner)
  if (t > 0.05 && t < 0.8) {
    ctx.save()
    ctx.strokeStyle = hexA('#0B1116', 0.97)
    ctx.fillStyle = hexA('#0B1116', 0.97)
    ctx.lineWidth = 17
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(penX + 14, penY + 6)
    ctx.lineTo(penX + 108, penY - 118)
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(penX - 5, penY - 12, 42, 25, 12)
    ctx.fill()
    ctx.restore()
  }

  // 剩下"留"：它被灯照亮
  const stay = clamp01((t - 0.7) / 0.16)
  if (stay > 0) {
    glow(ctx, px + 140, py + 610, 200, WARM, 0.16 * stay)
  }

  vignette(ctx, 0.48)
  grain(ctx, gr, f, 0.22)
}

export const CUTS = [0, 75, 150, 240, 330, 450, 540, 615, 720, 810, 870, 975, 1095, 1215]

export const SHOT_C = [
  { fn: form, dur: 75 },
  { fn: stack, dur: 75 },
  { fn: city, dur: 90 },
  { fn: schoolGate, dur: 90 },
  { fn: threeGates, dur: 120 },
  { fn: seatsFill, dur: 90 },
  { fn: villageSchool, dur: 75 },
  { fn: mapOut, dur: 105 },
  { fn: mapDist, dur: 90 },
  { fn: dorm, dur: 60 },
  { fn: makeBed, dur: 105 },
  { fn: lightsOut, dur: 120 },
  { fn: ledger, dur: 120 },
]