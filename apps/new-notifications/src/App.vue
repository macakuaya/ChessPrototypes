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
          <div
            class="nav-footer-btn"
            :class="{ 'nav-footer-btn-active': showNotifications }"
            @click.stop="toggleNotifications"
          >
            <cc-icon name="media-bell-fill" :size="20" />
            <cc-notification-badge
              v-if="notificationCount > 0"
              :label="notificationCount"
              variant="alert"
              class="nav-badge"
            />
          </div>
          <div class="nav-footer-btn">
            <cc-icon name="utility-cogwheel" :size="20" />
          </div>
        </div>
      </div>
    </nav>

    <!-- Notifications Popover -->
    <div v-if="showNotifications" class="notif-popover" @click.stop>
      <!-- Notification List -->
      <div class="notif-list">
        <div
          v-for="n in filteredNotifications"
          :key="n.id"
          class="notif-item"
          :class="{ 'notif-item-detailed': n.hasActions || n.rollup }"
        >
          <cc-avatar :src="n.avatar" :size="32" click-behavior="none" />
          <div class="notif-content">
            <div class="notif-text-block">
              <div class="notif-header">
                <span class="notif-username cc-text-medium-bold">{{ n.title }}</span>
                <span class="notif-time cc-text-x-small">{{ n.time }}</span>
              </div>
              <div class="notif-body-row">
                <span
                  class="notif-body"
                  :class="n.unread ? 'cc-text-small-bold' : 'cc-text-small'"
                >{{ n.body }}</span>
                <span v-if="n.unread" class="notif-dot"></span>
              </div>
            </div>
            <!-- Action buttons (accept / decline) -->
            <div v-if="n.hasActions" class="notif-actions">
              <cc-icon-button
                :icon="{ name: 'mark-cross', variant: 'glyph' }"
                variant="secondary"
                size="small"
              />
              <cc-icon-button
                :icon="{ name: 'mark-check', variant: 'glyph' }"
                variant="primary"
                size="small"
              />
            </div>
            <!-- Comment roll -->
            <div v-if="n.rollup" class="notif-roll">
              <cc-avatar :src="n.rollup.avatar" :size="24" click-behavior="none" />
              <span class="notif-roll-text cc-text-small">{{ n.rollup.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="notif-footer">
        <div class="notif-footer-left">
          <cc-icon-button
            :icon="{ name: 'utility-cogwheel', variant: 'glyph' }"
            variant="ghost"
            size="small"
            tooltip="Notifications Settings"
          />
          <cc-icon-button
            :icon="{ name: 'mark-check-double', variant: 'glyph' }"
            variant="ghost"
            size="small"
            tooltip="Clear All Notifications"
          />
        </div>
        <div class="notif-footer-right">
          <span class="notif-footer-label cc-text-small">Only show unread</span>
          <cc-switch v-model="showUnreadOnly" size="small" />
        </div>
      </div>
    </div>

    <main class="page-content" @click="showNotifications = false">
    </main>
  </div>
</template>

<script setup>
import {
  CcIcon,
  CcAvatar,
  CcNotificationBadge,
  CcIconButton,
  CcSwitch,
} from '@chesscom/design-system'
import { ref, computed } from 'vue'

const mainLinks = [
  { icon: 'play-white', label: 'Play' },
  { icon: 'puzzle-piece', label: 'Puzzles' },
  { icon: 'lessons', label: 'Learn' },
  { icon: 'training', label: 'Train' },
]

const showNotifications = ref(false)
const notificationCount = ref(2)
const activeTab = ref(0)
const showUnreadOnly = ref(false)
const tabs = ['Games', 'Social', 'Other']

const defaultAvatar = 'https://images.chesscomfiles.com/uploads/v1/user/211790230.6cb341d0.50x50o.6e9fcd3e24e0.png'

const notifications = ref([
  {
    id: 1,
    title: 'MagnusCarlsen',
    body: 'Wants to play Daily',
    time: '6h',
    avatar: defaultAvatar,
    unread: true,
    hasActions: true,
    rollup: null,
    tab: 0,
  },
  {
    id: 2,
    title: 'CHESScom',
    body: 'A new Team Match is starting',
    time: '23h',
    avatar: defaultAvatar,
    unread: true,
    hasActions: false,
    rollup: null,
    tab: 0,
  },
  {
    id: 3,
    title: 'Barcelona Chess Club',
    body: 'Someone commented something here',
    time: '1d',
    avatar: defaultAvatar,
    unread: false,
    hasActions: false,
    rollup: {
      avatar: defaultAvatar,
      text: '+2 more comments',
    },
    tab: 1,
  },
  {
    id: 4,
    title: 'FabianoCaruana',
    body: 'Notification description, what happens if we have two lines',
    time: '3d',
    avatar: defaultAvatar,
    unread: false,
    hasActions: false,
    rollup: null,
    tab: 0,
  },
  {
    id: 5,
    title: 'HikaruNakamura',
    body: 'Notification description here, yes',
    time: '40d',
    avatar: defaultAvatar,
    unread: false,
    hasActions: false,
    rollup: null,
    tab: 0,
  },
])

const filteredNotifications = computed(() => {
  if (showUnreadOnly.value) {
    return notifications.value.filter(n => n.unread)
  }
  return notifications.value
})

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    notificationCount.value = 0
  }
}
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

