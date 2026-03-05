<template>
  <div class="app">
    <nav class="nav-component">
      <div class="nav-top">
        <div class="nav-logo">
          <img class="nav-logo-img" src="/ChessPrototypes/new-notifications/chess-com-logo.png" alt="Chess.com" />
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
    <div v-show="showNotifications" class="notif-popover" @click.stop>
      <!-- Empty State -->
      <cc-empty-state
        v-if="filteredNotifications.length === 0"
        class="notif-empty"
        header="You're All Caught Up!"
        subheader="Notifications about clubs, players you follow, and more will appear here"
        :icon="{ name: 'media-bell-fill', variant: 'glyph' }"
        :icon-size="48"
      />

      <!-- Notification List -->
      <div v-else class="notif-list">
        <div
          v-for="n in filteredNotifications"
          :key="n.id"
          :data-notif-id="n.id"
          class="notif-item"
          :class="{
            'notif-item-detailed': n.hasActions || n.rollup,
            'notif-item-highlighted': highlightedId === n.id,
          }"
        >
          <div v-if="n.useIcon" class="notif-icon-avatar">
            <cc-icon :name="n.useIcon" :size="20" />
          </div>
          <cc-avatar v-else :src="n.avatar" :size="32" click-behavior="none" :is-lazy-loading="false" />
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
            <!-- Comment roll (non-interactive) -->
            <div v-if="n.rollup" class="notif-roll">
              <cc-avatar :src="n.rollup.avatar" :size="24" click-behavior="none" :is-lazy-loading="false" />
              <span class="notif-roll-text cc-text-small">{{ n.rollup.text }}</span>
            </div>
          </div>
          <cc-icon-button
            class="notif-dismiss"
            :icon="{ name: 'mark-cross', variant: 'glyph' }"
            variant="ghost"
            size="small"
            :icon-size="16"
            tooltip="Dismiss"
            @click.stop="dismissNotification(n.id)"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="notif-footer">
        <div class="notif-footer-left">
          <cc-icon-button
            :icon="{ name: 'mark-ellipsis-horizontal', variant: 'glyph' }"
            variant="ghost"
            size="small"
            @click.stop="showMenu = !showMenu"
          />
          <div v-show="showMenu" class="notif-menu" @click.stop>
            <cc-dropdown-item
              label="Mark all as read"
              :icon="{ name: 'mark-check-double' }"
              :is-disabled="!hasUnread"
              @click="markAllAsRead"
            />
            <cc-dropdown-item
              label="Delete all"
              :icon="{ name: 'utility-trashbin' }"
              :is-disabled="notifications.length === 0"
              @click="deleteAll"
            />
            <cc-dropdown-item
              label="Notification Settings"
              :icon="{ name: 'utility-cogwheel' }"
            />
          </div>
        </div>
        <div class="notif-footer-right">
          <span class="notif-footer-label cc-text-small-bold">Only show unread</span>
          <cc-switch v-model="showUnreadOnly" size="small" />
        </div>
      </div>
    </div>

    <main class="page-content">
    </main>

    <!-- Prototype Navigation Menu -->
    <PrototypeMenu
      :selected-category="selectedCategory"
      :categories="categories"
      :notification-names="notificationNames"
      @select="(id) => selectedCategory = id"
      @highlight="highlightNotification"
    />
  </div>
</template>

<script setup>
import {
  CcIcon,
  CcAvatar,
  CcNotificationBadge,
  CcIconButton,
  CcSwitch,
  CcDropdownItem,
  CcEmptyState,
} from '@chesscom/design-system'
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import PrototypeMenu from './components/PrototypeMenu.vue'

const mainLinks = [
  { icon: 'play-white', label: 'Play' },
  { icon: 'puzzle-piece', label: 'Puzzles' },
  { icon: 'lessons', label: 'Learn' },
  { icon: 'training', label: 'Train' },
]

const showNotifications = ref(false)
const notificationCount = ref(2)
const showUnreadOnly = ref(false)
const showMenu = ref(false)
const selectedCategory = ref('clubs')
const highlightedId = ref(null)

