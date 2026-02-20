import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'

document.body.classList.add('dark-mode')

const app = createApp(App)

app.provide('design-system-key', {
  trans: (key) => key,
  routes: {
    webMemberView: () => '#',
  },
})

app.mount('#app')

// #region agent log
fetch('http://127.0.0.1:7249/ingest/3379d450-6ec7-4c93-a22c-9a2a5a4d4e1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'ds-style-debug',hypothesisId:'H4',location:'main.js:afterMount',message:'entry CSS imports and root app state',data:{bodyClassList:Array.from(document.body.classList),appMounted:!!document.getElementById('app'),rootChildren:document.getElementById('app')?.children?.length||0},timestamp:Date.now()})}).catch(()=>{});
// #endregion
