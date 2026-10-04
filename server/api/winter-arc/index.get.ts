import {and,eq,gte,lte} from 'drizzle-orm'
import {challenges,habits,habitCompletions} from '../../database/schema'
import {database} from '../../database'
import {currentUser} from '../../utils/auth'
export default defineEventHandler(async event=>{
 const user=await currentUser(event),db=database();const [challenge]=await db.select().from(challenges).where(and(eq(challenges.userId,user.id),eq(challenges.status,'active'))).limit(1)
 const empty={currentStreak:0,longestStreak:0,completedDays:0,habitCompletion:0,challengeCompletion:0,todayCompleted:0};if(!challenge)return{challenge:null,habits:[],stats:empty}
 const hs=await db.select().from(habits).where(and(eq(habits.challengeId,challenge.id),eq(habits.active,true))).orderBy(habits.sortOrder);const today=new Date().toLocaleDateString('en-CA')
 const rows=await db.select().from(habitCompletions).where(and(gte(habitCompletions.date,challenge.startDate),lte(habitCompletions.date,today)));const allowed=new Set(hs.map(h=>h.id));const byDay=new Map<string,Set<string>>()
 for(const row of rows){if(row.completed&&allowed.has(row.habitId)){const key=String(row.date),set=byDay.get(key)||new Set<string>();set.add(row.habitId);byDay.set(key,set)}}
 const completeDays=[...byDay].filter(([,ids])=>hs.length>0&&ids.size>=hs.length).map(([d])=>d).sort();let best=0,run=0,prior=''
 for(const d of completeDays){const gap=prior?Math.round((new Date(d+'T00:00:00').getTime()-new Date(prior+'T00:00:00').getTime())/86400000):0;run=gap===1?run+1:1;best=Math.max(best,run);prior=d}
 const todayIds=byDay.get(today)||new Set<string>(),todayCompleted=hs.filter(h=>todayIds.has(h.id)).length;let cursor=new Date(today+'T00:00:00');if(!completeDays.includes(today))cursor.setDate(cursor.getDate()-1);let streak=0
 while(completeDays.includes(cursor.toLocaleDateString('en-CA'))){streak++;cursor.setDate(cursor.getDate()-1)}
 const day=Math.min(challenge.duration,Math.max(1,Math.floor((Date.now()-new Date(challenge.startDate+'T00:00:00').getTime())/86400000)+1))
 return{challenge:{...challenge,day},habits:hs.map(h=>({...h,todayCompleted:todayIds.has(h.id)})),stats:{currentStreak:streak,longestStreak:best,completedDays:completeDays.length,habitCompletion:hs.length?Math.round(100*todayCompleted/hs.length):0,challengeCompletion:Math.round(100*completeDays.length/challenge.duration),todayCompleted}}
})
