importScripts('engine.js','ai.js');
self.onmessage=function(event){
  const {state,level,token}=event.data;
  try{self.postMessage({token,result:self.CTLPlayAI.choose(state,level)});}
  catch(error){self.postMessage({token,error:error.message});}
};
