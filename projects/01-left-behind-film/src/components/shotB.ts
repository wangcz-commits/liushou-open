import {
  W, H, C, clamp01, lerp, eio, eout, ein, hexA, lg, glow, prng, pool,
  person, caption, disclaimer, vignette, grain,
} from './stage'

const SANS = '"Noto Sans SC", sans-serif'
const SERIF = '"Noto Serif SC", serif'

const BASE = '#0a1016'
const WARM = '#FFC98A'
const WARM_D = '#E9A94B'
const INK2 = '#06090c'

/* 镜 6｜车窗里的一排脸，车窗外的一排小剪影 */
export function windowSeat(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0f1820'
  ctx.fillRect(0, 0, W, H)

  const wy = 150
  const wh = 372

  ctx.fillStyle = lg(ctx, 0, wy, 0, wy + wh, [[0, hexA(WARM, 0.2)], [0.4, hexA(WARM, 0.48)], [1, hexA(WARM_D, 0.32)]])
  ctx.fillRect(-20, wy, W + 40, wh)

  for (let i = 0; i < 4; i++) {
    const cx = 246 + i * 474 + Math.sin(f * 0.03 + i * 1.7) * 2.5
    const base = wy + wh
    const headY = base - 132
    ctx.fillStyle = hexA(C.cream, 0.92)

    // 压扁的上半身：肩很宽、很矮，整个人贴在玻璃上
    ctx.beginPath()
    ctx.moveTo(cx - 132, base)
    ctx.quadraticCurveTo(cx - 126, headY + 52, cx - 74, headY + 34)
    ctx.quadraticCurveTo(cx, headY + 22, cx + 74, headY + 34)
    ctx.quadraticCurveTo(cx + 126, headY + 52, cx + 132, base)
    ctx.closePath()
    ctx.fill()
    // 头，略扁
    ctx.beginPath()
    ctx.ellipse(cx, headY - 4, 66, 54, 0, 0, Math.PI * 2)
    ctx.fill()

    // 两只手掌，五指并拢压在玻璃上
    ;[-1, 1].forEach((s) => {
      const hx = cx + s * 138
      const hy = headY + 116
      ctx.save()
      ctx.translate(hx, hy)
      ctx.rotate(s * 0.06)
      ctx.fillStyle = '#F5EEE0'
      // 掌心
      ctx.beginPath()
      ctx.ellipse(0, 0, 56, 62, 0, 0, Math.PI * 2)
      ctx.fill()
      // 四根并着的手指
      const fw = 33
      const fl = [108, 124, 118, 96]
      for (let k = 0; k < 4; k++) {
        ctx.beginPath()
        ctx.roundRect(-fw * 2 + k * fw + 1, -fl[k] - 26, fw - 2, fl[k] + 40, fw / 2)
        ctx.fill()
      }
      // 拇指
      ctx.save()
      ctx.rotate(s * 0.95)
      ctx.beginPath()
      ctx.roundRect(-17, -8, 34, 66, 17)
      ctx.fill()
      ctx.restore()
      ctx.restore()
    })
  }

  ctx.fillStyle = '#081016'
  for (let i = 0; i <= 4; i++) ctx.fillRect(i * 480 - 11, wy - 12, 22, wh + 24)
  ctx.fillRect(-20, wy - 14, W + 40, 16)
  ctx.fillRect(-20, wy + wh - 2, W + 40, 18)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = hexA('#FFFFFF', 0.045)
    ctx.beginPath()
    ctx.moveTo(150 + i * 640, wy + wh)
    ctx.lineTo(310 + i * 640, wy)
    ctx.lineTo(410 + i * 640, wy)
    ctx.lineTo(250 + i * 640, wy + wh)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  ctx.fillStyle = lg(ctx, 0, wy + wh, 0, H, [[0, hexA(WARM, 0.16)], [0.35, hexA(WARM, 0.05)], [1, hexA(WARM, 0)]])
  ctx.fillRect(0, wy + wh, W, H - wy - wh)

  // 车窗外：三个孩子，仰着头
  const kids = [
    { x: 400, h: 432, ph: 0.4 },
    { x: 960, h: 404, ph: 2.2 },
    { x: 1500, h: 420, ph: 4.1 },
  ]
  kids.forEach((k) => {
    const sway = Math.sin(f * 0.045 + k.ph) * 2
    kidLookingUp(ctx, k.x + sway, 1052, k.h, WARM)
  })

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}

