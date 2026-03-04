<script setup>
import { CcIconButton, CcDropdownButton } from '@chesscom/design-system'

defineProps({
  label: { type: String, required: true },
  showUpChevron: { type: Boolean, default: false },
  nextDisabled: { type: Boolean, default: false },
  prevDisabled: { type: Boolean, default: false },
  hideChevrons: { type: Boolean, default: false },
})

defineEmits(['prev', 'next', 'toggle'])
</script>

<template>
  <div class="date-picker">
    <CcIconButton
      v-if="!hideChevrons"
      :icon="{ name: 'arrow-chevron-left', variant: 'glyph' }"
      variant="hovered"
      size="small"
      :iconSize="16"
      :disabled="prevDisabled"
      tooltip="Previous day"
      @click="$emit('prev')"
    />
    <CcDropdownButton
      :label="label"
      variant="ghost"
      size="small"
      :direction="showUpChevron ? 'up' : 'down'"
      @click="$emit('toggle')"
    />
    <CcIconButton
      v-if="!hideChevrons"
      :icon="{ name: 'arrow-chevron-right', variant: 'glyph' }"
      variant="hovered"
      size="small"
      :iconSize="16"
      :disabled="nextDisabled"
      tooltip="Next day"
      @click="$emit('next')"
    />
  </div>
</template>

<style scoped>
.date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (hover: hover) {
  .date-picker :deep(.cc-dropdown-button-ghost:not([disabled]):hover) {
    background: var(--color-bg-subtler);
  }
}
</style>
