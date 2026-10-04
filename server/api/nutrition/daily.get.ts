import {dailyNutrition} from '../../services/nutrition'
import {database} from '../../database'
import {currentUser} from '../../utils/auth'
export default defineEventHandler(async event=>{const user=await currentUser(event);const d=getQuery(event).date;const date=typeof d==='string'?d:new Date().toLocaleDateString('en-CA');if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw createError({statusCode:400,statusMessage:'Invalid date.'});return dailyNutrition(database(),user.id,date)})
