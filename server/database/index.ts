import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
let pool:Pool|undefined
export function database(){const config=useRuntimeConfig();if(!config.databaseUrl)throw createError({statusCode:503,statusMessage:'DATABASE_URL is not configured'});pool??=new Pool({connectionString:config.databaseUrl,ssl:process.env.NODE_ENV==='production'?{rejectUnauthorized:true}:undefined});return drizzle(pool,{schema})}
