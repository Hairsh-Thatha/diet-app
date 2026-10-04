<script setup lang="ts">
const { data, error, refresh } = useNutrition()
const groups = ['Breakfast', 'Lunch', 'Snack', 'Dinner']
const removeId = ref('')
const adding = ref(false)
const busy = ref(false)
const message = ref('')
const successMessage = ref('')
const form = reactive({ foodName: '', mealType: 'Lunch', servingSize: '1 serving', calories: 0, protein: 0, carbs: 0, fat: 0 })

function addToMeal(meal: string) {
  form.mealType = meal
  adding.value = true
  message.value = ''
  successMessage.value = ''
}

async function remove() {
  message.value = ''
  try {
    await $fetch('/api/food/' + removeId.value, { method: 'DELETE' })
    removeId.value = ''
    await refresh()
  } catch (e: any) {
    message.value = e.data?.statusMessage || 'Could not remove food.'
  }
}

async function add() {
  busy.value = true
  message.value = ''
  successMessage.value = ''
  try {
    await $fetch('/api/food', { method: 'POST', body: form })
    successMessage.value = `${form.foodName} added to ${form.mealType}. You can add another food.`
    Object.assign(form, { foodName: '', servingSize: '1 serving', calories: 0, protein: 0, carbs: 0, fat: 0 })
    await refresh()
  } catch (e: any) {
    message.value = e.data?.statusMessage || e.message || 'Could not save food.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div><p class="text-sm text-emerald-700">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}</p><h1 class="mt-1 text-3xl font-semibold">Today's menu</h1></div>
      <div class="flex gap-2"><NuxtLink to="/scan-food" class="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white">＋ Scan food</NuxtLink><button class="rounded-xl border bg-white px-4 py-3 text-sm" @click="adding = !adding">＋ Add manually</button></div>
    </div>

    <p v-if="error" class="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Menu data could not be loaded. Check your database connection and sign in.</p>
    <p v-if="message" role="alert" class="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{{ message }} <NuxtLink v-if="message.toLowerCase().includes('sign in')" to="/login" class="font-semibold underline">Open local demo sign-in</NuxtLink></p>
    <p v-if="successMessage" role="status" class="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{{ successMessage }}</p>

    <form v-if="adding" class="mt-6 grid gap-3 rounded-2xl bg-white p-5 sm:grid-cols-2" @submit.prevent="add">
      <h2 class="font-semibold sm:col-span-2">Add food to {{ form.mealType }}</h2>
      <input v-model="form.foodName" required maxlength="160" placeholder="Food name" aria-label="Food name" class="rounded-lg border p-3">
      <select v-model="form.mealType" aria-label="Meal type" class="rounded-lg border p-3"><option v-for="group in groups" :key="group">{{ group }}</option></select>
      <input v-model="form.servingSize" required maxlength="100" placeholder="Serving size" aria-label="Serving size" class="rounded-lg border p-3">
      <input v-for="key in (['calories', 'protein', 'carbs', 'fat'] as const)" :key="key" v-model.number="form[key]" type="number" min="0" step="any" :placeholder="key" :aria-label="key" class="rounded-lg border p-3">
      <div class="flex gap-2"><button class="flex-1 rounded-lg bg-emerald-800 p-3 text-white disabled:opacity-60" :disabled="busy">{{ busy ? 'Saving…' : 'Save food' }}</button><button type="button" class="rounded-lg border px-4" :disabled="busy" @click="adding = false">Done</button></div>
    </form>

    <div class="mt-7 grid gap-5 lg:grid-cols-2">
      <section v-for="group in groups" :key="group" class="rounded-2xl bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between"><h2 class="font-semibold">{{ group === 'Snack' ? 'Snacks' : group }}</h2><button type="button" class="text-sm font-medium text-emerald-800" @click="addToMeal(group)">＋ Add food</button></div>
        <div v-for="food in data?.entries.filter(entry => entry.mealType === group)" :key="food.id" class="mt-4 flex justify-between border-t pt-4">
          <div><p class="font-medium">{{ food.foodName }}</p><p class="text-sm text-stone-500">{{ food.servingSize }}</p><p class="mt-1 text-xs text-stone-400">{{ food.calories }} kcal · {{ food.protein }}g protein · {{ food.carbs }}g carbs · {{ food.fat }}g fat</p></div>
          <button class="text-sm text-rose-600" @click="removeId = food.id">Remove</button>
        </div>
        <p v-if="!error && !data?.entries.some(entry => entry.mealType === group)" class="mt-4 text-sm text-stone-400">Nothing here yet</p>
      </section>
    </div>

    <section v-if="data" class="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-emerald-950 p-5 text-white sm:grid-cols-4">
      <div v-for="item in [['Calories', data.totals.calories + ' kcal'], ['Protein', data.totals.protein + 'g'], ['Carbs', data.totals.carbs + 'g'], ['Fat', data.totals.fat + 'g']]" :key="item[0]"><p class="text-xs text-emerald-100/70">{{ item[0] }}</p><p class="mt-1 text-xl font-semibold">{{ item[1] }}</p></div>
    </section>

    <div v-if="removeId" class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5"><div class="w-full max-w-sm rounded-2xl bg-white p-6"><h2 class="text-lg font-semibold">Remove food?</h2><p class="mt-2 text-sm text-stone-500">This will remove the food from today's menu.</p><div class="mt-5 flex justify-end gap-3"><button class="rounded-lg border px-4 py-2" @click="removeId = ''">Cancel</button><button class="rounded-lg bg-rose-600 px-4 py-2 text-white" @click="remove">Remove</button></div></div></div>
  </div>
</template>
