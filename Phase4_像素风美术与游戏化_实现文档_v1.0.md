# ArcanaCoder Phase 4 — 像素风美术与游戏化

> 完整实现文档 v1.0  
> 阶段目标：将纯色块占位替换为像素风美术，实现动态游戏效果  
> 前置条件：Phase 1-3 核心功能已完成并稳定运行  
> 预计周期：2 周（Week 7-8）

---

## 一、像素画素材清单（AI 生成）

### 1.1 角色类 — 贤者（主角）

| 素材 | 尺寸 | 帧数 | 用途 | AI 提示词 |
|------|------|------|------|-----------|
| 待机 | 32x32 | 3 | 主界面站立 | pixel art, female mage, brown hair, green eyes, purple robe with silver runes, wooden wand with green gem, idle breathing animation, 3 frames, 16-bit style, transparent background |
| 答对 | 32x32 | 3 | 答题正确反馈 | pixel art, female mage, happy expression, eyes curved into crescents, wand glowing golden, slight jump, 3 frames, golden particles, 16-bit style, transparent background |
| 答错 | 32x32 | 2 | 答题错误反馈 | pixel art, female mage, confused expression, eyebrow frown, head shaking side to side, 2 frames, 16-bit style, transparent background |
| 升级 | 32x32 | 5 | 等级提升 | pixel art, female mage, robe expanding outward, golden light radiating from body, arms raised, level up pose, 5 frames, 16-bit style, transparent background |
| 思考 | 32x32 | 2 | 加载/等待 | pixel art, female mage, hand on chin, thinking pose, blinking eyes, 2 frames, 16-bit style, transparent background |
| 施法 | 32x32 | 4 | 运行代码时 | pixel art, female mage, wand raised high, green gem glowing, magic circle forming, 4 frames, 16-bit style, transparent background |

### 1.2 角色类 — 诺克斯（雪枭伙伴）

| 素材 | 尺寸 | 帧数 | 用途 | AI 提示词 |
|------|------|------|------|-----------|
| 待机 | 16x16 | 3 | 站在贤者肩头 | pixel art, white snowy owl, golden eyes, blue glow rune on forehead, perched on shoulder, turning head left and right, 3 frames, 16-bit style, transparent background |
| 飞行 | 24x24 | 4 | 过渡动画 | pixel art, white snowy owl, wings flapping up and down, flying pose, 4 frames, 16-bit style, transparent background |
| 说话 | 16x16 | 2 | AI 总结时 | pixel art, white snowy owl, head bobbing up and down, blue rune pulsing, 2 frames, 16-bit style, transparent background |
| 警示 | 16x16 | 2 | 错误提示 | pixel art, white snowy owl, wings spread wide, eyes glowing bright, alert pose, 2 frames, 16-bit style, transparent background |
| 睡觉 | 16x16 | 2 | 空闲时 | pixel art, white snowy owl, eyes closed, head tucked, sleeping, 2 frames, 16-bit style, transparent background |

### 1.3 场景背景

| 素材 | 尺寸 | 用途 | AI 提示词 |
|------|------|------|-----------|
| 语法圣殿 | 1024x768 | 主线答题背景 | pixel art, ancient stone temple interior, golden glowing runes on walls, mystical atmosphere, dark blue and gold palette, 16-bit style |
| 爬虫山脉 | 1024x768 | 爬虫支线背景 | pixel art, snowy mountain range, aurora borealis data streams in sky, cold blue and purple palette, 16-bit style |
| 后端城 | 1024x768 | 后端支线背景 | pixel art, steampunk city towers, gears and pipes, steam clouds, warm orange and bronze palette, 16-bit style |
| 数据库森林 | 1024x768 | 数据库支线背景 | pixel art, enchanted forest, trees with glowing circuit patterns, data particles like fireflies, green and teal palette, 16-bit style |
| 前端海岸 | 1024x768 | 前端支线背景 | pixel art, seaside cliffs, ocean waves made of code lines, sunset gradient, blue and orange palette, 16-bit style |
| 世界地图 | 1024x768 | 主界面地图 | pixel art, fantasy world map, 5 distinct regions connected by golden paths, medieval cartography style, dark parchment background, 16-bit style |

