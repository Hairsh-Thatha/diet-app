import { randomInt, randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { currentUser } from '../../utils/auth'
import { database } from '../../database'
import { dietPlanProfiles } from '../../database/schema'
import { profileSchema, estimateNutrition, buildPlan } from '../../services/diet-plan'
import { readValidated } from '../../utils/validation'
import { z } from 'zod'

const schema = profileSchema.extend({ startDate: z.string().date().optional() })
export default defineEventHandler(async event => {
  const user = await currentUser(event), input = await readValidated(event, schema), db = database()
  const { startDate, ...profile } = input
  const [savedProfile] = await db.insert(dietPlanProfiles).values({ userId: user.id, ...profile, height: String(profile.height), weight: String(profile.weight) }).onConflictDoUpdate({ target: dietPlanProfiles.userId, set: { ...profile, height: String(profile.height), weight: String(profile.weight), updatedAt: new Date() } }).returning()
  const generatedAt = new Date().toISOString()
  const resolvedStartDate = startDate || new Date().toLocaleDateString('en-CA')
  return { profile: savedProfile, estimate: estimateNutrition(input), generatedAt, requestKey: randomUUID(), days: buildPlan(input, resolvedStartDate, randomInt(0, 1000)), disclaimer: 'Nutrition values are estimates, not medical advice. Check ingredient labels and cross-contamination risks for allergies.' }
})
