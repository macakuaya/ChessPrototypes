<template>
  <div class="app">
    <nav class="nav-component">
      <div class="nav-top">
        <div class="nav-logo">
          <div class="nav-logo-figma" aria-label="Chess.com">
            <div class="logo-v logo-v1"><img src="https://www.figma.com/api/mcp/asset/c3f9d460-641a-4f9a-a299-be217a63fbcd" alt="" /></div>
            <div class="logo-v logo-v2"><img src="https://www.figma.com/api/mcp/asset/ebe99667-779d-4a6a-ace2-fc32def158ff" alt="" /></div>
            <div class="logo-v logo-v3"><img src="https://www.figma.com/api/mcp/asset/d794a64b-9ffc-4e5d-b2a3-384ccf1157fd" alt="" /></div>
            <div class="logo-v logo-v4"><img src="https://www.figma.com/api/mcp/asset/088fd9e9-7b4b-4b02-8404-f93c3458b8c3" alt="" /></div>
            <div class="logo-v logo-v5"><img src="https://www.figma.com/api/mcp/asset/e2a2ee79-bf01-41b4-a239-cc795c5bbaa1" alt="" /></div>
            <div class="logo-v logo-v6"><img src="https://www.figma.com/api/mcp/asset/7ac219fa-83ca-45b0-87b3-b16fc00ab16f" alt="" /></div>
            <div class="logo-v logo-v7"><img src="https://www.figma.com/api/mcp/asset/a39d4dc8-4459-4963-8b1f-e4d011368a2e" alt="" /></div>
            <div class="logo-v logo-v8"><img src="https://www.figma.com/api/mcp/asset/110dd055-1b78-4e16-8360-d49cb8146ccb" alt="" /></div>
            <div class="logo-v logo-v9"><img src="https://www.figma.com/api/mcp/asset/c3025627-c268-4b4f-9c80-dfb87bcef980" alt="" /></div>
            <div class="logo-v logo-v10"><img src="https://www.figma.com/api/mcp/asset/8ae15c77-afc2-4e72-9b43-9d007130ceba" alt="" /></div>
            <div class="logo-v logo-v11"><img src="https://www.figma.com/api/mcp/asset/ad937973-b8f1-4df0-9bfa-edbc9b0959e5" alt="" /></div>
            <div class="logo-v logo-v12"><img src="https://www.figma.com/api/mcp/asset/8815367f-4a5f-4ce7-b566-b4c9b739f24a" alt="" /></div>
            <div class="logo-v logo-v13"><img src="https://www.figma.com/api/mcp/asset/578ccd70-7364-475f-9650-e702f50e3ca3" alt="" /></div>
          </div>
        </div>

        <div class="nav-links">
          <div class="nav-links-main">
            <a
              v-for="link in mainLinks"
              :key="link.label"
              class="nav-primary"
              href="#">
              <cc-icon :name="link.icon" variant="color" :size="24" />
              <span class="nav-primary-text cc-text-large-bold">{{ link.label }}</span>
            </a>

            <button class="nav-more" type="button">
              <span class="nav-more-chevron">
                <cc-icon name="arrow-chevron-bottom" :size="12" />
              </span>
              <span class="nav-more-text cc-text-medium-bold">More</span>
            </button>
          </div>

          <a class="nav-primary nav-free-trial" href="#">
            <cc-icon name="commerce-diamond" variant="color" :size="24" />
            <span class="nav-primary-text cc-text-large-bold nav-free-trial-text">Free Trial</span>
          </a>
        </div>
      </div>

      <div class="nav-bottom">
        <div class="nav-bottom-container">
          <div class="nav-bottom-links">
            <a class="nav-search" href="#">
              <cc-icon name="tool-magnifier-blank" :size="20" />
              <span class="nav-search-text cc-text-medium-bold">Search</span>
            </a>
          </div>

          <a class="nav-username" href="#">
            <div class="nav-username-inner">
              <cc-avatar
                src="https://images.chesscomfiles.com/uploads/v1/user/211790230.6cb341d0.50x50o.6e9fcd3e24e0.png"
                :size="24"
                click-behavior="none"
              />
              <span class="nav-username-text cc-text-medium-bold">macakuaya</span>
            </div>
          </a>
        </div>

        <div class="nav-footer-icons">
          <div class="nav-footer-btn">
            <cc-icon name="users" :size="20" />
          </div>
          <div class="nav-footer-btn">
            <cc-icon name="message-envelope-fill" :size="20" />
          </div>
          <div class="nav-footer-btn" @click="$emit('toggle-notifications')">
            <cc-icon name="media-bell-fill" :size="20" />
            <cc-notification-badge :label="2" variant="alert" class="nav-badge" />
          </div>
          <div class="nav-footer-btn">
            <cc-icon name="utility-cogwheel" :size="20" />
          </div>
        </div>
      </div>
    </nav>

    <main class="page-content">
      <!-- Notification panel will be built here -->
    </main>
  </div>
