import type { Directive } from 'vue'

/**
 * v-tilt：卡片 3D 倾斜指令。
 * 鼠标在元素上移动时按位置产生 rotateX/rotateY 透视倾斜，
 * 同时写入 --glare-x/--glare-y CSS 变量供 .tilt-glare 高光跟随。
 * 用法：v-tilt="true|false"（false 时禁用，如锁定卡片）。
 * 触屏与 prefers-reduced-motion 下自动不启用。
 */

interface TiltEl extends HTMLElement {
  _tiltCleanup?: () => void
  _tiltEnabled?: boolean
}

const MAX_X = 7 // 最大俯仰角
const MAX_Y = 9 // 最大偏航角

export const vTilt: Directive<TiltEl, boolean | undefined> = {
  mounted(el, binding) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (reduced || !finePointer) return

    el._tiltEnabled = binding.value !== false
    el.style.transition = 'transform 0.18s ease-out'
    el.style.willChange = 'transform'

    const onMove = (e: MouseEvent) => {
      if (!el._tiltEnabled) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      const rx = (0.5 - py) * MAX_X
      const ry = (px - 0.5) * MAX_Y
      el.style.transform =
        `perspective(700px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`
      el.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`)
    }
    const onLeave = () => {
      el.style.transform = ''
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el._tiltCleanup = () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  },
  updated(el, binding) {
    el._tiltEnabled = binding.value !== false
    if (!el._tiltEnabled) el.style.transform = ''
  },
  unmounted(el) {
    el._tiltCleanup?.()
  },
}
