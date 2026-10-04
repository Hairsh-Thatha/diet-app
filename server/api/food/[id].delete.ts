import {and,eq} from 'drizzle-orm'
import {foodEntries} from '../../database/schema'
import {database} from '../../database'
import {currentUser} from '../../utils/auth'
export default defineEventHandler(async event=>{const user=await currentUser(event);const id=getRouterParam(event,'id')!;const rows=await database().delete(foodEntries).where(and(eq(foodEntries.id,id),eq(foodEntries.userId,user.id))).returning({id:foodEntries.id});if(!rows.length)throw createError({statusCode:404,statusMessage:'Food entry not found.'});return{ok:true}})