/* ======== Notifications Popover ======== */

.notif-popover {
  position: fixed;
  left: 8px;
  bottom: 64px;
  width: 300px;
  height: 440px;
  background: var(--color-bg-opaque, #262421);
  border: 1px solid var(--color-border-default, rgba(255,255,255,0.1));
  border-radius: var(--radius-l, 5px);
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}

/* -- Tabs -- */

.notif-tabs {
  display: flex;
  flex-shrink: 0;
  width: 100%;
}

.notif-tab {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border-default, rgba(255,255,255,0.1));
  color: var(--color-text-default, rgba(255,255,255,0.72));
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}

.notif-tab-active {
  border-bottom: 3px solid rgba(255,255,255,0.72);
  color: var(--color-text-bolder, rgba(255,255,255,0.85));
}

/* -- Notification List -- */

.notif-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-8, 8px);
}

.notif-item {
  display: flex;
  gap: var(--space-8, 8px);
  align-items: flex-start;
  padding: var(--space-8, 8px);
  border-radius: var(--radius-l, 5px);
}

.notif-item-detailed {
  gap: var(--space-12, 12px);
}

.notif-item:hover {
  background: var(--color-bg-subtlest, rgba(255,255,255,0.02));
}

/* -- Notification Content -- */

.notif-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
  flex: 1;
  min-width: 0;
}

.notif-text-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.notif-header {
  display: flex;
  gap: 8px;
  align-items: baseline;
  width: 100%;
}

.notif-username {
  flex: 1;
  min-width: 0;
  color: var(--color-text-bolder, rgba(255,255,255,0.85));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-time {
  flex-shrink: 0;
  color: var(--color-text-subtle, rgba(255,255,255,0.5));
}

.notif-body-row {
  display: flex;
  gap: var(--space-4, 4px);
  align-items: baseline;
  width: 100%;
}

.notif-body {
  flex: 1;
  min-width: 0;
  color: var(--color-text-subtle, rgba(255,255,255,0.5));
}

.notif-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-bg-danger, #E5483F);
}

/* -- Action Buttons -- */

.notif-actions {
  display: flex;
  gap: var(--space-8, 8px);
  align-items: center;
}

/* -- Comment Roll -- */

.notif-roll {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px;
  background: var(--color-bg-subtlest, rgba(255,255,255,0.02));
  border-radius: 3px;
  width: 100%;
  box-sizing: border-box;
}

.notif-roll-text {
  flex: 1;
  min-width: 0;
  color: var(--color-text-subtle, rgba(255,255,255,0.5));
}

/* -- Footer -- */

.notif-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  flex-shrink: 0;
  padding: 0 var(--space-8, 8px);
  border-top: 1px solid var(--color-border-default, rgba(255,255,255,0.1));
  overflow: hidden;
}

.notif-footer-left {
  display: flex;
  align-items: center;
}

.notif-footer-right {
  display: flex;
  align-items: center;
  gap: var(--space-8, 8px);
  padding: 0 var(--space-8, 8px);
}

.notif-footer-label {
  color: var(--color-text-default, rgba(255,255,255,0.72));
  white-space: nowrap;
}
</style>
