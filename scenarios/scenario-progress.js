(function(root){
  const key='ctl-scenarios-v1';
  const fresh=()=>({mode:'guided',current:'A01',guided:{},assessment:{answers:{},finished:false}});
  function load(storage=root.localStorage){try{const v=JSON.parse(storage.getItem(key));if(!v||!v.guided||!v.assessment?.answers)return fresh();return {...fresh(),...v};}catch{return fresh();}}
  function save(state,storage=root.localStorage){try{storage.setItem(key,JSON.stringify(state));}catch{/* Learning remains usable if storage is unavailable. */}}
  function answer(state,id,choice,correct){
    if(state.mode==='assessment'){if(Object.hasOwn(state.assessment.answers,id))return false;state.assessment.answers[id]=choice;}
    else {const entry=state.guided[id]||{attempts:0,completed:false};entry.attempts++;entry.completed=entry.completed||correct;state.guided[id]=entry;}
    return true;
  }
  function restart(state,id){if(state.mode==='assessment')delete state.assessment.answers[id];else delete state.guided[id];state.assessment.finished=false;}
  function restartAssessment(state){state.assessment={answers:{},finished:false};}
  const api={key,fresh,load,save,answer,restart,restartAssessment};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ScenarioProgress=api;
})(typeof window!=='undefined'?window:globalThis);
