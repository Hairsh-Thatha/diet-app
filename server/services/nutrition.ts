import { and, eq, sql } from 'drizzle-orm'
import { foodEntries, nutritionGoals } from '../database/schema'
export async function dailyNutrition(db:any,userId:string,date:string){
  const [sum]=await db.select({calories:sql<string>`coalesce(sum(${foodEntries.calories}),0)`,protein:sql<string>`coalesce(sum(${foodEntries.protein}),0)`,carbs:sql<string>`coalesce(sum(${foodEntries.carbs}),0)`,fat:sql<string>`coalesce(sum(${foodEntries.fat}),0)`}).from(foodEntries).where(and(eq(foodEntries.userId,userId),eq(foodEntries.date,date)))
  const entries=await db.select().from(foodEntries).where(and(eq(foodEntries.userId,userId),eq(foodEntries.date,date))).orderBy(foodEntries.createdAt)
  let [goals]=await db.select().from(nutritionGoals).where(eq(nutritionGoals.userId,userId)).limit(1)
  if(!goals){[goals]=await db.insert(nutritionGoals).values({userId}).returning()}
  const n=(v:any)=>Number(v||0)
  return{date,totals:{calories:n(sum.calories),protein:n(sum.protein),carbs:n(sum.carbs),fat:n(sum.fat)},goals:{calories:goals.calories,protein:n(goals.protein),carbs:n(goals.carbs),fat:n(goals.fat),water:n(goals.water)},entries:entries.map((e:any)=>({...e,calories:n(e.calories),protein:n(e.protein),carbs:n(e.carbs),fat:n(e.fat),confidence:e.confidence===null?null:n(e.confidence)}))}
}
