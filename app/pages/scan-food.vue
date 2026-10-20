<script setup lang="ts">
const file = ref<File>()
const preview = ref('')
const busy = ref(false)
const saving = ref(false)
const result = ref<any>()
const meal = ref('Lunch')
const error = ref('')
const { refresh } = useNutrition()

function select(selected?: File) {
  if (!selected) return
  if (!selected.type.startsWith('image/')) {
    error.value = 'Choose an image file.'
    return
  }
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = selected
  preview.value = URL.createObjectURL(selected)
  result.value = null
  error.value = ''
}

function clearSelection() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = undefined
  preview.value = ''
  result.value = null
  error.value = ''
}

async function analyze() {
  if (!file.value) return
  busy.value = true
  error.value = ''
  try {
    const body = new FormData()
    body.append('image', file.value)
    result.value = await $fetch('/api/food/analyze', { method: 'POST', body })
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Analysis failed. Try again.'
  } finally {
    busy.value = false
  }
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/food', { method: 'POST', body: { ...result.value, mealType: meal.value } })
    await refresh()
    await navigateTo('/todays-menu')
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Could not save this food.'
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  if (preview.value) URL.revokeObjectURL(preview.value)
})
</script>

<template>
  <div class="scan-food-page mx-auto max-w-[1180px]">
    <div class="mb-3">
      <p class="text-xs font-bold tracking-[0.18em] text-emerald-700">FOOD SCANNER</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-[#102a33] sm:text-[36px]">Scan your food</h1>
      <p class="mt-2 text-base text-slate-500">Take a photo or upload an image to estimate its nutrition.</p>
    </div>

    <p v-if="error" role="alert" class="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{{ error }}</p>

    <section class="scan-dropzone relative rounded-2xl border border-dashed border-emerald-900/20 p-3 shadow-[0_5px_22px_rgba(18,55,43,.035)] sm:p-3.5" aria-label="Food image" @dragover.prevent @drop.prevent="select(($event as DragEvent).dataTransfer?.files[0])">
      <input id="food-file" class="sr-only" type="file" accept="image/*" capture="environment" @change="select(($event.target as HTMLInputElement).files?.[0])">
      <div v-if="preview" class="grid min-h-0 items-center gap-3 lg:grid-cols-[minmax(170px,200px)_minmax(0,1fr)] lg:gap-5">
        <div class="relative mx-auto flex h-[180px] w-full max-w-[200px] items-center justify-center sm:h-[200px]">
          <img :src="preview" class="max-h-[200px] max-w-[170px] rounded-2xl object-contain shadow-[0_6px_16px_rgba(18,55,43,.1)]" alt="Selected food">
          <button type="button" class="absolute right-2 top-2 grid size-9 place-items-center rounded-full border border-slate-200 bg-white/95 text-lg text-slate-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-700" aria-label="Remove selected image" @click="clearSelection">×</button>
        </div>
        <div class="flex flex-col items-center text-center">
            <span class="grid size-11 place-items-center rounded-full bg-emerald-100/80 text-emerald-700" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="size-6"><path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" stroke-width="1.8"/></svg>
          </span>
          <h2 class="mt-2 text-xl font-semibold tracking-tight text-[#102a33] sm:text-2xl">{{ result ? 'Image analyzed' : 'Image ready to analyze' }}</h2>
          <p class="mt-1 max-w-md text-sm leading-5 text-slate-500">{{ result ? 'Your nutrition estimate is ready below. You can review it or run the analysis again.' : "We'll estimate the nutrition information from your image using AI." }}</p>
          <div class="mt-3 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
            <label for="food-file" class="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800"><svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4.7L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.7L20 16m0 4v-4h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Replace image</label>
            <button class="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60" :disabled="busy" @click="analyze"><svg v-if="!busy" viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="m12 3 1.2 5.8L19 7l-3.8 5 5.8 1.2-5.8 1.2L19 20l-5.8-1.8L12 24l-1.2-5.8L5 20l3.8-5.6L3 13.2 8.8 12 5 7l5.8 1.8L12 3Z" transform="translate(0 -1.5) scale(.92)" fill="currentColor"/></svg>{{ busy ? 'Analyzing…' : result ? 'Analyze again' : 'Analyze food' }}</button>
          </div>
          <div v-if="busy" class="mt-4 flex items-center gap-2 text-sm text-slate-500" role="status"><span class="size-2 animate-pulse rounded-full bg-emerald-600" />Estimating ingredients and nutrition…</div>
        </div>
      </div>
      <div v-else class="flex min-h-[210px] flex-col items-center justify-center rounded-xl px-4 py-5 text-center">
        <span class="grid size-[72px] place-items-center rounded-full bg-emerald-100/80 text-emerald-700" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" class="size-9"><path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" stroke-width="1.8"/></svg></span>
        <h2 class="mt-4 text-xl font-semibold text-[#102a33]">Add a photo of your food</h2>
        <p class="mt-2 max-w-md text-sm leading-6 text-slate-500">Take a photo or upload a clear image of your meal. We’ll estimate its nutrition using AI.</p>
        <label for="food-file" class="mt-6 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"><svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true"><path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" stroke-width="1.8"/></svg>Choose image</label>
        <p class="mt-3 text-xs text-slate-400">JPG, PNG or WEBP · Up to 8 MB</p>
      </div>
    </section>

    <section v-if="result" class="mt-2 rounded-2xl border border-emerald-950/[0.07] bg-white p-3 shadow-[0_5px_22px_rgba(18,55,43,.05)] sm:p-3.5" aria-labelledby="nutrition-result-heading">
      <div class="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 pb-1.5">
        <div class="min-w-0 flex-1">
          <p id="nutrition-result-heading" class="text-xs font-bold tracking-[0.16em] text-emerald-700">ESTIMATED NUTRITION</p>
          <input id="food-name" v-model="result.foodName" aria-label="Food name" class="mt-1 w-full border-0 border-b border-transparent bg-transparent p-0 text-xl font-semibold tracking-tight text-[#102a33] outline-none transition focus:border-emerald-600 focus:ring-0 sm:text-[22px]">
          <p class="mt-0.5 text-sm text-slate-500">Serving size: <input id="serving-size" v-model="result.servingSize" aria-label="Serving size" class="inline-block max-w-[220px] border-b border-slate-200 bg-transparent text-sm text-slate-600 outline-none focus:border-emerald-600"></p>
        </div>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><span class="size-1.5 rounded-full bg-emerald-600" />{{ Math.round(result.confidence * 100) }}% confidence</span>
      </div>

      <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2">
        <label class="flex min-h-[72px] items-start gap-1.5 rounded-xl border border-orange-100 bg-orange-50/70 p-2"><span class="grid size-7 shrink-0 place-items-center rounded-lg bg-orange-100 text-orange-600"><svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="M13.4 2.8c.8 4-3.7 5.1-2.2 8.2.6 1.2 1.5 1.6 2.4 1.7-.3-1.5.6-2.9 2.2-3.8 2 1.7 3.1 3.6 3.1 5.8a6.9 6.9 0 1 1-13.8 0c0-3.5 2.1-6 5-8.2-.2 2.2.3 3.2 1.1 3.8-.5-3.2 2.1-4.8 2.2-7.5Z" fill="currentColor"/></svg></span><span class="min-w-0"><span class="block text-[11px] text-slate-600">Calories</span><span class="mt-0.5 flex items-baseline gap-1"><input v-model.number="result.calories" type="number" min="0" aria-label="Calories" class="w-full min-w-0 bg-transparent text-base font-bold tabular-nums text-[#102a33] outline-none"><span class="text-[10px] text-slate-500">kcal</span></span></span></label>
        <label class="flex min-h-[72px] items-start gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-2"><span class="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="M19.8 4.2C11.2 4 5.2 6.6 5.2 12.7c0 3.2 2.2 5.3 5 5.3 5.5 0 8.5-6.1 9.6-13.8Z" fill="currentColor"/><path d="M3.5 21c2.2-5.7 6.1-9.4 12-12.3" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg></span><span class="min-w-0"><span class="block text-[11px] text-slate-600">Protein</span><span class="mt-0.5 flex items-baseline gap-1"><input v-model.number="result.protein" type="number" min="0" aria-label="Protein" class="w-full min-w-0 bg-transparent text-base font-bold tabular-nums text-[#102a33] outline-none"><span class="text-[10px] text-slate-500">g</span></span><span class="text-[9px] text-slate-500">per serving</span></span></label>
        <label class="flex min-h-[72px] items-start gap-1.5 rounded-xl border border-sky-100 bg-sky-50/70 p-2"><span class="grid size-7 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-600"><svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="M12 3v18M8 5l4 3 4-3M7 10l5 3 5-3M6 15l6 3 6-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="min-w-0"><span class="block text-[11px] text-slate-600">Carbohydrates</span><span class="mt-0.5 flex items-baseline gap-1"><input v-model.number="result.carbs" type="number" min="0" aria-label="Carbohydrates" class="w-full min-w-0 bg-transparent text-base font-bold tabular-nums text-[#102a33] outline-none"><span class="text-[10px] text-slate-500">g</span></span><span class="text-[9px] text-slate-500">per serving</span></span></label>
        <label class="flex min-h-[72px] items-start gap-1.5 rounded-xl border border-violet-100 bg-violet-50/70 p-2"><span class="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600"><svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="M12 3.2c-2.2 3.2-6.4 8-6.4 11.5a6.4 6.4 0 1 0 12.8 0c0-3.5-4.2-8.3-6.4-11.5Z" fill="currentColor"/></svg></span><span class="min-w-0"><span class="block text-[11px] text-slate-600">Fat</span><span class="mt-0.5 flex items-baseline gap-1"><input v-model.number="result.fat" type="number" min="0" aria-label="Fat" class="w-full min-w-0 bg-transparent text-base font-bold tabular-nums text-[#102a33] outline-none"><span class="text-[10px] text-slate-500">g</span></span><span class="text-[9px] text-slate-500">per serving</span></span></label>
      </div>

      <div class="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px] sm:items-end">
        <div v-if="result.ingredients?.length"><h3 class="text-sm font-semibold text-slate-800">Detected ingredients</h3><div class="mt-2 flex flex-wrap gap-2"><span v-for="ingredient in result.ingredients" :key="ingredient" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">{{ ingredient }}</span></div></div>
        <label class="block text-xs font-semibold text-slate-700" for="meal-type">Add to meal<select id="meal-type" v-model="meal" class="mt-1 block h-8 w-full min-w-[170px] rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-normal text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"><option>Breakfast</option><option>Lunch</option><option>Snack</option><option>Dinner</option></select></label>
      </div>
      <div class="mt-2 flex flex-col-reverse justify-between gap-2 border-t border-slate-100 pt-2 sm:flex-row sm:items-center"><p class="max-w-xl text-[11px] leading-4 text-slate-500">Nutrition values are estimates. Review the serving size and adjust values before saving.</p><button class="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60" :disabled="saving" @click="save"><svg v-if="!saving" viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>{{ saving ? 'Saving…' : "Add to today's menu" }}</button></div>
    </section>
  </div>
</template>
