import {user,json} from '@/lib/world';
import {topicById} from '@/lib/bank';
// A topic's helpsheet. It teaches the method with a different example, so it is safe to open before answering.
export async function GET(req:Request){try{const uid=await user(req);if(!uid)return json({error:'Sign in to read helpsheets.'},401);const t=topicById.get(new URL(req.url).searchParams.get('id')??'');if(!t)return json({error:'There is no helpsheet for this question.'},404);return Response.json({topic:{id:t.id,title:t.title,subject:t.subject,strand:t.strand,helpsheet:t.helpsheet}},{headers:{'Cache-Control':'private, max-age=3600'}})}catch{return json({error:'The helpsheet is unavailable. Please try again.'},503)}}
