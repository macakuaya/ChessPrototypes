<script setup>
import { ref, computed } from 'vue'
import { CcIcon } from '@chesscom/design-system'
import DatePicker from './DatePicker.vue'

defineProps({
  puzzleTitle: { type: String, default: 'Painted Into a Corner' },
})

const emit = defineEmits(['close', 'select-date'])

const DAY_HEADERS = ['M', 'T', 'W', 'TH', 'F', 'S', 'S']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const now = new Date()
const todayYear = now.getFullYear()
const todayMonth = now.getMonth()
const todayDay = now.getDate()

const currentYear = ref(todayYear)
const currentMonth = ref(todayMonth)

const monthLabel = computed(() => `${MONTH_NAMES[currentMonth.value]} ${currentYear.value}`)
const dateLabel = computed(() => `${MONTH_NAMES[todayMonth]} ${todayDay}, ${todayYear}`)
const isCurrentMonth = computed(() => currentYear.value === todayYear && currentMonth.value === todayMonth)

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (isCurrentMonth.value) return
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())

const firstDayOffset = computed(() => {
  const jsDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  return jsDay === 0 ? 6 : jsDay - 1
})

// Mock data for past months
const MOCK_STATES = {
  2025: {
    11: { 5: 'solved', 12: 'solved', 13: 'solved', 14: 'solved', 15: 'solved', 16: 'solved', 17: 'solved', 22: 'solved', 29: 'solved' },
  },
  2026: {
    0: { 3: 'solved', 7: 'solved', 8: 'solved', 9: 'solved', 10: 'solved', 11: 'solved', 12: 'solved', 13: 'solved', 20: 'solved', 21: 'solved', 27: 'solved' },
    1: { 2: 'solved', 3: 'solved', 9: 'solved', 14: 'solved', 15: 'solved', 16: 'solved', 17: 'solved', 18: 'solved', 19: 'solved', 20: 'solved', 25: 'solved', 26: 'solved', 27: 'solved', 28: 'solved' },
    2: { 1: 'solved', 2: 'streak', 3: 'streak' },
  },
}

const getState = (day) => {
  const y = currentYear.value
  const m = currentMonth.value
  if (y === todayYear && m === todayMonth && day === todayDay) return 'today'
  if (y === todayYear && m === todayMonth && day > todayDay) return 'future'
  if (y > todayYear || (y === todayYear && m > todayMonth)) return 'future'
  const monthData = MOCK_STATES[y]?.[m]
  if (monthData && monthData[day]) return monthData[day]
  return 'empty'
}