### 1.4 魔法书系统

| 素材 | 尺寸 | 用途 | AI 提示词 |
|------|------|------|-----------|
| 魔法书封面 | 256x320 | 智慧之书封面 | pixel art, ancient leather spellbook, golden lock and corners, glowing runes on cover, purple and gold palette, 16-bit style |
| 书页纹理 | 512x512 | 书页背景（平铺） | pixel art, aged parchment paper texture, subtle yellowed edges, faint ink stains, seamless tile, 16-bit style |
| 书脊装饰 | 32x320 | 书脊金色装饰 | pixel art, golden book spine with ornate patterns, worn leather texture, 16-bit style |
| 翻页动画帧 | 128x128 x 8 | 翻页特效 | pixel art, book page flipping animation, 8 frames, paper bending and curling, golden edge glow, 16-bit style |
| 书签丝带 | 16x64 | 书签装饰 | pixel art, purple silk bookmark ribbon, flowing downward, slight wave, 16-bit style |
| 左翻页箭头 | 24x48 | 书左侧翻页按钮 | pixel art, golden left arrow, ornate medieval design, glow effect, 16-bit style, transparent background |
| 右翻页箭头 | 24x48 | 书右侧翻页按钮 | pixel art, golden right arrow, ornate medieval design, glow effect, 16-bit style, transparent background |

### 1.5 地图与技能树

| 素材 | 尺寸 | 用途 | AI 提示词 |
|------|------|------|-----------|
| 节点-已通关 | 16x16 | 地图完成节点 | pixel art, glowing golden star, pulsing light, 16-bit style, transparent background |
| 节点-未通关 | 16x16 | 地图锁定节点 | pixel art, gray stone with cracks, dull and lifeless, 16-bit style, transparent background |
| 节点-当前 | 16x16 | 地图当前位置 | pixel art, pulsing blue crystal, bright glow, rotating slowly, 16-bit style, transparent background |
| 节点-进行中 | 16x16 | 地图正在挑战 | pixel art, half-lit crystal, transition from gray to blue, 16-bit style, transparent background |
| 技能树-已点亮 | 16x16 | 技能树激活 | pixel art, glowing golden skill node, connected by bright lines, 16-bit style, transparent background |
| 技能树-未点亮 | 16x16 | 技能树锁定 | pixel art, dark dormant skill node, faint outline, 16-bit style, transparent background |
| 路径-已开通 | 32x4 | 地图连接路径 | pixel art, golden glowing path, bright and inviting, 16-bit style, transparent background |
| 路径-未开通 | 32x4 | 地图锁定路径 | pixel art, broken stone path, dark and cracked, 16-bit style, transparent background |

### 1.6 UI 元素

| 素材 | 尺寸 | 用途 | AI 提示词 |
|------|------|------|-----------|
| 对话框-贤者 | 64x64 | 对话头像 | pixel art, female mage portrait, neutral expression, circular frame, 64x64, 16-bit style |
| 对话框-诺克斯 | 64x64 | 对话头像 | pixel art, white owl portrait, golden eyes, circular frame, 64x64, 16-bit style |
| 经验条边框 | 256x16 | 经验值外框 | pixel art, golden ornate border for progress bar, medieval design, 16-bit style, transparent background |
| 经验条填充 | 256x16 | 经验值填充 | pixel art, golden glowing bar fill, gradient from dark to bright gold, 16-bit style |
| 按钮-普通 | 128x32 | 通用按钮 | pixel art, stone button with golden border, medieval style, 16-bit style, transparent background |
| 按钮-悬停 | 128x32 | 按钮悬停态 | pixel art, stone button glowing golden, hover state, 16-bit style, transparent background |
| 按钮-按下 | 128x32 | 按钮按下态 | pixel art, stone button pressed inward, darker shade, 16-bit style, transparent background |
| 道具-知识药水 | 16x16 | 道具图标 | pixel art, blue glowing potion bottle, magical liquid inside, 16-bit style, transparent background |
| 道具-时光沙漏 | 16x16 | 道具图标 | pixel art, golden hourglass with glowing sand, 16-bit style, transparent background |
| 道具-复活羽毛 | 16x16 | 道具图标 | pixel art, white glowing feather, ethereal light, 16-bit style, transparent background |
| 粒子-金色 | 8x8 x 4 | 升级特效 | pixel art, golden sparkle particles, 4 frames, rotating, 16-bit style, transparent background |
| 粒子-魔法 | 8x8 x 4 | 施法特效 | pixel art, green magic particles, 4 frames, floating upward, 16-bit style, transparent background |

