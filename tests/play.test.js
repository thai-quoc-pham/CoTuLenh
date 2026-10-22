const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../play/engine');
const AI=require('../play/ai');

let serial=0;
const p=(type,side)=>({id:++serial,type,side});
function position(extra={},turn='red'){
  return {board:{g1:[p(0,'red')],i12:[p(0,'blue')],...extra},turn,hold:{red:0,blue:0},ply:0,winner:null,reason:null,last:null};
}
const has=(moves,from,to,kind)=>moves.some(m=>m.from===from&&m.to===to&&m.kind===kind);

test('setup has 19 pieces per side and starts with legal moves',()=>{
  const s=E.initial();
  assert.equal(Object.values(s.board).flat().filter(x=>x.side==='red').length,19);
  assert.equal(Object.values(s.board).flat().filter(x=>x.side==='blue').length,19);
  const expected=[['g1',0],['b2',10],['e2',9],['f2',1],['h2',1],['i2',9],['d3',7],['g3',8],['j3',7],['c4',10],['e4',5],['f4',6],['h4',6],['i4',5],['c5',2],['d5',3],['g5',4],['j5',3],['k5',2]];
  for(const [at,type] of expected){
    assert.equal(s.board[at][0].type,type,`Đỏ ${at}`);
    assert.equal(s.board[at][0].side,'red',at);
    const mirror=at[0]+(13-Number(at.slice(1)));
    assert.equal(s.board[mirror][0].type,type,`Xanh ${mirror}`);
    assert.equal(s.board[mirror][0].side,'blue',mirror);
  }
  assert.equal(E.inCheck(s,'red'),false);
  assert.ok(E.legalMoves(s).length>0);
});
test('terrain matches the current community web board on all 132 squares',()=>{
  const bridges=new Set(['f6','f7','h6','h7']);
  const mixed=new Set(['d6','e6','d7','e7']);
  for(const col of E.FILES)for(let row=1;row<=12;row++){
    const at=col+row;
    const expected=bridges.has(at)?'bridge':col==='c'||mixed.has(at)?'mixed':col==='a'||col==='b'?'water':'land';
    assert.equal(E.terrain(at),expected,at);
  }
});
test('blocked movement, water, bridge and direct commander exposure',()=>{
  let s=position({e3:[p(6,'red')],e4:[p(2,'red')],e5:[p(2,'blue')]});
  assert.equal(has(E.legalMoves(s),'e3','e5','capture'),false);
  s=position({c3:[p(2,'red')],b3:[p(10,'blue')]});
  assert.equal(has(E.legalMoves(s),'c3','b3','capture'),false);
  s=position({f5:[p(7,'red')]});
  assert.equal(has(E.legalMoves(s),'f5','f6','move'),true);
  assert.equal(has(E.legalMoves(s),'f5','e6','move'),true);
  s=position({f6:[p(7,'red')]});
  assert.equal(has(E.legalMoves(s),'f6','e7','move'),false);
  assert.equal(E.terrain('e6'),'mixed');
  assert.equal(E.terrain('c4'),'mixed');
  assert.equal(E.terrain('c6'),'mixed');
  assert.equal(E.terrain('g6'),'land');
  assert.equal(E.terrain('a6'),'water');
  assert.equal(E.terrain('f6'),'bridge');
  assert.equal(E.canStand(10,'c4'),true);
  s=position({e5:[p(2,'red')]});
  assert.equal(has(E.legalMoves(s),'e5','e6','move'),true);
  s=position({i12:undefined,g12:[p(0,'blue')],g6:[p(2,'red')]});delete s.board.i12;
  assert.equal(has(E.legalMoves(s),'g6','f6','move'),false);
});
test('artillery can fire through one blocker but not two',()=>{
  let s=position({d3:[p(7,'red')],e3:[p(2,'red')],f3:[p(2,'blue')]});
  assert.equal(has(E.legalMoves(s),'d3','f3','fire'),true);
  s.board.f3=[p(2,'red')];s.board.g3=[p(2,'blue')];
  assert.equal(has(E.legalMoves(s),'d3','g3','fire'),false);
});
test('tank carries infantry, carrier moves together, passenger can split',()=>{
  let t=position({e3:[p(2,'red')],e4:[p(6,'red')]});
  const board=E.legalMoves(t).find(m=>m.from==='e3'&&m.to==='e4'&&m.kind==='carry');
  assert.ok(board);
  t=E.apply(t,board);
  assert.deepEqual(t.board.e4.map(x=>x.type),[6,2]);
  t.turn='red';
  assert.ok(E.legalMoves(t).some(m=>m.from==='e4'&&m.index===1&&m.to==='e5'));
  const split=E.legalMoves(t).find(m=>m.from==='e4'&&m.index===1&&m.to==='e5');
  t=E.apply(t,split);
  assert.deepEqual(t.board.e4.map(x=>x.type),[6]);
  assert.deepEqual(t.board.e5.map(x=>x.type),[2]);
});
test('ship can board a land unit from shore despite water destination',()=>{
  const s=position({c3:[p(2,'red')],b3:[p(10,'red')]});
  const move=E.legalMoves(s).find(m=>m.from==='c3'&&m.to==='b3'&&m.kind==='carry');
  assert.ok(move);
  const next=E.play(s,move);
  assert.deepEqual(next.board.b3.map(x=>x.type),[10,2]);
});
test('commander safety rejects exposed move and checkmate ends the game',()=>{
  const s=position({i12:undefined,g12:[p(0,'blue')],g6:[p(2,'red')]});delete s.board.i12;
  assert.equal(has(E.legalMoves(s),'g6','f6','move'),false);
  const m=position({g2:[p(6,'blue')],g3:[p(6,'blue')],f1:[p(6,'blue')],h1:[p(6,'blue')]},'red');
  assert.equal(E.inCheck(m,'red'),true);
  assert.equal(E.legalMoves(m).length,0);
  assert.equal(E.finish(m).reason,'chiếu bí');
});
test('carried commander is hidden from the direct face rule',()=>{
  const open=position({i12:undefined,g12:[p(0,'blue')]});delete open.board.i12;
  assert.equal(E.inCheck(open,'red'),true);
  open.board.g1=[p(6,'red'),open.board.g1[0]];
  assert.equal(E.inCheck(open,'red'),false);
});
test('base hold resets after control is broken and wins on third own turn',()=>{
  let s=position({f11:[p(2,'red')],d3:[p(2,'red')],h9:[p(2,'blue')]});
  s=E.apply(s,{from:'d3',to:'d4',index:0,kind:'move'});
  assert.equal(s.hold.red,1);
  s=E.apply(s,{from:'h9',to:'h10',index:0,kind:'move'});
  s=E.apply(s,{from:'d4',to:'d3',index:0,kind:'move'});
  assert.equal(s.hold.red,2);
  s=E.apply(s,{from:'h10',to:'h9',index:0,kind:'move'});
  s=E.apply(s,{from:'d3',to:'d4',index:0,kind:'move'});
  assert.equal(s.winner,'red');
  assert.match(s.reason,/3 lượt/);
});
test('AI returns legal moves at all three levels and sees a forced commander capture',()=>{
  const s=position({i12:undefined,g12:[p(0,'blue')],g11:[p(6,'red')]});delete s.board.i12;
  for(const level of ['easy','medium','hard']){
    const move=AI.choose(s,level,()=>0.5).move;
    assert.ok(E.legalMoves(s).some(m=>JSON.stringify(m)===JSON.stringify(move)),level);
    assert.equal(move.to,'g12',level);
    assert.equal(E.play(s,move).winner,'red',level);
  }
});
test('clock values are copied with each move so undo can restore them',()=>{
  const s=E.initial();s.remaining={red:300,blue:300};
  const next=E.play(s,E.legalMoves(s)[0]);
  next.remaining.blue=296;
  assert.deepEqual(s.remaining,{red:300,blue:300});
});
