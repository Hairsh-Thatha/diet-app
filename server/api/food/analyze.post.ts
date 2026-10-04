import { z } from 'zod'
import { currentUser } from '../../utils/auth'
const resultSchema=z.object({foodName:z.string(),servingSize:z.string(),calories:z.number(),protein:z.number(),carbs:z.number(),fat:z.number(),confidence:z.number().min(0).max(1),ingredients:z.array(z.string()).default([])})
export default defineEventHandler(async event=>{
  await currentUser(event)
  const config=useRuntimeConfig();if(!config.aiApiKey)throw createError({statusCode:503,statusMessage:'AI_API_KEY is not configured.'})
  const form=await readMultipartFormData(event);const image=form?.find(x=>x.name==='image'&&x.data);if(!image)throw createError({statusCode:400,statusMessage:'Upload a food image.'});if(image.data.length>8*1024*1024)throw createError({statusCode:413,statusMessage:'Image must be smaller than 8 MB.'})
  const mime=image.type||'image/jpeg';if(!mime.startsWith('image/'))throw createError({statusCode:415,statusMessage:'Upload a valid image.'})
  const url='data:'+mime+';base64,'+image.data.toString('base64')
  const response=await $fetch<any>('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+config.aiApiKey},body:{model:config.aiModel,temperature:0.2,response_format:{type:'json_object'},messages:[{role:'system',content:'Analyze the food image and return JSON only. Estimate one visible serving, never claim exact values. Use keys foodName, servingSize, calories, protein, carbs, fat, confidence (0-1), ingredients (string array). Nutrient values must be nonnegative numbers.'},{role:'user',content:[{type:'text',text:'Estimate the visible meal nutrition.'},{type:'image_url',image_url:{url,detail:'high'}}]}]}})
  const content=response.choices?.[0]?.message?.content;try{return resultSchema.parse(JSON.parse(content))}catch{throw createError({statusCode:502,statusMessage:'The AI returned an unusable nutrition estimate. Please try again.'})}
})
