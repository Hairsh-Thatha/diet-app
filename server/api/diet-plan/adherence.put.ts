import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { currentUser } from '../../utils/auth'
import { database } from '../../database'
import { dietPlanAdherence, dietPlanDays, dietPlans } from '../../database/schema'
import { readValidated } from '../../utils/validation'
const schema = z.object({ date: z.string().date(), followed: z.boolean() })
export default defineEventHandler(async event => {
  const user = await currentUser(event), input = await readValidated(event, schema), db = database()
  const [plan] = await db.select({ id: dietPlans.id }).from(dietPlans).where(and(eq(dietPlans.userId, user.id), eq(dietPlans.status, 'active'))).limit(1)
  if (!plan) throw createError({ statusCode: 404, statusMessage: 'No active diet plan was found.' })
  const [day] = await db.select({ id: dietPlanDays.id }).from(dietPlanDays).where(and(eq(dietPlanDays.dietPlanId, plan.id), eq(dietPlanDays.date, input.date))).limit(1)
  if (!day) throw createError({ statusCode: 400, statusMessage: 'That date is outside the active plan.' })
  const [row] = await db.insert(dietPlanAdherence).values({ userId: user.id, dietPlanId: plan.id, date: input.date, followed: input.followed }).onConflictDoUpdate({ target: [dietPlanAdherence.dietPlanId, dietPlanAdherence.date], set: { followed: input.followed, updatedAt: new Date() } }).returning()
  return row
})
