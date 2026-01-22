<script setup>
import { ref } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const props = defineProps({
  open: { type: Boolean, default: false },
  selectedExample: { type: String, default: 'skill-point-earned' },
})

const emit = defineEmits(['close', 'select'])

const dropdownOpen = ref(false)

const examples = [
  { id: 'skill-point-earned', label: 'Skill Point Earned' },
  { id: 'ftue', label: 'FTUE' },
  { id: 'end-of-ftue', label: 'End of FTUE' },
  { id: 'mastered-skill', label: 'Mastered Skill' },
  { id: 'all-skills-mastered', label: 'All Skills Mastered' },
]

function selectExample(id) {
  emit('select', id)
  dropdownOpen.value = false
}

function getSelectedLabel() {
  const example = examples.find(e => e.id === props.selectedExample)
  return example ? example.label : 'Select Example'
}
</script>

<template>
  <Transition name="menu">
    <div v-if="open" class="prototype-menu-overlay" @click.self="$emit('close')">
      <div class="prototype-menu-panel">
        <!-- Header -->
        <div class="panel-header">
          <span class="panel-title">Prototypes</span>
          <button class="close-button" @click="$emit('close')">
            <CcIcon name="mark-cross" :size="16" />
          </button>
        </div>

        <!-- Dropdown -->
        <div class="panel-content">
          <div class="dropdown-container">
            <button class="dropdown-button" @click="dropdownOpen = !dropdownOpen">
              <span class="dropdown-label">{{ getSelectedLabel() }}</span>
              <span class="dropdown-chevron" :class="{ open: dropdownOpen }">
                <CcIcon 
                  :name="dropdownOpen ? 'arrow-chevron-top' : 'arrow-chevron-bottom'" 
                  :size="12" 
                />
              </span>
            </button>

            <!-- Dropdown Menu -->
            <div v-if="dropdownOpen" class="dropdown-menu">
              <button
                v-for="example in examples"
                :key="example.id"
                class="dropdown-item"
                :class="{ selected: selectedExample === example.id }"
                @click="selectExample(example.id)"
              >
                <span class="item-label">{{ example.label }}</span>
                <CcIcon 
                  v-if="selectedExample === example.id" 
                  name="circle-fill-check" 
                  :size="16"
                  class="check-icon"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.prototype-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.77);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.prototype-menu-panel {
  width: 360px;
  height: 100%;
  background: #262421;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  font-family: 'Chess Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  color: white;
}

.close-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: white;
  margin-right: -12px;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.panel-content {
  padding: 16px;
}

.dropdown-container {
  position: relative;
}

.dropdown-button {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 8px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  cursor: pointer;
  backdrop-filter: blur(25px);
  box-shadow: 
    0px 1px 2px 0px rgba(0, 0, 0, 0.14),
    0px 2px 4px 0px rgba(0, 0, 0, 0.1),
    inset 0px 1px 0px 0px rgba(255, 255, 255, 0.14);
}

.dropdown-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0px 1px 0px rgba(0, 0, 0, 0.2);
}

.dropdown-chevron {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-icon-default);
}

.dropdown-menu {
  position: absolute;
  top: 42px;
  left: 0;
  right: 0;
  background: #262421;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 10;
}

.dropdown-item {
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-item.selected {
  background: rgba(255, 255, 255, 0.05);
}

.item-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.72);
}

.dropdown-item.selected .item-label {
  color: rgba(255, 255, 255, 0.85);
}

.check-icon {
  flex-shrink: 0;
  color: #81B64C;
}

/* Transition animations */
.menu-enter-active {
  transition: opacity 300ms cubic-bezier(0.2, 1, 0.3, 1);
}

.menu-leave-active {
  transition: opacity 300ms cubic-bezier(0.2, 1, 0.3, 1);
}

.menu-enter-active .prototype-menu-panel {
  transition: transform 300ms cubic-bezier(0.2, 1, 0.3, 1);
}

.menu-leave-active .prototype-menu-panel {
  transition: transform 300ms cubic-bezier(0.2, 1, 0.3, 1);
}

.menu-enter-active .panel-header,
.menu-enter-active .panel-content {
  transition: opacity 300ms cubic-bezier(0.2, 1, 0.3, 1);
}

.menu-leave-active .panel-header,
.menu-leave-active .panel-content {
  transition: opacity 300ms cubic-bezier(0.2, 1, 0.3, 1);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

.menu-enter-from .prototype-menu-panel,
.menu-leave-to .prototype-menu-panel {
  transform: translateX(100%);
}

.menu-enter-from .panel-header,
.menu-enter-from .panel-content,
.menu-leave-to .panel-header,
.menu-leave-to .panel-content {
  opacity: 0;
}
</style>
