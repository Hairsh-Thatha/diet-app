import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { currentUser } from '../../../utils/auth'
import { database } from '../../../database'
import { dietPlanAdherence, dietPlanDays, dietPlanMeals, dietPlans } from '../../../database/schema'
import { readValidated } from '../../../utils/validation'
const schema = z.object({ completed: z.boolean() })
export default defineEventHandler(async event => {
  const user = await currentUser(event), { completed } = await readValidated(event, schema), mealId = getRouterParam(event, 'id')!, db = database()
  const [meal] = await db.select({ id: dietPlanMeals.id, dayId: dietPlanDays.id, date: dietPlanDays.date, planId: dietPlans.id }).from(dietPlanMeals).innerJoin(dietPlanDays, eq(dietPlanMeals.dietPlanDayId, dietPlanDays.id)).innerJoin(dietPlans, eq(dietPlanDays.dietPlanId, dietPlans.id)).where(and(eq(dietPlanMeals.id, mealId), eq(dietPlans.userId, user.id), eq(dietPlans.status, 'active'))).limit(1)
  if (!meal) throw createError({ statusCode: 404, statusMessage: 'Meal not found in your active plan.' })
  await db.update(dietPlanMeals).set({ completed, updatedAt: new Date() }).where(eq(dietPlanMeals.id, mealId))
  const meals = await db.select({ completed: dietPlanMeals.completed }).from(dietPlanMeals).where(eq(dietPlanMeals.dietPlanDayId, meal.dayId))
  const [progress] = await db.insert(dietPlanAdherence).values({ userId: user.id, dietPlanId: meal.planId, date: meal.date, completedMeals: meals.filter(row => row.completed).length, totalMeals: meals.length }).onConflictDoUpdate({ target: [dietPlanAdherence.dietPlanId, dietPlanAdherence.date], set: { completedMeals: meals.filter(row => row.completed).length, totalMeals: meals.length, updatedAt: new Date() } }).returning()
  return progress
})