// Count consecutive streak days ending at today
const streakLength = computed(() => {
  let count = 0
  const d = new Date(todayYear, todayMonth, todayDay)
  while (true) {
    const y = d.getFullYear()
    const m = d.getMonth()
    const day = d.getDate()
    const monthData = MOCK_STATES[y]?.[m]
    const state = (y === todayYear && m === todayMonth && day === todayDay)
      ? 'today'
      : monthData?.[day]
    if (state === 'streak' || state === 'today') {
      count++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return count
})

const streakColor = computed(() => {
  const s = streakLength.value
  if (s <= 1) return 'var(--color-text-win, #81B64C)'
  if (s === 2) return 'var(--color-streak-lowest, #E3AA24)'
  if (s <= 4) return 'var(--color-streak-low, #E89B3C)'
  if (s <= 6) return 'var(--color-streak-medium, #E07A3C)'
  return 'var(--color-streak-high, #DC4C3C)'
})

const weeks = computed(() => {
  const result = []
  let week = new Array(firstDayOffset.value).fill(null)
  for (let d = 1; d <= daysInMonth.value; d++) {
    week.push(d)
    if (week.length === 7) {
      result.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    result.push(week)
  }
  return result
})
</script>

<template>
  <div class="archive-contents">
    <!-- Date Selector -->
    <DatePicker
      :label="dateLabel"
      :show-up-chevron="true"
      :hide-chevrons="true"
      @toggle="emit('close')"
    />

    <!-- Title + Calendar + Legend -->
    <div class="calendar-block">
      <h2 class="puzzle-title">{{ puzzleTitle }}</h2>

      <!-- Calendar Card -->
      <div class="calendar-card">
        <!-- Month Selector -->
        <div class="month-selector">
          <button class="month-nav" aria-label="Previous month" @click="prevMonth">
            <CcIcon name="arrow-chevron-left" :size="16" />
          </button>
          <span class="month-label">{{ monthLabel }}</span>
          <button class="month-nav" :class="{ 'month-nav-disabled': isCurrentMonth }" :disabled="isCurrentMonth" aria-label="Next month" @click="nextMonth">
            <CcIcon name="arrow-chevron-right" :size="16" />
          </button>
        </div>

        <!-- Grid -->
        <div class="calendar-grid">
          <!-- Day headers -->
          <div v-for="h in DAY_HEADERS" :key="'h-'+h" class="day-header">{{ h }}</div>

          <!-- Day cells -->
          <template v-for="(week, wi) in weeks" :key="'w-'+wi">
            <div v-for="(day, di) in week" :key="'d-'+wi+'-'+di" class="day-cell">
              <template v-if="day !== null">
                <div
                  class="day-icon"
                  :class="{
                    'day-solved': getState(day) === 'solved',
                    'day-streak': getState(day) === 'streak' || getState(day) === 'today',
                    'day-today': getState(day) === 'today',
                    'day-empty': getState(day) === 'empty',
                    'day-future': getState(day) === 'future',
                    'day-hoverable': getState(day) !== 'future',
                  }"
                >
                  <CcIcon
                    v-if="getState(day) === 'solved'"
                    name="mark-check"
                    :size="16"
                    class="icon-solved"
                  />
                  <CcIcon
                    v-else-if="getState(day) === 'streak' || getState(day) === 'today'"
                    name="element-fire-blank"
                    :size="16"
                    :style="{ color: streakColor }"
                  />
                </div>
                <span
                  class="day-number"
                  :class="{ 'day-number-subtle': getState(day) === 'future' }"
                >{{ day }}</span>
              </template>
            </div>
          </template>
        </div>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div class="legend-item">
          <CcIcon name="element-fire-blank" :size="16" :style="{ color: streakColor }" />
          <span class="legend-text">{{ streakLength }} day{{ streakLength !== 1 ? 's' : '' }} Streak</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive-contents {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 24px 24px;
  overflow: auto;
}

/* Title + Calendar Block */
.calendar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.puzzle-title {
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-weight: 700;
  font-size: 17px;
  line-height: 20px;
  color: var(--color-text-boldest, white);
  text-align: center;
  margin: 0;
  width: 100%;
  font-feature-settings: 'liga' 0;
}

/* Calendar Card */
.calendar-card {
  width: 284px;
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.02));
  border-radius: 20px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* Month Selector */
.month-selector {
  display: flex;
  align-items: center;
  width: 100%;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  background: none;
  border: none;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
  padding: 0;
}

.month-nav-disabled {
  opacity: 0.3;
  cursor: default;
}

.month-label {
  flex: 1;
  font-family: var(--font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: var(--color-text-bolder, rgba(255, 255, 255, 0.85));
  text-align: center;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 32px);
  gap: 8px 6px;
  width: 260px;
}

/* Day Headers */
.day-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  font-family: var(--font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
  text-align: center;
}

/* Day Cells */
.day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 32px;
}

.day-icon {
  width: 32px;
  height: 32px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--motion-fast, 150ms) var(--motion-ease-out-gentle, cubic-bezier(0, 0, 0.2, 1));
}

.day-hoverable {
  cursor: pointer;
}

.day-solved {
  background: var(--color-bg-subtler, rgba(255, 255, 255, 0.08));
}

.day-streak {
  background: var(--color-bg-subtler, rgba(255, 255, 255, 0.08));
}

.day-today {
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.02));
  border: 3px solid var(--color-border-success, #81b64c);
}

.day-empty,
.day-future {
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.02));
}

@media (hover: hover) {
  .day-solved.day-hoverable:hover,
  .day-streak.day-hoverable:hover {
    background: var(--color-bg-subtle, rgba(255, 255, 255, 0.14));
  }

  .day-empty.day-hoverable:hover,
  .day-today.day-hoverable:hover {
    background: var(--color-bg-subtler, rgba(255, 255, 255, 0.08));
  }
}

.day-number {
  font-family: var(--font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: var(--color-text-boldest, white);
  text-align: center;
  white-space: nowrap;
}

.day-number-subtle {
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
}

.icon-solved {
  color: var(--color-green-300, #81B64C);
}


/* Legend */
.legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-text {
  font-family: var(--font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  white-space: nowrap;
}
</style>
