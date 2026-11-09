import {
  W, H, C, clamp01, lerp, eio, eout, ein, hexA, lg, glow, prng,
  person, hand, vignette, grain,
} from './stage'

const SANS = '"Noto Sans SC", sans-serif'
const WARM = '#FFC98A'
const WARM_D = '#E9A94B'
const COLD = '#9CBBD4'
const PAPER = '#E7DFCF'
const INKC = '#22282e'
const INK2 = '#06090C'

/* 一只手：掌 + 一指伸出（指尖在 0,0），其余蜷着。朝右画，用 rotate 调方向 */
function oneFinger(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, s: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ang)
  ctx.scale(s, s)
  ctx.fillStyle = hexA(INK2, 0.97)
  ctx.strokeStyle = hexA(INK2, 0.97)
  ctx.lineCap = 'round'
  // 食指
  ctx.beginPath()
  ctx.roundRect(-6, -19, 150, 38, 19)
  ctx.fill()
  // 掌
  ctx.beginPath()
  ctx.ellipse(190, 8, 74, 66, 0.12, 0, Math.PI * 2)
  ctx.fill()
  // 蜷着的三根
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.ellipse(214, -44 + i * 42, 30, 24, 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
  // 拇指
  ctx.beginPath()
  ctx.ellipse(206, 78, 34, 26, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // 腕
  ctx.lineWidth = 118
  ctx.beginPath()
  ctx.moveTo(250, 60)
  ctx.lineTo(470, 200)
  ctx.stroke()
  ctx.restore()
}

/* 镜 24｜5:40，摸黑找到手机 */
export function wake(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0C131A'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = lg(ctx, 0, 0, 0, 520, [[0, '#101922'], [1, '#16202A']])
  ctx.fillRect(0, 0, W, 520)
  ctx.fillStyle = '#0A1117'
  ctx.fillRect(0, 520, W, H - 520)
  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.fillRect(0, 518, W, 3)

  // 床沿
  ctx.fillStyle = '#141E26'
  ctx.beginPath()
  ctx.moveTo(0, 1080)
  ctx.lineTo(0, 880)
  ctx.quadraticCurveTo(280, 812, 560, 890)
  ctx.lineTo(560, 1080)
  ctx.closePath()
  ctx.fill()

  // 床头柜
  ctx.fillStyle = '#101921'
  ctx.beginPath()
  ctx.roundRect(1060, 760, 420, 320, 10)
  ctx.fill()
  ctx.fillStyle = hexA(COLD, 0.1)
  ctx.fillRect(1060, 760, 420, 3)

  const on = clamp01((f - 30) / 16)
  const px = 1250
  const py = 660

  if (on > 0) {
    glow(ctx, px, py - 40, 900, WARM, 0.1 * on)
    glow(ctx, px, py - 60, 420, WARM, 0.14 * on)
    ctx.save()
    ctx.globalAlpha = on
    const patch = ctx.createRadialGradient(px, 460, 20, px, 460, 460)
    patch.addColorStop(0, hexA(WARM, 0.18))
    patch.addColorStop(1, hexA(WARM, 0))
    ctx.fillStyle = patch
    ctx.beginPath()
    ctx.ellipse(px, 460, 460, 200, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(-0.16)
  ctx.fillStyle = '#05080B'
  ctx.beginPath()
  ctx.roundRect(-132, -214, 264, 428, 32)
  ctx.fill()
  if (on > 0) {
    ctx.globalAlpha = on
    ctx.fillStyle = lg(ctx, 0, -200, 0, 200, [[0, '#FFF0D2'], [1, WARM_D]])
    ctx.beginPath()
    ctx.roundRect(-116, -198, 232, 396, 26)
    ctx.fill()
    ctx.fillStyle = hexA(INKC, 0.85)
    ctx.font = `300 96px ${SANS}`
    ctx.textAlign = 'center'
    ctx.fillText('5:40', 0, 12)
    ctx.font = `400 22px ${SANS}`
    ctx.fillStyle = hexA(INKC, 0.5)
    ctx.fillText('正月初六', 0, 62)
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
  }
  ctx.restore()

  // 一根食指摸上去
  const hp = clamp01((f - 6) / 30)
  if (hp > 0) {
    const k = eout(hp)
    hand(ctx, { x: lerp(1980, 1436, k), y: lerp(1300, 906, k), len: 620, ang: -2.14, pose: 'point', fill: hexA(INK2, 0.97) })
  }

  vignette(ctx, 0.56)
  grain(ctx, gr, f, 0.24)
}

/* 镜 25｜摸黑穿衣，扣错一个，低头看，重扣 */
export function dressing(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0C141B'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = lg(ctx, 0, 120, 0, 780, [[0, hexA(COLD, 0.24)], [1, hexA(COLD, 0.05)]])
  ctx.fillRect(60, 120, 460, 660)
  ctx.fillStyle = '#0C141B'
  ctx.fillRect(280, 120, 16, 660)
  ctx.fillRect(60, 440, 460, 16)
  const shaft = ctx.createLinearGradient(300, 760, 1000, 1080)
  shaft.addColorStop(0, hexA(COLD, 0.12))
  shaft.addColorStop(1, hexA(COLD, 0))
  ctx.fillStyle = shaft
  ctx.beginPath()
  ctx.moveTo(60, 780)
  ctx.lineTo(520, 780)
  ctx.lineTo(1080, 1080)
  ctx.lineTo(160, 1080)
  ctx.closePath()
  ctx.fill()

  // 床
  ctx.fillStyle = '#17212A'
  ctx.beginPath()
  ctx.roundRect(1300, 780, 700, 300, 8)
  ctx.fill()
  ctx.fillStyle = hexA(C.cream, 0.45)
  ctx.beginPath()
  ctx.roundRect(1330, 726, 340, 70, 20)
  ctx.fill()

  const p = clamp01(f / dur)
  const stop = clamp01((p - 0.4) / 0.12) * (1 - clamp01((p - 0.64) / 0.12))
  const tilt = 0.05 + stop * 0.34

  // 身子（先画，供裁剪）
  const bx = 860
  const by = 1050
  const hgt = 700
  person(ctx, { x: bx, y: by, h: hgt, hair: 'bob', fill: C.cream, headTilt: tilt, arm: 0.1 })

  // 衣摆：一边高一边低，扣错了下摆就歪
  const hemY = by - 0.34 * hgt
  const skew = 22 + stop * 16
  ctx.fillStyle = '#0C141B'
  ctx.beginPath()
  ctx.moveTo(bx - 200, hemY + 40 + 70)
  ctx.lineTo(bx + 200, hemY + 40 + 70)
  ctx.lineTo(bx + 200, hemY + skew)
  ctx.lineTo(bx - 200, hemY)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = hexA('#000000', 0.25)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(bx - 120, hemY + skew * 0.5)
  ctx.lineTo(bx + 120, hemY - 4)
  ctx.stroke()
  // 扣子：三颗，最上面那颗歪出去
  for (let i = 0; i < 3; i++) {
    const ox = stop > 0.4 && i === 0 ? 30 : 0
    ctx.fillStyle = hexA('#0C1218', 0.7)
    ctx.beginPath()
    ctx.arc(bx + ox, by - 0.62 * hgt + i * 58, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  // 一只手停在胸口，另一只在身侧
  const hy = by - 0.6 * hgt + Math.sin(f * 0.22) * 8 * (1 - stop)
  hand(ctx, { x: bx + 56, y: hy + 78, len: 190, ang: -1.62, pose: 'relaxed', fill: C.cream })
  ctx.beginPath()
  ctx.ellipse(bx - 104, by - 0.42 * hgt, 26, 34, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // 冷边
  ctx.strokeStyle = hexA(COLD, 0.5)
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(bx - 8, by - 0.805 * hgt, 0.086 * hgt, Math.PI * 0.85, Math.PI * 1.5)
  ctx.stroke()

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.24)
}

/* 镜 26｜灶台，踮脚端下两碗饭 */
export function stove(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0D151C'
  ctx.fillRect(0, 0, W, H)

  // 灶台
  ctx.fillStyle = '#19232C'
  ctx.beginPath()
  ctx.roundRect(260, 600, 700, 400, 6)
  ctx.fill()
  ctx.fillStyle = hexA('#8FA9C4', 0.12)
  ctx.fillRect(260, 600, 700, 4)

  const fire = 0.72 + 0.28 * Math.sin(f * 0.55)
  glow(ctx, 600, 830, 620, '#E8763C', 0.2 * fire)
  glow(ctx, 600, 810, 260, '#FFB066', 0.2 * fire)
  ctx.fillStyle = hexA('#2A1A12', 0.92)
  ctx.beginPath()
  ctx.roundRect(460, 790, 280, 120, 10)
  ctx.fill()
  for (let i = 0; i < 3; i++) {
    const fx = 540 + i * 60
    const fh = 96 * fire * (0.82 + 0.18 * Math.sin(f * 0.4 + i))
    ctx.fillStyle = hexA(i === 1 ? '#FFC27A' : '#E8763C', 0.8)
    ctx.beginPath()
    ctx.moveTo(fx - 28, 880)
    ctx.quadraticCurveTo(fx - 12, 880 - fh, fx, 880 - fh * 1.3)
    ctx.quadraticCurveTo(fx + 12, 880 - fh, fx + 28, 880)
    ctx.closePath()
    ctx.fill()
  }

  // 锅
  ctx.fillStyle = '#26333F'
  ctx.beginPath()
  ctx.ellipse(600, 586, 180, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = hexA('#DCE6EC', 0.3)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(600, 586, 180, 30, 0, Math.PI, Math.PI * 2)
  ctx.stroke()
  // 热气
  for (let i = 0; i < 3; i++) {
    const k = (f * 0.018 + i * 0.33) % 1
    ctx.fillStyle = hexA('#E8F1F6', 0.07 * (1 - k))
    ctx.beginPath()
    ctx.ellipse(560 + i * 34, 520 - k * 190, 34 + k * 46, 24 + k * 34, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 两碗饭就放在灶台边上
  const bowls = [742, 878]
  bowls.forEach((bx2, i) => {
    const taken = clamp01((f / dur - 0.55 - i * 0.18) / 0.18)
    const dy = taken * -60
    ctx.fillStyle = hexA(C.cream, 0.95)
    ctx.beginPath()
    ctx.ellipse(bx2, 578 + dy, 56, 40, 0, 0, Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(bx2, 578 + dy, 56, 13, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = hexA('#C9BFA8', 0.9)
    ctx.beginPath()
    ctx.ellipse(bx2, 578 + dy, 40, 9, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  // 孩子：侧身朝灶台，踮脚，两只手一起端
  const reach = clamp01((f / dur) / 0.42)
  const tip = eio(reach) * 16
  const cx = 986
  const cy = 990 - tip
  const hh = 470

  person(ctx, { x: cx, y: cy, h: hh, hair: 'bob', flip: true, fill: C.cream, arm: 0, headTilt: -0.06 })

  // 两条手臂：肩 → 肘 → 手，落在两只碗上
  const shoulderX = cx - 0.07 * hh
  const shoulderY = cy - 0.70 * hh
  const handY = 570
  ctx.strokeStyle = C.cream
  ctx.lineWidth = 0.062 * hh
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const hand1 = [lerp(cx - 40, 742, eio(reach)), handY]
  const hand2 = [lerp(cx - 20, 878, eio(reach)), handY + 6]
  ;[[hand1, -0.3], [hand2, 0.16]].forEach(([hd, bend], i) => {
    const [hx, hy] = hd as [number, number]
    const elx = lerp(shoulderX, hx, 0.5) + (i === 0 ? -40 : 34)
    const ely = lerp(shoulderY, hy, 0.45) + 40
    ctx.beginPath()
    ctx.moveTo(shoulderX + (i === 0 ? -14 : 14), shoulderY)
    ctx.quadraticCurveTo(elx, ely, hx, hy)
    ctx.stroke()
    void bend
    // 手
    ctx.fillStyle = C.cream
    ctx.beginPath()
    ctx.arc(hx, hy, 0.034 * hh, 0, Math.PI * 2)
    ctx.fill()
  })

  // 火光在身上的反射
  ctx.strokeStyle = hexA('#F2A05C', 0.5)
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(shoulderX - 10, shoulderY + 20)
  ctx.quadraticCurveTo(cx - 0.14 * hh, cy - 0.4 * hh, cx - 0.1 * hh, cy - 0.06 * hh)
  ctx.stroke()

  vignette(ctx, 0.54)
  grain(ctx, gr, f, 0.24)
}

/* 镜 27｜一碗端进里屋，放在床边 */
export function innerRoom(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0A1117'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = lg(ctx, 0, 0, 520, 0, [[0, hexA(WARM, 0.3)], [1, hexA(WARM, 0)]])
  ctx.fillRect(0, 0, 520, H)
  glow(ctx, 120, 600, 560, WARM, 0.18)
  ctx.fillStyle = hexA(WARM, 0.16)
  ctx.fillRect(0, 900, 700, 12)

  ctx.fillStyle = '#161F28'
  ctx.beginPath()
  ctx.roundRect(1060, 700, 760, 340, 8)
  ctx.fill()
  ctx.fillStyle = hexA('#8FA9C4', 0.14)
  ctx.fillRect(1060, 700, 760, 4)
  ctx.fillStyle = '#1E2833'
  ctx.fillRect(1740, 600, 80, 440)
  ctx.fillStyle = hexA(C.cream, 0.58)
  ctx.beginPath()
  ctx.roundRect(1120, 700, 600, 70, 20)
  ctx.fill()
  const breath = Math.sin(f * 0.05) * 7
  ctx.fillStyle = hexA(C.cream, 0.66)
  ctx.beginPath()
  ctx.ellipse(1400, 706 + breath, 270, 46, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hexA(C.cream, 0.85)
  ctx.beginPath()
  ctx.arc(1200, 676 + breath, 48, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hexA('#E8E2D4', 0.9)
  ctx.beginPath()
  ctx.arc(1192, 656 + breath, 24, Math.PI * 0.9, Math.PI * 2.1)
  ctx.fill()

  ctx.fillStyle = '#121B23'
  ctx.fillRect(880, 830, 160, 18)
  ctx.fillRect(900, 848, 12, 60)
  ctx.fillRect(1010, 848, 12, 60)
  ctx.fillStyle = hexA(C.cream, 0.95)
  ctx.beginPath()
  ctx.ellipse(960, 812, 48, 34, 0, 0, Math.PI)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(960, 812, 48, 11, 0, 0, Math.PI * 2)
  ctx.fill()

  const k = clamp01(f / (dur * 0.66))
  const x = lerp(-180, 760, eio(k))
  person(ctx, { x, y: 980, h: 460, hair: 'bob', pose: 'walk', step: Math.sin(f * 0.4) * 0.5, fill: C.cream })
  // 背上的门光
  ctx.strokeStyle = hexA(WARM, 0.5)
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(x - 0.11 * 460, 980 - 0.2 * 460)
  ctx.quadraticCurveTo(x - 0.14 * 460, 980 - 0.45 * 460, x - 0.09 * 460, 980 - 0.68 * 460)
  ctx.stroke()

  if (k > 0.6) {
    const d = clamp01((k - 0.6) / 0.4)
    ctx.fillStyle = C.cream
    ctx.beginPath()
    ctx.arc(lerp(820, 930, d), lerp(760, 770, d), 26, 0, Math.PI * 2)
    ctx.fill()
  }

  vignette(ctx, 0.54)
  grain(ctx, gr, f, 0.24)
}

/* 镜 28｜书包拉链上那只磨白了的小熊 */
export function charm(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#101A22'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1300, 300, 1000, COLD, 0.08)

  // 书包的一角
  ctx.fillStyle = '#1C2A36'
  ctx.beginPath()
  ctx.moveTo(180, 220)
  ctx.lineTo(1180, 400)
  ctx.lineTo(1120, 1080)
  ctx.lineTo(180, 1080)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = hexA(COLD, 0.12)
  ctx.beginPath()
  ctx.moveTo(180, 220)
  ctx.lineTo(1180, 400)
  ctx.lineWidth = 4
  ctx.strokeStyle = hexA(COLD, 0.25)
  ctx.stroke()

  // 拉链轨道：一条斜线，齿是真的齿
  ctx.save()
  ctx.translate(300, 470)
  ctx.rotate(0.18)
  ctx.fillStyle = '#26333F'
  ctx.fillRect(0, -26, 900, 52)
  for (let i = 0; i < 44; i++) {
    ctx.fillStyle = hexA('#9FB4C4', 0.55)
    ctx.fillRect(20 + i * 20, -20, 12, 16)
    ctx.fillStyle = hexA('#9FB4C4', 0.4)
    ctx.fillRect(20 + i * 20, 6, 12, 14)
  }
  // 拉链头
  ctx.fillStyle = hexA('#D5E0E8', 0.95)
  ctx.beginPath()
  ctx.roundRect(830, -30, 92, 60, 12)
  ctx.fill()
  ctx.fillStyle = hexA('#8FA3B2', 0.95)
  ctx.beginPath()
  ctx.roundRect(848, -14, 56, 28, 8)
  ctx.fill()
  ctx.restore()

  // 小圆环扣在拉链头上
  const px = 870
  const py = 520
  ctx.strokeStyle = hexA('#D5E0E8', 0.95)
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(px, py + 14, 22, 0, Math.PI * 2)
  ctx.stroke()

  // 小熊：挂在环下，比例小
  const swing = Math.sin(f * 0.05) * 0.06
  ctx.save()
  ctx.translate(px, py + 34)
  ctx.rotate(swing)
  ctx.fillStyle = '#D8E2EA'
  ctx.beginPath()
  ctx.ellipse(0, 96, 52, 62, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 22, 44, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-34, -10, 18, 0, Math.PI * 2)
  ctx.arc(34, -10, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-52, 74, 18, 28, 0.5, 0, Math.PI * 2)
  ctx.ellipse(52, 74, 18, 28, -0.5, 0, Math.PI * 2)
  ctx.fill()
  // 磨掉的旧痕
  ctx.fillStyle = hexA('#8A7A63', 0.4)
  ctx.beginPath()
  ctx.ellipse(-14, 108, 15, 22, 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(24, 44, 10, 13, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // 剩下的一点原色
  ctx.fillStyle = hexA('#B5483B', 0.42)
  ctx.beginPath()
  ctx.arc(14, 26, 5, 0, Math.PI * 2)
  ctx.arc(-14, 26, 5, 0, Math.PI * 2)
  ctx.fill()
  // 冷边
  ctx.strokeStyle = hexA('#EAF3FA', 0.5)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 22, 44, Math.PI * 1.05, Math.PI * 1.7)
  ctx.stroke()
  ctx.restore()

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.24)
  void dur
}

/* 镜 29｜签字栏 */
export function signature(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0F181F'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1560, 180, 900, WARM, 0.1)

  const push = 1 + eio(clamp01(f / dur)) * 0.04
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.scale(push, push)
  ctx.translate(-W / 2, -H / 2)

  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.fillRect(340, 190, 1280, 720)
  ctx.fillStyle = PAPER
  ctx.fillRect(320, 170, 1280, 720)
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = hexA('#5B7FA8', 0.18)
    ctx.fillRect(400, 300 + i * 46, 1120, 2)
  }
  ctx.fillStyle = hexA('#B5483B', 0.3)
  ctx.fillRect(560, 170, 3, 720)

  const prev = ['2 月 24 日', '2 月 25 日', '2 月 26 日', '2 月 27 日', '2 月 28 日']
  prev.forEach((d, i) => {
    const yy = 470 + i * 92
    ctx.fillStyle = hexA(INKC, 0.32)
    ctx.font = `400 28px ${SANS}`
    ctx.fillText(d, 420, yy)
    ctx.fillStyle = hexA(INKC, 0.5)
    ctx.font = `400 34px ${SANS}`
    ctx.fillText('奶', 1080 + (i % 2) * 6, yy)
  })

  ctx.fillStyle = hexA(INKC, 0.55)
  ctx.font = `400 40px ${SANS}`
  ctx.fillText('3 月 1 日', 420, 352)
  ctx.fillStyle = hexA(INKC, 0.4)
  ctx.font = `400 34px ${SANS}`
  ctx.fillText('家长签字', 860, 352)
  ctx.save()
  ctx.translate(1080, 374)
  ctx.rotate(-0.06)
  ctx.fillStyle = hexA(INKC, 0.9)
  ctx.font = `500 78px ${SANS}`
  ctx.fillText('奶', 0, 0)
  ctx.restore()
  ctx.fillStyle = hexA('#000000', 0.06)
  ctx.fillRect(1076, 300, 130, 76)
  ctx.restore()

  vignette(ctx, 0.48)
  grain(ctx, gr, f, 0.2)
}

/* 镜 30｜在"奶"字旁边一笔一划写 3.2 */
export function writeDate(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0F181F'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1500, 160, 800, WARM, 0.1)

  ctx.fillStyle = PAPER
  ctx.fillRect(120, 90, 1680, 900)
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = hexA('#5B7FA8', 0.16)
    ctx.fillRect(200, 300 + i * 80, 1500, 2)
  }
  ctx.save()
  ctx.translate(300, 460)
  ctx.fillStyle = hexA(INKC, 0.88)
  ctx.font = `500 150px ${SANS}`
  ctx.fillText('奶', 0, 0)
  ctx.restore()

  // 正在写：一笔一划浮现
  const p = clamp01((f - 6) / (dur * 0.62))
  const text = '3.2'
  const n = p * text.length
  const full = Math.floor(n)
  const frac = n - full
  let cx = 620
  for (let i = 0; i < text.length; i++) {
    const glyphW = 86
    if (i < full) {
      ctx.save()
      ctx.translate(cx, 470)
      ctx.fillStyle = hexA(INKC, 0.85)
      ctx.font = `400 104px ${SANS}`
      ctx.fillText(text[i], 0, 0)
      ctx.restore()
    } else if (i === full && frac > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(cx - 6, 350, glyphW * frac, 150)
      ctx.clip()
      ctx.fillStyle = hexA(INKC, 0.85)
      ctx.font = `400 104px ${SANS}`
      ctx.fillText(text[i], cx, 470)
      ctx.restore()
    }
    cx += glyphW * 0.82
  }

  // 笔尖正落在最后一个字上
  const tipX = cx - 46 * 0.82
  const tipY = 470
  ctx.save()
  ctx.strokeStyle = '#0B1116'
  ctx.lineCap = 'round'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX + 190, tipY + 108)
  ctx.stroke()
  ctx.fillStyle = '#0B1116'
  ctx.beginPath()
  ctx.moveTo(tipX - 2, tipY - 8)
  ctx.lineTo(tipX + 24, tipY + 10)
  ctx.lineTo(tipX + 4, tipY + 14)
  ctx.closePath()
  ctx.fill()
  // 握笔的手
  hand(ctx, { x: tipX + 300, y: tipY + 186, len: 300, ang: 0.52, pose: 'grip', fill: C.cream })
  ctx.restore()

  vignette(ctx, 0.42)
  grain(ctx, gr, f, 0.2)
}

/* 镜 31｜奶奶说语音，转出来的字是错的 */
export function grandma(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0C141B'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1180, 620, 900, WARM, 0.12)
  glow(ctx, 1180, 600, 420, WARM, 0.16)

  ctx.save()
  ctx.fillStyle = '#121B23'
  ctx.fillRect(740, 900, 280, 18)
  ctx.fillRect(770, 918, 16, 62)
  ctx.fillRect(960, 918, 16, 62)
  ctx.fillStyle = hexA(C.cream, 0.92)
  ctx.beginPath()
  ctx.moveTo(680, 910)
  ctx.quadraticCurveTo(664, 720, 736, 654)
  ctx.quadraticCurveTo(794, 596, 874, 612)
  ctx.quadraticCurveTo(952, 630, 958, 704)
  ctx.quadraticCurveTo(966, 812, 952, 910)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = hexA('#B9AE99', 0.5)
  ctx.beginPath()
  ctx.ellipse(824, 646, 58, 24, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hexA(C.cream, 0.95)
  ctx.beginPath()
  ctx.ellipse(846, 558, 66, 70, 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hexA('#E8E2D4', 0.95)
  ctx.beginPath()
  ctx.ellipse(806, 510, 36, 30, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = hexA(C.cream, 0.92)
  ctx.lineWidth = 44
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(930, 720)
  ctx.quadraticCurveTo(1024, 700, 1078, 640)
  ctx.stroke()
  ctx.fillStyle = hexA(C.cream, 0.92)
  ctx.beginPath()
  ctx.arc(1084, 630, 34, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = hexA(WARM, 0.45)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(946, 700)
  ctx.quadraticCurveTo(958, 800, 946, 888)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.translate(1180, 610)
  ctx.rotate(0.08)
  ctx.fillStyle = '#05080B'
  ctx.beginPath()
  ctx.roundRect(-108, -190, 216, 380, 26)
  ctx.fill()
  ctx.fillStyle = lg(ctx, 0, -180, 0, 180, [[0, '#FFF3DC'], [1, WARM_D]])
  ctx.beginPath()
  ctx.roundRect(-96, -178, 192, 356, 20)
  ctx.fill()
  ctx.fillStyle = hexA(INKC, 0.45)
  ctx.font = `400 17px ${SANS}`
  ctx.fillText('语音转文字', -80, -146)
  // 真正的识别错误
  ctx.font = `500 27px ${SANS}`
  ctx.fillStyle = hexA(INKC, 0.85)
  ctx.fillText('你在歪面', -80, -96)
  ctx.fillText('要好好次反', -80, -52)
  ctx.fillText('别省', -80, -8)
  // 标出错字
  ctx.strokeStyle = hexA('#B5483B', 0.85)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(-24, -104, 30, 22, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(18, -60, 54, 22, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  const t = clamp01(f / dur)
  if (t > 0.2 && t < 0.85) {
    for (let i = 0; i < 3; i++) {
      const rr = ((t - 0.2) * 3 + i * 0.33) % 1
      ctx.strokeStyle = hexA(WARM, 0.3 * (1 - rr))
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(1180, 610, 150 + rr * 220, -0.6, 0.6)
      ctx.stroke()
    }
  }

  vignette(ctx, 0.54)
  grain(ctx, gr, f, 0.24)
}

/* 镜 32｜手指伸向那个错字，又收回去 */
export function hover(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0A1117'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 900, 560, 1200, WARM, 0.1)

  ctx.save()
  ctx.translate(900, 560)
  ctx.rotate(-0.03)
  ctx.fillStyle = '#05080B'
  ctx.beginPath()
  ctx.roundRect(-560, -720, 1120, 1440, 40)
  ctx.fill()
  ctx.fillStyle = lg(ctx, 0, -700, 0, 700, [[0, '#FFF3DC'], [1, WARM_D]])
  ctx.beginPath()
  ctx.roundRect(-536, -696, 1072, 1392, 30)
  ctx.fill()

  ctx.fillStyle = hexA(INKC, 0.5)
  ctx.font = `500 40px ${SANS}`
  ctx.fillText('奶奶', -470, -570)
  ctx.fillStyle = hexA('#FFFFFF', 0.6)
  ctx.beginPath()
  ctx.roundRect(-470, -500, 700, 200, 26)
  ctx.fill()
  ctx.fillStyle = hexA(INKC, 0.85)
  ctx.font = `400 44px ${SANS}`
  ctx.fillText('你在歪面', -440, -424)
  ctx.fillText('要好好次反', -440, -360)
  ctx.fillText('别省', -440, -296)
  // 圈出错字
  ctx.strokeStyle = hexA('#B5483B', 0.75)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(-30, -440, 48, 34, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(30, -376, 86, 34, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = hexA('#000000', 0.06)
  ctx.beginPath()
  ctx.roundRect(-470, 420, 940, 130, 26)
  ctx.fill()
  ctx.fillStyle = hexA(INKC, 0.4)
  ctx.font = `400 38px ${SANS}`
  ctx.fillText('改成「你」', -430, 496)
  ctx.restore()

  const p = clamp01(f / dur)
  let fx = 1180
  let fy = 1320
  if (p > 0.14) {
    const a = eout(clamp01((p - 0.14) / 0.3))
    fx = lerp(1180, 800, a)
    fy = lerp(1320, 900, a)
  }
  if (p > 0.6) {
    const b = ein(clamp01((p - 0.6) / 0.24))
    fx = lerp(800, 1200, b)
    fy = lerp(900, 1340, b)
  }
  if (fy < 1320) hand(ctx, { x: fx + 300, y: fy + 190, len: 760, ang: -2.28, pose: 'point', fill: hexA(INK2, 0.97) })

  vignette(ctx, 0.52)
  grain(ctx, gr, f, 0.24)
}

/* 镜 33｜蹲在包裹堆里拆开，低头闻 */
export function parcels(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0D161E'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1100, 200, 900, COLD, 0.12)
  ctx.fillStyle = hexA('#E8F1F6', 0.7)
  ctx.beginPath()
  ctx.arc(1100, 170, 12, 0, Math.PI * 2)
  ctx.fill()

  // 包裹堆
  const boxes: [number, number, number, number, string][] = [
    [900, 660, 260, 220, '#8A7354'],
    [1150, 650, 250, 230, '#9A8160'],
    [1390, 690, 230, 190, '#7A6448'],
    [1020, 500, 220, 160, '#A38A66'],
    [1230, 520, 230, 150, '#8A7354'],
    [1430, 540, 190, 130, '#9A8160'],
  ]
  boxes.forEach(([bx, by, bw2, bh2, col]) => {
    ctx.fillStyle = col
    ctx.fillRect(bx, by, bw2, bh2)
    ctx.fillStyle = hexA(COLD, 0.18)
    ctx.fillRect(bx, by, bw2, 4)
    ctx.fillStyle = hexA('#D8C7A8', 0.55)
    ctx.fillRect(bx + bw2 * 0.2, by + bh2 * 0.28, bw2 * 0.6, 9)
    ctx.fillStyle = hexA('#000000', 0.18)
    ctx.fillRect(bx, by + bh2 - 8, bw2, 8)
  })

  ctx.fillStyle = '#131C24'
  ctx.fillRect(0, 900, W, 180)

  // 孩子蹲着，怀里抱着拆开的箱子，头低下去闻
  const k = clamp01(f / dur)
  const lean = 0.18 + 0.12 * Math.sin(f * 0.12)
  person(ctx, { x: 560, y: 930, h: 520, hair: 'bob', pose: 'squat', fill: C.cream, lean: lean, headTilt: 0.34 })

  // 拆开的箱子：抱在身前，箱盖打开
  const bx3 = 470
  const by3 = 700
  ctx.save()
  ctx.translate(bx3, by3)
  ctx.rotate(-0.12)
  ctx.fillStyle = '#C9A97C'
  ctx.fillRect(0, 0, 210, 150)
  ctx.fillStyle = '#B08F63'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-70, -50)
  ctx.lineTo(120, -50)
  ctx.lineTo(210, 0)
  ctx.closePath()
  ctx.fill()
  // 里面露出的一件衣服
  ctx.fillStyle = hexA(C.cream, 0.95)
  ctx.beginPath()
  ctx.roundRect(40, -34, 120, 60, 12)
  ctx.fill()
  ctx.fillStyle = hexA('#B9AE99', 0.4)
  ctx.fillRect(40, -10, 120, 4)
  ctx.restore()

  // 一只手伸进箱子，另一只扶着箱沿
  ctx.strokeStyle = C.cream
  ctx.lineWidth = 24
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(600, 760)
  ctx.quadraticCurveTo(620, 720, 640, 700)
  ctx.stroke()
  ctx.fillStyle = C.cream
  ctx.beginPath()
  ctx.arc(646, 694, 24, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(560, 720, 22, 0, Math.PI * 2)
  ctx.fill()

  // 低头闻的时候，箱子附近有一点呼吸般的暖雾
  const sniff = Math.sin(f * 0.2)
  glow(ctx, 600, 690, 120, WARM, 0.05 + 0.03 * sniff)

  // 吊灯在头肩上的一条冷边
  ctx.strokeStyle = hexA(COLD, 0.4)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(560, 930 - 0.6 * 520, 0.09 * 520, Math.PI * 1.15, Math.PI * 1.8)
  ctx.stroke()

  void k
  vignette(ctx, 0.52)
  grain(ctx, gr, f, 0.24)
}

/* 镜 34｜食堂，端着盘子找不到位子 */
export function canteen(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#101922'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = lg(ctx, 0, 0, 0, 420, [[0, hexA(WARM, 0.18)], [1, hexA(WARM, 0)]])
  ctx.fillRect(0, 0, W, 420)
  glow(ctx, 260, 260, 620, WARM, 0.14)

  // 打饭窗口
  ctx.fillStyle = '#1A242D'
  ctx.fillRect(0, 380, 520, 120)
  ctx.fillStyle = hexA(WARM, 0.35)
  ctx.fillRect(20, 400, 460, 70)

  // 长条桌：三条，斜着排
  for (let r = 0; r < 3; r++) {
    const sc = 1 - r * 0.13
    const yy = 560 + r * 128
    ctx.fillStyle = '#243140'
    ctx.beginPath()
    ctx.roundRect(300 - r * 40, yy, 1500 * sc, 22 * sc, 8)
    ctx.fill()
    ctx.fillStyle = hexA(COLD, 0.12)
    ctx.fillRect(300 - r * 40, yy, 1500 * sc, 3)

    // 坐着的人：一排
    for (let c = 0; c < 5; c++) {
      const xx = 420 + c * 280 * sc + r * 26
      ctx.fillStyle = hexA(C.cream, 0.9)
      ctx.beginPath()
      ctx.moveTo(xx - 44 * sc, yy + 2)
      ctx.quadraticCurveTo(xx - 42 * sc, yy - 76 * sc, xx - 20 * sc, yy - 86 * sc)
      ctx.quadraticCurveTo(xx, yy - 92 * sc, xx + 20 * sc, yy - 86 * sc)
      ctx.quadraticCurveTo(xx + 42 * sc, yy - 76 * sc, xx + 44 * sc, yy + 2)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.arc(xx, yy - 108 * sc, 27 * sc, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = hexA('#141C23', 0.9)
      ctx.beginPath()
      ctx.arc(xx, yy - 114 * sc, 27 * sc, Math.PI * 0.98, Math.PI * 2.02)
      ctx.fill()
      // 面前的盘子
      ctx.fillStyle = hexA('#E8F1F6', 0.2)
      ctx.beginPath()
      ctx.ellipse(xx, yy - 4, 48 * sc, 12 * sc, 0, 0, Math.PI * 2)
      ctx.fill()
      // 肩上的暖边
      ctx.strokeStyle = hexA(WARM, 0.25)
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(xx, yy - 108 * sc, 28 * sc, Math.PI * 1.1, Math.PI * 1.75)
      ctx.stroke()
    }
  }

  // 端着盘子走的孩子
  const k = clamp01(f / (dur * 0.72))
  const x = lerp(200, 1500, eio(k))
  person(ctx, { x, y: 1000, h: 470, hair: 'bob', pose: 'walk', step: Math.sin(f * 0.42) * 0.45, fill: C.cream })
  // 盘子：两只手端着，盘子在前
  ctx.fillStyle = hexA('#E8F1F6', 0.6)
  ctx.beginPath()
  ctx.ellipse(x + 8, 712, 96, 22, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = hexA('#E8F1F6', 0.4)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(x + 8, 712, 96, 22, 0, 0, Math.PI * 2)
  ctx.stroke()
  // 盘里的饭
  ctx.fillStyle = hexA('#D9C9A8', 0.8)
  ctx.beginPath()
  ctx.arc(x - 20, 706, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hexA('#C9BFA8', 0.7)
  ctx.beginPath()
  ctx.arc(x + 34, 708, 14, 0, Math.PI * 2)
  ctx.fill()
  // 两只手托着盘沿
  ctx.fillStyle = C.cream
  ctx.beginPath()
  ctx.arc(x - 66, 726, 20, 0, Math.PI * 2)
  ctx.arc(x + 82, 726, 20, 0, Math.PI * 2)
  ctx.fill()

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.24)
}

/* 镜 35｜门从里面反锁，锁舌"咔"一声 */
export function bolt(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0D151C'
  ctx.fillRect(0, 0, W, H)

  // 门：一整块，右边是门缝
  ctx.fillStyle = '#1B2731'
  ctx.fillRect(120, 40, 1620, 1000)
  ctx.fillStyle = hexA(COLD, 0.14)
  ctx.fillRect(120, 40, 3, 1000)
  // 门的竖纹
  ctx.fillStyle = hexA('#000000', 0.18)
  for (let i = 0; i < 4; i++) ctx.fillRect(260 + i * 300, 40, 4, 1000)
  // 门缝
  ctx.fillStyle = '#05090D'
  ctx.fillRect(1740, 40, 26, 1000)

  // 门把手：横着的把手 + 底座
  ctx.fillStyle = '#B9C8D3'
  ctx.beginPath()
  ctx.roundRect(520, 520, 70, 110, 20)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(560, 548, 300, 56, 28)
  ctx.fill()
  ctx.fillStyle = hexA('#FFFFFF', 0.35)
  ctx.fillRect(566, 556, 290, 8)

  // 反锁旋钮：圆形底座 + 旋钮
  const turn = eout(clamp01((f - 10) / (dur * 0.5)))
  const ang = turn * 1.35
  ctx.fillStyle = '#93A3B0'
  ctx.beginPath()
  ctx.arc(1330, 620, 96, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#D5E0E8'
  ctx.beginPath()
  ctx.arc(1330, 620, 64, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(1330, 620)
  ctx.rotate(ang)
  ctx.fillStyle = '#7E8E9C'
  ctx.beginPath()
  ctx.roundRect(-14, -58, 28, 116, 14)
  ctx.fill()
  ctx.restore()

  // 锁舌：从门边伸出去
  ctx.fillStyle = '#D5E0E8'
  const slide = eout(clamp01((f - 10) / (dur * 0.5)))
  ctx.beginPath()
  ctx.roundRect(1600 + slide * 90, 590, 120, 46, 10)
  ctx.fill()
  // 门框上的锁孔
  ctx.fillStyle = '#05090D'
  ctx.beginPath()
  ctx.roundRect(1734, 578, 34, 70, 8)
  ctx.fill()

  // 手：握着旋钮
  hand(ctx, { x: 1396, y: 742, len: 400, ang: -2.55, pose: 'grip', fill: C.cream })

  // 咔的一声：一圈光
  const click = clamp01((turn - 0.9) / 0.1)
  if (click > 0) {
    ctx.strokeStyle = hexA('#EAF6FF', 0.55 * (1 - click))
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(1660, 612, 40 + click * 240, 0, Math.PI * 2)
    ctx.stroke()
  }

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.24)
}

/* 镜 36｜47 条未接，手指停在拨号键上 */
export function missed(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0A1016'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 960, 540, 1200, WARM, 0.1)

  ctx.save()
  ctx.translate(900, 540)
  ctx.fillStyle = '#05080B'
  ctx.beginPath()
  ctx.roundRect(-470, -740, 940, 1480, 40)
  ctx.fill()
  ctx.fillStyle = lg(ctx, 0, -720, 0, 720, [[0, '#FFF3DC'], [1, WARM_D]])
  ctx.beginPath()
  ctx.roundRect(-446, -716, 892, 1432, 30)
  ctx.fill()

  ctx.fillStyle = hexA(INKC, 0.5)
  ctx.font = `400 38px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText('视频通话', 0, -620)

  ctx.fillStyle = hexA(INKC, 0.14)
  ctx.beginPath()
  ctx.arc(0, -410, 170, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hexA(INKC, 0.28)
  ctx.beginPath()
  ctx.arc(0, -456, 66, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(-104, -382, 208, 124, 58)
  ctx.fill()

  ctx.fillStyle = hexA('#B5483B', 0.85)
  ctx.font = `600 92px ${SANS}`
  ctx.fillText('47', 0, -120)
  ctx.fillStyle = hexA(INKC, 0.6)
  ctx.font = `400 38px ${SANS}`
  ctx.fillText('个未接', 0, -58)

  const scroll = clamp01((f / dur - 0.12) / 0.5) * 500
  ctx.save()
  ctx.beginPath()
  ctx.rect(-446, 0, 892, 500)
  ctx.clip()
  for (let i = 0; i < 12; i++) {
    const yy = 26 + i * 94 - scroll
    if (yy < -80 || yy > 540) continue
    ctx.fillStyle = hexA(INKC, 0.18)
    ctx.fillRect(-410, yy, 820, 2)
    ctx.fillStyle = hexA(INKC, 0.55)
    ctx.font = `400 30px ${SANS}`
    ctx.textAlign = 'left'
    ctx.fillText('未接视频', -390, yy + 50)
    ctx.textAlign = 'right'
    ctx.fillStyle = hexA('#B5483B', 0.6)
    ctx.fillText('2 月 ' + (28 - i) + ' 日', 390, yy + 50)
  }
  ctx.restore()

  // 拨号键：绿色
  ctx.fillStyle = hexA('#3E8E5A', 0.9)
  ctx.beginPath()
  ctx.arc(0, 640, 90, 0, Math.PI * 2)
  ctx.fill()
  glow(ctx, 0, 640, 200, '#6FCF97', 0.18)
  ctx.fillStyle = hexA('#EAF7EF', 0.9)
  ctx.beginPath()
  ctx.roundRect(-26, 606, 52, 46, 14)
  ctx.fill()
  ctx.restore()

  // 手指停在拨号键上方
  const p = clamp01(f / dur)
  const hover = clamp01((p - 0.62) / 0.18) * (1 - clamp01((p - 0.9) / 0.1))
  const fy = lerp(1220, 500, eout(hover))
  if (hover > 0.02) {
    hand(ctx, { x: 1268, y: fy + 300, len: 640, ang: -2.75, pose: 'point', fill: hexA(INK2, 0.97) })
    if (hover > 0.6) glow(ctx, 950, fy + 40, 110, '#FFFFFF', 0.05)
  }

  const dim = clamp01((p - 0.94) / 0.06)
  if (dim > 0) {
    ctx.fillStyle = `rgba(4,7,10,${0.85 * dim})`
    ctx.fillRect(0, 0, W, H)
  }
  // 屏幕边缘的暗角
  const edge = ctx.createRadialGradient(900, 540, 500, 900, 540, 1000)
  edge.addColorStop(0, 'rgba(0,0,0,0)')
  edge.addColorStop(1, `rgba(0,0,0,${0.25 + 0.15 * p})`)
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, W, H)

  grain(ctx, gr, f, 0.24)
}

export const CUTS_D = [0, 90, 195, 300, 390, 450, 525, 615, 705, 795, 885, 990, 1050, 1170]

export const SHOT_D = [
  { fn: wake, dur: 90 },
  { fn: dressing, dur: 105 },
  { fn: stove, dur: 105 },
  { fn: innerRoom, dur: 90 },
  { fn: charm, dur: 60 },
  { fn: signature, dur: 75 },
  { fn: writeDate, dur: 90 },
  { fn: grandma, dur: 90 },
  { fn: hover, dur: 90 },
  { fn: parcels, dur: 90 },
  { fn: canteen, dur: 105 },
  { fn: bolt, dur: 60 },
  { fn: missed, dur: 120 },
]