// 仰着头的孩子：整身在画面里，头往后仰，下巴抬高
function kidLookingUp(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, rim: string) {
  const hipY = y - h * 0.31
  const shoulderY = y - h * 0.63
  const headX = x + h * 0.03
  const headY = y - h * 0.80
  const rx = h * 0.084
  const ry = h * 0.096

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(-0.05)
  ctx.translate(-x, -y)
  ctx.fillStyle = INK2

  // 腿、脚
  ctx.fillRect(x - h * 0.075, hipY, h * 0.056, y - hipY - h * 0.012)
  ctx.fillRect(x + h * 0.019, hipY, h * 0.056, y - hipY - h * 0.012)
  ctx.beginPath()
  ctx.ellipse(x - h * 0.047, y - h * 0.012, h * 0.046, h * 0.016, 0, 0, Math.PI * 2)
  ctx.ellipse(x + h * 0.047, y - h * 0.012, h * 0.046, h * 0.016, 0, 0, Math.PI * 2)
  ctx.fill()

  // 身子，略微后仰
  ctx.beginPath()
  ctx.moveTo(x - h * 0.112, hipY + h * 0.01)
  ctx.quadraticCurveTo(x - h * 0.108, shoulderY + h * 0.05, x - h * 0.086, shoulderY)
  ctx.quadraticCurveTo(x + h * 0.01, shoulderY - h * 0.05, x + h * 0.086, shoulderY)
  ctx.quadraticCurveTo(x + h * 0.108, shoulderY + h * 0.05, x + h * 0.112, hipY + h * 0.01)
  ctx.closePath()
  ctx.fill()

  // 手臂自然垂着
  ctx.strokeStyle = INK2
  ctx.lineWidth = h * 0.044
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - h * 0.092, shoulderY + h * 0.03)
  ctx.lineTo(x - h * 0.104, hipY + h * 0.04)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + h * 0.092, shoulderY + h * 0.03)
  ctx.lineTo(x + h * 0.104, hipY + h * 0.04)
  ctx.stroke()

  // 脖子（露出来一截，说明头是探出去的）
  ctx.beginPath()
  ctx.roundRect(headX - h * 0.026, headY + ry * 0.4, h * 0.052, shoulderY - headY - ry * 0.3, h * 0.026)
  ctx.fill()

  // 头：一个往后仰的蛋，下巴朝前上方翘
  ctx.save()
  ctx.translate(headX, headY)
  ctx.rotate(-0.44)
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(rx * 0.34, ry * 0.34, rx * 0.42, ry * 0.3, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // 后脑勺的一撮头发，往后坠
  ctx.beginPath()
  ctx.ellipse(-rx * 0.82, -ry * 0.1, rx * 0.4, ry * 0.52, 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 头顶被窗光照到的一条边
  ctx.strokeStyle = hexA(rim, 0.5)
  ctx.lineWidth = ry * 0.19
  ctx.beginPath()
  ctx.ellipse(headX, headY, rx * 0.95, ry * 0.95, -0.44, Math.PI * 1.15, Math.PI * 1.86)
  ctx.stroke()
  glow(ctx, headX, headY - ry * 0.85, ry * 1.5, rim, 0.05)
  ctx.restore()
}
/* 一辆车的侧面 */
function busSide(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = hexA('#000000', 0.5)
  ctx.beginPath()
  ctx.ellipse(x + w / 2, y + h + 6, w * 0.52, h * 0.09, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#111a23'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, [h * 0.26, h * 0.26, h * 0.06, h * 0.06])
  ctx.fill()
  ctx.fillStyle = hexA('#8FB6D4', 0.16)
  ctx.fillRect(x + w * 0.08, y + h * 0.06, w * 0.84, 4)

  const wy = y + h * 0.2
  const wh = h * 0.3
  ctx.fillStyle = lg(ctx, 0, wy, 0, wy + wh, [[0, hexA(WARM, 0.5)], [1, hexA(WARM_D, 0.3)]])
  ctx.beginPath()
  ctx.roundRect(x + w * 0.05, wy, w * 0.9, wh, 8)
  ctx.fill()
  ctx.fillStyle = '#0a1218'
  for (let i = 0; i <= 5; i++) ctx.fillRect(x + w * (0.05 + i * 0.18) - 5, wy, 10, wh)
  ctx.fillStyle = hexA('#0f1820', 0.6)
  for (let i = 0; i < 4; i++) {
    const cx = x + w * (0.14 + i * 0.18)
    ctx.beginPath()
    ctx.arc(cx, wy + wh * 0.45, wh * 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(cx - wh * 0.22, wy + wh * 0.66, wh * 0.44, wh * 0.34)
  }

  ;[0.2, 0.74].forEach((k) => {
    const wx = x + w * k
    const wyy = y + h
    ctx.fillStyle = '#05080b'
    ctx.beginPath()
    ctx.arc(wx, wyy, h * 0.19, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = hexA('#5E7180', 0.3)
    ctx.beginPath()
    ctx.arc(wx, wyy, h * 0.085, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = hexA('#E04B3A', 0.95)
  ctx.beginPath()
  ctx.roundRect(x + 4, y + h * 0.62, 14, 30, 5)
  ctx.fill()
  glow(ctx, x + 10, y + h * 0.66, 110, '#E04B3A', 0.22)
  ctx.fillStyle = hexA('#8FB6D4', 0.1)
  ctx.fillRect(x + w * 0.08, y + h * 0.88, w * 0.84, 3)
}

/* 镜 7｜车开动，孩子跟两步，停住 */
export function depart(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = lg(ctx, 0, 0, 0, 800, [[0, '#070c11'], [1, '#121b24']])
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#080f15'
  ;[[40, 596, 250], [360, 636, 210], [1400, 606, 270], [1710, 592, 230]].forEach(([hx, hy, hw]) => {
    ctx.fillRect(hx, hy, hw, 830 - hy)
    ctx.beginPath()
    ctx.moveTo(hx - 14, hy)
    ctx.lineTo(hx + hw / 2, hy - hw * 0.2)
    ctx.lineTo(hx + hw + 14, hy)
    ctx.closePath()
    ctx.fill()
  })

  ctx.fillStyle = lg(ctx, 0, 792, 0, H, [[0, '#1b2530'], [1, '#0c141a']])
  ctx.fillRect(0, 792, W, H - 792)
  ctx.fillStyle = hexA('#050a0e', 0.55)
  ctx.fillRect(0, 792, W, 4)

  const e = eio(t)
  const bx = lerp(260, 1620, e)
  const bw = lerp(800, 500, e)
  const bh = bw * 0.4

  // 车后的土：贴着后轮，贴着地
  const rr = prng(5521)
  for (let i = 0; i < 30; i++) {
    const p = rr()
    const life = clamp01((t * 1.4 - p * 0.4) / 0.95)
    if (life <= 0.05) continue
    const px = bx + 14 - life * (110 + p * 190)
    const py = 790 - 16 - p * 38 - life * 24
    ctx.fillStyle = hexA('#B9A98F', 0.055 * (1 - life) * (0.4 + p))
    ctx.beginPath()
    ctx.arc(px, py, 18 + p * 32 + life * 24, 0, Math.PI * 2)
    ctx.fill()
  }

  busSide(ctx, bx, 792 - bh, bw, bh)

  // 孩子：刚跨出一步、正在停住
  const walkP = clamp01(f / (dur * 0.5))
  const moving = walkP < 1
  const cx = 540 + eio(walkP) * 108
  const stop = clamp01((walkP - 0.75) / 0.25)
  ctx.fillStyle = hexA('#000000', 0.5)
  ctx.beginPath()
  ctx.ellipse(cx + 10, 900, 104, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  person(ctx, {
    x: cx, y: 898, h: 400, hair: 'bob', back: true,
    pose: 'walk', step: moving ? 0.5 : 0.16,
    arm: lerp(0.5, 0.95, stop),
    lean: lerp(0.08, 0.14, stop),
    fill: C.cream,
  })

  vignette(ctx, 0.58)
  grain(ctx, gr, f, 0.24)
}

/* 镜 8｜特写：手指数车，数到一半乱了，重来 */
export function counting(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#141d26'], [0.55, '#0d141b'], [1, '#080d12']])
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1500, 240, 1300, WARM, 0.045)
  glow(ctx, 340, 980, 1100, '#7FA8C9', 0.03)

  const cx = 950
  const knuckleY = 500
  const palmBottom = 812
  const knuckleW = 296
  const wristW = 166
  const roots = [-108, -36, 36, 108]
  const lens = [198, 224, 208, 176]

  let folded = [0, 0, 0, 0]
  if (t < 0.58) {
    const at = [0.16, 0.3, 0.44, 0.56]
    folded = at.map((a) => clamp01((t - a) / 0.07))
  } else if (t < 0.68) {
    folded = [0.95, 0.4, 0.9, 0.18]
  } else if (t < 0.75) {
    const k = eout(clamp01((t - 0.68) / 0.07))
    folded = [0.95 * (1 - k), 0.4 * (1 - k), 0.9 * (1 - k), 0.18 * (1 - k)]
  } else {
    const k = eio(clamp01((t - 0.75) / 0.08))
    folded = [k, 0, 0, 0]
  }

  ctx.save()
  ctx.fillStyle = C.cream
  ctx.strokeStyle = C.cream
  ctx.lineCap = 'round'

  // 四根手指：两节，远节往里弯
  roots.forEach((rx, i) => {
    const fd = folded[i]
    const L1 = lens[i] * 0.56 * (1 - 0.62 * fd)
    const L2 = lens[i] * 0.46 * (1 - 0.86 * fd)
    ctx.beginPath()
    ctx.roundRect(cx + rx - 29, knuckleY - L1 + 12, 58, L1 + 26, 29)
    ctx.fill()
    ctx.save()
    ctx.translate(cx + rx, knuckleY - L1 + 18)
    ctx.rotate(-0.1 - 0.62 * fd)
    ctx.beginPath()
    ctx.roundRect(-26, -L2, 52, L2 + 26, 26)
    ctx.fill()
    ctx.restore()
  })

  // 拇指
  ctx.save()
  ctx.translate(cx - knuckleW / 2 + 24, knuckleY + 152)
  ctx.rotate(-0.72)
  ctx.beginPath()
  ctx.roundRect(-52, -42, 168, 88, 44)
  ctx.fill()
  ctx.restore()

  // 掌：上宽下窄
  ctx.beginPath()
  ctx.moveTo(cx - knuckleW / 2, knuckleY + 34)
  ctx.quadraticCurveTo(cx - knuckleW / 2 - 4, knuckleY - 8, cx - knuckleW / 2 + 32, knuckleY - 8)
  ctx.lineTo(cx + knuckleW / 2 - 32, knuckleY - 8)
  ctx.quadraticCurveTo(cx + knuckleW / 2 + 4, knuckleY - 8, cx + knuckleW / 2, knuckleY + 34)
  ctx.quadraticCurveTo(cx + wristW / 2 + 46, knuckleY + 210, cx + wristW / 2, palmBottom)
  ctx.lineTo(cx - wristW / 2, palmBottom)
  ctx.quadraticCurveTo(cx - wristW / 2 - 46, knuckleY + 210, cx - knuckleW / 2, knuckleY + 34)
  ctx.closePath()
  ctx.fill()

  // 腕
  ctx.beginPath()
  ctx.roundRect(cx - wristW / 2, palmBottom - 16, wristW, 300, 60)
  ctx.fill()

  // 指根的小窝
  roots.forEach((rx) => {
    ctx.fillStyle = hexA('#000000', 0.1)
    ctx.beginPath()
    ctx.ellipse(cx + rx, knuckleY + 16, 30, 12, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  // 掌心的浅影
  ctx.fillStyle = hexA('#000000', 0.06)
  ctx.beginPath()
  ctx.ellipse(cx, knuckleY + 190, 86, 110, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  vignette(ctx, 0.6)
  grain(ctx, gr, f, 0.24)
}
/* 镜 9｜尾灯拐过山角，尘土落回路面 */
export function taillight(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = lg(ctx, 0, 0, 0, 720, [[0, '#0a1118'], [1, '#182533']])
  ctx.fillRect(0, 0, W, H)

  const r0 = prng(3311)
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = hexA('#cfe0ea', 0.1 + r0() * 0.25)
    ctx.fillRect(r0() * W, r0() * 420, 2, 2)
  }

  // 路：一直铺到山脚下
  ctx.fillStyle = lg(ctx, 0, 700, 0, H, [[0, '#202b36'], [1, '#0b1218']])
  ctx.fillRect(0, 700, W, H - 700)
  // 山脚下那段还在往右延伸的路面
  ctx.fillStyle = hexA('#2A3846', 0.55)
  ctx.beginPath()
  ctx.moveTo(1180, 712)
  ctx.lineTo(1520, 700)
  ctx.lineTo(1560, 742)
  ctx.lineTo(1160, 760)
  ctx.closePath()
  ctx.fill()

  // 尾灯：一路往右，被山吃掉
  const k1 = clamp01((t - 0.12) / 0.72)
  const lx = lerp(1130, 1520, eio(k1))
  const ly = lerp(690, 706, eio(k1))
  const fade = 1 - clamp01((t - 0.55) / 0.45)
  if (fade > 0.02) {
    glow(ctx, lx, ly, 260, '#C0392B', 0.3 * fade)
    glow(ctx, lx, ly, 90, '#FF7A5C', 0.45 * fade)
    ctx.fillStyle = hexA('#FF8A6A', fade)
    ctx.beginPath()
    ctx.arc(lx - 26, ly, 10, 0, Math.PI * 2)
    ctx.arc(lx + 26, ly, 10, 0, Math.PI * 2)
    ctx.fill()
    const rf = lg(ctx, lx - 70, ly, lx, H, [[0, hexA('#C0392B', 0.16 * fade)], [1, hexA('#C0392B', 0)]])
    ctx.fillStyle = rf
    ctx.beginPath()
    ctx.moveTo(lx - 50, ly)
    ctx.lineTo(lx + 50, ly)
    ctx.lineTo(lx + 150, H)
    ctx.lineTo(lx - 150, H)
    ctx.closePath()
    ctx.fill()
  }

  // 山：最后画，它从右边压过来，把尾灯吃掉
  const edge = lerp(1560, 1240, eio(t))
  ctx.fillStyle = '#05090d'
  ctx.beginPath()
  ctx.moveTo(edge, 806)
  ctx.bezierCurveTo(edge + 190, 620, edge + 430, 520, edge + 740, 474)
  ctx.lineTo(1990, 420)
  ctx.lineTo(1990, H)
  ctx.lineTo(edge, H)
  ctx.closePath()
  ctx.fill()
  // 山脊的一道冷边
  ctx.strokeStyle = hexA('#7FA8C9', 0.18)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(edge, 806)
  ctx.bezierCurveTo(edge + 190, 620, edge + 430, 520, edge + 740, 474)
  ctx.stroke()

  const rr = prng(7731)
  for (let i = 0; i < 44; i++) {
    const p = rr()
    const lift = (0.35 + p * 0.65) * (1 - t * 0.75)
    const dx = 320 + p * 780 + Math.sin(f * 0.02 + p * 6) * 26
    const dy = 716 - lift * 150 + t * 70
    ctx.fillStyle = hexA('#B9A98F', 0.05 * (1 - t * 0.7))
    ctx.beginPath()
    ctx.arc(dx, dy, 26 + p * 48, 0, Math.PI * 2)
    ctx.fill()
  }

  person(ctx, { x: 196, y: 902, h: 330, hair: 'bob', back: true, fill: hexA(C.cream, 0.5) })

  vignette(ctx, 0.62)
  grain(ctx, gr, f, 0.24)
}

/* 镜 10｜1550.56 万 */
export function number(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#070b0e'
  ctx.fillRect(0, 0, W, H)

  const push = eio(t)
  ctx.save()
  ctx.translate(W / 2, H)
  const sc = 1 + push * 0.14
  ctx.scale(sc, sc)
  ctx.translate(-W / 2, -H)

  // 地平线
  ctx.fillStyle = hexA('#8FB6D4', 0.1)
  ctx.fillRect(0, 636, W, 2)

  // 那条空路，从地平线往画面前铺开
  ctx.fillStyle = lg(ctx, 0, 638, 0, H, [[0, '#15202a'], [0.5, '#0f171f'], [1, '#080d12']])
  ctx.beginPath()
  ctx.moveTo(906, 638)
  ctx.lineTo(1014, 638)
  ctx.lineTo(2120, H)
  ctx.lineTo(-200, H)
  ctx.closePath()
  ctx.fill()

  // 路肩
  ctx.strokeStyle = hexA('#5E7488', 0.26)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(906, 638)
  ctx.lineTo(-200, H)
  ctx.moveTo(1014, 638)
  ctx.lineTo(2120, H)
  ctx.stroke()

  // 车辙
  ctx.strokeStyle = hexA('#070d12', 0.35)
  ctx.lineWidth = 20
  ctx.beginPath()
  ctx.moveTo(944, 640)
  ctx.lineTo(400, H)
  ctx.moveTo(976, 640)
  ctx.lineTo(1520, H)
  ctx.stroke()

  // 地平线上一点余晖
  glow(ctx, 960, 640, 460, WARM, 0.045)
  ctx.restore()

  const v = eio(clamp01((f - 8) / (dur * 0.62))) * 1550.56
  const settle = eio(clamp01((f - dur * 0.7) / (dur * 0.3)))

  ctx.save()
  ctx.translate(W / 2, 470)
  const sc2 = 1 + 0.05 * settle
  ctx.scale(sc2, sc2)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = hexA(C.dust, 0.8)
  ctx.font = `500 32px ${SANS}`
  ctx.fillText('义务教育阶段 · 农村留守儿童', 0, -132)

  ctx.fillStyle = C.cream
  ctx.font = `500 166px ${SERIF}`
  ctx.shadowColor = hexA('#000000', 0.6)
  ctx.shadowBlur = 40
  ctx.fillText(v.toFixed(2), -92, 30)
  ctx.shadowBlur = 0

  ctx.fillStyle = WARM
  ctx.font = `500 70px ${SANS}`
  ctx.fillText('万', 386, 16)
  ctx.restore()

  // 暖黄的一条线，像未写完的破折号
  const lp = clamp01((f - dur * 0.62) / (dur * 0.3))
  if (lp > 0) {
    const w = 820 * eout(lp)
    ctx.fillStyle = hexA(WARM, 0.55 * lp)
    ctx.fillRect(W / 2 - w / 2, 576, w, 3)
  }

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.22)
}