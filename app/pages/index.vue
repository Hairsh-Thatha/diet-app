<script setup lang="ts">
const { data, pending, error } = useNutrition()
const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'
</script>

<template>
  <div class="dashboard-page mx-auto max-w-[1440px] flex flex-col gap-6 space-y-0 pb-0">
    <header class="flex flex-wrap items-center justify-between gap-5 sm:gap-8">
      <div>
        <p class="text-sm font-semibold tracking-wide text-emerald-700">{{ today }}</p>
        <h1 class="mt-2 text-[30px] font-semibold tracking-tight text-[#102a33] sm:text-[38px]">{{ greeting }} <span aria-hidden="true">👋</span></h1>
        <p class="mt-2 text-base text-slate-500 sm:text-[17px]">A little progress adds up.</p>
      </div>
      <NuxtLink to="/scan-food" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(8,127,91,0.16)] transition hover:-translate-y-0.5 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20">
        <svg viewBox="0 0 24 24" fill="none" class="size-[18px]" aria-hidden="true"><path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" stroke-width="1.8"/></svg>
        <span>＋ Scan food</span>
      </NuxtLink>
    </header>

    <p v-if="error" class="rounded-2xl border border-amber-200/70 bg-amber-50 px-5 py-4 text-sm text-amber-900">Sign in and connect your database to load personal nutrition data.</p>

    <section aria-labelledby="nutrition-heading">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-700"><svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true"><path d="M12 3.5 19 6v5.6c0 4.4-3 7.2-7 8.9-4-1.7-7-4.5-7-8.9V6l7-2.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 12.2 11 14l4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <div>
            <h2 id="nutrition-heading" class="text-lg font-semibold text-[#102a33]">Today's nutrition</h2>
            <p class="mt-0.5 text-sm text-slate-500">Track your daily intake and stay on your goals.</p>
          </div>
        </div>
        <NuxtLink to="/settings" class="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-900">
          <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" stroke="currentColor" stroke-width="1.7"/><path d="m19.2 13.5 1.1.9-1.5 2.6-1.3-.5a7.9 7.9 0 0 1-1.5.9l-.2 1.4h-3l-.3-1.4a7.9 7.9 0 0 1-1.5-.9l-1.3.5-1.5-2.6 1.1-.9a7 7 0 0 1 0-1.8l-1.1-.9 1.5-2.6 1.3.5a7.9 7.9 0 0 1 1.5-.9l.3-1.4h3l.2 1.4a7.9 7.9 0 0 1 1.5.9l1.3-.5 1.5 2.6-1.1.9a7 7 0 0 1 0 1.8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          Edit goals <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div v-if="pending" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-[148px] animate-pulse rounded-[18px] border border-emerald-950/[0.05] bg-white/80" />
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Calories" :value="data?.totals.calories || 0" :goal="`${data?.goals.calories} kcal`" :percent="(data?.totals.calories || 0) / (data?.goals.calories || 1) * 100" accent="orange" />
        <StatCard label="Protein" :value="`${data?.totals.protein || 0}g`" :goal="`${data?.goals.protein}g`" :percent="(data?.totals.protein || 0) / (data?.goals.protein || 1) * 100" accent="green" />
        <StatCard label="Carbohydrates" :value="`${data?.totals.carbs || 0}g`" :goal="`${data?.goals.carbs}g`" :percent="(data?.totals.carbs || 0) / (data?.goals.carbs || 1) * 100" accent="blue" />
        <StatCard label="Fat" :value="`${data?.totals.fat || 0}g`" :goal="`${data?.goals.fat}g`" :percent="(data?.totals.fat || 0) / (data?.goals.fat || 1) * 100" accent="purple" />
      </div>
    </section>

    <div class="grid items-stretch gap-5 xl:grid-cols-12">
      <section class="flex min-h-[330px] flex-col rounded-[20px] border border-emerald-950/[0.07] bg-white p-5 shadow-[0_4px_20px_rgba(15,50,45,0.05)] sm:p-6 xl:col-span-7" aria-labelledby="menu-heading">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true"><path d="M5 4.5h14v15H5zM8 8h8M8 11.5h8M8 15h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div><h2 id="menu-heading" class="text-base font-semibold text-[#102a33]">Today's menu</h2><p class="mt-0.5 text-sm text-slate-500">Meals logged today</p></div>
          </div>
          <NuxtLink to="/todays-menu" class="shrink-0 rounded-lg px-2 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">View all <span aria-hidden="true">→</span></NuxtLink>
        </div>

        <div v-if="!data?.entries.length" class="flex flex-1 flex-col items-center justify-center rounded-2xl border border-emerald-950/[0.045] bg-[linear-gradient(135deg,#f7fbfa,#f8fafc)] px-5 py-7 text-center">
          <span class="grid size-[60px] place-items-center rounded-full bg-emerald-100/80 text-[30px]" aria-hidden="true">🥗</span>
          <h3 class="mt-4 text-base font-semibold text-[#102a33]">No meals added today</h3>
          <p class="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">Scan your first meal to start tracking your nutrition.</p>
          <NuxtLink to="/scan-food" class="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20"><svg viewBox="0 0 24 24" fill="none" class="size-[17px]" aria-hidden="true"><path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" stroke-width="1.8"/></svg>＋ Scan food</NuxtLink>
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="x in data.entries.slice(0, 4)" :key="x.id" class="flex items-center justify-between gap-4 py-3.5 first:pt-1">
            <div class="flex min-w-0 items-center gap-3"><span class="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg" aria-hidden="true">🥣</span><div class="min-w-0"><p class="truncate text-sm font-semibold text-[#102a33]">{{ x.foodName }}</p><p class="mt-1 text-xs text-slate-500">{{ x.mealType }} · {{ x.servingSize }}</p></div></div>
            <p class="shrink-0 text-sm font-semibold tabular-nums text-slate-700">{{ x.calories }} <span class="font-normal text-slate-400">kcal</span></p>
          </div>
        </div>
      </section>

      <section class="relative isolate flex min-h-[330px] flex-col overflow-hidden rounded-[20px] bg-[#063c32] p-6 text-white shadow-[0_8px_24px_rgba(4,60,50,0.12)] sm:p-7 xl:col-span-5" aria-labelledby="winter-heading">
        <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_4%,rgba(34,197,139,0.22),transparent_42%),linear-gradient(145deg,#073b32,#052f29)]" />
        <svg viewBox="0 0 520 280" fill="none" class="pointer-events-none absolute -right-8 bottom-0 -z-10 h-44 w-[88%] opacity-[0.13]" aria-hidden="true"><path d="m0 230 93-82 52 42 92-113 71 86 55-46 157 113v50H0v-50Z" fill="#9ed9bd"/><path d="m170 112 67-35 71 86-39-27-29 18-25-22-26 20-19-40Z" fill="#e4fff1"/><path d="m302 156 61-43 55 40 40-17 62 46v48H302v-74Z" fill="#69b891"/></svg>
        <div class="relative flex items-start justify-between gap-4">
          <div>
            <p class="text-[11px] font-semibold tracking-[0.19em] text-emerald-100/70">YOUR DAILY RHYTHM</p>
            <h2 id="winter-heading" class="mt-3 flex items-center gap-2.5 text-[22px] font-semibold tracking-tight"><span class="text-sky-300" aria-hidden="true">❄</span> Winter Arc</h2>
            <p class="mt-2 text-sm text-emerald-50/75">Build consistency, one day at a time.</p>
          </div>
          <span class="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-xl" aria-hidden="true">✦</span>
        </div>
        <NuxtLink to="/winter-arc" class="relative mt-5 inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-white/10 bg-emerald-400/15 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400/25">Open challenge <span aria-hidden="true">→</span></NuxtLink>
        <div class="relative mt-auto grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/[0.07] bg-white/[0.06] py-4">
          <div class="px-2 text-center"><span class="text-base text-amber-300" aria-hidden="true">◎</span><p class="mt-1 text-xs font-semibold text-white">Stay Consistent</p><p class="mt-1 text-[11px] text-emerald-50/60">Build better habits</p></div>
          <div class="px-2 text-center"><span class="text-base text-sky-300" aria-hidden="true">▥</span><p class="mt-1 text-xs font-semibold text-white">Track Progress</p><p class="mt-1 text-[11px] text-emerald-50/60">See your growth</p></div>
          <div class="px-2 text-center"><span class="text-base text-amber-300" aria-hidden="true">★</span><p class="mt-1 text-xs font-semibold text-white">Feel Better</p><p class="mt-1 text-[11px] text-emerald-50/60">A healthier you</p></div>
        </div>
      </section>
    </div>
  </div>
</template>
