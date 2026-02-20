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
    <div v-show="showNotifications" class="notif-popover" @click.stop>
      <!-- Notification List -->
      <div class="notif-list">
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
            <!-- Comment roll -->
            <template v-if="n.rollup">
              <div
                v-show="!n.rollup.expanded"
                class="notif-roll"
                @click.stop="n.rollup.expanded = true"
              >
                <cc-avatar :src="n.rollup.avatar" :size="24" click-behavior="none" :is-lazy-loading="false" />
                <span class="notif-roll-text cc-text-small">{{ n.rollup.text }}</span>
              </div>
              <div v-show="n.rollup.expanded" class="notif-comments">
                <div
                  v-for="c in n.rollup.comments"
                  :key="c.id"
                  class="notif-comment"
                >
                  <cc-avatar :src="c.avatar" :size="24" click-behavior="none" :is-lazy-loading="false" />
                  <div class="notif-comment-content">
                    <span class="notif-comment-user cc-text-medium-bold">{{ c.username }}</span>
                    <span class="notif-comment-body cc-text-small">{{ c.body }}</span>
                  </div>
                </div>
              </div>
            </template>
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
          <span class="notif-footer-label cc-text-small-bold">Only show unread</span>
          <cc-switch v-model="showUnreadOnly" size="small" />
        </div>
      </div>
    </div>

    <main class="page-content" @click="showNotifications = false">
    </main>

    <!-- Menu button top right -->
    <button class="menu-button" aria-label="Menu" @click="showPrototypeMenu = true">
      <CcIcon name="mark-menu" :size="24" />
    </button>

    <!-- Prototype Navigation Menu -->
    <PrototypeMenu
      :open="showPrototypeMenu"
      :selected-category="selectedCategory"
      :categories="categories"
      :notification-names="notificationNames"
      @close="showPrototypeMenu = false"
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
} from '@chesscom/design-system'
import { ref, computed, watch, nextTick } from 'vue'
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
const showPrototypeMenu = ref(false)
const selectedCategory = ref('demo')
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
}

const categories = [
  { id: 'demo', label: 'Demo' },
  { id: 'clubs', label: 'Clubs' },
  { id: 'games-challenges', label: 'Games — Challenges' },
  { id: 'games-active', label: 'Games — Active Games' },
  { id: 'games-competitions', label: 'Games — Competitions' },
  { id: 'social', label: 'Social' },
  { id: 'achievements', label: 'Achievements & Rewards' },
  { id: 'other', label: 'Other' },
]

