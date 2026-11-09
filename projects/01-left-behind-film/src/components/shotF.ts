import {
  W, H, C, clamp01, lerp, eio, eout, ein, hexA, lg, glow, prng,
  person, hand, vignette, grain,
} from './stage'

const SANS = '"Noto Sans SC", sans-serif'
const SERIF = '"Noto Serif SC", serif'
const WARM = '#FFC98A'
const WARM_D = '#E9A94B'
const COLD = '#9CBBD4'
const PAPER = '#E7DFCF'
const INKC = '#22282e'
const INK2 = '#06090C'

/* 镜 48｜手机屏占满画面，短视频一条条往上滑 */
export function doomscroll(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#070C11'
  ctx.fillRect(0, 0, W, H)

  // 屏幕：有边框、有圆角
  const sx = 300
  const sy = 20
  const sw = 1320
  const sh = 1040
  ctx.fillStyle = '#05080B'
  ctx.beginPath()
  ctx.roundRect(sx - 16, sy - 16, sw + 32, sh + 32, 48)
  ctx.fill()
  ctx.fillStyle = '#0C141B'
  ctx.beginPath()
  ctx.roundRect(sx, sy, sw, sh, 34)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(sx, sy, sw, sh, 34)
  ctx.clip()

  // 一条一条往上划的短视频
  const speed = 260 + 1100 * t * t
  const offset = f * speed * 0.055
  for (let i = 0; i < 4; i++) {
    const y = sy + ((i * 780 - offset) % 3120 + 3120) % 3120 - 300
    const hue = (i * 41) % 90
    // 画面
    ctx.fillStyle = `rgb(${44 + hue},${56 + hue * 0.5},${70 + hue * 0.55})`
    ctx.fillRect(sx, y, sw, 720)
    // 画面里的东西：轮廓柔和的色块
    ctx.fillStyle = hexA(WARM, 0.12)
    ctx.beginPath()
    ctx.ellipse(sx + 520, y + 380, 260, 210, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = hexA(COLD, 0.1)
    ctx.fillRect(sx + 860, y + 160, 380, 420)
    // 运动模糊：上一条的残影
    ctx.fillStyle = hexA('#0C141B', 0.35)
    ctx.fillRect(sx, y - 60, sw, 60)

    // 右侧：点赞、评论、分享的轮廓
    ctx.strokeStyle = hexA('#E8F1F6', 0.55)
    ctx.lineWidth = 5
    const ix = sx + sw - 90
    ;[0, 1, 2].forEach((k) => {
      const iy = y + 400 + k * 110
      ctx.beginPath()
      if (k === 0) {
        ctx.arc(ix, iy, 26, Math.PI * 0.15, Math.PI * 1.85)
        ctx.moveTo(ix, iy - 26)
        ctx.lineTo(ix, iy + 26)
      } else if (k === 1) {
        ctx.roundRect(ix - 30, iy - 26, 60, 46, 16)
        ctx.moveTo(ix - 10, iy + 20)
        ctx.lineTo(ix - 16, iy + 34)
      } else {
        ctx.moveTo(ix - 26, iy)
        ctx.lineTo(ix + 26, iy)
        ctx.moveTo(ix + 8, iy - 18)
        ctx.lineTo(ix + 26, iy)
        ctx.lineTo(ix + 8, iy + 18)
      }
      ctx.stroke()
    })

    // 底部：账号和文案的两条线
    ctx.fillStyle = hexA('#E8F1F6', 0.4)
    ctx.fillRect(sx + 60, y + 600, 300, 14)
    ctx.fillRect(sx + 60, y + 634, 520, 10)
    ctx.fillStyle = hexA('#05080B', 0.9)
    ctx.fillRect(sx, y + 720, sw, 60)
  }

  // 顶部状态栏
  ctx.fillStyle = hexA('#05080B', 0.55)
  ctx.fillRect(sx, sy, sw, 120)
  ctx.fillStyle = hexA('#E8F1F6', 0.85)
  ctx.font = `500 40px ${SANS}`
  const hh = 21 + Math.floor(t * 4.2)
  ctx.fillText(`${String(hh).padStart(2, '0')}:${String(Math.floor((f * 3) % 60)).padStart(2, '0')}`, sx + 50, sy + 74)

  // 底部的一条进度
  ctx.fillStyle = hexA('#E8F1F6', 0.25)
  ctx.fillRect(sx + 40, sy + sh - 60, sw - 80, 6)
  ctx.fillStyle = hexA('#E8F1F6', 0.7)
  ctx.fillRect(sx + 40, sy + sh - 60, (sw - 80) * ((f % 60) / 60), 6)

  ctx.restore()

  // 屏幕外的一圈暗
  const edge = ctx.createRadialGradient(960, 540, 600, 960, 540, 1200)
  edge.addColorStop(0, 'rgba(0,0,0,0)')
  edge.addColorStop(1, 'rgba(0,0,0,0.8)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, W, H)

  grain(ctx, gr, f, 0.2)
}

/* 镜 49｜时间 21:00 → 23:00 → 01:00，黑暗里只有屏幕 */
export function timeSkip(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#070C11'
  ctx.fillRect(0, 0, W, H)

  // 墙与床沿
  ctx.fillStyle = '#0F1821'
  ctx.fillRect(0, 0, W, 520)
  ctx.fillStyle = '#0A1118'
  ctx.fillRect(0, 520, W, H - 520)
  ctx.fillStyle = hexA(COLD, 0.08)
  ctx.fillRect(0, 520, W, 3)

  // 黑暗里低着头的人：只有一圈极淡的轮廓
  const sway = Math.sin(f * 0.03) * 2
  ctx.strokeStyle = hexA('#5E7488', 0.35)
  ctx.lineWidth = 4
  ctx.beginPath()
  // 头
  ctx.arc(700 + sway, 420, 96, Math.PI * 0.85, Math.PI * 2.2)
  // 拱起来的背
  ctx.moveTo(700 + sway - 92, 470)
  ctx.quadraticCurveTo(700 + sway - 190, 700, 640 + sway, 900)
  ctx.lineTo(980 + sway, 900)
  ctx.quadraticCurveTo(860 + sway, 700, 800 + sway, 470)
  ctx.stroke()
  // 弓着的脖子
  ctx.beginPath()
  ctx.moveTo(700 + sway + 40, 500)
  ctx.quadraticCurveTo(760 + sway, 540, 790 + sway, 500)
  ctx.stroke()

  // 屏幕
  glow(ctx, 1180, 760, 900, WARM, 0.16)
  ctx.fillStyle = '#05080B'
  ctx.beginPath()
  ctx.roundRect(1000, 640, 420, 620, 34)
  ctx.fill()
  ctx.fillStyle = lg(ctx, 0, 660, 0, 1240, [[0, '#FFF3DC'], [1, WARM_D]])
  ctx.beginPath()
  ctx.roundRect(1016, 656, 388, 588, 26)
  ctx.fill()

  const times = ['21:00', '23:00', '01:00']
  const idx = Math.min(2, Math.floor(t * 3))
  const k = (t * 3) % 1
  const blink = idx < 2 ? 1 - clamp01((k - 0.82) / 0.18) : 1
  ctx.save()
  ctx.globalAlpha = 0.4 + 0.6 * blink
  ctx.fillStyle = hexA(INKC, 0.9)
  ctx.font = `300 96px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText(times[idx], 1210, 980)
  ctx.textAlign = 'left'
  ctx.restore()

  // 屏幕光打到脸上
  glow(ctx, 1000, 780, 420, WARM, 0.14)

  vignette(ctx, 0.66)
  grain(ctx, gr, f, 0.26)
}

/* 镜 50｜最后一排，趴着睡；黑板上 100 天被擦掉一半 */
export function lastRow(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0E1720'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = lg(ctx, 0, 0, 760, 0, [[0, hexA(COLD, 0.1)], [1, hexA(COLD, 0)]])
  ctx.fillRect(0, 0, W, H)

  // 黑板
  ctx.fillStyle = '#18241E'
  ctx.fillRect(1000, 90, 800, 330)
  ctx.strokeStyle = hexA('#7C8F84', 0.4)
  ctx.lineWidth = 10
  ctx.strokeRect(1000, 90, 800, 330)
  ctx.fillStyle = hexA('#C9D8D0', 0.62)
  ctx.font = `500 58px ${SANS}`
  ctx.fillText('距中考', 1060, 240)
  ctx.fillText('天', 1440, 240)
  // “100”被粗暴抹掉一半：先画数字，再盖上一层粉笔灰
  ctx.fillStyle = hexA('#C9D8D0', 0.5)
  ctx.fillText('100', 1280, 240)
  ctx.save()
  const sm = ctx.createRadialGradient(1360, 222, 30, 1360, 222, 130)
  sm.addColorStop(0, hexA('#1B2A24', 0.92))
  sm.addColorStop(0.6, hexA('#1B2A24', 0.75))
  sm.addColorStop(1, hexA('#1B2A24', 0))
  ctx.fillStyle = sm
  ctx.beginPath()
  ctx.ellipse(1352, 222, 120, 78, -0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // 擦不干净的几笔
  ctx.strokeStyle = hexA('#C9D8D0', 0.3)
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(1300, 196)
  ctx.lineTo(1308, 262)
  ctx.moveTo(1330, 200)
  ctx.lineTo(1346, 258)
  ctx.stroke()
  // 板擦来回抹出来的粉笔灰
  ctx.fillStyle = hexA('#C9D8D0', 0.1)
  for (let i = 0; i < 8; i++) {
    ctx.beginPath()
    ctx.ellipse(1290 + i * 34, 236 + Math.sin(i * 1.7) * 12, 54, 20, -0.2, 0, Math.PI * 2)
    ctx.fill()
  }
  // 课桌
  for (let r = 0; r < 3; r++) {
    const sc = 1 - r * 0.1
    const yy = 620 + r * 110
    for (let c = 0; c < 4; c++) {
      const xx = 320 + c * 320 * sc + r * 20
      ctx.fillStyle = '#1E2A35'
      ctx.beginPath()
      ctx.roundRect(xx - 130, yy, 260, 18, 6)
      ctx.fill()
      ctx.fillStyle = '#141D25'
      ctx.fillRect(xx - 120, yy + 18, 10, 70)
      ctx.fillRect(xx + 110, yy + 18, 10, 70)
    }
  }

  // 最后一排中间那个：趴在桌上睡
  const xx = 320 + 1 * 320 + 2 * 20
  const yy = 620 + 2 * 110
  // 背：从桌面拱起来的一块
  ctx.fillStyle = hexA(C.cream, 0.92)
  ctx.beginPath()
  ctx.ellipse(xx + 16, yy - 44, 118, 58, -0.04, Math.PI, Math.PI * 2)
  ctx.closePath()
  ctx.fill()
  // 后脑勺：压在手臂上
  ctx.beginPath()
  ctx.ellipse(xx - 92, yy - 34, 52, 44, 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hexA('#121A21', 0.92)
  ctx.beginPath()
  ctx.ellipse(xx - 98, yy - 44, 48, 38, 0.22, 0, Math.PI * 2)
  ctx.fill()
  // 脸埋在臂弯里：一条暗缝
  ctx.strokeStyle = hexA('#000000', 0.18)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(xx - 60, yy - 24)
  ctx.lineTo(xx - 96, yy - 16)
  ctx.stroke()
  // 弯折的手臂，压在桌上
  ctx.fillStyle = hexA(C.cream, 0.88)
  ctx.beginPath()
  ctx.roundRect(xx - 60, yy - 26, 190, 26, 13)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(xx + 120, yy - 20, 56, 22, 11)
  ctx.fill()
  // 垂下来的手
  ctx.beginPath()
  ctx.ellipse(xx + 168, yy - 8, 26, 18, 0.2, 0, Math.PI * 2)
  ctx.fill()

  vignette(ctx, 0.48)
  grain(ctx, gr, f, 0.22)
}

/* 镜 51｜"监护人"那一栏空着，笔尖悬着，纸上压出一个点 */
export function guardian(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0F181F'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1400, 240, 800, WARM, 0.1)

  ctx.save()
  ctx.translate(300, 160)
  ctx.rotate(-0.02)
  ctx.fillStyle = hexA('#000000', 0.45)
  ctx.fillRect(16, 18, 1320, 760)
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, 1320, 760)

  ctx.fillStyle = hexA(INKC, 0.55)
  ctx.font = `500 38px ${SANS}`
  ctx.fillText('义务教育阶段学生登记表', 90, 90)
  ctx.fillStyle = hexA(INKC, 0.16)
  ctx.fillRect(90, 110, 1140, 2)

  const rows = ['姓　　名', '监护人', '联系电话', '家庭住址']
  rows.forEach((r, i) => {
    const yy = 230 + i * 130
    ctx.fillStyle = hexA(INKC, 0.65)
    ctx.font = `400 40px ${SANS}`
    ctx.fillText(r, 90, yy)
    ctx.fillStyle = hexA(INKC, 0.15)
    ctx.fillRect(360, yy + 14, 760, 2)
  })
  ctx.fillStyle = hexA(INKC, 0.35)
  ctx.font = `400 40px ${SANS}`
  ctx.fillText('（空）', 380, 364)

  // 墨水点：慢慢洇开
  const press = clamp01((f - 20) / (dur * 0.6))
  const r = 4 + press * 12
  const ink = ctx.createRadialGradient(620, 372, 0, 620, 372, r * 3.2)
  ink.addColorStop(0, hexA('#1A1F26', 0.9 * press))
  ink.addColorStop(0.45, hexA('#1A1F26', 0.5 * press))
  ink.addColorStop(1, hexA('#1A1F26', 0))
  ctx.fillStyle = ink
  ctx.beginPath()
  ctx.arc(620, 372, r * 3.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 笔：有笔尖，笔尖正对着那个点
  const drop = eout(clamp01((f - 12) / (dur * 0.55)))
  const tx = 300 + 620
  const ty = 160 + lerp(110, 356, drop)
  ctx.save()
  ctx.strokeStyle = '#0B1116'
  ctx.lineCap = 'round'
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(tx + 16, ty - 10)
  ctx.lineTo(tx + 220, ty - 168)
  ctx.stroke()
  // 笔尖
  ctx.fillStyle = '#0B1116'
  ctx.beginPath()
  ctx.moveTo(tx + 2, ty + 2)
  ctx.lineTo(tx + 26, ty - 12)
  ctx.lineTo(tx + 20, ty + 12)
  ctx.closePath()
  ctx.fill()
  // 笔尖的一点金属
  ctx.fillStyle = hexA('#D5E0E8', 0.8)
  ctx.beginPath()
  ctx.arc(tx + 8, ty - 2, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  vignette(ctx, 0.46)
  grain(ctx, gr, f, 0.2)
}

/* 镜 52｜笔放下，表格被推开 */
export function pushAside(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#0F181F'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, 1400, 240, 700, WARM, 0.08)

  const push = eio(clamp01((t - 0.25) / 0.45))
  const speed = clamp01((t - 0.25) / 0.18) * (1 - clamp01((t - 0.55) / 0.2))

  // 纸：被推走时带三层残影
  for (let g = 3; g >= 0; g--) {
    const gp = clamp01(push - g * 0.05 * speed)
    ctx.save()
    ctx.globalAlpha = g === 0 ? 1 : 0.16 * speed
    ctx.translate(lerp(300, 180, gp), lerp(160, 240, gp))
    ctx.rotate(-0.02 + gp * 0.12)
    ctx.fillStyle = hexA('#000000', 0.45)
    ctx.fillRect(16, 18, 1320, 760)
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, 1320, 760)
    if (g === 0) {
      ctx.fillStyle = hexA(INKC, 0.5)
      ctx.font = `500 38px ${SANS}`
      ctx.fillText('义务教育阶段学生登记表', 90, 90)
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = hexA(INKC, 0.12)
        ctx.fillRect(90, 330 + i * 130, 1140, 2)
      }
      ctx.fillStyle = hexA(INKC, 0.4)
      ctx.font = `400 36px ${SANS}`
      ctx.fillText('监护人', 90, 360)
      ctx.fillText('（空）', 380, 364)
    }
    ctx.restore()
  }

  // 笔躺在纸边上
  const lay = eout(clamp01(t / 0.3))
  ctx.save()
  ctx.strokeStyle = '#0B1116'
  ctx.lineCap = 'round'
  ctx.lineWidth = 16
  ctx.translate(lerp(700, 1480, lay), lerp(330, 900, lay))
  ctx.rotate(lerp(0.6, 1.45, lay))
  ctx.beginPath()
  ctx.moveTo(-120, 0)
  ctx.lineTo(120, 0)
  ctx.stroke()
  ctx.restore()

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.2)
}

/* 镜 53｜流水线：手在传送带上取放零件 */
export function line(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0C141B'
  ctx.fillRect(0, 0, W, H)

  ;[400, 960, 1520].forEach((lx) => {
    glow(ctx, lx, 120, 420, '#DCEAF5', 0.12)
    ctx.fillStyle = hexA('#DCEAF5', 0.6)
    ctx.beginPath()
    ctx.arc(lx, 110, 12, 0, Math.PI * 2)
    ctx.fill()
  })

  // 传送带
  ctx.fillStyle = '#1A242D'
  ctx.fillRect(0, 820, W, 70)
  ctx.fillStyle = hexA(COLD, 0.14)
  ctx.fillRect(0, 820, W, 4)
  // 正在流过去的零件
  for (let i = 0; i < 10; i++) {
    const px = ((i * 260 + f * 7) % 2900) - 200
    ctx.fillStyle = '#3C5164'
    ctx.beginPath()
    ctx.roundRect(px, 796, 90, 26, 8)
    ctx.fill()
  }

  // 工位框架
  ctx.fillStyle = '#16212A'
  ctx.fillRect(1200, 300, 60, 520)
  ctx.fillRect(1560, 300, 60, 520)
  ctx.fillRect(1200, 300, 420, 40)

  // 站在工位上的人
  const sway = Math.sin(f * 0.08) * 3
  person(ctx, { x: 1380 + sway, y: 820, h: 440, hair: 'cap', fill: C.cream, arm: 0.2 })

  // 两只手伸到传送带上，抓、拧
  const cyc = (f * 0.12) % 1
  const dip = Math.sin(cyc * Math.PI * 2) * 18
  const grab = eout(clamp01((Math.sin(cyc * Math.PI * 2) + 1) / 2))
  ctx.save()
  ctx.strokeStyle = C.cream
  ctx.lineWidth = 0.062 * 440
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(1380 + sway + 0.07 * 440, 820 - 0.7 * 440)
  ctx.quadraticCurveTo(1380 + sway + 0.2 * 440, 820 - 0.5 * 440, 1380 + sway + 0.24 * 440, 800 + dip)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(1380 + sway - 0.07 * 440, 820 - 0.7 * 440)
  ctx.quadraticCurveTo(1380 + sway - 0.2 * 440, 820 - 0.5 * 440, 1380 + sway - 0.22 * 440, 800 + dip)
  ctx.stroke()
  ctx.restore()
  // 两条前臂的末端收在传送带上（不画手）
  ctx.fillStyle = C.cream
  ctx.beginPath()
  ctx.ellipse(1380 + sway + 0.25 * 440, 806 + dip, 30, 20, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(1380 + sway - 0.23 * 440, 806 + dip, 30, 20, -0.3, 0, Math.PI * 2)
  ctx.fill()
  // 手上那个零件
  ctx.fillStyle = '#4B6275'
  ctx.beginPath()
  ctx.roundRect(1380 + sway - 60, 790 + dip, 110, 26, 8)
  ctx.fill()
  void grab

  ctx.strokeStyle = hexA(COLD, 0.4)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(1380 + sway, 820 - 0.805 * 440, 0.086 * 440, Math.PI * 1.1, Math.PI * 1.9)
  ctx.stroke()

  vignette(ctx, 0.56)
  grain(ctx, gr, f, 0.24)
}

/* 镜 54｜和当年父亲同一个位置 */
export function sameSpot(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#0C141B'
  ctx.fillRect(0, 0, W, H)
  // 顶上的冷光
  glow(ctx, 960, 220, 700, '#DCEAF5', 0.14)

  // 工位
  ctx.strokeStyle = hexA('#8FA9C4', 0.18)
  ctx.lineWidth = 6
  ctx.strokeRect(560, 240, 800, 700)
  ctx.fillStyle = '#16212A'
  ctx.fillRect(560, 240, 800, 40)

  // 地上一个标线
  ctx.fillStyle = hexA(WARM, 0.22)
  ctx.beginPath()
  ctx.ellipse(960, 900, 160, 26, 0, 0, Math.PI * 2)
  ctx.fill()

  // 父亲的影子：在他身后错开半步，佝偻着
  ctx.save()
  ctx.globalAlpha = 0.35
  person(ctx, { x: 1004, y: 900, h: 500, hair: 'cap', fill: hexA(COLD, 0.5), lean: 0.12 })
  ctx.restore()
  // 儿子站在同一个位置上
  person(ctx, { x: 960, y: 900, h: 500, hair: 'cap', fill: C.cream })
  // 两边的冷边
  ctx.strokeStyle = hexA('#DCEAF5', 0.5)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(960, 900 - 0.805 * 500, 0.086 * 500, Math.PI * 1.1, Math.PI * 1.9)
  ctx.stroke()

  vignette(ctx, 0.54)
  grain(ctx, gr, f, 0.24)
  void dur
  void f
}

/* 镜 55｜两个剪影叠化成一个 */
export function dissolve(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#0B1319'
  ctx.fillRect(0, 0, W, H)
  // 工位上方的冷光
  glow(ctx, 960, 240, 760, '#DCEAF5', 0.14)

  // 父亲：先实后淡，背是驼的
  ctx.save()
  ctx.globalAlpha = 1 - eio(t) * 0.85
  person(ctx, { x: 930, y: 900, h: 520, hair: 'cap', fill: hexA(C.cream, 0.7), lean: 0.13 })
  ctx.restore()

  // 儿子：先淡后实，背是直的
  ctx.save()
  ctx.globalAlpha = 0.15 + 0.85 * eio(t)
  person(ctx, { x: 990, y: 900, h: 500, hair: 'cap', fill: C.cream, lean: 0.01 })
  ctx.restore()

  // 叠化的一瞬：两个人的轮廓重合处有一点暖
  ctx.fillStyle = hexA(WARM, 0.1 * (1 - Math.abs(t - 0.5) * 2))
  ctx.beginPath()
  ctx.ellipse(960, 640, 170, 280, 0, 0, Math.PI * 2)
  ctx.fill()

  const dark = clamp01((t - 0.85) / 0.15)
  if (dark > 0) {
    ctx.fillStyle = `rgba(4,7,10,${0.7 * dark})`
    ctx.fillRect(0, 0, W, H)
  }

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.24)
}

/* 镜 56｜回到村口，同一机位，霜没有了 */
export function sameRoad(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  // 破晓：天是深蓝的，不是黑的
  ctx.fillStyle = lg(ctx, 0, 0, 0, 660, [[0, '#0C1626'], [0.6, '#16263A'], [1, '#2A3F56']])
  ctx.fillRect(0, 0, W, H)

  // 村子轮廓
  ctx.fillStyle = '#0A121A'
  ;[[60, 558, 210], [290, 586, 150], [500, 570, 180], [1390, 564, 220], [1640, 588, 160], [1810, 568, 130]].forEach(([hx, hy, hw]) => {
    ctx.fillRect(hx, hy, hw, 660 - hy)
    ctx.beginPath()
    ctx.moveTo(hx - 12, hy)
    ctx.lineTo(hx + hw / 2, hy - hw * 0.22)
    ctx.lineTo(hx + hw + 12, hy)
    ctx.closePath()
    ctx.fill()
  })

  // 土路：霜化了，路面反着一点天亮
  ctx.fillStyle = lg(ctx, 0, 640, 0, H, [[0, '#33465A'], [0.4, '#26343F'], [1, '#141D25']])
  ctx.beginPath()
  ctx.moveTo(902, 650)
  ctx.lineTo(1020, 650)
  ctx.lineTo(1840, H)
  ctx.lineTo(80, H)
  ctx.closePath()
  ctx.fill()

  // 车辙
  ctx.strokeStyle = hexA('#101A22', 0.55)
  ctx.lineWidth = 30
  ctx.beginPath()
  ctx.moveTo(944, 656)
  ctx.lineTo(620, H)
  ctx.moveTo(978, 656)
  ctx.lineTo(1320, H)
  ctx.stroke()

  // 湿的路面：反光条
  const r = prng(4471)
  for (let i = 0; i < 90; i++) {
    const v = r()
    const yy = lerp(670, H, v * v)
    const half = lerp(16, 900, Math.pow(v, 1.35))
    const xx = 960 + (r() - 0.5) * 2 * half
    ctx.fillStyle = hexA('#9CBBD4', 0.05 + 0.12 * r() * v)
    ctx.fillRect(xx, yy, 20 + v * 60, 2 + v * 2)
  }

  // 破晓的一线光
  glow(ctx, 960, 620, 1100, '#5C7FA8', 0.12)

  // 孩子站在路口
  person(ctx, { x: 640, y: 940, h: 420, hair: 'bob', back: true, fill: hexA(C.cream, 0.92) })

  vignette(ctx, 0.55)
  grain(ctx, gr, f, 0.24)
  void dur
  void f
}

/* 镜 57｜地图上亮起 1550 万个点 */
export function dots(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  const t = clamp01(f / dur)
  ctx.fillStyle = '#0A1218'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = hexA('#6E93B0', 0.07)
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

  const r = prng(2024)
  const n = 2600
  for (let i = 0; i < n; i++) {
    const x = r() * W
    const y = r() * H
    const d = clamp01((t * 1.5 - (x / W) * 0.45 - (y / H) * 0.15) / 0.3)
    if (d <= 0) continue
    ctx.fillStyle = hexA(WARM, 0.5 * d)
    ctx.beginPath()
    ctx.arc(x, y, 2.4 * d + 0.7, 0, Math.PI * 2)
    ctx.fill()
  }
  // 整体的一层微光，让它像一片光海
  glow(ctx, W / 2, H / 2, 900, WARM, 0.06 * t)

  vignette(ctx, 0.46)
  grain(ctx, gr, f, 0.2)
}

/* 镜 58｜字占满屏 */
export function statement(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#070B0E'
  ctx.fillRect(0, 0, W, H)
  glow(ctx, W / 2, H / 2, 1100, '#2A3B4A', 0.1)

  const t = clamp01(f / dur)
  const lines = ['他们不缺吃穿。', '缺的是那个签字的人。']
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  lines.forEach((l, i) => {
    const k = clamp01((t - 0.06 - i * 0.14) / 0.16)
    if (k <= 0) return
    ctx.save()
    ctx.globalAlpha = eout(k)
    ctx.translate(0, (1 - eout(k)) * 22)
    ctx.fillStyle = i === 1 ? WARM : C.cream
    ctx.font = `500 ${i === 1 ? 86 : 82}px ${SERIF}`
    ctx.fillText(l, W / 2, H / 2 - 40 + i * 130)
    ctx.restore()
  })
  ctx.textAlign = 'left'

  vignette(ctx, 0.5)
  grain(ctx, gr, f, 0.2)
}

/* 镜 59｜黑场，只留一行字 */
export function lastWord(ctx: CanvasRenderingContext2D, f: number, dur: number, gr: HTMLCanvasElement) {
  ctx.fillStyle = '#050708'
  ctx.fillRect(0, 0, W, H)
  const t = clamp01(f / dur)
  const k = clamp01((t - 0.12) / 0.22)
  ctx.save()
  ctx.globalAlpha = eout(k)
  ctx.textAlign = 'center'
  ctx.fillStyle = hexA(C.cream, 0.92)
  ctx.font = `400 54px ${SANS}`
  ctx.fillText('下一次视频，别只问成绩。', W / 2, H / 2)
  ctx.textAlign = 'left'
  ctx.restore()

  const fade = clamp01((t - 0.86) / 0.14)
  if (fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fade})`
    ctx.fillRect(0, 0, W, H)
  }
  grain(ctx, gr, f, 0.18)
}

export const CUTS_F = [0, 90, 195, 315, 375, 465, 555, 630, 705, 780, 900, 1005, 1095]

export const SHOT_F = [
  { fn: doomscroll, dur: 90 },
  { fn: timeSkip, dur: 105 },
  { fn: lastRow, dur: 120 },
  { fn: guardian, dur: 60 },
  { fn: pushAside, dur: 90 },
  { fn: line, dur: 90 },
  { fn: sameSpot, dur: 75 },
  { fn: dissolve, dur: 75 },
  { fn: sameRoad, dur: 75 },
  { fn: dots, dur: 120 },
  { fn: statement, dur: 105 },
  { fn: lastWord, dur: 90 },
]