const avatars = {
  magnus: 'https://images.chesscomfiles.com/uploads/v1/user/3889224.121e2094.200x200o.361c2f8a59c2.jpg',
  chesscom: 'https://images.chesscomfiles.com/uploads/v1/user/33.862d5ff1.200x200o.0fc116e99993.png',
  barcelona: 'https://images.chesscomfiles.com/uploads/v1/group/898989.734243c5.50x50o.b1beed728fce.png',
  gotham: 'https://images.chesscomfiles.com/uploads/v1/user/33945736.eb0c3771.200x200o.cf06060d2143.png',
  botez: 'https://images.chesscomfiles.com/uploads/v1/user/28583276.401697ff.200x200o.152b758db93a.jpg',
  fabiano: 'https://images.chesscomfiles.com/uploads/v1/user/11177810.9dfc8d31.200x200o.9a9eccebc07c.png',
  hikaru: 'https://images.chesscomfiles.com/uploads/v1/user/15448422.88c010c1.200x200o.3c5619f5441e.png',
  naroditsky: 'https://images.chesscomfiles.com/uploads/v1/user/1715324.840b7522.200x200o.b79dde86ff74.jpg',
  anishgiri: 'https://images.chesscomfiles.com/uploads/v1/user/22252178.3669db0a.200x200o.b05e0e28dabe.jpg',
  penguin: 'https://images.chesscomfiles.com/uploads/v1/user/8344034.afe06124.200x200o.bcc27fc3d0b3.gif',
  wesley: 'https://images.chesscomfiles.com/uploads/v1/user/30366824.22d6b1f8.200x200o.bf8ce3f933fc.jpg',
  anna: 'https://images.chesscomfiles.com/uploads/v1/user/70349336.09d03b0c.200x200o.a5160d80bcc3.jpg',
  rprag: 'https://images.chesscomfiles.com/uploads/v1/user/28692936.02da0bac.200x200o.d0b1b8f66ac2.jpg',
  nihal: 'https://images.chesscomfiles.com/uploads/v1/user/7195919.159050ca.200x200o.883e75faf64e.jpg',
  chessbrah: 'https://images.chesscomfiles.com/uploads/v1/user/2555939.974bf39b.200x200o.b79b105ffb0e.png',
  duhless: 'https://images.chesscomfiles.com/uploads/v1/user/10174260.4865a6da.200x200o.6932fffcda21.png',
  teamusa: 'https://images.chesscomfiles.com/uploads/v1/group/6589.88736429.50x50o.968cc063a111.jpeg',
  caleb: 'https://images.chesscomfiles.com/uploads/v1/user/211790230.6cb341d0.200x200o.6e9fcd3e24e0.png',
}

const categories = [
  { id: 'clubs', label: 'Clubs' },
  { id: 'social', label: 'Social' },
  { id: 'achievements', label: 'Achievements & Rewards' },
  { id: 'other', label: 'Other' },
  { id: 'rollup', label: 'Rollup Examples' },
]

