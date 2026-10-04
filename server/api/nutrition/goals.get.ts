import {eq} from 'drizzle-orm'
import {nutritionGoals} from '../../database/schema'
import {database} from '../../database'
import {currentUser} from '../../utils/auth'
export default defineEventHandler(async event=>{const user=await currentUser(event);let [g]=await database().select().from(nutritionGoals).where(eq(nutritionGoals.userId,user.id)).limit(1);if(!g)[g]=await database().insert(nutritionGoals).values({userId:user.id}).returning();return g})