### 1.7 总计

| 类别 | 数量 | 总帧数 |
|------|------|--------|
| 贤者角色 | 6 套 | 19 帧 |
| 诺克斯角色 | 5 套 | 13 帧 |
| 场景背景 | 6 张 | - |
| 魔法书系统 | 7 套 | 8 帧 |
| 地图与技能树 | 8 套 | - |
| UI 元素 | 11 套 | 8 帧 |
| **总计** | **43 套** | **48 帧** |

---

## 二、CSS 像素风渲染系统

### 2.1 精灵图渲染（Sprite Sheet）

```css
.sprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: -moz-crisp-edges;
}

.mage-idle {
  width: 32px;
  height: 32px;
  background-image: url('/sprites/mage-idle.png');
  background-size: 96px 32px;
  animation: mage-idle 0.8s steps(3) infinite;
}

@keyframes mage-idle {
  0% { background-position: 0 0; }
  100% { background-position: -96px 0; }
}

.mage-correct {
  width: 32px;
  height: 32px;
  background-image: url('/sprites/mage-correct.png');
  background-size: 96px 32px;
  animation: mage-correct 0.6s steps(3) forwards;
}

@keyframes mage-correct {
  0% { background-position: 0 0; transform: translateY(0); }
  50% { background-position: -64px 0; transform: translateY(-8px); }
  100% { background-position: -96px 0; transform: translateY(0); }
}

.owl-idle {
  width: 16px;
  height: 16px;
  background-image: url('/sprites/owl-idle.png');
  background-size: 48px 16px;
  animation: owl-idle 1.2s steps(3) infinite;
}

@keyframes owl-idle {
  0% { background-position: 0 0; }
  100% { background-position: -48px 0; }
}
```

### 2.2 粒子系统（纯 CSS）

```css
.particle-gold {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #c9a227;
  border-radius: 50%;
  animation: particle-float 1.5s ease-out forwards;
}

@keyframes particle-float {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
}

.level-up-particles {
  position: relative;
}

.level-up-particles::before,
.level-up-particles::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: #c9a227;
  border-radius: 50%;
  animation: particle-burst 1s ease-out forwards;
}

.level-up-particles::before { --angle: 0deg; }
.level-up-particles::after { --angle: 45deg; }

@keyframes particle-burst {
  0% { transform: rotate(var(--angle)) translateX(0) scale(1); opacity: 1; }
  100% { transform: rotate(var(--angle)) translateX(60px) scale(0); opacity: 0; }
}
```

---

## 三、魔法书 3D 翻页系统

### 3.1 HTML 结构

```html
<template>
  <div class="magic-book-scene">
    <div class="book-3d" :class="{ 'flipping-right': isFlippingRight, 'flipping-left': isFlippingLeft }">
      <button class="page-arrow arrow-left" @click="prevPage" :disabled="currentPage === 0">
        <img src="/sprites/arrow-left.png" alt="上一页">
      </button>

      <div class="book-container">
        <div class="book-spine"></div>

        <div class="book-page page-front">
          <div class="page-content">
            <div class="page-header">
              <span class="page-number">{{ currentPage + 1 }} / {{ totalPages }}</span>
            </div>
            <div class="knowledge-content">
              <h3>{{ currentPoint.title }}</h3>
              <p class="metaphor">{{ currentPoint.metaphor }}</p>
              <div class="code-block">
                <pre><code>{{ currentPoint.code }}</code></pre>
              </div>
              <button class="run-btn" @click="runDemo">▶ 运行看看</button>
              <div class="output-panel" v-if="demoOutput"><pre>{{ demoOutput }}</pre></div>
              <p class="tip">{{ currentPoint.tip }}</p>
            </div>
          </div>
        </div>

        <div class="book-page page-back">
          <div class="page-content"></div>
        </div>

        <div class="page-shadow"></div>
      </div>

      <button class="page-arrow arrow-right" @click="nextPage" :disabled="currentPage === totalPages - 1">
        <img src="/sprites/arrow-right.png" alt="下一页">
      </button>
    </div>

    <button v-if="currentPage === totalPages - 1" class="btn-start-trial" @click="startTrial">
      开始试炼
    </button>
  </div>
</template>
```

