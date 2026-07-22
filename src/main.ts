import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { saveErrorLog } from './services/storage'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())

// Vue 组件渲染错误捕获
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue error]', err, info)
  saveErrorLog({
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    url: window.location.href,
    timestamp: Date.now(),
  })
}

// 全局运行时错误捕获
window.onerror = (message, source, lineno, colno, error) => {
  saveErrorLog({
    message: String(message),
    source,
    lineno,
    colno,
    stack: error?.stack,
    url: window.location.href,
    timestamp: Date.now(),
  })
}

// 未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  saveErrorLog({
    message: event.reason instanceof Error ? event.reason.message : String(event.reason),
    stack: event.reason instanceof Error ? event.reason.stack : undefined,
    url: window.location.href,
    timestamp: Date.now(),
  })
})

app.mount('#app')