</template>

<script setup>
import {
  CcIcon,
  CcAvatar,
  CcNotificationBadge,
} from '@chesscom/design-system'
import { onMounted } from 'vue'

defineEmits(['toggle-notifications'])

const mainLinks = [
  { icon: 'play-white', label: 'Play' },
  { icon: 'puzzle-piece', label: 'Puzzles' },
  { icon: 'lessons', label: 'Learn' },
  { icon: 'training', label: 'Train' },
]

onMounted(() => {
  const primary = document.querySelector('.nav-primary-text.cc-text-large-bold')
  const search = document.querySelector('.nav-search-text.cc-text-medium-bold')
  const badge = document.querySelector('.nav-badge')
  const primaryStyles = primary ? getComputedStyle(primary) : null
  const searchStyles = search ? getComputedStyle(search) : null
  const badgeStyles = badge ? getComputedStyle(badge) : null

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/3379d450-6ec7-4c93-a22c-9a2a5a4d4e1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'ds-style-debug',hypothesisId:'H1',location:'App.vue:onMounted',message:'design-system stylesheets and utility classes presence',data:{styleSheets:Array.from(document.styleSheets).map((s)=>s.href||'inline').slice(0,30),hasCcTextLargeBold:Array.from(document.styleSheets).some((s)=>{try{return Array.from(s.cssRules||[]).some((r)=>r.cssText?.includes('.cc-text-large-bold'))}catch{return false}}),hasCcNotificationBadge:Array.from(document.styleSheets).some((s)=>{try{return Array.from(s.cssRules||[]).some((r)=>r.cssText?.includes('.cc-notification-badge-component'))}catch{return false}})},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/3379d450-6ec7-4c93-a22c-9a2a5a4d4e1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'ds-style-debug',hypothesisId:'H2',location:'App.vue:onMounted',message:'computed typography for target elements',data:{primaryExists:!!primary,primaryFontSize:primaryStyles?.fontSize,primaryFontWeight:primaryStyles?.fontWeight,primaryLineHeight:primaryStyles?.lineHeight,primaryColor:primaryStyles?.color,searchExists:!!search,searchFontSize:searchStyles?.fontSize,searchFontWeight:searchStyles?.fontWeight,searchLineHeight:searchStyles?.lineHeight,searchColor:searchStyles?.color},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/3379d450-6ec7-4c93-a22c-9a2a5a4d4e1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'ds-style-debug',hypothesisId:'H3',location:'App.vue:onMounted',message:'theme + token + scale state',data:{htmlFontSize:getComputedStyle(document.documentElement).fontSize,bodyHasDarkMode:document.body.classList.contains('dark-mode'),colorTextBolder:getComputedStyle(document.documentElement).getPropertyValue('--color-text-bolder').trim(),colorTextDefault:getComputedStyle(document.documentElement).getPropertyValue('--color-text-default').trim(),colorTextSubtle:getComputedStyle(document.documentElement).getPropertyValue('--color-text-subtle').trim(),navBg:getComputedStyle(document.querySelector('.nav-component')||document.body).backgroundColor,badgeExists:!!badge,badgeHeight:badgeStyles?.height,badgeMinWidth:badgeStyles?.minWidth,badgePadding:badgeStyles?.padding,badgeRadius:badgeStyles?.borderRadius},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/3379d450-6ec7-4c93-a22c-9a2a5a4d4e1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'ds-style-debug',hypothesisId:'H5',location:'App.vue:onMounted',message:'zoom + css variable resolution on actual elements',data:{devicePixelRatio:window.devicePixelRatio,visualViewportScale:window.visualViewport?.scale||null,browserZoomEstimated:Math.round((window.outerWidth/window.innerWidth)*100),rootTextBolder:getComputedStyle(document.documentElement).getPropertyValue('--color-text-bolder').trim(),bodyTextBolder:getComputedStyle(document.body).getPropertyValue('--color-text-bolder').trim(),primaryResolvedColor:primaryStyles?.color,freeTrialResolvedColor:getComputedStyle(document.querySelector('.nav-free-trial-text')||document.body).color,searchGap:getComputedStyle(document.querySelector('.nav-search')||document.body).gap},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const htmlStyles = getComputedStyle(document.documentElement)
  const bodyStyles = getComputedStyle(document.body)
  const appEl = document.querySelector('.app')
  const navEl = document.querySelector('.nav-component')
  const appRect = appEl ? appEl.getBoundingClientRect() : null
  const navRect = navEl ? navEl.getBoundingClientRect() : null
  const bodyComputed = getComputedStyle(document.body)

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/3379d450-6ec7-4c93-a22c-9a2a5a4d4e1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'ds-style-debug',hypothesisId:'H6',location:'App.vue:onMounted',message:'layout scaling and container transforms',data:{innerWidth:window.innerWidth,innerHeight:window.innerHeight,outerWidth:window.outerWidth,outerHeight:window.outerHeight,htmlZoom:htmlStyles.zoom||'',bodyZoom:bodyStyles.zoom||'',htmlTransform:htmlStyles.transform||'none',bodyTransform:bodyStyles.transform||'none',htmlFontSize:htmlStyles.fontSize,bodyFontSize:bodyStyles.fontSize,appRect:appRect?{width:Math.round(appRect.width),height:Math.round(appRect.height)}:null,navRect:navRect?{width:Math.round(navRect.width),height:Math.round(navRect.height)}:null,navComputedWidth:navEl?getComputedStyle(navEl).width:null,primaryRect:primary?{width:Math.round(primary.getBoundingClientRect().width),height:Math.round(primary.getBoundingClientRect().height)}:null,searchRect:search?{width:Math.round(search.getBoundingClientRect().width),height:Math.round(search.getBoundingClientRect().height)}:null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/3379d450-6ec7-4c93-a22c-9a2a5a4d4e1c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'ds-style-debug',hypothesisId:'H7',location:'App.vue:onMounted',message:'font family resolution for DS text utilities',data:{fontFamilySystemVar:htmlStyles.getPropertyValue('--font-family-system').trim(),fontFamilyHeadingVar:htmlStyles.getPropertyValue('--font-family-heading').trim(),bodyFontFamily:bodyComputed.fontFamily,primaryFontFamily:primaryStyles?.fontFamily,searchFontFamily:searchStyles?.fontFamily,primaryClasses:primary?.className||'',searchClasses:search?.className||''},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
})
</script>

<style>
html {
  font-size: 62.5%;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

body {
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
}

body.dark-mode {
  background: var(--color-gray-800, #312E2B);
}
</style>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
}

.nav-component {
  background-color: var(--color-bg-secondary);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 17rem;
  height: 100vh;
  height: 100dvh;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  overflow: hidden;
}

/* ---- Top Section ---- */

.nav-top {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: var(--space-8, 0.8rem);
  padding-left: var(--space-8, 0.8rem);
  padding-right: var(--space-8, 0.8rem);
}

.nav-logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 4.2rem;
  padding: var(--space-4, 0.4rem) 0.9rem;
}

.nav-logo-figma {
  position: relative;
  width: 11.4rem;
  height: 3.2rem;
  overflow: hidden;
}

.logo-v {
  position: absolute;
}

.logo-v img {
  display: block;
  width: 100%;
  height: 100%;
}

.logo-v1 { inset: 1.14% 81.5% 0.63% 0; }
.logo-v2 { inset: 46.96% 89.67% 14.16% 0.41%; }
.logo-v3 { inset: 0.01% 87.32% 56.62% 3.43%; }
.logo-v4 { inset: 3.16% 90.13% 85.09% 6.19%; }
.logo-v5 { inset: 26.44% 62.21% 17.78% 26.8%; }
.logo-v6 { inset: 39.44% 49.37% 17.16% 39.25%; }
.logo-v7 { inset: 39.44% 27.13% 17.16% 62.55%; }
.logo-v8 { inset: 76.25% 25.18% 17.16% 73.03%; }
.logo-v9 { inset: 54.94% 10.99% 17.16% 81.58%; }
.logo-v10 { inset: 54.93% 0 17.47% 89.94%; }
.logo-v11 { inset: 54.94% 19.01% 17.16% 75.11%; }
.logo-v12 { inset: 39% 37.72% 16.36% 51.66%; }
.logo-v13 { inset: 26.44% 74.89% 16.84% 12.83%; }

/* ---- Links ---- */

.nav-links {
  display: flex;
  flex-direction: column;
}

.nav-links-main {
  display: flex;
  flex-direction: column;
}

/* Primary nav link (Play, Puzzles, Learn, Train, Free Trial) */
.nav-primary {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: var(--space-8, 0.8rem);
  border-radius: var(--radius-l, 0.5rem);
  text-decoration: none;
  color: inherit;
  user-select: none;
}

.nav-primary:hover {
  background-color: var(--color-bg-subtlest, rgba(255,255,255,0.02));
}

.nav-primary-text {
  color: var(--color-text-bolder, rgba(255,255,255,0.85));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* More button */
.nav-more {
  display: flex;
  align-items: center;
  gap: var(--space-12, 1.2rem);
  padding: var(--space-8, 0.8rem);
  border-radius: var(--radius-l, 0.5rem);
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  user-select: none;
  width: 100%;
}

.nav-more:hover {
  background-color: var(--color-bg-subtlest, rgba(255,255,255,0.02));
}

.nav-more-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
  color: var(--color-text-default, rgba(255,255,255,0.72));
}

.nav-more-text {
  color: var(--color-text-default, rgba(255,255,255,0.72));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  text-align: left;
}

/* Free Trial */
.nav-free-trial-text {
  color: var(--color-blue-100, #4DC3EA);
}

/* ---- Bottom Section ---- */

.nav-bottom {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 0.8rem);
  padding-bottom: var(--space-24, 2.4rem);
  padding-left: var(--space-8, 0.8rem);
  padding-right: var(--space-8, 0.8rem);
}

.nav-bottom-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 0.4rem);
}

