import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { database } from '../../database'
import { users } from '../../database/schema'
import { createSession, hashPassword, verifyPassword } from '../../utils/auth'
import { readValidated } from '../../utils/validation'

const schema=z.object({email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(1).max(128)})
export default defineEventHandler(async event=>{
  const input=await readValidated(event,schema)
  const [user]=await database().select().from(users).where(eq(users.email,input.email)).limit(1)
  if(!user||!verifyPassword(input.password,user.passwordHash)){
    // Keep response timing similar for accounts without a stored password hash.
    if(!user)hashPassword(input.password)
    throw createError({statusCode:401,statusMessage:'Email or password is incorrect.'})
  }
  await createSession(event,user.id)
  return{id:user.id,name:user.name,email:user.email}
})
