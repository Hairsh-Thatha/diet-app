import { z } from 'zod'
import { database } from '../../database'
import { users } from '../../database/schema'
import { createSession, hashPassword } from '../../utils/auth'
import { readValidated } from '../../utils/validation'

const schema=z.object({name:z.string().trim().min(1).max(80),email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(8).max(128)})
export default defineEventHandler(async event=>{
  const input=await readValidated(event,schema);const db=database()
  const user=await db.transaction(async tx=>{
    const [created]=await tx.insert(users).values({name:input.name,email:input.email,passwordHash:hashPassword(input.password)}).onConflictDoNothing({target:users.email}).returning({id:users.id,name:users.name,email:users.email})
    if(!created)throw createError({statusCode:409,statusMessage:'An account with this email already exists.'})
    await createSession(event,created.id,tx)
    return created
  })
  return user
})