function buildCategoryData() {
  return {
    clubs: [
      { id: 'club-1', type: 'Club News', title: 'Barcelona Chess Club', body: 'Posted news', time: '2h', avatar: avatars.barcelona, unread: true, hasActions: false, rollup: null },
      { id: 'club-4', type: 'Club Join Request', title: 'Barcelona Chess Club', body: 'NihalSarin wants to join', time: '3h', avatar: avatars.barcelona, unread: true, hasActions: true, rollup: null },
      { id: 'club-2', type: 'Club Note', title: 'Team USA', body: 'Has 3 new notes', time: '5h', avatar: avatars.teamusa, unread: true, hasActions: false, rollup: null },
      { id: 'club-3', type: 'Club Forum Topic', title: 'Barcelona Chess Club', body: 'Has 3 new topics', time: '1d', avatar: avatars.barcelona, unread: false, hasActions: false, rollup: null },
    ],

    social: [
      { id: 'soc-1', type: 'New Comment', title: 'Caleb commented on your post', body: 'My Brilliant Game Analysis', time: '2h', avatar: avatars.caleb, unread: true, hasActions: false,
        rollup: { avatar: avatars.botez, text: '+3 comments from BotezLive, chessbrah and others' },
      },
      { id: 'soc-2', type: 'New Content', title: 'GothamChess', body: 'Has 3 new posts', time: '4h', avatar: avatars.gotham, unread: true, hasActions: false, rollup: null },
      { id: 'soc-5', type: 'Friend Activity', title: 'DanielNaroditsky', body: 'Has achieved a rating of 2830 in Blitz', time: '12h', avatar: avatars.naroditsky, unread: false, hasActions: false, rollup: null },
      { id: 'soc-3', type: 'Profile Notes', title: 'BotezLive', body: 'Left a note on your profile', time: '1d', avatar: avatars.botez, unread: false, hasActions: false,
        rollup: { avatar: avatars.gotham, text: '+10 notes from GothamChess, chessbrah and others' },
      },
      { id: 'soc-6', type: 'Contact Match', title: 'Anna Cramling is Now on Chess.com!', body: 'Add Anna as a friend, and challenge them to a game!', time: '2d', avatar: avatars.anna, unread: false, hasActions: false, rollup: null },
    ],

    achievements: [
      { id: 'ach-1', type: 'Achievement', title: 'Puzzle Rush Master', body: 'You earned an achievement', time: '1h', avatar: null, useIcon: 'trophy-medal-badge-star', unread: true, hasActions: false, rollup: null },
      { id: 'ach-2', type: 'Trophy', title: 'MagnusCarlsen', body: 'Sent you a trophy "Brilliant Player"', time: '3h', avatar: avatars.magnus, unread: true, hasActions: false, rollup: null },
      { id: 'ach-3', type: 'Arena Trophy', title: 'Arena Champion', body: 'You earned a trophy', time: '1d', avatar: null, useIcon: 'trophy-cup-star', unread: false, hasActions: false, rollup: null },
    ],

    other: [
      { id: 'oth-1', type: 'Insights', title: 'Your insights are ready!', body: 'Check out your weekly performance review', time: '6h', avatar: null, useIcon: 'document-box-closed', unread: true, hasActions: false, rollup: null },
    ],

    rollup: [
      { id: 'roll-1', type: 'Clubs · Club News (Replace)', title: 'Barcelona Chess Club', body: 'Posted news', time: '2h', avatar: avatars.barcelona, unread: true, hasActions: false, rollup: null },
      { id: 'roll-2', type: 'Clubs · Club Note (Aggregate)', title: 'Team USA', body: 'Has 3 new notes', time: '5h', avatar: avatars.teamusa, unread: true, hasActions: false, rollup: null },
      { id: 'roll-3', type: 'Clubs · Club Forum Topic (Aggregate)', title: 'Barcelona Chess Club', body: 'Has 3 new topics', time: '1d', avatar: avatars.barcelona, unread: false, hasActions: false, rollup: null },
      { id: 'roll-4', type: 'Social · New Comment (Aggregate)', title: 'Caleb commented on your post', body: 'My Brilliant Game Analysis', time: '2h', avatar: avatars.caleb, unread: true, hasActions: false,
        rollup: { avatar: avatars.botez, text: '+3 comments from BotezLive, chessbrah and others' },
      },
      { id: 'roll-5', type: 'Social · New Content (Aggregate)', title: 'GothamChess', body: 'Has 3 new posts', time: '4h', avatar: avatars.gotham, unread: true, hasActions: false, rollup: null },
      { id: 'roll-6', type: 'Social · Profile Notes (Aggregate)', title: 'BotezLive', body: 'Left a note on your profile', time: '1d', avatar: avatars.botez, unread: false, hasActions: false,
        rollup: { avatar: avatars.gotham, text: '+10 notes from GothamChess, chessbrah and others' },
      },
    ],
  }
}

const categoryData = buildCategoryData()

const notifications = ref([...categoryData.clubs])

const notificationNames = computed(() => {
  const data = categoryData[selectedCategory.value]
  if (!data) return []
  const seen = new Set()
  return data.filter(n => {
    if (seen.has(n.type)) return false
    seen.add(n.type)
    return true
  }).map(n => ({ id: n.id, label: n.type }))
})

watch(selectedCategory, (cat) => {
  const data = categoryData[cat]
  if (data) {
    notifications.value = data.map(n => {
      const clone = { ...n }
      if (clone.rollup) {
        clone.rollup = { ...clone.rollup, expanded: false }
      }
      return clone
    })
    notificationCount.value = notifications.value.filter(n => n.unread).length
    showNotifications.value = true
  }
})

const hasUnread = computed(() => notifications.value.some(n => n.unread))

const filteredNotifications = computed(() => {
  if (showUnreadOnly.value) {
    return notifications.value.filter(n => n.unread)
  }
  return notifications.value
})

