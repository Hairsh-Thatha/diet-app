<script setup lang="ts">
definePageMeta({ layout: 'default' })
const form = reactive({ name: '', email: '', password: '' })
const confirmPassword = ref('')
const acceptedTerms = ref(true)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const busy = ref(false)
const error = ref('')
const toast = useToast()
async function submit() {
  error.value = ''
  if (form.password !== confirmPassword.value) { error.value = 'Your passwords do not match.'; return }
  if (!acceptedTerms.value) { error.value = 'Please agree to the Terms of Service and Privacy Policy.'; return }
  busy.value = true
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: form })
    toast.add({
      title: 'Account created',
      description: 'Your account is ready. Sign in to continue.',
      color: 'success',
    })
  } catch (e: any) {
    error.value = e.data?.statusMessage || e.message || 'Could not create your account. Check the database connection and try again.'
  } finally { busy.value = false }
}
</script>
<template>
  <div class="auth-form auth-form--register">
    <h1>Create your account</h1>
    <p class="form-subtitle">Join Nutric Arc and take the first step toward a healthier, more active you.</p>
    <p v-if="error" role="alert" class="form-error">{{ error }}</p>
    <form @submit.prevent="submit">
      <label class="auth-label">Full name<span class="input-wrap"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg><input v-model="form.name" autocomplete="name" maxlength="80" placeholder="Enter your full name" required></span></label>
      <label class="auth-label">Email address<span class="input-wrap"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg><input v-model="form.email" type="email" autocomplete="email" placeholder="you@example.com" required></span></label>
      <label class="auth-label password-field">Password<span class="input-wrap"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg><input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="8" maxlength="128" placeholder="Create a password" required><button type="button" class="visibility-toggle" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></span></label><p class="password-hint">Use at least 8 characters with a mix of letters, numbers and symbols.</p><label class="auth-label confirm-password-field">Confirm password<span class="input-wrap"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg><input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" autocomplete="new-password" minlength="8" maxlength="128" placeholder="Confirm your password" required><button type="button" class="visibility-toggle" :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'" @click="showConfirmPassword = !showConfirmPassword"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></span></label>
      <label class="check-label terms-check"><input v-model="acceptedTerms" type="checkbox"><span class="checkmark">✓</span><span>I agree to the <a href="#" class="text-link" @click.prevent>Terms of Service</a> and <a href="#" class="text-link" @click.prevent>Privacy Policy</a></span></label>
      <button class="primary-auth-button" type="submit" :disabled="busy">{{ busy ? 'Creating account…' : 'Create account' }} <span aria-hidden="true">→</span></button>
    </form>

  </div>
</template>
