import {and,eq} from 'drizzle-orm'
import {challenges,habits,habitCompletions} from '../../../database/schema'
import {database} from '../../../database'
import {currentUser} from '../../../utils/auth'
import {readValidated} from '../../../utils/validation'
import {z} from 'zod'
const schema=z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),completed:z.boolean(),value:z.coerce.number().min(0).default(1)})
export default defineEventHandler(async event=>{const user=await currentUser(event);const id=getRouterParam(event,'id')!;const input=await readValidated(event,schema);const db=database();const [owned]=await db.select({id:habits.id}).from(habits).innerJoin(challenges,eq(habits.challengeId,challenges.id)).where(and(eq(habits.id,id),eq(challenges.userId,user.id))).limit(1);if(!owned)throw createError({statusCode:404,statusMessage:'Habit not found.'});const [old]=await db.select({id:habitCompletions.id}).from(habitCompletions).where(and(eq(habitCompletions.habitId,id),eq(habitCompletions.date,input.date))).limit(1);const [row]=old?await db.update(habitCompletions).set({...input,updatedAt:new Date()}).where(eq(habitCompletions.id,old.id)).returning():await db.insert(habitCompletions).values({habitId:id,...input}).returning();return row})
