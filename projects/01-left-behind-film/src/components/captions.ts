import { caption, prng, hexA, W, H, C } from './stage'

// 每一镜左上角的一行字幕。null = 这一镜不写字（留白）。
type Lines = { t: string; c?: string }[] | null

export const CAPTIONS: Lines[][] = [
  // 段 1
  [
    null,
    null,
    null,
    [{ t: '班车会带走一批大人。', c: '#FFC98A' }],
    null,
    null,
    [{ t: '他们不回头。' }],
    [{ t: '孩子站在原地，' }, { t: '数车。', c: '#FFC98A' }],
    null,
    [{ t: '1550.56 万', c: '#FFC98A' }],
  ],
  // 段 2
  [
    [{ t: '父母离开' }, { t: '满三个月', c: '#FFC98A' }],
    [{ t: '就算“留守”' }],
    null,
    [{ t: '不是不想带。' }],
    [{ t: '是带不走。', c: '#FFC98A' }],
    null,
    [{ t: '村里的学校，在撤。' }],
    null,
    [{ t: '最近的一所，' }, { t: '八公里外。', c: '#FFC98A' }],
    [{ t: '于是有了寄宿。' }],
    null,
    [{ t: '熄灯以后' }],
    [{ t: '留下，是算过的账。', c: '#FFC98A' }],
  ],
  // 段 3
  [
    [{ t: '没有人叫他。' }],
    null,
    [{ t: '两碗饭。' }],
    [{ t: '一碗给奶奶。', c: '#FFC98A' }],
    [{ t: '妈妈买的。' }],
    [{ t: '签字栏里' }],
    [{ t: '写的是“奶”。', c: '#FFC98A' }],
    [{ t: '奶奶不会打字。' }],
    null,
    [{ t: '妈妈寄的。', c: '#FFC98A' }],
    null,
    [{ t: '门是反锁的。' }],
    [{ t: '47 次没接通。', c: '#FFC98A' }],
  ],
  // 段 4
  [
    [{ t: '“这孩子真懂事。”', c: '#FFC98A' }],
    null,
    [{ t: '懂事' }],
    [{ t: '生病也是自己扛。', c: '#FFC98A' }],
    null,
    [{ t: '家长会' }],
    [{ t: '来的是姑姑。', c: '#FFC98A' }],
    [{ t: '一年见一次。' }],
    null,
    null,
    null,
  ],
  // 段 5
  [
    [{ t: '手机是唯一的陪伴。' }],
    null,
    [{ t: '上课在睡。', c: '#FFC98A' }],
    [{ t: '该签的人' }],
    [{ t: '不在。', c: '#FFC98A' }],
    [{ t: '然后' }],
    [{ t: '轮到他了。', c: '#FFC98A' }],
    null,
    [{ t: '一年。' }],
    [{ t: '1550 万个', c: '#FFC98A' }],
    null,
    null,
  ],
]

export function drawCaption(
  ctx: CanvasRenderingContext2D,
  seg: number,
  idx: number,
  local: number,
  dur: number,
) {
  const lines = CAPTIONS[seg]?.[idx]
  if (!lines) return
  caption(ctx, { lines, f: local, start: 5, end: dur, size: 52 })
}

// 空气中一直有东西在飘：细尘、颗粒、缓慢的呼吸感
export function atmosphere(ctx: CanvasRenderingContext2D, f: number, seed: number) {
  const r = prng(seed)
  ctx.save()
  for (let i = 0; i < 26; i++) {
    const bx = r() * W
    const by = r() * H
    const sp = 0.15 + r() * 0.5
    const x = (bx + Math.sin(f * 0.006 + i) * 40 + f * sp * 0.25) % W
    const y = (by - f * sp * 0.35 + H) % H
    const a = 0.03 + r() * 0.05
    ctx.fillStyle = hexA('#DCE6EC', a)
    ctx.beginPath()
    ctx.arc(x, y, 1 + r() * 2.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  void C
}
