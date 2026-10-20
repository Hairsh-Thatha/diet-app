import { z } from 'zod'

export const profileSchema = z.object({
  gender: z.enum(['male', 'female', 'prefer_not_to_say']),
  age: z.coerce.number().int().min(18).max(100),
  height: z.coerce.number().positive().max(300),
  heightUnit: z.enum(['cm', 'ft_in']),
  weight: z.coerce.number().positive().max(500),
  weightUnit: z.enum(['kg', 'lb']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
  goal: z.enum(['lose_weight', 'maintain_weight', 'gain_weight']),
  dietaryPreference: z.enum(['no_preference', 'vegetarian', 'vegan', 'high_protein', 'low_carb', 'other']).default('no_preference'),
  allergies: z.string().max(500).default(''),
  foodsToAvoid: z.string().max(500).default(''),
  mealsPerDay: z.coerce.number().int().min(3).max(5).default(5)
})

export type DietProfile = z.infer<typeof profileSchema>
export type PlannedMeal = { mealType: string; name: string; description: string; ingredients: string[]; servingSize: string; calories: number; protein: number; carbohydrates: number; fat: number; suggestedTime: string; sortOrder: number }
export type PlannedDay = { dayNumber: number; date: string; meals: PlannedMeal[]; summary: { calories: number; protein: number; carbohydrates: number; fat: number } }

const activityFactors: Record<DietProfile['activityLevel'], number> = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extremely_active: 1.9 }
const mealTypes = [
  { type: 'Breakfast', time: '7:00 AM', share: .23 },
  { type: 'Morning snack', time: '10:00 AM', share: .10 },
  { type: 'Lunch', time: '12:30 PM', share: .30 },
  { type: 'Evening snack', time: '4:00 PM', share: .10 },
  { type: 'Dinner', time: '7:00 PM', share: .27 }
]
const recipes: Array<{ name: string; description: string; ingredients: string[]; calories: number; protein: number; carbohydrates: number; fat: number; tags: string[] }> = [
  { name: 'Oatmeal with berries', description: 'Warm oats with fruit and seeds.', ingredients: ['rolled oats', 'mixed berries', 'chia seeds', 'milk'], calories: 380, protein: 16, carbohydrates: 58, fat: 10, tags: ['vegetarian', 'vegan'] },
  { name: 'Greek yogurt fruit bowl', description: 'Creamy yogurt with fruit and a little crunch.', ingredients: ['Greek yogurt', 'banana', 'berries', 'pumpkin seeds'], calories: 340, protein: 25, carbohydrates: 42, fat: 9, tags: ['vegetarian', 'high_protein'] },
  { name: 'Tofu grain bowl', description: 'Seasoned tofu with grains and crisp vegetables.', ingredients: ['tofu', 'brown rice', 'spinach', 'bell pepper'], calories: 510, protein: 27, carbohydrates: 62, fat: 17, tags: ['vegetarian', 'vegan', 'high_protein'] },
  { name: 'Chicken quinoa salad', description: 'Grilled chicken with greens and quinoa.', ingredients: ['chicken breast', 'quinoa', 'mixed greens', 'tomato'], calories: 520, protein: 42, carbohydrates: 48, fat: 17, tags: ['high_protein', 'low_carb'] },
  { name: 'Lentil vegetable stew', description: 'Hearty lentils simmered with seasonal vegetables.', ingredients: ['lentils', 'carrot', 'tomato', 'spinach'], calories: 430, protein: 23, carbohydrates: 66, fat: 8, tags: ['vegetarian', 'vegan'] },
  { name: 'Baked salmon and vegetables', description: 'Salmon with roasted vegetables and a whole grain.', ingredients: ['salmon', 'broccoli', 'brown rice', 'lemon'], calories: 560, protein: 39, carbohydrates: 46, fat: 23, tags: ['high_protein', 'low_carb'] },
  { name: 'Apple with nut butter', description: 'A simple fruit snack with satisfying healthy fats.', ingredients: ['apple', 'peanut butter'], calories: 240, protein: 6, carbohydrates: 32, fat: 12, tags: ['vegetarian', 'vegan'] },
  { name: 'Cottage cheese and cucumber', description: 'A fresh, protein-rich snack.', ingredients: ['cottage cheese', 'cucumber', 'black pepper'], calories: 190, protein: 22, carbohydrates: 9, fat: 7, tags: ['vegetarian', 'high_protein', 'low_carb'] },
  { name: 'Chickpea avocado toast', description: 'Mashed chickpeas and avocado on whole grain toast.', ingredients: ['chickpeas', 'avocado', 'whole grain bread', 'lemon'], calories: 390, protein: 15, carbohydrates: 52, fat: 15, tags: ['vegetarian', 'vegan'] },
  { name: 'Egg and vegetable scramble', description: 'Eggs cooked with vegetables and served with toast.', ingredients: ['eggs', 'spinach', 'tomato', 'whole grain bread'], calories: 360, protein: 24, carbohydrates: 32, fat: 15, tags: ['vegetarian', 'high_protein', 'low_carb'] },
  { name: 'Edamame and orange', description: 'A light snack pairing plant protein and fruit.', ingredients: ['edamame', 'orange'], calories: 210, protein: 14, carbohydrates: 29, fat: 6, tags: ['vegetarian', 'vegan', 'high_protein'] }
]

