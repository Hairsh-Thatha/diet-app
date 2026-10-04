import { and,eq } from 'drizzle-orm'
import {challenges,habits} from '../../database/schema'
import {database} from '../../database'
import {currentUser} from '../../utils/auth'
import {readValidated} from '../../utils/validation'
import {z} from 'zod'
const schema=z.object({name:z.string().trim().min(1).max(100),startDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),duration:z.coerce.number().int().min(1).max(365)})
const defaults=[['🏋️','Workout','minutes',45],['🚶','Steps','steps',8000],['🥗','Nutrition','within goal',1],['💪','Protein','grams',150],['💧','Water','liters',3],['😴','Sleep','hours',7],['📚','Learning','minutes',30],['🧘','Mental reset','minutes',10]]
export default defineEventHandler(async event=>{const user=await currentUser(event);const input=await readValidated(event,schema);const db=database();const [active]=await db.select({id:challenges.id}).from(challenges).where(and(eq(challenges.userId,user.id),eq(challenges.status,'active'))).limit(1);if(active)throw createError({statusCode:409,statusMessage:'Finish or close your active challenge first.'});const end=new Date(input.startDate+'T00:00:00');end.setDate(end.getDate()+input.duration-1);return db.transaction(async tx=>{const [challenge]=await tx.insert(challenges).values({userId:user.id,name:input.name,startDate:input.startDate,endDate:end.toLocaleDateString('en-CA'),duration:input.duration}).returning();await tx.insert(habits).values(defaults.map(([icon,name,unit,target],i)=>({challengeId:challenge.id,icon:String(icon),name:String(name),unit:String(unit),target:String(target),sortOrder:i,type:'numeric'})));return challenge})})
