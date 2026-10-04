import {eq} from 'drizzle-orm'
import {z} from 'zod'
import {nutritionGoals} from '../../database/schema'
import {database} from '../../database'
import {currentUser} from '../../utils/auth'
import {readValidated} from '../../utils/validation'
const schema=z.object({calories:z.coerce.number().int().min(500).max(10000),protein:z.coerce.number().min(0).max(1000),carbs:z.coerce.number().min(0).max(1000),fat:z.coerce.number().min(0).max(1000),water:z.coerce.number().min(0).max(20)})
export default defineEventHandler(async event=>{const user=await currentUser(event);const body=await readValidated(event,schema);const db=database();const [existing]=await db.select({id:nutritionGoals.id}).from(nutritionGoals).where(eq(nutritionGoals.userId,user.id)).limit(1);const [g]=existing?await db.update(nutritionGoals).set({...body,updatedAt:new Date()}).where(eq(nutritionGoals.userId,user.id)).returning():await db.insert(nutritionGoals).values({...body,userId:user.id}).returning();return g})