export function estimateNutrition(profile: DietProfile) {
  const weightKg = profile.weightUnit === 'kg' ? profile.weight : profile.weight * 0.45359237
  const heightCm = profile.heightUnit === 'cm' ? profile.height : profile.height * 2.54
  const genderOffset = profile.gender === 'male' ? 5 : profile.gender === 'female' ? -161 : -78
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age + genderOffset
  const maintenance = Math.round(bmr * activityFactors[profile.activityLevel])
  const goalAdjustment = profile.goal === 'lose_weight' ? -Math.min(350, Math.round(maintenance * 0.15)) : profile.goal === 'gain_weight' ? Math.min(300, Math.round(maintenance * 0.10)) : 0
  const calories = Math.max(1400, Math.min(4000, maintenance + goalAdjustment))
  const protein = Math.round(Math.max(0.8, Math.min(1.6, profile.goal === 'gain_weight' || profile.dietaryPreference === 'high_protein' ? 1.5 : 1.2)) * weightKg)
  const fat = Math.round(calories * 0.28 / 9)
  const carbohydrates = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
  return { calories, protein, carbohydrates, fat }
}

function recipeMatches(recipe: typeof recipes[number], profile: DietProfile) {
  const preference = profile.dietaryPreference
  if (preference === 'vegan' && !recipe.tags.includes('vegan')) return false
  if (preference === 'vegetarian' && !recipe.tags.includes('vegetarian')) return false
  if (preference === 'high_protein' && !recipe.tags.includes('high_protein')) return false
  if (preference === 'low_carb' && !recipe.tags.includes('low_carb')) return false
  const blocked = `${profile.allergies},${profile.foodsToAvoid}`.toLowerCase().split(/[,;\n]/).map(x => x.trim()).filter(Boolean)
  return !recipe.ingredients.some(ingredient => blocked.some(term => ingredient.toLowerCase().includes(term) || term.includes(ingredient.toLowerCase())))
}

const round = (n: number) => Math.round(n)
export function buildPlan(profile: DietProfile, startDate: string, seed = 0): PlannedDay[] {
  const targets = estimateNutrition(profile)
  const available = recipes.filter(recipe => recipeMatches(recipe, profile))
  if (!available.length) throw createError({ statusCode: 400, statusMessage: 'No meal suggestions match those preferences. Please review your allergy and avoid-food entries.' })
  const types = profile.mealsPerDay === 3 ? [mealTypes[0], mealTypes[2], mealTypes[4]] : profile.mealsPerDay === 4 ? [mealTypes[0], mealTypes[2], mealTypes[3], mealTypes[4]] : mealTypes
  return Array.from({ length: 7 }, (_, dayIndex) => {
    let cursor = (seed + dayIndex * 3) % available.length
    const meals: PlannedMeal[] = types.map((slot, slotIndex) => {
      const recipe = available[cursor % available.length]!
      cursor++
      const targetCalories = targets.calories * slot!.share / (types.length === 5 ? 1 : types.length === 4 ? .9 : .8)
      const scale = Math.min(1.7, Math.max(.55, targetCalories / recipe.calories))
      return { mealType: slot!.type, name: recipe.name, description: recipe.description, ingredients: recipe.ingredients, servingSize: `${Math.max(1, round(scale * 100 / 25) * 25)} g serving`, calories: round(recipe.calories * scale), protein: round(recipe.protein * scale), carbohydrates: round(recipe.carbohydrates * scale), fat: round(recipe.fat * scale), suggestedTime: slot!.time, sortOrder: slotIndex }
    })
    const summary = meals.reduce((total, meal) => ({ calories: total.calories + meal.calories, protein: total.protein + meal.protein, carbohydrates: total.carbohydrates + meal.carbohydrates, fat: total.fat + meal.fat }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0 })
    const dayDate = new Date(`${startDate}T00:00:00.000Z`)
    dayDate.setUTCDate(dayDate.getUTCDate() + dayIndex)
    return { dayNumber: dayIndex + 1, date: dayDate.toISOString().slice(0, 10), meals, summary }
  })
}