### 3.2 CSS 3D 翻页动画

```css
.magic-book-scene {
  perspective: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.book-3d {
  position: relative;
  width: 600px;
  height: 400px;
  transform-style: preserve-3d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-container {
  position: relative;
  width: 480px;
  height: 360px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-spine {
  position: absolute;
  left: -8px;
  top: 0;
  width: 16px;
  height: 100%;
  background: linear-gradient(180deg, #8B6914 0%, #c9a227 30%, #8B6914 50%, #c9a227 70%, #8B6914 100%);
  border-radius: 4px 0 0 4px;
  transform: translateX(-8px) rotateY(-15deg);
  transform-origin: right center;
  box-shadow: inset 2px 0 4px rgba(0,0,0,0.3), -4px 0 8px rgba(0,0,0,0.2);
}

.book-page {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #f4e4c1;
  background-image: url('/textures/parchment.png');
  border-radius: 0 8px 8px 0;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 0 60px rgba(139, 105, 20, 0.1);
}

.page-front {
  transform: rotateY(0deg);
  transform-origin: left center;
  z-index: 2;
}

.page-back {
  transform: rotateY(180deg);
  transform-origin: left center;
  z-index: 1;
}

.flipping-right .page-front {
  animation: flip-right 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes flip-right {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(-180deg); }
}

.flipping-left .page-back {
  animation: flip-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes flip-left {
  0% { transform: rotateY(-180deg); }
  100% { transform: rotateY(0deg); }
}

.page-shadow {
  position: absolute;
  right: 0; top: 0;
  width: 40px; height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2) 100%);
  border-radius: 0 8px 8px 0;
  pointer-events: none;
}

.page-arrow {
  position: absolute; top: 50%;
  transform: translateY(-50%);
  width: 48px; height: 48px;
  background: transparent; border: none;
  cursor: pointer; z-index: 10;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.page-arrow:hover { opacity: 1; transform: translateY(-50%) scale(1.1); }
.page-arrow:disabled { opacity: 0.2; cursor: not-allowed; }
.page-arrow img { width: 100%; height: 100%; image-rendering: pixelated; }

.arrow-left { left: 20px; }
.arrow-right { right: 20px; }

.page-content {
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
}

.knowledge-content h3 { color: #4B0082; font-size: 1.3rem; margin: 0 0 1rem; }
.metaphor { color: #5a4a3a; font-size: 1rem; line-height: 1.7; margin-bottom: 1.5rem; }

.code-block {
  background: #2d2a2a;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(201, 162, 39, 0.2);
}

.code-block pre { margin: 0; color: #7ee787; font-size: 0.9rem; line-height: 1.6; }

.run-btn {
  display: flex; align-items: center;
  gap: 0.5rem; padding: 0.6rem 1.2rem;
  background: #2d6a4f; color: #e8dcc8;
  border: none; border-radius: 6px;
  font-size: 0.9rem; cursor: pointer;
  transition: all 0.2s; margin-bottom: 1rem;
}

.run-btn:hover { background: #40916c; }

.btn-start-trial {
  margin-top: 2rem;
  padding: 1rem 3rem;
  background: #c9a227;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.1em;
}

.btn-start-trial:hover {
  background: #d4a93a;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(201, 162, 39, 0.3);
}
```

### 3.3 Vue 逻辑

