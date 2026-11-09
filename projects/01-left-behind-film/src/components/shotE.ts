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

/* 镜 37｜三个大人围着他，头顶冒出同一句话 */
export function praised(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0E1720'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 960, 260, 1200, WARM, 0.05)

  // 三个大人：把他围在中间
  person(ctx, { x: 520, y: 940, h: 560, hair: 'cap', fill: hexA(C.cream, 0.62) })
  person(ctx, { x: 1400, y: 940, h: 570, hair: 'cap', fill: hexA(C.cream, 0.62) })
  person(ctx, { x: 960, y: 900, h: 540, hair: 'cap', fill: hexA(C.cream, 0.5) })

  // 孩子
  person(ctx, { x: 960, y: 980, h: 400, hair: 'bob', fill: C.cream, headTilt: 0.1 })

  // 三句一样的话
  const lines = [
    { x: 360, y: 250 },
    { x: 1440, y: 230 },
    { x: 900, y: 170 },
  ]
  lines.forEach((b, i) => {
    const k = clamp01((f / dur - 0.08 - i * 0.1) / 0.12)
    if (k <= 0) return
    const s = 0.86 + 0.14 * eout(k)
    ctx.save()
    ctx.globalAlpha = clamp01(k * 1.2)
    ctx.translate(b.x, b.y)
    ctx.scale(s, s)
    ctx.fillStyle = hexA('#EDE6D8', 0.94)
    ctx.beginPath()
    ctx.roundRect(-190, -48, 380, 96, 30)
    ctx.fill()
    // 小尾巴
    ctx.beginPath()
    ctx.moveTo(-24, 46)
    ctx.lineTo(6, 84)
    ctx.lineTo(26, 46)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = INKC
    ctx.font = `500 40px ${SANS}`
    ctx.textAlign = 'center'
    ctx.fillText('这孩子真懂事。', 0, 14)
    ctx.textAlign = 'left'
    ctx.restore()
  })

  vignette(ctx, 0.52)
  grain(ctx, gr, f, 0.22)
}

/* 镜 38｜低头，手在裤缝上来回蹭 */
export function rubSeam(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0F1821'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 700, 200, 1000, COLD, 0.06)

  // 近景：孩子上半身，头低着
  const bx = 820
  person(ctx, { x: bx, y: 1080, h: 900, hair: 'bob', fill: C.cream, headTilt: 0.42 })

  // 一只手在裤缝上下蹭
  const rub = 0.5 + 0.5 * Math.sin(f * 0.5)
  void rub
  // 裤缝的一条线
  ctx.strokeStyle = hexA('#000000', 0.12)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(bx + 26, 1080 - 0.56 * 900)
  ctx.lineTo(bx + 30, 1080 - 0.06 * 900)
  ctx.stroke()

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}

