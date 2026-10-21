const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../scenarios/scenario-data');
const engine=require('../scenarios/scenario-engine');
const progress=require('../scenarios/scenario-progress');

test('twelve verified scenarios cover five categories and have complete answers',()=>{
  assert.equal(data.scenarios.length,12);
  assert.equal(new Set(data.scenarios.map(s=>s.category)).size,5);
  for(const s of data.scenarios){assert.equal(s.verified,true,s.id);assert.equal(engine.validate(s),true,s.id);assert.equal(engine.judge(s,s.answer).correct,true,s.id);}
});
test('unverified data is excluded from assessment and 80% requires all answers',()=>{
  const list=[...data.scenarios,{...data.scenarios[0],id:'X99',verified:false}];
  assert.equal(engine.active({scenarios:list}).length,12);
  const answers=Object.fromEntries(data.scenarios.slice(0,10).map(s=>[s.id,s.answer]));
  assert.equal(engine.grade(list,answers).passed,false);
  answers[data.scenarios[10].id]='wrong';answers[data.scenarios[11].id]='wrong';
  assert.equal(engine.grade(list,answers).passed,true);
  answers[data.scenarios[9].id]='wrong';assert.equal(engine.grade(list,answers).passed,false);
});
test('guided retries and targeted restart preserve other work',()=>{
  const s=progress.fresh();
  progress.answer(s,'A01','yes',false);progress.answer(s,'A01','no',true);progress.answer(s,'A02','f3',true);
  assert.deepEqual(s.guided.A01,{attempts:2,completed:true});
  progress.restart(s,'A01');assert.equal(s.guided.A01,undefined);assert.equal(s.guided.A02.completed,true);
});
test('assessment keeps first answer and serializes intermediate progress',()=>{
  const s=progress.fresh();s.mode='assessment';
  assert.equal(progress.answer(s,'A01','yes',false),true);
  assert.equal(progress.answer(s,'A01','no',true),false);
  const storage={value:null,getItem(){return this.value},setItem(k,v){this.value=v}};
  progress.save(s,storage);const restored=progress.load(storage);
  assert.equal(restored.assessment.answers.A01,'yes');
  progress.restartAssessment(restored);assert.deepEqual(restored.assessment.answers,{});
});