```typescript
interface KnowledgePoint {
  title: string
  metaphor: string
  code: string
  expectedOutput: string
  tip: string
}

const props = defineProps<{
  chapterNumber: number
  chapterName: string
  points: KnowledgePoint[]
}>()

const emit = defineEmits<{ start: [] }>()

const currentPage = ref(0)
const isFlippingRight = ref(false)
const isFlippingLeft = ref(false)
const isRunning = ref(false)
const demoOutput = ref<string | null>(null)

const totalPages = computed(() => props.points.length)
const currentPoint = computed(() => props.points[currentPage.value])

async function runDemo() {
  if (!currentPoint.value || isRunning.value) return
  isRunning.value = true
  demoOutput.value = null
  // 调用 Pyodide 运行代码
  isRunning.value = false
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1 && !isFlippingRight.value) {
    isFlippingRight.value = true
    setTimeout(() => {
      currentPage.value++
      demoOutput.value = null
      isFlippingRight.value = false
    }, 600)
  }
}

function prevPage() {
  if (currentPage.value > 0 && !isFlippingLeft.value) {
    isFlippingLeft.value = true
    setTimeout(() => {
      currentPage.value--
      demoOutput.value = null
      isFlippingLeft.value = false
    }, 600)
  }
}

function startTrial() { emit('start') }
```

---

## 四、动态游戏效果

### 4.1 贤者表情状态机

```typescript
type MageExpression = 'idle' | 'correct' | 'wrong' | 'levelup' | 'thinking' | 'casting'

export function useMageExpression() {
  const currentExpression = ref<MageExpression>('idle')
  const isAnimating = ref(false)

  const spriteClass = computed(() => {
    switch (currentExpression.value) {
      case 'idle': return 'mage-idle'
      case 'correct': return 'mage-correct'
      case 'wrong': return 'mage-wrong'
      case 'levelup': return 'mage-levelup'
      case 'thinking': return 'mage-thinking'
      case 'casting': return 'mage-casting'
      default: return 'mage-idle'
    }
  })

  function setExpression(expr: MageExpression, duration?: number) {
    currentExpression.value = expr
    isAnimating.value = true
    if (duration) {
      setTimeout(() => {
        currentExpression.value = 'idle'
        isAnimating.value = false
      }, duration)
    }
  }

  return { currentExpression, spriteClass, isAnimating, setExpression }
}
```

### 4.2 答题反馈联动

```html
<!-- 在 QuizPanel 中使用 -->
<div class="mage-container">
  <div :class="['sprite', mage.spriteClass.value]"></div>
</div>

<div class="owl-container">
  <div :class="['sprite', 'owl-idle']"></div>
</div>

<button @click="submitAnswer">提交答案</button>
```

```typescript
const mage = useMageExpression()

async function submitAnswer() {
  const isCorrect = await checkAnswer()
  if (isCorrect) {
    mage.setExpression('correct', 1200)
  } else {
    mage.setExpression('wrong', 800)
  }
}
```

### 4.3 粒子系统组件

```html
<template>
  <div class="particle-container" ref="container">
    <div v-for="particle in particles" :key="particle.id" class="particle" :style="particle.style"></div>
  </div>
</template>

<style scoped>
.particle-container {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
}

.particle {
  position: absolute; width: 4px; height: 4px; background: #c9a227;
  border-radius: 50%;
  animation: particle-burst 1.5s ease-out forwards;
}

@keyframes particle-burst {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); }
}
</style>
```

---

## 五、世界地图与技能树

### 5.1 地图节点系统

