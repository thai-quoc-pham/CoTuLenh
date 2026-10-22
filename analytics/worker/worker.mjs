const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emptyStats=()=>({version:1,totalBrowsers:0,byDay:{},visitors:{},updatedAt:null});

function cors(origin,env){
  const allowed=String(env.ALLOWED_ORIGIN||'').split(',').map(x=>x.trim()).filter(Boolean);
  return allowed.includes(origin)?{
    'Access-Control-Allow-Origin':origin,
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Max-Age':'600',
    'Vary':'Origin'
  }:null;
}
function reply(body,status,headers={}){
  return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
}
function validConfig(env){
  return /^[\w-]+$/.test(env.GITHUB_OWNER||'')&&/^[\w.-]+$/.test(env.GITHUB_REPO||'')&&
    typeof env.GITHUB_BRANCH==='string'&&env.GITHUB_BRANCH.length>0&&
    /^(?:[\w.-]+\/)*[\w.-]+\.json$/.test(env.GITHUB_DATA_PATH||'')&&
    typeof env.GITHUB_TOKEN==='string'&&env.GITHUB_TOKEN.length>0&&
    typeof env.VISITOR_SALT==='string'&&env.VISITOR_SALT.length>=32;
}
function githubUrl(env){
  const path=env.GITHUB_DATA_PATH.split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${path}`;
}
function githubHeaders(env){return {'Accept':'application/vnd.github+json','Authorization':`Bearer ${env.GITHUB_TOKEN}`,'User-Agent':'CoTuLenh-Visitor-Counter','Content-Type':'application/json'};}
function encodeContent(value){
  const bytes=new TextEncoder().encode(JSON.stringify(value,null,2)+'\n');
  let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
  return btoa(binary);
}
function decodeContent(value){
  const binary=atob(value.replace(/\s/g,'')),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const parsed=JSON.parse(new TextDecoder().decode(bytes));
  if(parsed?.version!==1||!Number.isInteger(parsed.totalBrowsers)||parsed.totalBrowsers<0||
    !parsed.byDay||Array.isArray(parsed.byDay)||!parsed.visitors||Array.isArray(parsed.visitors))throw Error('Dữ liệu thống kê không đúng định dạng');
  return parsed;
}
async function readStats(env){
  const response=await fetch(`${githubUrl(env)}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`,{headers:githubHeaders(env)});
  if(response.status===404)return {stats:emptyStats(),sha:null};
  if(!response.ok)throw Error(`GitHub GET ${response.status}`);
  const file=await response.json();
  if(typeof file.sha!=='string'||typeof file.content!=='string')throw Error('GitHub không trả nội dung JSON');
  return {stats:decodeContent(file.content),sha:file.sha};
}
async function writeStats(env,stats,sha){
  const body={message:`Thống kê: thêm trình duyệt mới ${new Date().toISOString().slice(0,10)}`,content:encodeContent(stats),branch:env.GITHUB_BRANCH};
  if(sha)body.sha=sha;
  const response=await fetch(githubUrl(env),{method:'PUT',headers:githubHeaders(env),body:JSON.stringify(body)});
  if(response.ok)return true;
  if(response.status===409||response.status===422)return false; // SHA đã thay đổi; đọc lại rồi thử tiếp.
  throw Error(`GitHub PUT ${response.status}`);
}
async function hashId(id,salt){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(salt),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signed=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(id));
  return Array.from(new Uint8Array(signed),byte=>byte.toString(16).padStart(2,'0')).join('');
}
async function recordVisit(env,id){
  const key=await hashId(id,env.VISITOR_SALT);
  for(let attempt=0;attempt<5;attempt++){
    const {stats,sha}=await readStats(env);
    if(Object.hasOwn(stats.visitors,key))return {newVisitor:false,totalBrowsers:stats.totalBrowsers};
    const day=new Date().toISOString().slice(0,10);
    stats.visitors[key]=day;
    stats.totalBrowsers+=1;
    stats.byDay[day]=(Number(stats.byDay[day])||0)+1;
    stats.updatedAt=new Date().toISOString();
    if(await writeStats(env,stats,sha))return {newVisitor:true,totalBrowsers:stats.totalBrowsers};
  }
  throw Error('Xung đột cập nhật sau nhiều lần thử');
}

export default {
  async fetch(request,env){
    const url=new URL(request.url),headers=cors(request.headers.get('Origin'),env);
    if(!headers)return reply({error:'Nguồn truy cập không được phép'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(!validConfig(env))return reply({error:'Chưa cấu hình dịch vụ thống kê'},503,headers);
    if(request.method==='GET'&&url.pathname==='/stats'){
      try{const {stats}=await readStats(env);return reply({totalBrowsers:stats.totalBrowsers,byDay:stats.byDay,updatedAt:stats.updatedAt},200,headers);}
      catch{return reply({error:'Không đọc được thống kê'},503,headers);}
    }
    if(request.method!=='POST'||url.pathname!=='/visit')return reply({error:'Không tìm thấy'},404,headers);
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'Cần gửi JSON'},415,headers);
    if(Number(request.headers.get('Content-Length')||0)>256)return reply({error:'Dữ liệu quá dài'},413,headers);
    let body;try{const raw=await request.text();if(raw.length>256)return reply({error:'Dữ liệu quá dài'},413,headers);body=JSON.parse(raw);}catch{return reply({error:'JSON không hợp lệ'},400,headers);}
    if(!uuidPattern.test(body?.visitorId||''))return reply({error:'Mã trình duyệt không hợp lệ'},400,headers);
    try{return reply(await recordVisit(env,body.visitorId),200,headers);}
    catch{return reply({error:'Chưa thể ghi thống kê, hãy thử lại sau'},503,headers);}
  }
};

export {emptyStats,encodeContent,decodeContent,hashId,recordVisit,validConfig};