function markNonActionableAsRead() {
  notifications.value.forEach(n => {
    if (n.unread && !n.hasActions) n.unread = false
  })
  notificationCount.value = notifications.value.filter(n => n.unread).length
}

function markAllAsRead() {
  notifications.value.forEach(n => { n.unread = false })
  notificationCount.value = 0
  showMenu.value = false
}

function deleteAll() {
  notifications.value = []
  notificationCount.value = 0
  showMenu.value = false
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    markNonActionableAsRead()
  }
}

function onDocumentClick(e) {
  showMenu.value = false
  if (!showNotifications.value) return
  const popover = document.querySelector('.notif-popover')
  const bell = document.querySelector('.nav-footer-btn-active')
  if (popover?.contains(e.target) || bell?.contains(e.target)) return
  showNotifications.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

function dismissNotification(id) {
  notifications.value = notifications.value.filter(n => n.id !== id)
  notificationCount.value = notifications.value.filter(n => n.unread).length
}

function highlightNotification(id) {
  showNotifications.value = true
  markNonActionableAsRead()
  highlightedId.value = null
  nextTick(() => {
    highlightedId.value = id
    const el = document.querySelector(`[data-notif-id="${id}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    setTimeout(() => {
      highlightedId.value = null
    }, 1500)
  })
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

.nav-logo-img {
  display: block;
  width: 100%;
  height: auto;
}

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
  min-height: 440px;
  max-height: calc(100vh - 80px);
  background: var(--color-bg-opaque, #262421);
  border: 1px solid var(--color-border-default, rgba(255,255,255,0.1));
  border-radius: var(--radius-l, 5px);
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  overflow: clip;
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

/* -- Empty State -- */

.notif-empty {
  flex: 1;
}

.notif-empty {
  flex: 1;
}

.notif-empty :deep(.cc-empty-state-content) h1,
.notif-empty :deep(.cc-empty-state-content) p {
  margin: 0;
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
  position: relative;
}

.notif-item-detailed {
  gap: var(--space-8, 8px);
}

.notif-item:hover {
  background: var(--color-bg-subtlest, rgba(255,255,255,0.02));
}

.notif-dismiss {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  pointer-events: none;
}

.notif-item:hover .notif-dismiss {
  opacity: 1;
  pointer-events: auto;
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
}

.notif-time {
  flex-shrink: 0;
  color: var(--color-text-subtle, rgba(255,255,255,0.5));
}

.notif-item:hover .notif-time {
  visibility: hidden;
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
  padding: 0;
  background: unset;
  border-radius: 3px;
  width: 100%;
  box-sizing: border-box;
}

.notif-roll-text {
  flex: 1;
  min-width: 0;
  color: var(--color-text-subtle, rgba(255,255,255,0.5));
}

.notif-comments {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 4px);
  width: 100%;
}

.notif-comment {
  display: flex;
  gap: var(--space-8, 8px);
  align-items: flex-start;
  padding: var(--space-4, 4px);
  background: var(--color-bg-subtlest, rgba(255,255,255,0.02));
  border-radius: 3px;
}

.notif-comment-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.notif-comment-user {
  color: var(--color-text-bolder, rgba(255,255,255,0.85));
  line-height: 24px;
}

.notif-comment-body {
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
  overflow: visible;
  position: relative;
  z-index: 1;
}

.notif-footer-left {
  display: flex;
  align-items: center;
  position: relative;
}

.notif-menu {
  position: absolute;
  bottom: calc(100% + var(--space-8, 8px));
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-opaque-lighter, #312e2b);
  border: 1px solid var(--color-border-default, rgba(255,255,255,0.1));
  border-radius: var(--radius-l, 5px);
  box-shadow: 0px 2px 4px 0px var(--color-transparent-black-30, rgba(0,0,0,0.3));
  overflow: clip;
  white-space: nowrap;
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

/* -- Icon avatar fallback -- */

.notif-icon-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-bg-subtlest, rgba(255,255,255,0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-icon-default, rgba(255,255,255,0.5));
}

/* -- Highlight animation -- */

.notif-item-highlighted {
  animation: notif-flash 1.5s ease-out;
}

@keyframes notif-flash {
  0% { background: rgba(129, 182, 76, 0.3); }
  100% { background: transparent; }
}
</style>
