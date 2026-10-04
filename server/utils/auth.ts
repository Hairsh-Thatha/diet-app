import { and, eq, gt } from 'drizzle-orm'
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { database } from '../database'
import { authSessions, users } from '../database/schema'
const SESSION_COOKIE='nutriarc_session'
const SESSION_DAYS=30
export function hashPassword(password:string){const salt=randomBytes(16);const hash=scryptSync(password,salt,64);return salt.toString('base64url')+'.'+hash.toString('base64url')}
export function verifyPassword(password:string,stored:string|null){if(!stored)return false;const [saltText,hashText]=stored.split('.');if(!saltText||!hashText)return false;try{const salt=Buffer.from(saltText,'base64url'),expected=Buffer.from(hashText,'base64url'),actual=scryptSync(password,salt,expected.length);return expected.length===actual.length&&timingSafeEqual(expected,actual)}catch{return false}}
export async function createSession(event:any,userId:string,tx:any=database()){const token=randomBytes(32).toString('base64url'),tokenHash=createHash('sha256').update(token).digest('hex'),expiresAt=new Date(Date.now()+SESSION_DAYS*86400000);await tx.insert(authSessions).values({userId,tokenHash,expiresAt});setCookie(event,SESSION_COOKIE,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:SESSION_DAYS*86400});return expiresAt}
export async function currentUser(event: any){
  const token=getCookie(event,SESSION_COOKIE)
  if(!token)throw createError({statusCode:401,statusMessage:'Sign in to access your NutriArc data.'})
  const tokenHash=createHash('sha256').update(token).digest('hex')
  const [user]=await database().select({id:users.id,name:users.name,email:users.email}).from(authSessions).innerJoin(users,eq(authSessions.userId,users.id)).where(and(eq(authSessions.tokenHash,tokenHash),gt(authSessions.expiresAt,new Date()))).limit(1)
  if(!user)throw createError({statusCode:401,statusMessage:'Your session is invalid. Sign in again.'})
  return user
}
