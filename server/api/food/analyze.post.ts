import { z } from 'zod'
import { currentUser } from '../../utils/auth'
const resultSchema=z.object({foodName:z.string(),servingSize:z.string(),calories:z.number(),protein:z.number(),carbs:z.number(),fat:z.number(),confidence:z.number().min(0).max(1),ingredients:z.array(z.string()).default([])})
export default defineEventHandler(async event=>{
  await currentUser(event)
  const config=useRuntimeConfig();const apiKey=config.aiApiKey?.trim();if(!apiKey)throw createError({statusCode:503,statusMessage:'AI_API_KEY is missing. Add it to the project .env file and restart the Nuxt server.'})
  const form=await readMultipartFormData(event);const image=form?.find(x=>x.name==='image'&&x.data);if(!image)throw createError({statusCode:400,statusMessage:'Upload a food image.'});if(image.data.length>8*1024*1024)throw createError({statusCode:413,statusMessage:'Image must be smaller than 8 MB.'})
  const mime=image.type||'image/jpeg';if(!mime.startsWith('image/'))throw createError({statusCode:415,statusMessage:'Upload a valid image.'})
  const url='data:'+mime+';base64,'+image.data.toString('base64')
  let response:any
  try {
    response=await $fetch<any>('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+apiKey},body:{model:config.aiModel,temperature:0.2,response_format:{type:'json_object'},messages:[{role:'system',content:'Analyze the food image and return JSON only. Estimate one visible serving, never claim exact values. Use keys foodName, servingSize, calories, protein, carbs, fat, confidence (0-1), ingredients (string array). Nutrient values must be nonnegative numbers.'},{role:'user',content:[{type:'text',text:'Estimate the visible meal nutrition.'},{type:'image_url',image_url:{url,detail:'high'}}]}]}})
  } catch (error:any) {
    const status=error?.response?.status||error?.statusCode
    if(status===401||status===403)throw createError({statusCode:502,statusMessage:'OpenAI rejected AI_API_KEY. Check that the key is valid and enabled, then restart Nuxt.'})
    if(status===429)throw createError({statusCode:502,statusMessage:'OpenAI rate limit or quota reached. Check the API project billing and limits.'})
    if(status===400)throw createError({statusCode:502,statusMessage:'OpenAI rejected the AI_MODEL or request. Check that AI_MODEL is supported by your API account.'})
    throw createError({statusCode:502,statusMessage:'Could not reach OpenAI. Check the server network connection and try again.'})
  }
  const content=response.choices?.[0]?.message?.content;try{return resultSchema.parse(JSON.parse(content))}catch{throw createError({statusCode:502,statusMessage:'The AI returned an unusable nutrition estimate. Please try again.'})}
})
