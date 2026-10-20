<script setup lang="ts">
const route = useRoute()
const isAuthPage = computed(() => ['/login', '/create-account'].includes(route.path))
const nav = [{ label: 'Home', to: '/', icon: 'home' }, { label: 'Scan Food', to: '/scan-food', icon: 'scan' }, { label: "Today's Menu", to: '/todays-menu', icon: 'menu' }, { label: 'Diet Plan', to: '/diet-plan', icon: 'diet' }, { label: 'Winter Arc', to: '/winter-arc', icon: 'winter' }, { label: 'Progress', to: '/progress', icon: 'progress' }, { label: 'Settings', to: '/settings', icon: 'settings' }]
const mobileIcons: Record<string, string> = { home: '⌂', scan: '◉', menu: '▤', diet: '◈', winter: '❄', progress: '▥', settings: '⚙' }
</script>
<template>
  <div v-if="isAuthPage" class="auth-page" :class="route.path === '/login' ? 'auth-page--login' : 'auth-page--register'">
    <div class="auth-topline">
      <NuxtLink to="/login" class="auth-brand" aria-label="Nutric Arc"><span class="brand-mark"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M23.7 44C9.4 37.2 4.1 27 7.4 16.1c8.1 1.3 13.4 5.3 16.3 11.2C27 17.1 33 10.6 42.2 7.5c3.1 15.2-1.8 28.6-18.5 36.5Z" fill="currentColor"/><path d="M24 44V20M24 31c-3.2-5.4-7.4-8.6-13.3-10.4M24 27c4-6.7 8.1-10.8 14.5-13" stroke="white" stroke-width="2.4" stroke-linecap="round"/><path d="M24 5c3.2 2 4.1 4.3 0 7.4C19.9 9.3 20.8 7 24 5Z" fill="#408c59"/></svg></span><span>Nutric <em>Arc</em></span></NuxtLink>
      <div v-if="route.path === '/login'" class="language-pill" aria-label="Language: English"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c2.3 2.5 3.4 5.5 3.4 9S14.3 18.5 12 21c-2.3-2.5-3.4-5.5-3.4-9S9.7 5.5 12 3Z"/></svg>English <span class="chevron">⌄</span></div>
      <p v-else class="auth-switch">Already have an account? <NuxtLink to="/login">Sign in</NuxtLink></p>
    </div>
    <div class="auth-grid">
      <section class="auth-intro">
        <p class="auth-eyebrow">EAT WELL · STAY ACTIVE · BUILD HEALTHY HABITS</p>
        <h2 v-if="route.path === '/login'">Small Everyday<br>Choices.<br><span>A Healthier You.</span></h2>
        <h2 v-else>Start your<br><span>healthier journey</span><br>with Nutric Arc</h2>
        <p class="auth-description">{{ route.path === '/login' ? 'Track what you eat, stay active, and build healthier habits with personalized insights. Nutric Arc helps you create a more balanced and happier life.' : 'Track your food, daily activities, and habits to understand your lifestyle better and build a more balanced, healthier you.' }}</p>
        <div class="feature-grid">
          <div class="feature"><span class="feature-icon feature-icon--green"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3v7M8 3v7M5 7h3M6.5 10v11M16 3c-2 2-3 4.5-3 7h3v11h2V3h-2Z"/></svg></span><div><h3>Track What You Eat</h3><p>Log your meals and make better choices.</p></div></div>
          <div class="feature"><span class="feature-icon feature-icon--blue"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="15.5" cy="4.5" r="2"/><path d="m13 8-3 4 4 2 2 5M10 12l-4 2-2 4M13 8l4 2 3 3M10 8l-3-1"/></svg></span><div><h3>Log Daily Activities</h3><p>Track your steps, workouts and more.</p></div></div>
          <div class="feature"><span class="feature-icon feature-icon--orange"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V11h4v9M10 20V5h4v15M16 20v-7h4v7M3 21h18"/></svg></span><div><h3>See Your Progress</h3><p>See trends and achieve your goals.</p></div></div>
          <div class="feature"><span class="feature-icon feature-icon--purple"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z"/></svg></span><div><h3>Healthier Habits</h3><p>Build sustainable routines for a better you.</p></div></div>
        </div>
        <div class="hero-lifestyle" aria-hidden="true"><span class="hero-orb hero-orb--one"></span><span class="hero-orb hero-orb--two"></span><div class="hero-lifestyle-caption"><span class="hero-caption-dot"></span> Small steps, a healthier everyday</div></div>
      </section>
      <section class="auth-card"><slot /></section>
    </div>
  </div>
  <div v-else class="app-shell min-h-screen lg:flex" :class="route.path === '/' ? 'app-shell--dashboard' : route.path === '/scan-food' ? 'app-shell--scan-food' : route.path === '/diet-plan' ? 'app-shell--diet-plan' : 'app-shell--content'">
    <aside class="app-sidebar hidden lg:flex">
      <NuxtLink to="/" class="sidebar-brand" aria-label="Nutric Arc home">
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M7 38C8 20 20 8 41 6c-.4 20-11 32-31 34" fill="currentColor"/><path d="M8 40c7-11 15-18 27-25" stroke="white" stroke-width="2.4" stroke-linecap="round"/></svg>
        <span>Nutric <em>Arc</em></span>
      </NuxtLink>
      <nav class="sidebar-nav" aria-label="Main navigation">
        <NuxtLink v-for="x in nav" :key="x.to" :to="x.to" class="sidebar-link" :class="route.path===x.to?'is-active':''">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <template v-if="x.icon === 'home'"><path d="m3.5 10 8.5-7 8.5 7v10.5h-6v-7h-5v7h-6V10Z"/></template>
            <template v-else-if="x.icon === 'scan'"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M9 9h6v6H9z"/></template>
            <template v-else-if="x.icon === 'menu'"><path d="M5 4.5h14v15H5zM8 8h8M8 12h8M8 16h5"/></template>
            <template v-else-if="x.icon === 'winter'"><path d="M12 2.8v18.4M4 7.4l16 9.2M4 16.6l16-9.2M9 4.4l3 2 3-2M9 19.6l3-2 3 2M3.8 10.5l3.2.3.8 3.1M20.2 13.5l-3.2-.3-.8-3.1M3.8 13.5l3.2-.3.8-3.1M20.2 10.5l-3.2.3-.8 3.1"/></template>
            <template v-else-if="x.icon === 'progress'"><path d="M4 19V11h4v8H4ZM10 19V5h4v14h-4ZM16 19V8h4v11h-4Z"/></template>
            <template v-else-if="x.icon === 'diet'"><path d="M12 20c-4.8-2.8-6.5-6.5-5.1-10.2 2.6.5 4.4 2.2 5.1 4.2 1.2-4.3 3.4-6.8 7.1-8 .9 5.7-1.5 10.8-7.1 14Z"/><path d="M12 20v-7M12 16c-1-1.7-2.3-2.7-4.2-3.3M12 14c1.2-2 2.4-3.2 4.3-3.9"/></template>
            <template v-else><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M10 2.8h4l.55 2.15a7.7 7.7 0 0 1 1.65.95l2.1-.65 2 3.45-1.55 1.55a7.2 7.2 0 0 1 0 1.9l1.55 1.55-2 3.45-2.1-.65a7.7 7.7 0 0 1-1.65.95L14 19.6h-4l-.55-2.15a7.7 7.7 0 0 1-1.65-.95l-2.1.65-2-3.45 1.55-1.55a7.2 7.2 0 0 1 0-1.9L3.7 8.7l2-3.45 2.1.65a7.7 7.7 0 0 1 1.65-.95L10 2.8Z"/></template>
          </svg>
          <span>{{x.label}}</span>
        </NuxtLink>
      </nav>
    </aside>
    <main class="app-main min-h-screen flex-1 bg-[#f3f8f6] pb-24 lg:pb-0">
      <header class="flex h-16 items-center justify-between border-b border-emerald-950/[0.06] bg-white px-5 lg:hidden"><NuxtLink to="/" class="font-bold text-[#102a33]">Nutric Arc</NuxtLink><NuxtLink to="/settings" aria-label="Account and settings">⚙</NuxtLink></header>
      <div class="app-content mx-auto max-w-[1440px] px-5 py-7 lg:px-9 lg:py-7" :class="route.path === '/scan-food' ? 'app-content--scan-food' : ''"><slot/></div>
    </main>
    <nav class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t border-emerald-950/[0.06] bg-white px-1 py-2 lg:hidden"><NuxtLink v-for="x in nav" :key="x.to" :to="x.to" class="flex flex-col items-center gap-1 rounded-lg py-1 text-[9px] transition-colors" :class="route.path===x.to?'text-emerald-800':'text-slate-400'"><span class="text-lg">{{mobileIcons[x.icon]}}</span>{{x.label}}</NuxtLink></nav>
  </div>
</template>
