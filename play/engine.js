(function (root) {
  'use strict';
  const FILES = 'abcdefghijk', WIDTH = 11, HEIGHT = 12;
  const NAMES = ['Chỉ huy','Sở Chỉ Huy','Bộ binh','Công binh','Dân quân','Phòng không','Xe tăng','Pháo','Tên lửa','Máy bay','Hải quân'];
  const VALUES = [10000,180,100,160,130,260,360,430,390,550,420];
  const ORTH = [[1,0],[-1,0],[0,1],[0,-1]];
  const ALL = [...ORTH,[1,1],[1,-1],[-1,1],[-1,-1]];
  const SETUP = [['g1',0],['b2',10],['e2',9],['f2',1],['h2',1],['i2',9],['d3',7],['g3',8],['j3',7],['c4',10],['e4',5],['f4',6],['h4',6],['i4',5],['c5',2],['d5',3],['g5',4],['j5',3],['k5',2]];
  const BASES = {red:['f2','h2'],blue:['f11','h11']};
  const opposite = side => side === 'red' ? 'blue' : 'red';
  const sideName = side => side === 'red' ? 'Đỏ' : 'Xanh';
  function xy(at) { return [FILES.indexOf(at[0]), Number(at.slice(1)) - 1]; }
  function square(x,y) { return x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT ? null : FILES[x] + (y+1); }
  function terrain(at) {
    const [x,y] = xy(at);
    if ((x === 5 || x === 7) && (y === 5 || y === 6)) return 'bridge';
    if (x === 2 || (x === 3 || x === 4) && (y === 5 || y === 6)) return 'mixed';
    if (x < 2) return 'water';
    return 'land';
  }
  function initial() {
    const board = {};
    let id = 0;
    for (const [at,type] of SETUP) {
      board[at] = [{id:++id,type,side:'red'}];
      const mirror = at[0] + (13 - Number(at.slice(1)));
      board[mirror] = [{id:++id,type,side:'blue'}];
    }
    return {board,turn:'red',hold:{red:0,blue:0},ply:0,winner:null,reason:null,last:null};
  }
  const clone = state => ({...state,board:Object.fromEntries(Object.entries(state.board).map(([at,stack])=>[at,stack.map(p=>({...p}))])),hold:{...state.hold},remaining:state.remaining&&{...state.remaining},last:state.last&&{...state.last}});
  const top = stack => stack?.[0];
  const sideAt = (state,at) => top(state.board[at])?.side;
  const commanderSquare = (state,side) => Object.keys(state.board).find(at=>state.board[at].some(p=>p.side===side&&p.type===0));
  function canStand(type,at) {
    const t=terrain(at);
    return type===10 ? t==='water'||t==='mixed' : t!=='water';
  }
  function stackAllowed(stack,passenger) {
    if (!stack?.length || stack.some(p=>p.id===passenger.id)) return false;
    const carrier=stack[0].type, all=[...stack.map(p=>p.type),passenger.type];
    if (carrier===1) return all.length===2&&passenger.type===0;
    if (carrier===6) return all.length===2&&[0,2,4].includes(passenger.type);
    if (carrier===3) return all.length===2&&[5,7,8].includes(passenger.type);
    if (carrier===9) return all.length<=3&&all.filter(t=>t===6).length<=1&&all.filter(t=>[0,2,4].includes(t)).length<=1&&all.slice(1).every(t=>[0,2,4,6].includes(t));
    if (carrier===10) return all.length<=3&&all.filter(t=>t===9).length<=1&&all.filter(t=>[0,2,4,6].includes(t)).length<=1&&all.slice(1).every(t=>[0,2,4,6,9].includes(t));
    return false;
  }
  function movement(type) {
    if (type===0) return [ORTH,11];
    if ([2,3,5].includes(type)) return [ORTH,1];
    if (type===4) return [ALL,1];
    if (type===6) return [ORTH,2];
    if (type===7) return [ALL,3];
    if (type===8) return [ALL,2];
    if (type===9||type===10) return [ALL,4];
    return [[],0];
  }
  function flightBlocked(state,side,from,to) {
    const [fx,fy]=xy(from),[tx,ty]=xy(to),dx=Math.sign(tx-fx),dy=Math.sign(ty-fy),steps=Math.max(Math.abs(tx-fx),Math.abs(ty-fy));
    for(let n=1;n<=steps;n++) {
      const x=fx+dx*n,y=fy+dy*n;
      for(const [at,stack] of Object.entries(state.board)) {
        if(top(stack).side===side) continue;
        const type=top(stack).type,[ax,ay]=xy(at);
        const range=type===5?1:type===8?2:type===10?1:0;
        if(range&&Math.max(Math.abs(ax-x),Math.abs(ay-y))<=range) return true;
      }
    }
    return false;
  }
  function crossesRiver(from,to,type) {
    if (![5,7,8].includes(type)) return false;
    const a=Number(from.slice(1)),b=Number(to.slice(1));
    if ((a<=6&&b>=7)||(a>=7&&b<=6)) {
      const [fx,fy]=xy(from),[tx,ty]=xy(to),dx=Math.sign(tx-fx),dy=Math.sign(ty-fy),steps=Math.max(Math.abs(tx-fx),Math.abs(ty-fy));
      for(let n=1;n<=steps;n++){
        const previous=square(fx+dx*(n-1),fy+dy*(n-1)),current=square(fx+dx*n,fy+dy*n);
        const row=Number(previous.slice(1)),nextRow=Number(current.slice(1));
        if((row<=6&&nextRow>=7)||(row>=7&&nextRow<=6))
          return previous[0]!==current[0]||!['f','h'].includes(current[0])||terrain(previous)!=='bridge'||terrain(current)!=='bridge';
      }
    }
    return false;
  }
  // Pseudo moves do not test commander safety. Fire through exactly one occupied square.
  function pseudoFrom(state,from,index=0) {
    const stack=state.board[from];if(!stack||!stack[index])return [];
    const unit=stack[index],type=unit.type,side=unit.side;
    if(type===1)return [];
    const [dirs,max]=movement(type),[fx,fy]=xy(from),moves=[];
    for(const [dx,dy] of dirs){
      if(type===8&&dx&&dy) {
        // Diagonal missile moves only one square.
      }
      let blockers=0,waterPath=false;
      for(let step=1;step<=max;step++){
        if(type===8&&dx&&dy&&step>1)break;
        const to=square(fx+dx*step,fy+dy*step);if(!to)break;
        const target=state.board[to],enemy=target&&top(target).side!==side,friendly=target&&top(target).side===side;
        const fly=type===9,naval=type===10,heavy=[5,7,8].includes(type);
        const priorWater=waterPath;
        if(!fly&&!naval&&terrain(to)==='water')waterPath=true;
        const blockedTerrain=heavy&&crossesRiver(from,to,type);
        const flightDanger=fly&&flightBlocked(state,side,from,to);
        const stand=canStand(type,to)&&!waterPath&&!blockedTerrain&&!flightDanger;
        const capturable=type!==0||step===1;
        if(!target&&stand&&blockers===0) moves.push({from,to,index,kind:'move'});
        if(enemy&&capturable){
          if(stand&&blockers===0)moves.push({from,to,index,kind:'capture'});
          if([7,8,9,10].includes(type)||type===6&&!stand){
            if(!flightDanger&&(blockers===0||[7,8].includes(type)&&blockers===1))moves.push({from,to,index,kind:'fire'});
          }
        }
        if(friendly&&blockers===0&&!priorWater&&!flightDanger&&(index>0||stack.length===1)&&stackAllowed(target,unit))moves.push({from,to,index,kind:'carry'});
        if(target&&!fly){blockers++;if(!(type===7||type===8)||blockers>1)break;}
        if(naval&&terrain(to)!=='water'&&terrain(to)!=='mixed')break;
        if(type===0&&target)break;
      }
    }
    return moves;
  }
  function pseudo(state,side) {
    const moves=[];
    for(const [at,stack] of Object.entries(state.board))if(top(stack).side===side){
      // Carrier moves the whole stack; each passenger may split using its own rules.
      for(let i=0;i<stack.length;i++)moves.push(...pseudoFrom(state,at,i));
    }
    return moves;
  }
  function apply(state,move) {
    const next=clone(state),fromStack=next.board[move.from],unit=fromStack[move.index];
    const group=move.index===0?fromStack.splice(0):[fromStack.splice(move.index,1)[0]];
    if(!fromStack.length)delete next.board[move.from];
    if(move.kind==='fire'){
      // Firing consumes a turn without changing the attacker's position.
      next.board[move.from]=move.index===0?group:(next.board[move.from]||[]).concat(group);
      delete next.board[move.to];
    } else if(move.kind==='carry') {
      next.board[move.to].push(...group);
    } else {
      next.board[move.to]=group;
    }
    next.turn=opposite(state.turn);next.ply=state.ply+1;next.last={...move,side:unit.side,type:unit.type};
    const enemy=opposite(unit.side);
    if(!commanderSquare(next,enemy)){next.winner=unit.side;next.reason='bắt Chỉ huy';}
    const occupied=BASES[enemy].some(at=>sideAt(next,at)===unit.side);
    next.hold[unit.side]=occupied?state.hold[unit.side]+1:0;
    if(!BASES[unit.side].some(at=>sideAt(next,at)===enemy))next.hold[enemy]=0;
    if(next.hold[unit.side]>=3){next.winner=unit.side;next.reason='giữ Sở Chỉ Huy 3 lượt';}
    return next;
  }
  function inCheck(state,side) {
    const king=commanderSquare(state,side);if(!king)return true;
    const enemy=opposite(side),[kx,ky]=xy(king),other=commanderSquare(state,enemy);
    const hidden=state.board[king].findIndex(p=>p.side===side&&p.type===0)>0;
    const otherHidden=other&&state.board[other].findIndex(p=>p.side===enemy&&p.type===0)>0;
    if(other&&!hidden&&!otherHidden){const [ox,oy]=xy(other);if(ox===kx||oy===ky){let clear=true,dx=Math.sign(ox-kx),dy=Math.sign(oy-ky);for(let x=kx+dx,y=ky+dy;x!==ox||y!==oy;x+=dx,y+=dy)if(state.board[square(x,y)]){clear=false;break;}if(clear)return true;}}
    for(const [at,stack] of Object.entries(state.board))if(top(stack).side===enemy){
      for(const unit of stack){
        if(unit.type===1)continue;
        const [x,y]=xy(at),dx=kx-x,dy=ky-y,ax=Math.abs(dx),ay=Math.abs(dy),dist=Math.max(ax,ay);
        const orth=(dx===0)!==(dy===0),diag=ax===ay&&ax>0;
        const [dirs,max]=movement(unit.type);
        if(!dist||dist>max||!(orth||diag)||diag&&dirs===ORTH||unit.type===8&&diag&&dist>1||unit.type===0&&dist>1)continue;
        if(unit.type===9&&flightBlocked(state,enemy,at,king))continue;
        let blockers=0,sx=Math.sign(dx),sy=Math.sign(dy);
        for(let n=1;n<dist;n++)if(state.board[square(x+sx*n,y+sy*n)])blockers++;
        if(blockers===0||[7,8].includes(unit.type)&&blockers===1)return true;
      }
    }
    return false;
  }
  function legalMoves(state,side=state.turn) {
    if(state.winner)return [];
    return pseudo(state,side).filter(m=>!inCheck(apply({...state,turn:side},m),side));
  }
  function finish(state) {
    if(state.winner)return state;
    const moves=legalMoves(state,state.turn);
    if(!moves.length){state.winner=opposite(state.turn);state.reason=inCheck(state,state.turn)?'chiếu bí':'hết nước hợp lệ';}
    return state;
  }
  function play(state,move) {
    if(state.winner)throw Error('Ván đã kết thúc');
    const allowed=legalMoves(state).find(m=>m.from===move.from&&m.to===move.to&&m.index===move.index&&m.kind===move.kind);
    if(!allowed)throw Error('Nước đi không hợp lệ');
    return finish(apply(state,allowed));
  }
  const api={FILES,NAMES,VALUES,BASES,initial,clone,terrain,sideName,opposite,xy,square,canStand,stackAllowed,pseudoFrom,pseudo,apply,inCheck,legalMoves,finish,play,commanderSquare,sideAt};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CTLPlayEngine=api;
})(typeof window!=='undefined'?window:globalThis);
