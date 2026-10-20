<script setup lang="ts">
definePageMeta({ layout: 'default' })
const form = reactive({ email: '', password: '' })
const remember = ref(true)
const showPassword = ref(false)
const busy = ref(false)
const error = ref('')
const toast = useToast()
async function submit() {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await refreshNuxtData('nutriarc-auth-user')
    toast.add({
      title: 'Signed in successfully',
      description: 'Welcome back to Nutric Arc.',
      color: 'success',
    })
    await navigateTo('/')
  } catch (e: any) {
    error.value = e.data?.statusMessage || e.message || 'Could not sign in. Check your details and try again.'
  } finally { busy.value = false }
}
</script>
<template>
  <div class="auth-form auth-form--login">
    <h1>Welcome back</h1>
    <p class="form-subtitle">Sign in to your Nutric Arc account to continue your journey towards a healthier, more active you.</p>
    <p v-if="error" role="alert" class="form-error">{{ error }}</p>
    <form @submit.prevent="submit">
      <label class="auth-label">Email address<span class="input-wrap"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg><input v-model="form.email" type="email" autocomplete="email" placeholder="you@example.com" required></span></label>
      <label class="auth-label">Password<span class="input-wrap"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg><input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Enter your password" required><button type="button" class="visibility-toggle" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></span></label>
      <div class="form-options"><label class="check-label"><input v-model="remember" type="checkbox"><span class="checkmark">✓</span>Remember me</label><a href="#" class="text-link" @click.prevent="error = 'Password reset is not available yet. Please contact support.'">Forgot password?</a></div>
      <button class="primary-auth-button" type="submit" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }} <span aria-hidden="true">→</span></button>
    </form>

    <p class="auth-footer">New to Nutric Arc? <NuxtLink to="/create-account">Create account</NuxtLink></p>
  </div>
</template>