.nav-bottom-links {
  display: flex;
  flex-direction: column;
}

/* Search */
.nav-search {
  display: flex;
  align-items: center;
  height: 32px;
  min-height: 32px;
  box-sizing: border-box;
  gap: var(--space-16, 1.6rem);
  padding: var(--space-4, 0.4rem) var(--space-8, 0.8rem);
  border-radius: var(--radius-l, 0.5rem);
  text-decoration: none;
  color: var(--color-icon-default, rgba(255,255,255,0.5));
  user-select: none;
}

.nav-search:hover {
  background-color: var(--color-bg-subtlest, rgba(255,255,255,0.02));
}

.nav-search-text {
  color: var(--color-text-subtle, rgba(255,255,255,0.5));
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Username */
.nav-username {
  display: flex;
  align-items: stretch;
  height: 32px;
  min-height: 32px;
  border-radius: var(--radius-l, 0.5rem);
  text-decoration: none;
  color: inherit;
  user-select: none;
}

.nav-username:hover {
  background-color: var(--color-bg-subtlest, rgba(255,255,255,0.02));
}

.nav-username-inner {
  display: flex;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
  gap: var(--space-12, 1.2rem);
  padding: var(--space-4, 0.4rem) var(--space-8, 0.8rem);
  flex: 1;
  min-width: 0;
}

.nav-username-text {
  color: var(--color-text-default, rgba(255,255,255,0.72));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Footer Icons */
.nav-footer-icons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4, 0.4rem);
}

.nav-footer-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: var(--radius-m, 0.3rem);
  color: var(--color-icon-default, rgba(255,255,255,0.5));
  cursor: pointer;
  user-select: none;
}

.nav-footer-btn:hover {
  background-color: var(--color-bg-subtlest, rgba(255,255,255,0.02));
  color: var(--color-icon-default-hovered, rgba(255,255,255,0.72));
}

.nav-footer-btn-active {
  background-color: var(--color-transparent-white-10, rgba(255,255,255,0.1));
  color: var(--color-text-bolder, rgba(255,255,255,0.85));
}

.nav-badge {
  position: absolute;
  top: -0.3rem;
  left: 1.9rem;
  padding-left: 0.2rem;
  padding-right: 0.2rem;
}

/* ---- Main Content ---- */

.page-content {
  flex: 1;
  background: var(--color-bg-surface, #262421);
}
</style>
