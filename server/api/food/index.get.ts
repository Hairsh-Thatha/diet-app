import { and,eq } from 'drizzle-orm'
import { foodEntries } from '../../database/schema'
import { database } from '../../database'
import { currentUser } from '../../utils/auth'
export default defineEventHandler(async event=>{const user=await currentUser(event);const date=getQuery(event).date; if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw createError({statusCode:400,statusMessage:'A valid date is required.'});return database().select().from(foodEntries).where(and(eq(foodEntries.userId,user.id),eq(foodEntries.date,date)))})
