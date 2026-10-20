<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string | number
  goal?: string
  percent?: number
  accent?: 'orange' | 'green' | 'blue' | 'purple'
}>()

const accentStyles = computed(() => ({
  orange: { icon: 'bg-orange-100 text-orange-600', track: 'bg-orange-50', bar: 'bg-orange-500' },
  green: { icon: 'bg-emerald-100 text-emerald-700', track: 'bg-emerald-50', bar: 'bg-emerald-600' },
  blue: { icon: 'bg-sky-100 text-sky-600', track: 'bg-sky-50', bar: 'bg-sky-500' },
  purple: { icon: 'bg-violet-100 text-violet-600', track: 'bg-violet-50', bar: 'bg-violet-500' },
})[props.accent || 'green'])
</script>

<template>
  <section class="flex min-h-[148px] flex-col rounded-[18px] border border-emerald-950/[0.07] bg-white p-5 shadow-[0_4px_18px_rgba(15,50,45,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,50,45,0.08)]">
    <div class="flex items-center gap-3">
      <span class="grid size-11 shrink-0 place-items-center rounded-full" :class="accentStyles.icon">
        <svg v-if="accent === 'orange'" viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true"><path d="M13.4 2.8c.8 4-3.7 5.1-2.2 8.2.6 1.2 1.5 1.6 2.4 1.7-.3-1.5.6-2.9 2.2-3.8 2 1.7 3.1 3.6 3.1 5.8a6.9 6.9 0 1 1-13.8 0c0-3.5 2.1-6 5-8.2-.2 2.2.3 3.2 1.1 3.8-.5-3.2 2.1-4.8 2.2-7.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <svg v-else-if="accent === 'green'" viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true"><path d="M19.8 4.2C11.2 4 5.2 6.6 5.2 12.7c0 3.2 2.2 5.3 5 5.3 5.5 0 8.5-6.1 9.6-13.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3.5 21c2.2-5.7 6.1-9.4 12-12.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <svg v-else-if="accent === 'blue'" viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true"><path d="M12 3v18M8 5l4 3 4-3M7 10l5 3 5-3M6 15l6 3 6-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true"><path d="M12 3.2c-2.2 3.2-6.4 8-6.4 11.5a6.4 6.4 0 1 0 12.8 0c0-3.5-4.2-8.3-6.4-11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 15.2c.2 1.5 1.2 2.5 2.7 2.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-slate-500">{{ label }}</p>
        <p class="mt-1 flex items-baseline gap-1.5 text-[26px] font-semibold leading-none tracking-tight text-[#102a33]">
          {{ value }}<span v-if="goal" class="text-sm font-normal tracking-normal text-slate-400">/ {{ goal }}</span>
        </p>
      </div>
    </div>
    <div v-if="percent !== undefined" class="mt-auto flex items-center gap-3 pt-5">
      <div class="h-2 flex-1 overflow-hidden rounded-full" :class="accentStyles.track" role="progressbar" :aria-label="`${label} progress`" :aria-valuenow="Math.min(Math.max(percent, 0), 100)" aria-valuemin="0" aria-valuemax="100">
        <div class="h-full rounded-full transition-[width] duration-500" :class="accentStyles.bar" :style="{ width: Math.min(Math.max(percent, 0), 100) + '%' }" />
      </div>
      <span class="w-9 text-right text-xs font-semibold tabular-nums text-slate-500">{{ Math.round(percent) }}%</span>
    </div>
  </section>
</template>