/* 镜 39｜大人伸手摸头，肩膀缩了一下 */
export function patHead(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0E1720'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1520, 260, 900, WARM, 0.06)

  const reach = eio(clamp01((f / dur - 0.1) / 0.38))
  const shrink = clamp01((f / dur - 0.55) / 0.2)

  // 孩子：含胸，一边肩膀高一边低
  const cx = 1150
  const ch = 560
  const cy = 1060
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(0.03)
  ctx.translate(-cx, -cy)
  person(ctx, { x: cx, y: cy, h: ch, hair: 'bob', fill: C.cream, headTilt: 0.18 + shrink * 0.1 })
  // 耸起来的肩膀：两个圆压在肩线上，显得缩着
  ctx.fillStyle = C.cream
  ctx.beginPath()
  ctx.arc(cx - 0.075 * ch, cy - 0.7 * ch - 8, 0.052 * ch, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + 0.075 * ch, cy - 0.7 * ch + 12, 0.045 * ch, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 大人：站在左边，靠得近一点，胳膊短了
  person(ctx, { x: 780, y: 1060, h: 720, hair: 'cap', fill: hexA(C.cream, 0.55) })
  const shx = 780 + 0.07 * 720
  const shy = 1060 - 0.7 * 720
  const hx = lerp(920, cx - 40, reach)
  const hy = lerp(620, 1060 - 0.87 * ch, reach)
  ctx.strokeStyle = hexA(C.cream, 0.8)
  ctx.lineWidth = 0.062 * 720
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(shx, shy)
  // 肘：先往下再往上，弯出个肘来
  ctx.quadraticCurveTo(shx + 40, shy + 150, hx, hy)
  ctx.stroke()
  if (reach > 0.9) {
    void hx
  }

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}

/* 镜 40｜夜里找药：柜门、药板剩两粒、水壶倒不出水 */
export function medicine(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#0D161E'
  ctx.fillRect(0, 0, W, H)

  // 柜子：一格，左边一扇半开的门
  ctx.fillStyle = '#18222B'
  ctx.fillRect(200, 120, 1520, 820)
  // 柜门：斜着的平行四边形，画个透视
  ctx.fillStyle = '#22303C'
  ctx.beginPath()
  ctx.moveTo(200, 120)
  ctx.lineTo(520, 60)
  ctx.lineTo(560, 900)
  ctx.lineTo(200, 940)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = hexA(COLD, 0.18)
  ctx.beginPath()
  ctx.moveTo(200, 120)
  ctx.lineTo(520, 60)
  ctx.lineTo(520, 66)
  ctx.lineTo(200, 126)
  ctx.closePath()
  ctx.fill()

  // 格板
  ctx.fillStyle = '#101A22'
  ctx.fillRect(560, 470, 1160, 26)
  ctx.fillStyle = hexA(COLD, 0.1)
  ctx.fillRect(560, 470, 1160, 3)

  // 格子里：一个药盒、两个瓶子
  ctx.fillStyle = '#33475A'
  ctx.beginPath()
  ctx.roundRect(700, 330, 220, 140, 8)
  ctx.fill()
  ctx.fillStyle = hexA('#E8F1F6', 0.25)
  ctx.fillRect(700, 330, 220, 6)
  ctx.fillStyle = '#2F4152'
  ctx.beginPath()
  ctx.roundRect(1560, 340, 90, 130, 10)
  ctx.fill()

  // 手伸进来，手里拿着药板
  const grab = eout(clamp01((t - 0.04) / 0.3))
  const px = lerp(1500, 860, grab)
  const py = lerp(420, 560, grab)
  if (t > 0.32) {
    // 药板：4×2 的泡罩，只剩两粒
    const pb = clamp01((t - 0.32) / 0.16)
    ctx.save()
    ctx.globalAlpha = pb
    ctx.translate(px + 40, py + 60)
    ctx.rotate(-0.18)
    ctx.fillStyle = hexA('#DCE6EC', 0.96)
    ctx.beginPath()
    ctx.roundRect(-110, -70, 220, 140, 14)
    ctx.fill()
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        const empty = !(i === 0 && j === 0) && !(i === 1 && j === 1)
        ctx.fillStyle = empty ? hexA('#8FA3B2', 0.35) : hexA('#FFFFFF', 0.95)
        ctx.beginPath()
        ctx.arc(-72 + i * 48, -34 + j * 68, 15, 0, Math.PI * 2)
        ctx.fill()
        if (!empty) {
          ctx.fillStyle = hexA('#E8A05C', 0.9)
          ctx.beginPath()
          ctx.ellipse(-72 + i * 48, -34 + j * 68, 10, 6, 0.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    ctx.restore()
    hand(ctx, { x: px + 250, y: py + 130, len: 250, ang: 3.35, pose: 'grip', fill: hexA(INK2, 0.97) })
  } else if (grab > 0) {
    hand(ctx, { x: px + 250, y: py + 130, len: 250, ang: 3.35, pose: 'relaxed', fill: hexA(INK2, 0.97) })
  }

  // 水壶：嘴朝下，一滴水都没有
  const pour = eout(clamp01((t - 0.7) / 0.22))
  if (pour > 0) {
    ctx.save()
    ctx.translate(1180, 800)
    ctx.rotate(lerp(0, -1.15, pour))
    ctx.fillStyle = '#2E4152'
    ctx.beginPath()
    ctx.moveTo(-70, -120)
    ctx.quadraticCurveTo(0, -150, 70, -120)
    ctx.lineTo(70, 100)
    ctx.quadraticCurveTo(0, 130, -70, 100)
    ctx.closePath()
    ctx.fill()
    // 壶嘴
    ctx.beginPath()
    ctx.roundRect(60, -110, 90, 40, 14)
    ctx.fill()
    // 把
    ctx.strokeStyle = '#2E4152'
    ctx.lineWidth = 26
    ctx.beginPath()
    ctx.arc(-80, -20, 60, -1.2, 1.2)
    ctx.stroke()
    ctx.fillStyle = hexA(COLD, 0.25)
    ctx.fillRect(-64, -110, 8, 220)
    ctx.restore()
    // 杯子在下面，空的
    ctx.fillStyle = hexA(C.cream, 0.9)
    ctx.beginPath()
    ctx.moveTo(1240, 900)
    ctx.lineTo(1380, 900)
    ctx.lineTo(1362, 1040)
    ctx.lineTo(1258, 1040)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = hexA('#000000', 0.25)
    ctx.beginPath()
    ctx.ellipse(1310, 906, 70, 14, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.24)
}
/* 镜 41｜打了一行字，删掉，改成"我没事" */
export function rewrite(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#0B1218'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 960, 540, 1100, WARM, 0.1)

  ctx.save()
  ctx.translate(960, 540)
  ctx.fillStyle = '#05080B'
  ctx.beginPath()
  ctx.roundRect(-460, -700, 920, 1400, 40)
  ctx.fill()
  ctx.fillStyle = lg(ctx, 0, -680, 0, 680, [[0, '#FFF3DC'], [1, WARM_D]])
  ctx.beginPath()
  ctx.roundRect(-436, -676, 872, 1352, 30)
  ctx.fill()

  ctx.fillStyle = hexA(INKC, 0.55)
  ctx.font = `500 40px ${SANS}`
  ctx.fillText('妈妈', -390, -560)

  // 输入框
  ctx.fillStyle = hexA('#FFFFFF', 0.5)
  ctx.beginPath()
  ctx.roundRect(-400, 300, 800, 150, 24)
  ctx.fill()

  // 先打出"妈，我发烧了"，删掉，再打"我没事"
  const typed1 = '妈，我发烧了'
  const typed2 = '我没事'
  const type1 = clamp01(t / 0.3)
  const del = clamp01((t - 0.38) / 0.14)
  const type2 = clamp01((t - 0.56) / 0.18)

  const n1 = Math.floor(type1 * typed1.length) - Math.floor(del * typed1.length)
  const shown = n1 > 0 ? typed1.slice(0, n1) : ''
  const n2 = Math.floor(type2 * typed2.length)

  ctx.font = `400 44px ${SANS}`
  ctx.fillStyle = hexA(INKC, 0.85)
  if (shown) ctx.fillText(shown, -370, 390)
  if (n2 > 0) {
    ctx.fillStyle = hexA(INKC, 0.9)
    ctx.fillText(typed2.slice(0, n2), -370, 390)
  }
  // 光标
  if ((f % 30) < 16) {
    const cw = ctx.measureText(n2 > 0 ? typed2.slice(0, n2) : shown).width
    ctx.fillStyle = hexA(INKC, 0.6)
    ctx.fillRect(-370 + cw + 6, 350, 3, 54)
  }
  ctx.restore()

  // 手指在输入框上方
  const fy = 780 + Math.sin(f * 0.1) * 8
  hand(ctx, { x: 1560, y: fy + 120, len: 440, ang: -2.35, pose: 'point', fill: hexA(INK2, 0.9) })

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}

/* 镜 42｜家长会的座位表："家长"一栏写着"姑姑" */
export function seatChart(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0F181F'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1500, 200, 900, WARM, 0.09)

  const push = 1 + eio(clamp01(f / dur)) * 0.04
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.scale(push, push)
  ctx.translate(-W / 2, -H / 2)

  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.fillRect(320, 190, 1280, 700)
  ctx.fillStyle = PAPER
  ctx.fillRect(300, 170, 1280, 700)

  ctx.fillStyle = hexA(INKC, 0.6)
  ctx.font = `600 40px ${SANS}`
  ctx.fillText('三年二班 · 家长会座位表', 380, 250)

  // 座位格子
  const cols = 4
  const rows = 4
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 400 + c * 280
      const y = 320 + r * 130
      ctx.strokeStyle = hexA(INKC, 0.18)
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, 240, 100)
      ctx.fillStyle = hexA(INKC, 0.3)
      ctx.font = `400 26px ${SANS}`
      ctx.fillText('家长', x + 18, y + 34)
      // 那一格
      if (r === 1 && c === 2) {
        ctx.fillStyle = hexA(INKC, 0.9)
        ctx.font = `500 40px ${SANS}`
        ctx.fillText('姑姑', x + 96, y + 68)
      } else {
        ctx.fillStyle = hexA(INKC, 0.45)
        ctx.font = `400 30px ${SANS}`
        ctx.fillText(['爸爸', '妈妈', '爷爷', '外婆', '舅舅'][(r * cols + c) % 5], x + 100, y + 68)
      }
    }
  }

  // 红笔圈一下
  const k = clamp01((f - 30) / 26)
  if (k > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(956, 446, 250 * k, 108)
    ctx.strokeStyle = hexA('#B5483B', 0.9)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()

  vignette(ctx, 0.46)
  grain(ctx, gr, f, 0.2)
}

/* 镜 43｜一排家长的背影，停到姑姑，旁边两个空座 */
export function parentsRow(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#0E1720'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = lg(ctx, 0, 0, 0, 420, [[0, hexA(WARM, 0.1)], [1, hexA(WARM, 0)]])
  ctx.fillRect(0, 0, W, 420)

  const pan = eio(clamp01(t / 0.6)) * 560
  const seats = [
    { x: 240, who: 'adult' },
    { x: 540, who: 'adult' },
    { x: 840, who: 'aunt' },
    { x: 1140, who: 'empty' },
    { x: 1440, who: 'empty' },
    { x: 1740, who: 'adult' },
  ]
  seats.forEach((s) => {
    const x = s.x - pan
    // 桌面
    ctx.fillStyle = '#1E2A35'
    ctx.beginPath()
    ctx.roundRect(x - 130, 706, 260, 22, 8)
    ctx.fill()
    if (s.who === 'adult') {
      // 背影：肩宽、头圆
      ctx.fillStyle = hexA(C.cream, 0.5)
      ctx.beginPath()
      ctx.moveTo(x - 84, 706)
      ctx.quadraticCurveTo(x - 80, 600, x - 34, 584)
      ctx.quadraticCurveTo(x, 574, x + 34, 584)
      ctx.quadraticCurveTo(x + 80, 600, x + 84, 706)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, 552, 42, 0, Math.PI * 2)
      ctx.fill()
    } else if (s.who === 'aunt') {
      // 姑姑：背有点驼，披着外套
      ctx.fillStyle = hexA(C.cream, 0.95)
      ctx.beginPath()
      ctx.moveTo(x - 96, 706)
      ctx.quadraticCurveTo(x - 92, 618, x - 40, 606)
      ctx.quadraticCurveTo(x, 598, x + 40, 606)
      ctx.quadraticCurveTo(x + 92, 618, x + 96, 706)
      ctx.closePath()
      ctx.fill()
      // 驼着的背：一个鼓包
      ctx.beginPath()
      ctx.ellipse(x, 630, 62, 40, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, 578, 44, 0, Math.PI * 2)
      ctx.fill()
      // 挽起来的头发
      ctx.fillStyle = hexA('#E8E2D4', 0.9)
      ctx.beginPath()
      ctx.arc(x - 6, 548, 20, 0, Math.PI * 2)
      ctx.fill()
      // 搭在椅背上的外套
      ctx.fillStyle = hexA('#C9713F', 0.55)
      ctx.beginPath()
      ctx.roundRect(x - 100, 690, 200, 70, 20)
      ctx.fill()
    } else {
      // 空座：虚线的名牌
      ctx.setLineDash([10, 8])
      ctx.strokeStyle = hexA(C.cream, 0.35)
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(x - 84, 690, 168, 58, 10)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = hexA(C.cream, 0.25)
      ctx.font = `400 26px ${SANS}`
      ctx.textAlign = 'center'
      ctx.fillText('未到', x, 728)
      ctx.textAlign = 'left'
    }
  })

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}

/* 镜 44｜行李箱：腊肉、鸡蛋、一袋米 */
export function packBag(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#101A22'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1000, 280, 900, WARM, 0.1)

  // 箱子：俯视四分三，箱盖打开在后面
  ctx.fillStyle = '#22303C'
  ctx.beginPath()
  ctx.moveTo(420, 700)
  ctx.lineTo(1360, 700)
  ctx.lineTo(1500, 960)
  ctx.lineTo(300, 960)
  ctx.closePath()
  ctx.fill()
  // 箱内壁
  ctx.fillStyle = '#18232D'
  ctx.beginPath()
  ctx.moveTo(470, 720)
  ctx.lineTo(1310, 720)
  ctx.lineTo(1420, 920)
  ctx.lineTo(370, 920)
  ctx.closePath()
  ctx.fill()
  // 箱盖（立起来）
  ctx.fillStyle = '#2A3B49'
  ctx.beginPath()
  ctx.moveTo(420, 700)
  ctx.lineTo(1360, 700)
  ctx.lineTo(1330, 470)
  ctx.lineTo(450, 470)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = hexA(COLD, 0.12)
  ctx.fillRect(450, 470, 880, 4)

  // 一样一样放进去
  // 腊肉：深色、长条、有绑绳
  const m1 = clamp01((t - 0.06) / 0.1)
  if (m1 > 0) {
    ctx.save()
    ctx.globalAlpha = clamp01(m1 * 1.4)
    ctx.translate(0, (1 - eout(m1)) * -70)
    ctx.fillStyle = '#5E2F22'
    ctx.beginPath()
    ctx.roundRect(520, 800, 300, 90, 40)
    ctx.fill()
    ctx.strokeStyle = hexA('#3A1D16', 0.8)
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(600, 792)
    ctx.lineTo(600, 898)
    ctx.moveTo(740, 792)
    ctx.lineTo(740, 898)
    ctx.stroke()
    ctx.restore()
  }
  // 鸡蛋：一袋，几个椭圆露出来
  const m2 = clamp01((t - 0.26) / 0.1)
  if (m2 > 0) {
    ctx.save()
    ctx.globalAlpha = clamp01(m2 * 1.4)
    ctx.translate(0, (1 - eout(m2)) * -60)
    ctx.fillStyle = hexA('#D8CBB0', 0.95)
    ctx.beginPath()
    ctx.roundRect(880, 790, 240, 110, 26)
    ctx.fill()
    ctx.fillStyle = hexA('#F2EADA', 0.95)
    ;[[920, 812], [972, 806], [1024, 814], [948, 846], [1000, 848], [1070, 812]].forEach(([ex, ey]) => {
      ctx.beginPath()
      ctx.ellipse(ex, ey, 22, 26, 0.1, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()
  }
  // 米：一个布袋子，有褶
  const m3 = clamp01((t - 0.46) / 0.1)
  if (m3 > 0) {
    ctx.save()
    ctx.globalAlpha = clamp01(m3 * 1.4)
    ctx.translate(0, (1 - eout(m3)) * -60)
    ctx.fillStyle = '#C7BCA2'
    ctx.beginPath()
    ctx.ellipse(1180, 850, 120, 80, 0.05, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = hexA('#000000', 0.12)
    ctx.beginPath()
    ctx.ellipse(1140, 870, 30, 50, 0.3, 0, Math.PI * 2)
    ctx.ellipse(1226, 830, 26, 44, -0.2, 0, Math.PI * 2)
    ctx.fill()
    // 袋口
    ctx.fillStyle = '#B3A78D'
    ctx.beginPath()
    ctx.roundRect(1150, 760, 60, 40, 12)
    ctx.fill()
    ctx.restore()
  }

  // 母亲的手：从右上方伸进来往下按
  const press = clamp01((t - 0.6) / 0.3)
  if (press > 0) {
    hand(ctx, {
      x: lerp(1560, 1260, eout(press)), y: lerp(420, 760, eout(press)),
      len: 300, ang: 1.85, pose: 'open', fill: C.cream,
    })
  }

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}

/* 镜 45｜塞太满，拉链合不上，膝盖压住硬拉 */
export function zipUp(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#101A22'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 900, 300, 820, WARM, 0.09)

  // 箱子边缘：鼓起来的那一块特写
  const bulge = 1 + 0.04 * Math.sin(t * 9)
  ctx.save()
  ctx.translate(960, 720)
  ctx.scale(bulge, 1 / bulge)
  // 箱体
  ctx.fillStyle = '#2E404F'
  ctx.beginPath()
  ctx.moveTo(-620, 260)
  ctx.lineTo(620, 260)
  ctx.lineTo(620, -140)
  ctx.quadraticCurveTo(300, -240, 0, -150)
  ctx.quadraticCurveTo(-300, -240, -620, -140)
  ctx.closePath()
  ctx.fill()
  // 鼓出来的那一块：被里面的东西顶起来
  ctx.fillStyle = '#3C5164'
  ctx.beginPath()
  ctx.ellipse(180, -60, 190, 110, 0.06, 0, Math.PI * 2)
  ctx.fill()
  // 缝线：合不上的那条缝
  ctx.strokeStyle = hexA('#0C141B', 0.6)
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(-620, -140)
  ctx.quadraticCurveTo(-300, -240, 0, -150)
  ctx.quadraticCurveTo(300, -240, 620, -140)
  ctx.stroke()
  ctx.restore()

  // 拉链齿：被拉过的一段咬合，前面还是张开的
  const zip = eout(clamp01((t - 0.12) / 0.42))
  const from = -600
  const to = lerp(-600, 520, zip)
  for (let i = 0; i < 46; i++) {
    const x = from + i * 26
    if (x > to) break
    ctx.fillStyle = hexA('#B9C9D6', 0.75)
    ctx.fillRect(x, 588, 14, 10)
    ctx.fillRect(x, 604, 14, 10)
  }
  // 拉链头
  ctx.fillStyle = hexA('#D5E0E8', 0.95)
  ctx.beginPath()
  ctx.roundRect(to - 10, 566, 70, 70, 12)
  ctx.fill()
  ctx.fillStyle = hexA('#8FA3B2', 0.9)
  ctx.beginPath()
  ctx.roundRect(to + 12, 580, 26, 42, 8)
  ctx.fill()

  // 膝盖从上面压下来
  const knee = eout(clamp01((t - 0.3) / 0.28))
  if (knee > 0) {
    ctx.fillStyle = hexA(C.cream, 0.95)
    ctx.beginPath()
    ctx.ellipse(300, lerp(-120, 120, knee), 150, 110, 0.1, 0, Math.PI * 2)
    ctx.fill()
    // 小腿往上出画
    ctx.strokeStyle = hexA(C.cream, 0.95)
    ctx.lineWidth = 150
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(300, lerp(-60, 60, knee))
    ctx.lineTo(240, -320)
    ctx.stroke()
  }

  // 手死死捏着拉链头
  hand(ctx, {
    x: to + 120, y: 640,
    len: 260, ang: lerp(3.3, 3.05, zip), pose: 'grip', fill: C.cream,
  })

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.22)
}
/* 镜 46｜站在门口，手背在身后，没哭 */
export function doorway(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#070C11'
  ctx.fillRect(0, 0, W, H)

  // 门外：极亮、极冷的白光
  ctx.fillStyle = lg(ctx, 0, 100, 0, 1000, [[0, '#EAF4FF'], [0.5, '#D3E6F5'], [1, '#BFD9EC']])
  ctx.fillRect(600, 120, 720, 860)
  glow(ctx, 960, 620, 900, '#EAF4FF', 0.3)
  // 门框
  ctx.fillStyle = '#05090D'
  ctx.fillRect(568, 60, 40, 1020)
  ctx.fillRect(1312, 60, 40, 1020)
  ctx.fillRect(568, 60, 784, 44)
  // 地上的光
  ctx.fillStyle = hexA('#EAF4FF', 0.22)
  ctx.beginPath()
  ctx.ellipse(960, 990, 460, 60, 0, 0, Math.PI * 2)
  ctx.fill()

  const sway = Math.sin(f * 0.05) * 1.5
  // 孩子在背光里：几乎全黑，只有边缘一圈冷光
  ctx.fillStyle = '#0A1015'
  person(ctx, { x: 960 + sway, y: 960, h: 620, hair: 'bob', fill: '#0A1015', headTilt: 0.03 })
  // 轮廓光
  ctx.strokeStyle = hexA('#F2F9FF', 0.85)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(960 + sway, 960 - 0.805 * 620, 0.086 * 620, Math.PI * 0.9, Math.PI * 2.1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(960 + sway - 0.108 * 620, 960 - 0.3 * 620)
  ctx.quadraticCurveTo(960 + sway - 0.13 * 620, 960 - 0.55 * 620, 960 + sway - 0.085 * 620, 960 - 0.7 * 620)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(960 + sway + 0.108 * 620, 960 - 0.3 * 620)
  ctx.quadraticCurveTo(960 + sway + 0.13 * 620, 960 - 0.55 * 620, 960 + sway + 0.085 * 620, 960 - 0.7 * 620)
  ctx.stroke()

  // 背在身后的手：两只手扣在一起
  ctx.fillStyle = '#0A1015'
  ctx.beginPath()
  ctx.ellipse(960 + sway, 960 - 0.37 * 620, 60, 40, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = hexA('#F2F9FF', 0.6)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(960 + sway, 960 - 0.37 * 620, 60, 40, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(960 + sway - 60, 960 - 0.37 * 620)
  ctx.lineTo(960 + sway + 60, 960 - 0.37 * 620)
  ctx.stroke()

  vignette(ctx, 0.42)
  grain(ctx, gr, f, 0.22)
}

/* 镜 47｜尾灯拐过山角，他还站在路口 */
export function departure(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = lg(ctx, 0, 0, 0, 780, [[0, '#0A1219'], [1, '#1A252F']])
  ctx.fillRect(0, 0, W, H)

  // 村子剪影
  ctx.fillStyle = '#0A1218'
  ;[[60, 600, 280], [400, 650, 200], [1560, 620, 300]].forEach(([hx, hy, hw]) => {
    ctx.fillRect(hx, hy, hw, 840 - hy)
    ctx.beginPath()
    ctx.moveTo(hx - 16, hy)
    ctx.lineTo(hx + hw / 2, hy - hw * 0.22)
    ctx.lineTo(hx + hw + 16, hy)
    ctx.closePath()
    ctx.fill()
  })

  // 路面：有透视
  ctx.fillStyle = lg(ctx, 0, 820, 0, H, [[0, '#22303C'], [1, '#0C141A']])
  ctx.fillRect(0, 820, W, H - 820)
  ctx.strokeStyle = hexA('#8FA9C4', 0.1)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 900)
  ctx.lineTo(W, 860)
  ctx.stroke()

  // 车尾：看得出的车
  const e = eio(clamp01(t / 0.85))
  const cx = lerp(760, 1760, e)
  const cw = lerp(560, 220, e)
  const chh = cw * 0.52
  const baseY = 830
  // 车身
  ctx.fillStyle = '#243441'
  ctx.beginPath()
  ctx.moveTo(cx - cw / 2, baseY)
  ctx.lineTo(cx - cw / 2, baseY - chh * 0.55)
  ctx.quadraticCurveTo(cx, baseY - chh * 1.05, cx + cw / 2, baseY - chh * 0.55)
  ctx.lineTo(cx + cw / 2, baseY)
  ctx.closePath()
  ctx.fill()
  // 后窗
  ctx.fillStyle = hexA('#8FB6D4', 0.2 * (1 - e * 0.5))
  ctx.beginPath()
  ctx.roundRect(cx - cw * 0.27, baseY - chh * 0.78, cw * 0.54, chh * 0.32, 6)
  ctx.fill()
  // 轮子
  ctx.fillStyle = '#05080B'
  ctx.beginPath()
  ctx.arc(cx - cw * 0.32, baseY, chh * 0.16, 0, Math.PI * 2)
  ctx.arc(cx + cw * 0.32, baseY, chh * 0.16, 0, Math.PI * 2)
  ctx.fill()
  // 尾灯
  const fade = 1 - clamp01((t - 0.72) / 0.28)
  if (fade > 0.02) {
    ;[-1, 1].forEach((s) => {
      glow(ctx, cx + s * cw * 0.38, baseY - chh * 0.38, 220 * fade, '#D4453A', 0.45 * fade)
      ctx.fillStyle = hexA('#FF6A55', fade)
      ctx.beginPath()
      ctx.roundRect(cx + s * cw * 0.38 - 14, baseY - chh * 0.44, 28, 22, 6)
      ctx.fill()
    })
  }
  // 车底的影
  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.beginPath()
  ctx.ellipse(cx, baseY + 6, cw * 0.5, 14, 0, 0, Math.PI * 2)
  ctx.fill()

  // 孩子站在路口
  const sway = Math.sin(f * 0.04) * 1.5
  ctx.fillStyle = hexA('#000000', 0.4)
  ctx.beginPath()
  ctx.ellipse(330, 932, 90, 11, 0, 0, Math.PI * 2)
  ctx.fill()
  person(ctx, { x: 330 + sway, y: 930, h: 460, hair: 'bob', back: true, fill: C.cream })
  // 车灯在他身上的反光
  if (fade > 0.1) {
    ctx.strokeStyle = hexA('#D4453A', 0.25 * fade)
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(330 + sway, 930 - 0.805 * 460, 0.086 * 460, Math.PI * 1.6, Math.PI * 0.35)
    ctx.stroke()
  }

  const dark = clamp01((t - 0.9) / 0.1)
  if (dark > 0) {
    ctx.fillStyle = `rgba(4,7,10,${0.55 * dark})`
    ctx.fillRect(0, 0, W, H)
  }

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.24)
}
export const CUTS_E = [0, 90, 165, 240, 360, 450, 510, 630, 720, 825, 885, 975]

export const SHOT_E = [
  { fn: praised, dur: 90 },
  { fn: rubSeam, dur: 75 },
  { fn: patHead, dur: 75 },
  { fn: medicine, dur: 120 },
  { fn: rewrite, dur: 90 },
  { fn: seatChart, dur: 60 },
  { fn: parentsRow, dur: 120 },
  { fn: packBag, dur: 90 },
  { fn: zipUp, dur: 105 },
  { fn: doorway, dur: 60 },
  { fn: departure, dur: 90 },
]
