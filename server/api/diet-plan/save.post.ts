import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { currentUser } from '../../utils/auth'
import { database } from '../../database'
import { dietPlanDays, dietPlanMeals, dietPlanProfiles, dietPlans } from '../../database/schema'
import { buildPlan, estimateNutrition, profileSchema } from '../../services/diet-plan'
import { readValidated } from '../../utils/validation'

const schema = z.object({ requestKey: z.string().uuid(), startDate: z.string().date(), profile: profileSchema })
export default defineEventHandler(async event => {
  const user = await currentUser(event), input = await readValidated(event, schema), db = database()
  const [existing] = await db.select().from(dietPlans).where(and(eq(dietPlans.userId, user.id), eq(dietPlans.requestKey, input.requestKey))).limit(1)
  if (existing) return { id: existing.id, saved: true, existing: true }
  const [profile] = await db.select().from(dietPlanProfiles).where(eq(dietPlanProfiles.userId, user.id)).limit(1)
  if (!profile) throw createError({ statusCode: 400, statusMessage: 'Save your profile details before saving a plan.' })
  const profileForPlan = input.profile
  const targets = estimateNutrition(profileForPlan), days = buildPlan(profileForPlan, input.startDate)
  const saved = await db.transaction(async tx => {
    await tx.update(dietPlans).set({ status: 'archived', updatedAt: new Date() }).where(and(eq(dietPlans.userId, user.id), eq(dietPlans.status, 'active')))
    const [plan] = await tx.insert(dietPlans).values({ userId: user.id, requestKey: input.requestKey, goal: profileForPlan.goal, dailyCalorieTarget: targets.calories, planData: { days, disclaimer: 'Nutrition values are estimates, not medical advice.' }, profileSnapshot: profileForPlan, version: 1, status: 'active' }).returning()
    if (!plan) throw createError({ statusCode: 500, statusMessage: 'Could not save the diet plan.' })
    for (const day of days) {
      const [savedDay] = await tx.insert(dietPlanDays).values({ dietPlanId: plan.id, dayNumber: day.dayNumber, date: day.date }).returning()
      if (!savedDay) throw createError({ statusCode: 500, statusMessage: 'Could not save a plan day.' })
      if (day.meals.length) await tx.insert(dietPlanMeals).values(day.meals.map(meal => ({ dietPlanDayId: savedDay.id, mealType: meal.mealType, mealName: meal.name, description: meal.description, ingredients: meal.ingredients, servingSize: meal.servingSize, calories: String(meal.calories), protein: String(meal.protein), carbohydrates: String(meal.carbohydrates), fat: String(meal.fat), suggestedTime: meal.suggestedTime, sortOrder: meal.sortOrder })))
    }
    return plan
  })
  if (!saved) throw createError({ statusCode: 500, statusMessage: 'Could not save the diet plan.' })
  return { id: saved.id, saved: true, existing: false }
})
