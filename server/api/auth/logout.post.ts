import { createHash } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { database } from '../../database'
import { authSessions } from '../../database/schema'
export default defineEventHandler(async event=>{const token=getCookie(event,'nutriarc_session');if(token){const hash=createHash('sha256').update(token).digest('hex');await database().delete(authSessions).where(eq(authSessions.tokenHash,hash))}setCookie(event,'nutriarc_session','',{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:0});return{ok:true}})