```html
<template>
  <div class="world-map-container">
    <div class="map-background" :style="backgroundStyle"></div>

    <svg class="map-paths" viewBox="0 0 1024 768">
      <path v-for="path in paths" :key="path.id" :d="path.d"
        :class="['path-line', path.unlocked ? 'unlocked' : 'locked']" />
    </svg>

    <div v-for="node in nodes" :key="node.id"
      :class="['map-node', node.status]"
      :style="{ left: node.x + 'px', top: node.y + 'px' }"
      @click="selectNode(node)">
      <div class="node-sprite"></div>
      <div class="node-label">{{ node.name }}</div>
    </div>
  </div>
</template>

<style scoped>
.world-map-container {
  position: relative; width: 1024px; height: 768px; overflow: hidden;
}
.map-background {
  position: absolute; inset: 0;
  background-image: url('/backgrounds/world-map.png');
  background-size: cover; image-rendering: pixelated;
}
.map-node { position: absolute; transform: translate(-50%, -50%); cursor: pointer; }
.map-node.locked .node-sprite { background-image: url('/sprites/node-locked.png'); }
.map-node.current .node-sprite { background-image: url('/sprites/node-current.png'); }
.map-node.completed .node-sprite { background-image: url('/sprites/node-completed.png'); }
</style>
```

---

## 六、AI 生成像素画工具配置

### 6.1 Midjourney 参数
```
--style raw --ar 1:1 --v 6 --s 50 --q 1
```

### 6.2 DALL-E 3 提示词模板
```
pixel art, [subject], [description], 16-bit style,
game sprite, transparent background,
sharp edges, limited color palette,
retro gaming aesthetic
```

### 6.3 Stable Diffusion 配置

| 参数 | 值 |
|------|-----|
| 模型 | PixelArtXL_v1.0 |
| LoRA | pixel-art-style-v1.0 |
| 采样器 | DPM++ 2M Karras |
| 步数 | 25 |
| CFG | 7 |
| 尺寸 | 512x512 |

---

## 七、开发检查清单

### Week 7
- [ ] AI 生成所有角色像素画（贤者 6 套 + 诺克斯 5 套）
- [ ] 生成场景背景（6 张）
- [ ] 生成魔法书素材（7 套）
- [ ] 实现 CSS 精灵动画系统
- [ ] 替换纯色块为像素精灵
- [ ] 实现贤者表情状态机

### Week 8
- [ ] 生成地图与技能树素材（8 套）
- [ ] 生成 UI 元素（11 套）
- [ ] 实现魔法书 3D 翻页系统
- [ ] 实现世界地图组件
- [ ] 实现技能树可视化
- [ ] 添加粒子特效系统
- [ ] 联调测试所有动画

---

## 八、性能优化

| 优化项 | 方案 |
|--------|------|
| 精灵图合并 | 使用 CSS sprite sheet，减少 HTTP 请求 |
| 懒加载 | 场景背景按需加载，当前场景优先 |
| 动画性能 | 使用 transform 和 opacity，避免 layout 触发 |
| 粒子池 | 复用粒子 DOM 节点，避免频繁创建销毁 |
| 图片压缩 | 像素画使用 PNG-8，256 色索引模式 |

---

## 九、素材目录结构

```
public/
├── sprites/
│   ├── mage-idle.png
│   ├── mage-correct.png
│   ├── mage-wrong.png
│   ├── mage-levelup.png
│   ├── mage-thinking.png
│   ├── mage-casting.png
│   ├── owl-idle.png
│   ├── owl-flying.png
│   ├── owl-speaking.png
│   ├── owl-alert.png
│   ├── owl-sleeping.png
│   ├── node-locked.png
│   ├── node-current.png
│   ├── node-completed.png
│   ├── node-in-progress.png
│   ├── arrow-left.png
│   ├── arrow-right.png
│   ├── btn-normal.png
│   ├── btn-hover.png
│   ├── btn-pressed.png
│   ├── exp-border.png
│   ├── exp-fill.png
│   ├── item-potion.png
│   ├── item-hourglass.png
│   ├── item-feather.png
│   ├── particle-gold.png
│   └── particle-magic.png
├── backgrounds/
│   ├── syntax-temple.png
│   ├── spider-mountain.png
│   ├── backend-city.png
│   ├── database-forest.png
│   ├── frontend-coast.png
│   └── world-map.png
├── textures/
│   ├── parchment.png
│   └── book-cover.png
└── portraits/
    ├── mage-portrait.png
    └── owl-portrait.png
```

---

> 文档版本：v1.0  
> 更新日期：2026-06-22  
> 状态：Phase 4 开发指南
