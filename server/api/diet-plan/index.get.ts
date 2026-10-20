import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm'
import { currentUser } from '../../utils/auth'
import { database } from '../../database'
import { dietPlanAdherence, dietPlanDays, dietPlanMeals, dietPlanProfiles, dietPlans } from '../../database/schema'

export default defineEventHandler(async event => {
  const user = await currentUser(event), db = database()
  const [profile] = await db.select().from(dietPlanProfiles).where(eq(dietPlanProfiles.userId, user.id)).limit(1)
  const [plan] = await db.select().from(dietPlans).where(and(eq(dietPlans.userId, user.id), eq(dietPlans.status, 'active'))).orderBy(desc(dietPlans.generatedAt)).limit(1)
  if (!plan) return { profile: profile || null, plan: null, adherence: [], weekly: { followedDays: 0, totalDays: 0, completedMeals: 0, totalMeals: 0, currentStreak: 0 } }
  const days = await db.select().from(dietPlanDays).where(eq(dietPlanDays.dietPlanId, plan.id)).orderBy(dietPlanDays.dayNumber)
  const dayIds = days.map(day => day.id)
  const allMeals = dayIds.length ? await db.select().from(dietPlanMeals).where(inArray(dietPlanMeals.dietPlanDayId, dayIds)).orderBy(dietPlanMeals.sortOrder) : []
  const today = new Date().toLocaleDateString('en-CA')
  const start = days[0]?.date || today, end = days.at(-1)?.date || today
  const adherence = await db.select().from(dietPlanAdherence).where(and(eq(dietPlanAdherence.userId, user.id), eq(dietPlanAdherence.dietPlanId, plan.id), gte(dietPlanAdherence.date, start), lte(dietPlanAdherence.date, end))).orderBy(dietPlanAdherence.date)
  const completedMeals = allMeals.filter(meal => meal.completed).length
  const followedDays = adherence.filter(row => row.followed === true).length
  const dates = new Set(adherence.filter(row => row.followed === true).map(row => String(row.date)))
  let cursor = new Date(`${today}T00:00:00`)
  if (!dates.has(cursor.toLocaleDateString('en-CA'))) cursor.setDate(cursor.getDate() - 1)
  let currentStreak = 0
  while (dates.has(cursor.toLocaleDateString('en-CA'))) { currentStreak++; cursor.setDate(cursor.getDate() - 1) }
  const enrichedDays = days.map(day => {
    const dayMeals = allMeals.filter(meal => meal.dietPlanDayId === day.id).map(meal => ({ ...meal, calories: Number(meal.calories), protein: Number(meal.protein), carbohydrates: Number(meal.carbohydrates), fat: Number(meal.fat) }))
    const summary = dayMeals.reduce((total, meal) => ({ calories: total.calories + meal.calories, protein: total.protein + meal.protein, carbohydrates: total.carbohydrates + meal.carbohydrates, fat: total.fat + meal.fat }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0 })
    return { ...day, date: String(day.date), meals: dayMeals, summary }
  })
  return { profile: profile || null, plan: { ...plan, dailyCalorieTarget: Number(plan.dailyCalorieTarget), days: enrichedDays }, adherence: adherence.map(row => ({ ...row, date: String(row.date) })), weekly: { followedDays, totalDays: days.length, completedMeals, totalMeals: allMeals.length, currentStreak } }
})
