import { foodEntries } from '../../database/schema'
import { database } from '../../database'
import { currentUser } from '../../utils/auth'
import { foodSchema, readValidated } from '../../utils/validation'
export default defineEventHandler(async event=>{const user=await currentUser(event);const body=await readValidated(event,foodSchema);const [entry]=await database().insert(foodEntries).values({...body,userId:user.id,date:new Date().toLocaleDateString('en-CA')}).returning();return entry})
