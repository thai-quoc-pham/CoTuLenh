(function(root){
  function active(data){return data.scenarios.filter(s=>s.verified===true);}
  function validate(s){
    if(!s.id||!s.title||!s.question||!s.explanation||!s.source||!s.ruleSet||!Array.isArray(s.pieces)||!s.pieces.length)return false;
    const answers=s.choices||s.options?.map(o=>o[0]);
    return Array.isArray(answers)&&answers.length>=2&&answers.includes(s.answer)&&new Set(answers).size===answers.length;
  }
  function judge(s,choice){if(!validate(s))throw Error('Tình huống thiếu dữ liệu hoặc chưa được xác minh');return {correct:choice===s.answer,answer:s.answer,explanation:s.explanation};}
  function grade(scenarios,answers){const included=active({scenarios});const total=included.length;const answered=included.filter(s=>Object.hasOwn(answers,s.id)).length;const correct=included.filter(s=>answers[s.id]===s.answer).length;return {total,answered,correct,percent:total?Math.round(correct/total*100):0,passed:total>0&&answered===total&&correct/total>=0.8};}
  const api={active,validate,judge,grade};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.ScenarioEngine=api;
})(typeof window!=='undefined'?window:globalThis);
