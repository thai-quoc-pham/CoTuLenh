(function(root){
  'use strict';
  const E=root.CTLPlayEngine||(typeof require!=='undefined'?require('./engine'):null);
  const LEVELS={easy:{depth:1,width:8,noise:150},medium:{depth:2,width:9,noise:20},hard:{depth:3,width:12,noise:0}};
  const WIN=1000000;
  function value(state,side){
    if(state.winner)return state.winner===side?WIN-state.ply:-WIN+state.ply;
    let sum=0;
    for(const [at,stack] of Object.entries(state.board))for(const p of stack){
      const [x,y]=E.xy(at),forward=p.side==='red'?y:11-y;
      let score=E.VALUES[p.type];
      if(p.type!==1)score+=Math.max(0,5-Math.abs(x-5))*3+forward*2;
      if(p.type===0)score-=forward*5;
      if(p.type===10)score+=(x===2?16:0);
      sum+=(p.side===side?1:-1)*score;
    }
    sum+=(state.hold[side]-state.hold[E.opposite(side)])*170;
    for(const at of E.BASES[E.opposite(side)])if(E.sideAt(state,at)===side)sum+=170;
    for(const at of E.BASES[side])if(E.sideAt(state,at)===E.opposite(side))sum-=170;
    return sum;
  }
  function moveHint(state,move){
    const target=state.board[move.to],captured=target&&target[0].side!==state.turn?target.reduce((s,p)=>s+E.VALUES[p.type],0):0;
    let score=captured*10;
    if(move.kind==='carry')score+=45;
    if(move.kind==='fire')score-=5;
    if(E.BASES[E.opposite(state.turn)].includes(move.to))score+=130;
    const [x,y]=E.xy(move.to);score+=5-Math.abs(x-5);
    return score;
  }
  function ordered(state,moves,width){return moves.map(m=>({...m,hint:moveHint(state,m)})).sort((a,b)=>b.hint-a.hint).slice(0,width);}
  function search(state,depth,alpha,beta,side,width,cache,stats){
    stats.nodes++;
    if(state.winner||depth===0)return value(state,side);
    const key=JSON.stringify([state.turn,state.hold,Object.entries(state.board).map(([at,s])=>[at,s.map(p=>[p.side,p.type])])])+':'+depth;
    if(cache.has(key))return cache.get(key);
    const moves=E.legalMoves(state);
    if(!moves.length)return state.turn===side?-WIN+state.ply:WIN-state.ply;
    const maximizing=state.turn===side;
    let best=maximizing?-Infinity:Infinity,cut=false;
    for(const move of ordered(state,moves,width)){
      const child=E.apply(state,move);
      const score=search(child,depth-1,alpha,beta,side,width,cache,stats);
      best=maximizing?Math.max(best,score):Math.min(best,score);
      if(maximizing)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);
      if(beta<=alpha){stats.prunes++;cut=true;break;}
    }
    if(!cut)cache.set(key,best);
    return best;
  }
  function choose(state,level='medium',random=Math.random){
    const config=LEVELS[level]||LEVELS.medium,side=state.turn,moves=E.legalMoves(state);
    if(!moves.length)return {move:null,score:-WIN,nodes:0,prunes:0};
    const stats={nodes:0,prunes:0},cache=new Map();
    // Consider every legal root move so a forced defence or winning move is never dropped.
    let best=-Infinity,selected=[];
    for(const move of ordered(state,moves,moves.length)){
      const child=E.apply(state,move);
      const score=search(child,config.depth-1,-Infinity,Infinity,side,config.width,cache,stats);
      const adjusted=score+(config.noise?(random()-.5)*config.noise:0);
      if(adjusted>best+0.0001){best=adjusted;selected=[move];}
      else if(Math.abs(adjusted-best)<=0.0001)selected.push(move);
    }
    const picked=selected[Math.floor(random()*selected.length)];
    return {move:{from:picked.from,to:picked.to,index:picked.index,kind:picked.kind},score:best,...stats};
  }
  const api={LEVELS,value,choose};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CTLPlayAI=api;
})(typeof window!=='undefined'?window:globalThis);
