import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{emptyStats,encodeContent,decodeContent,hashId} from '../analytics/worker/worker.mjs';

const origin='https://example.github.io';
const env={
  ALLOWED_ORIGIN:origin,GITHUB_OWNER:'example',GITHUB_REPO:'co-tu-lenh',
  GITHUB_BRANCH:'visitor-data',GITHUB_DATA_PATH:'analytics/data/visitors.json',
  GITHUB_TOKEN:'test-token',VISITOR_SALT:'a-secret-salt-with-more-than-32-characters'
};
const visitId='025d35b7-a15c-4fe0-b7a5-353e32810991';
const request=(id=visitId,source=origin)=>new Request('https://counter.example.workers.dev/visit',{method:'POST',headers:{Origin:source,'Content-Type':'application/json'},body:JSON.stringify({visitorId:id})});

test('JSON is encoded losslessly and browser ID is not stored raw',async()=>{
  const stats=emptyStats();stats.visitors[await hashId(visitId,env.VISITOR_SALT)]='2026-10-22';
  assert.deepEqual(decodeContent(encodeContent(stats)),stats);
  assert.equal(encodeContent(stats).includes(visitId),false);
});

test('a new browser is recorded once; a second request is idempotent',async()=>{
  const originalFetch=globalThis.fetch;
  let content=null,sha=null,writes=0;
  globalThis.fetch=async(_url,options={})=>{
    if(options.method==='PUT'){
      const body=JSON.parse(options.body);content=body.content;sha='sha-'+(++writes);
      return new Response('{}',{status:200});
    }
    return content?Response.json({content,sha}):new Response('{}',{status:404});
  };
  try{
    const first=await worker.fetch(request(),env),second=await worker.fetch(request(),env);
    assert.deepEqual(await first.json(),{newVisitor:true,totalBrowsers:1});
    assert.deepEqual(await second.json(),{newVisitor:false,totalBrowsers:1});
    assert.equal(writes,1);
    const stats=decodeContent(content);
    assert.equal(stats.totalBrowsers,1);
    assert.equal(Object.keys(stats.visitors).length,1);
    assert.equal(Object.keys(stats.visitors)[0]===visitId,false);
  } finally {globalThis.fetch=originalFetch;}
});

test('wrong origin, invalid ID and missing configuration are rejected before GitHub writes',async()=>{
  assert.equal((await worker.fetch(request(visitId,'https://other.example'),env)).status,403);
  assert.equal((await worker.fetch(request('bad-id'),env)).status,400);
  assert.equal((await worker.fetch(request(visitId),{...env,GITHUB_TOKEN:''})).status,503);
});

test('SHA conflicts cause a fresh read and retry',async()=>{
  const originalFetch=globalThis.fetch;let putCount=0;
  globalThis.fetch=async(_url,options={})=>{
    if(options.method==='PUT')return new Response('{}',{status:++putCount===1?409:200});
    return Response.json({content:encodeContent(emptyStats()),sha:'original-sha'});
  };
  try{const response=await worker.fetch(request(),env);assert.equal(response.status,200);assert.equal(putCount,2);}
  finally{globalThis.fetch=originalFetch;}
});