function buildCategoryData() {
  return {
    demo: [
      { id: 'demo-1', type: 'Game Seek (Daily)', title: 'MagnusCarlsen', body: 'Wants to play Daily', time: '6h', avatar: avatars.magnus, unread: true, hasActions: true, rollup: null },
      { id: 'demo-2', type: 'Team Match', title: 'CHESScom', body: 'A new Team Match is starting', time: '23h', avatar: avatars.chesscom, unread: true, hasActions: false, rollup: null },
      { id: 'demo-3', type: 'New Comment (Rollup)', title: 'Barcelona Chess Club', body: '3 new comments', time: '1d', avatar: avatars.barcelona, unread: false, hasActions: false,
        rollup: { avatar: avatars.barcelona, text: '+2 more comments', expanded: false, comments: [
          { id: 'c1', avatar: avatars.gotham, username: 'GothamChess', body: 'Great game analysis! The knight sacrifice on move 23 was brilliant.' },
          { id: 'c2', avatar: avatars.botez, username: 'BotezLive', body: 'Our team should try this opening in the next match.' },
        ]},
      },
      { id: 'demo-4', type: 'Your Move (Daily)', title: "It's your move!", body: 'FabianoCaruana played Nxe5.', time: '3d', avatar: avatars.fabiano, unread: false, hasActions: false, rollup: null },
      { id: 'demo-5', type: 'Game Finished', title: 'You won!', body: 'You beat HikaruNakamura on time.', time: '40d', avatar: avatars.hikaru, unread: false, hasActions: false, rollup: null },
    ],

    clubs: [
      { id: 'club-1', type: 'Club News', title: 'Barcelona Chess Club', body: 'Posted news', time: '2h', avatar: avatars.barcelona, unread: true, hasActions: false, rollup: null },
      { id: 'club-2', type: 'Club Note', title: 'Team USA', body: 'Has a new Note', time: '5h', avatar: avatars.teamusa, unread: true, hasActions: false,
        rollup: { avatar: avatars.teamusa, text: '+3 new notes this week', expanded: false, comments: [
          { id: 'cn1', avatar: avatars.teamusa, username: 'Team USA Admin', body: 'Weekly tournament schedule has been updated.' },
          { id: 'cn2', avatar: avatars.teamusa, username: 'Team USA Admin', body: 'Congratulations to our members who achieved new ratings!' },
        ]},
      },
      { id: 'club-3', type: 'Club Forum Topic', title: 'Barcelona Chess Club', body: 'Has a new topic', time: '1d', avatar: avatars.barcelona, unread: false, hasActions: false,
        rollup: { avatar: avatars.barcelona, text: '+2 new topics', expanded: false, comments: [
          { id: 'cf1', avatar: avatars.gotham, username: 'GothamChess', body: 'Best opening prep for club matches?' },
          { id: 'cf2', avatar: avatars.chessbrah, username: 'chessbrah', body: 'Analyzing our last team match results' },
        ]},
      },
      { id: 'club-4', type: 'Club Join Request', title: 'Barcelona Chess Club', body: 'NihalSarin wants to join', time: '3h', avatar: avatars.barcelona, unread: true, hasActions: true, rollup: null },
    ],

    'games-challenges': [
      { id: 'gc-1', type: 'Game Seek (Daily)', title: 'MagnusCarlsen', body: 'Wants to play Daily', time: '6h', avatar: avatars.magnus, unread: true, hasActions: true, rollup: null },
      { id: 'gc-2', type: 'Live Challenge', title: 'HikaruNakamura', body: 'Wants to play Blitz 3+0', time: '2m', avatar: avatars.hikaru, unread: true, hasActions: true, rollup: null },
    ],

    'games-active': [
      { id: 'ga-1', type: 'Game Started', title: "It's your move!", body: 'Your game with FabianoCaruana (2820) has started!', time: '1m', avatar: avatars.fabiano, unread: true, hasActions: false, rollup: null },
      { id: 'ga-2', type: 'Your Move (Daily)', title: "It's your move!", body: 'DanielNaroditsky played Nf3.', time: '4h', avatar: avatars.naroditsky, unread: true, hasActions: false, rollup: null },
      { id: 'ga-3', type: 'Game Low On Time', title: 'AnishGiri', body: 'Your game against AnishGiri is running out of time. Make your move!', time: '30m', avatar: avatars.anishgiri, unread: true, hasActions: false, rollup: null },
      { id: 'ga-4', type: 'Draw Offered', title: 'PenguinGM', body: 'Offered a Draw', time: '15m', avatar: avatars.penguin, unread: true, hasActions: true, rollup: null },
      { id: 'ga-5', type: 'Chat Message Sent', title: 'GMWso (2650) messaged you', body: 'Good game! That endgame was really tricky.', time: '2h', avatar: avatars.wesley, unread: false, hasActions: false, rollup: null },
      { id: 'ga-6', type: 'Game Finished', title: 'You won!', body: 'You beat chessbrah by resignation.', time: '1d', avatar: avatars.chessbrah, unread: false, hasActions: false, rollup: null },
    ],

    'games-competitions': [
      { id: 'gcomp-1', type: 'Team Match', title: 'Team Match "Barcelona vs Team USA" Has Started', body: 'Click to view the match', time: '1h', avatar: avatars.teamusa, unread: true, hasActions: false, rollup: null },
      { id: 'gcomp-2', type: 'Tournament Game', title: "It's your move!", body: 'Your tournament game with RPragChess has started.', time: '3h', avatar: avatars.rprag, unread: true, hasActions: false, rollup: null },
      { id: 'gcomp-3', type: 'Team Live Competition', title: 'Champions Chess Tour', body: 'Starts in 30 minutes', time: '30m', avatar: avatars.chesscom, unread: true, hasActions: false, rollup: null },
      { id: 'gcomp-4', type: 'Vote Chess Game', title: 'Barcelona vs Team USA', body: 'Has an update', time: '6h', avatar: avatars.barcelona, unread: false, hasActions: false,
        rollup: { avatar: avatars.barcelona, text: 'Votechess game has 4 updates', expanded: false, comments: [
          { id: 'vc1', avatar: avatars.gotham, username: 'GothamChess', body: 'I voted for Bb5 — pins the knight and keeps pressure.' },
          { id: 'vc2', avatar: avatars.botez, username: 'BotezLive', body: 'What about d4? Opens up the center nicely.' },
          { id: 'vc3', avatar: avatars.naroditsky, username: 'DanielNaroditsky', body: 'Bb5 is stronger here. After d4 exd4, Black gets counterplay.' },
          { id: 'vc4', avatar: avatars.anna, username: 'AnnaCramling', body: 'I agree with Bb5. Let\'s keep the tension on the kingside.' },
        ]},
      },
    ],

    social: [
      { id: 'soc-1', type: 'New Comment', title: 'My Brilliant Game Analysis', body: '3 new comments', time: '2h', avatar: null, useIcon: 'message-bubble-fill-left', unread: true, hasActions: false,
        rollup: { avatar: avatars.gotham, text: '+2 more comments', expanded: false, comments: [
          { id: 'sc1', avatar: avatars.gotham, username: 'GothamChess', body: 'That sacrifice was absolutely stunning!' },
          { id: 'sc2', avatar: avatars.anna, username: 'AnnaCramling', body: 'Can you share the PGN? Would love to study this.' },
        ]},
      },
      { id: 'soc-2', type: 'New Content', title: 'GothamChess', body: 'Has a new post', time: '4h', avatar: avatars.gotham, unread: true, hasActions: false, rollup: null },
      { id: 'soc-3', type: 'Profile Notes', title: 'BotezLive', body: 'Left a note on your profile', time: '1d', avatar: avatars.botez, unread: false, hasActions: false, rollup: null },
      { id: 'soc-4', type: 'Friend Request', title: 'NihalSarin', body: 'Wants to be friends', time: '6h', avatar: avatars.nihal, unread: true, hasActions: true, rollup: null },
      { id: 'soc-5', type: 'Friend Activity', title: 'DanielNaroditsky', body: 'Has achieved a rating of 2830 in Blitz', time: '12h', avatar: avatars.naroditsky, unread: false, hasActions: false, rollup: null },
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
  }
}

const categoryData = buildCategoryData()

const notifications = ref([...categoryData.demo])

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

function highlightNotification(id) {
  showPrototypeMenu.value = false
  showNotifications.value = true
  notificationCount.value = 0
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
  cursor: pointer;
}

.notif-roll:hover {
  background: var(--color-bg-subtle, rgba(255,255,255,0.1));
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

/* -- Menu Button -- */

.menu-button {
  position: fixed;
  top: 4px;
  right: 4px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: background 0.15s ease;
  z-index: 50;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.1);
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
