/**
 * 星渊粒子引擎：视差星空 + 流星 + 粒子迸发。
 *
 * 单例模式：StarfieldCanvas 挂载时初始化，全局共享一个 rAF 循环。
 * burst() 供答题反馈等场景在视口任意坐标触发粒子迸发。
 * prefers-reduced-motion 时只渲染一帧静态星野，burst 为空操作。
 */

interface Star {
  x: number // 0~1 相对坐标
  y: number
  r: number // 半径 px
  depth: number // 视差深度 0.2 / 0.5 / 1
  phase: number // 闪烁相位
  speed: number // 闪烁速度
  tint: string
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  r: number
  color: string
}

const STAR_TINTS = ['#eef0fa', '#eef0fa', '#b3a6ff', '#ecd27a']
const BURST_COLORS = ['#f4e3a1', '#ecd27a', '#d4af37', '#b3a6ff', '#eef0fa']

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let stars: Star[] = []
let meteors: Meteor[] = []
let particles: Particle[] = []
let mouseX = 0.5
let mouseY = 0.5
let rafId = 0
let lastTime = 0
let meteorTimer = 0
let reducedMotion = false

function resize() {
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function initStars() {
  const count = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 9000))
  const depths = [0.2, 0.5, 1]
  stars = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.4 + Math.random() * 1.2,
    depth: depths[Math.floor(Math.random() * depths.length)],
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 1.2,
    tint: STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)],
  }))
}

function spawnMeteor() {
  const fromLeft = Math.random() > 0.5
  const speed = 380 + Math.random() * 260
  const angle = (fromLeft ? 1 : -1) * (Math.PI / 6 + Math.random() * Math.PI / 8)
  meteors.push({
    x: Math.random() * window.innerWidth,
    y: -20,
    vx: Math.sin(angle) * speed,
    vy: Math.cos(angle) * speed,
    life: 0,
    maxLife: 1.4 + Math.random() * 0.6,
  })
}

function drawFrame(time: number) {
  if (!ctx || !canvas) return
  const w = window.innerWidth
  const h = window.innerHeight
  ctx.clearRect(0, 0, w, h)

  // 星野：按深度做鼠标视差 + 闪烁
  const px = (mouseX - 0.5) * 36
  const py = (mouseY - 0.5) * 24
  for (const s of stars) {
    const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase + time * s.speed))
    ctx.globalAlpha = twinkle * (0.35 + s.depth * 0.65)
    ctx.fillStyle = s.tint
    ctx.beginPath()
    ctx.arc(s.x * w - px * s.depth, s.y * h - py * s.depth, s.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // 流星：短尾亮线
  for (const m of meteors) {
    const t = m.life / m.maxLife
    const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8
    const tailX = m.x - m.vx * 0.14
    const tailY = m.y - m.vy * 0.14
    const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY)
    grad.addColorStop(0, `rgba(238, 240, 250, ${0.9 * alpha})`)
    grad.addColorStop(1, 'rgba(179, 166, 255, 0)')
    ctx.globalAlpha = 1
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(m.x, m.y)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()
  }

  // 迸发粒子：重力 + 衰减
  for (const p of particles) {
    const t = p.life / p.maxLife
    ctx.globalAlpha = Math.max(0, 1 - t)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * (1 - t * 0.5), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function tick(now: number) {
  const dt = Math.min((now - lastTime) / 1000, 0.05)
  lastTime = now
  const time = now / 1000

  meteorTimer -= dt
  if (meteorTimer <= 0) {
    spawnMeteor()
    meteorTimer = 4 + Math.random() * 6
  }

  for (const m of meteors) {
    m.life += dt
    m.x += m.vx * dt
    m.y += m.vy * dt
  }
  meteors = meteors.filter((m) => m.life < m.maxLife && m.y < window.innerHeight + 40)

  for (const p of particles) {
    p.life += dt
    p.vy += 340 * dt // 重力
    p.vx *= 1 - 1.6 * dt // 阻力
    p.x += p.vx * dt
    p.y += p.vy * dt
  }
  particles = particles.filter((p) => p.life < p.maxLife)

  drawFrame(time)
  rafId = requestAnimationFrame(tick)
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX / window.innerWidth
  mouseY = e.clientY / window.innerHeight
}

function onResize() {
  resize()
  initStars()
  if (reducedMotion) drawFrame(0)
}

/**
 * 挂载星野画布，返回清理函数。
 */
export function mountStarfield(el: HTMLCanvasElement): () => void {
  canvas = el
  ctx = el.getContext('2d')
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  initStars()

  window.addEventListener('resize', onResize)

  if (reducedMotion) {
    drawFrame(0)
  } else {
    window.addEventListener('mousemove', onMouseMove)
    meteorTimer = 2 + Math.random() * 3
    lastTime = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('mousemove', onMouseMove)
    canvas = null
    ctx = null
    stars = []
    meteors = []
    particles = []
  }
}

/**
 * 金色粒子雨：从屏幕顶部洒落（升级/通关仪式用）。
 */
export function rain(count = 90) {
  if (!ctx || reducedMotion) return
  const w = window.innerWidth
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: -10 - Math.random() * window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 60,
      vy: 120 + Math.random() * 140,
      life: 0,
      maxLife: 2.2 + Math.random() * 1.4,
      r: 1 + Math.random() * 2,
      color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
    })
  }
}

/**
 * 在视口坐标 (x, y) 触发粒子迸发（答对反馈等）。
 */
export function burst(
  x: number,
  y: number,
  opts: { count?: number; colors?: string[]; speed?: number } = {},
) {
  if (!ctx || reducedMotion) return
  const { count = 48, colors = BURST_COLORS, speed = 260 } = opts
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const v = speed * (0.3 + Math.random() * 0.9)
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - speed * 0.35, // 略向上抛
      life: 0,
      maxLife: 0.8 + Math.random() * 0.7,
      r: 1 + Math.random() * 2.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  }
}
