<template>
  <nav class="nav-component">
    <div class="nav-top">
      <div class="nav-logo">
        <img class="nav-logo-img" :src="`${baseUrl}chess-com-logo.png`" alt="Chess.com" />
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

          <div class="nav-more">
            <span class="nav-more-chevron">
              <cc-icon name="arrow-chevron-bottom" :size="12" />
            </span>
            <span class="nav-more-text cc-text-medium-bold">More</span>
          </div>
        </div>

        <a class="nav-primary nav-free-trial" href="#">
          <cc-icon name="commerce-diamond" variant="color" :size="24" />
          <span class="nav-free-trial-text cc-text-medium-bold">Free Trial</span>
        </a>
      </div>
    </div>

    <div class="nav-bottom">
      <div class="nav-bottom-container">
        <div class="nav-bottom-links">
          <a class="nav-search" href="#">
            <cc-icon name="tool-magnifier-blank" :size="24" />
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
        <div class="nav-footer-btn nav-footer-btn-highlighted">
          <cc-icon name="users" :size="20" />
          <cc-notification-badge
            :label="2"
            variant="alert"
            class="nav-badge"
          />
        </div>
        <div class="nav-footer-btn">
          <cc-icon name="message-envelope-fill" :size="20" />
        </div>
        <div class="nav-footer-btn">
          <cc-icon name="media-bell-fill" :size="20" />
        </div>
        <div class="nav-footer-btn">
          <cc-icon name="utility-cogwheel" :size="20" />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import {
  CcIcon,
  CcAvatar,
  CcNotificationBadge,
} from '@chesscom/design-system'

const baseUrl = import.meta.env.BASE_URL

const mainLinks = [
  { icon: 'play-white', label: 'Play' },
  { icon: 'puzzle-piece', label: 'Puzzles' },
  { icon: 'lessons', label: 'Learn' },
  { icon: 'training', label: 'Train' },
]
</script>

<style scoped>
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

.nav-primary-text {
  color: var(--color-text-bolder, rgba(255, 255, 255, 0.85));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* More */

.nav-more {
  display: flex;
  align-items: center;
  gap: var(--space-12, 1.2rem);
  padding: var(--space-8, 0.8rem);
  border-radius: var(--radius-l, 0.5rem);
  user-select: none;
}

.nav-more-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
}

.nav-more-text {
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  text-align: left;
}

/* Free Trial */

.nav-free-trial-text {
  color: var(--color-blue-100, #4DC3EA);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
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
  gap: var(--space-12, 1.2rem);
  padding: var(--space-4, 0.4rem) var(--space-8, 0.8rem);
  border-radius: var(--radius-l, 0.5rem);
  text-decoration: none;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.5));
  user-select: none;
}

.nav-search-text {
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Username */

.nav-username {
  display: flex;
  align-items: stretch;
  height: 3.2rem;
  min-height: 3.2rem;
  border-radius: var(--radius-l, 0.5rem);
  text-decoration: none;
  color: inherit;
  user-select: none;
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
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
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
  color: var(--color-icon-default, rgba(255, 255, 255, 0.5));
}

.nav-footer-btn-highlighted {
  background-color: var(--color-bg-subtler, rgba(255, 255, 255, 0.08));
}

.nav-badge {
  position: absolute;
  top: -0.3rem;
  left: 1.9rem;
  padding-left: 0.2rem;
  padding-right: 0.2rem;
}
</style>
