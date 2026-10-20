<script setup lang="ts">
const route = useRoute()

// Keep authentication server-side so a saved session can be restored on reload.
const { data: user, error } = await useFetch('/api/auth/me', {
  key: 'nutriarc-auth-user',
  retry: false,
})

if (!user.value || error.value) {
  if (route.path !== '/login' && route.path !== '/create-account') {
    await navigateTo('/login')
  }
} else if (route.path === '/login' || route.path === '/create-account') {
  await navigateTo('/')
}
</script>
<template><UApp :toaster="{ position: 'bottom-center' }"><NuxtLayout><NuxtPage /></NuxtLayout></UApp></template>
