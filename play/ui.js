(function(){
  'use strict';
  const E=window.CTLPlayEngine,AI=window.CTLPlayAI,box=document.getElementById('aiGame');
  if(!E||!AI||!box)return;
  const q=id=>box.querySelector(id);
  const asset=['01-tu-lenh','02-so-chi-huy','03-bo-binh','04-cong-binh','05-dan-quan','06-cao-xa','07-xe-tang','08-phao-binh','09-ten-lua','10-may-bay','11-tau-chien'];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state=E.initial(),human='red',selected=null,moves=[],pending=[],history=[],busy=false,token=0,worker=null,clockLast=Date.now(),note='Phe Đỏ đi trước. Chọn một quân để xem nước hợp lệ.';
  const label=m=>m.kind==='move'?'Đi tới':m.kind==='capture'?'Tiến vào ăn quân':m.kind==='fire'?'Bắn tại chỗ':'Phối hợp / chở quân';
  const sideLabel=side=>E.sideName(side);
  box.addEventListener('error',event=>{
    const img=event.target;
    if(img?.tagName==='IMG'&&img.closest('#aiBoard')&&!img.dataset.retried){
      img.dataset.retried='1';
      img.src+=img.src.includes('?')?'&retry=1':'?retry=1';
    }
  },true);
  function moveText(m){const type=E.NAMES[m.type??state.board[m.from]?.[m.index]?.type]||'Quân';return `${type} ${m.from.toUpperCase()} → ${m.to.toUpperCase()} · ${label(m)}`;}
  function phase(){
    if(state.winner)return `Phe ${sideLabel(state.winner)} thắng · ${state.reason}.`;
    const check=E.inCheck(state,state.turn)?' · Chỉ huy đang bị chiếu':'';
    return busy?'AI đang tính nước đi…':`Lượt phe ${sideLabel(state.turn)}${check}`;
  }
  function clockText(){
    if(!state.remaining)return 'Không dùng đồng hồ';
    const format=n=>`${String(Math.floor(Math.max(0,n)/60)).padStart(2,'0')}:${String(Math.floor(Math.max(0,n)%60)).padStart(2,'0')}`;
    return `Đỏ ${format(state.remaining.red)} · Xanh ${format(state.remaining.blue)}`;
  }
  function render(){
    q('#aiStatus').textContent=phase();q('#aiNote').textContent=note;
    q('#aiClocks').textContent=clockText();
    q('#aiHold').textContent=`Giữ căn cứ: Đỏ ${state.hold.red}/3 · Xanh ${state.hold.blue}/3`;
    q('#aiUndo').disabled=!history.length||busy||(human==='blue'&&history.length===1);
    q('#aiResign').disabled=!!state.winner||busy;
    q('#aiActions').innerHTML=pending.length>1?`<span>Chọn hành động ở ${pending[0].to.toUpperCase()}:</span>${pending.map((m,i)=>`<button type="button" data-action="${i}">${E.NAMES[state.board[m.from][m.index].type]} · ${label(m)}</button>`).join('')}`:'';
    const targets=new Map();for(const m of moves)targets.set(m.to,m);
    let html='<span class="ai-coord"></span>'+[...E.FILES].map(c=>`<span class="ai-coord">${c.toUpperCase()}</span>`).join('');
    for(let row=12;row>=1;row--){html+=`<span class="ai-coord">${row}</span>`;for(const col of E.FILES){
      const at=col+row,stack=state.board[at],piece=stack?.[0],target=targets.get(at),isLast=state.last&&(state.last.from===at||state.last.to===at);
      const cl=['ai-cell',E.terrain(at),col==='c'?'shore':'',piece?'occupied':'',piece?.side||'',selected===at?'selected':'',target?'target '+target.kind:'',isLast?'last':'',E.BASES.red.includes(at)||E.BASES.blue.includes(at)?'base':''].filter(Boolean).join(' ');
      const p=piece?`<img src="assets/cutouts/board/${asset[piece.type]}-${piece.side==='red'?'do':'xanh'}.png" alt="" loading="eager"><span class="ai-piece-type">${E.NAMES[piece.type]}</span>${stack.length>1?`<b class="ai-stack-count">${stack.length}</b>`:''}`:'';
      const content=p||`<span class="ai-empty">${E.BASES.red.includes(at)||E.BASES.blue.includes(at)?'◆':E.terrain(at)==='bridge'?'◇':''}</span>`;
      const title=`${at.toUpperCase()}, ${E.terrain(at)==='water'?'nước':E.terrain(at)==='bridge'?'cầu':E.terrain(at)==='mixed'?'ô hỗn hợp ven nước':'đất'}${stack?', '+stack.map(p=>E.NAMES[p.type]+' '+sideLabel(p.side)).join(' chở '):''}${target?', '+label(target):''}`;
      html+=`<button type="button" class="${cl}" data-at="${at}" title="${escape(title)}" aria-label="${escape(title)}" ${busy||state.winner||state.turn!==human?'disabled':''}><small>${at}</small>${content}</button>`;
    }}
    q('#aiBoard').innerHTML=html;
    q('#aiLog').innerHTML=history.length?history.slice(-8).reverse().map((h,i)=>`<li>${escape(moveText(h.move))}</li>`).join(''):'<li>Chưa có nước đi.</li>';
  }
  function startAI(){
    if(state.winner||state.turn===human)return;
    busy=true;selected=null;moves=[];pending=[];note='AI đang duyệt cây Minimax và cắt tỉa Alpha-Beta.';render();
    const current=++token,level=q('#aiLevel').value;
    const complete=result=>{
      if(current!==token)return;
      busy=false;
      if(!result?.move){state=E.finish(state);note='AI không còn nước hợp lệ.';render();return;}
      history.push({state,move:{...result.move,type:state.board[result.move.from][result.move.index].type}});
      state=E.play(state,result.move);note=`AI đi ${moveText(history.at(-1).move)} · đã duyệt ${result.nodes} nút, cắt ${result.prunes} nhánh.`;
      render();
    };
    if(window.Worker&&location.protocol!=='file:'){
      try{
        worker=new Worker('play/worker.js?v=terrain-4');
        worker.onmessage=e=>{worker?.terminate();worker=null;if(e.data.token!==current)return;if(e.data.error){setTimeout(()=>complete(AI.choose(state,level)),20);return;}complete(e.data.result);};
        worker.onerror=()=>{worker?.terminate();worker=null;setTimeout(()=>complete(AI.choose(state,level)),20);};
        worker.postMessage({state,level,token:current});return;
      }catch{}
    }
    setTimeout(()=>complete(AI.choose(state,level)),30);
  }
  function commit(move){
    const stored={...move,type:state.board[move.from][move.index].type};
    history.push({state,move:stored});state=E.play(state,move);
    selected=null;moves=[];pending=[];note=`Bạn đi ${moveText(stored)}.`;render();
    if(!state.winner)startAI();
  }
  function choose(at){
    if(busy||state.winner||state.turn!==human)return;
    if(selected&&moves.some(m=>m.to===at)){
      const choices=moves.filter(m=>m.to===at);
      if(choices.length===1)commit(choices[0]);else{pending=choices;render();}
      return;
    }
    const stack=state.board[at];
    if(stack?.[0].side===human){
      selected=at;pending=[];moves=E.legalMoves(state,human).filter(m=>m.from===at);
      note=stack.length>1?`${at.toUpperCase()}: tổ hợp ${stack.map(p=>E.NAMES[p.type]).join(' + ')}. Chọn ô để đi cùng hoặc tách quân.`:`${E.NAMES[stack[0].type]} ở ${at.toUpperCase()}: ${moves.length} hành động hợp lệ.`;
    }else{selected=null;moves=[];pending=[];note='Chọn quân của phe mình, rồi chọn ô được đánh dấu.';}
    render();
  }
  box.addEventListener('click',event=>{
    const at=event.target.closest('[data-at]');if(at){choose(at.dataset.at);return;}
    const action=event.target.closest('[data-action]');if(action){const m=pending[Number(action.dataset.action)];if(m)commit(m);return;}
    if(event.target.closest('#aiNew')){
      token++;worker?.terminate();worker=null;busy=false;human=q('#aiSide').value;state=E.initial();const minutes=Number(q('#aiClock').value);if(minutes)state.remaining={red:minutes*60,blue:minutes*60};clockLast=Date.now();history=[];selected=null;moves=[];pending=[];note=`Ván mới: bạn cầm phe ${sideLabel(human)}.`;render();if(human==='blue')startAI();return;
    }
    if(event.target.closest('#aiUndo')){
      token++;worker?.terminate();worker=null;busy=false;
      if(!history.length)return;
      // Return to the human's previous turn, including the AI response when present.
      let item=history.pop();state=item.state;
      if(state.turn!==human&&history.length){item=history.pop();state=item.state;}
      clockLast=Date.now();selected=null;moves=[];pending=[];note='Đã hoàn tác về lượt của bạn.';render();return;
    }
    if(event.target.closest('#aiResign')){state={...state,winner:E.opposite(human),reason:'đối phương đầu hàng'};selected=null;moves=[];pending=[];note='Bạn đã đầu hàng.';render();}
  });
  q('#aiSide').addEventListener('change',()=>{note='Bấm “Ván mới” để đổi phe.';render();});
  q('#aiClock').addEventListener('change',()=>{note='Bấm “Ván mới” để áp dụng đồng hồ.';render();});
  q('#aiLevel').addEventListener('change',()=>{note=`Đã chọn mức ${q('#aiLevel').selectedOptions[0].text}. AI dùng mức này từ lượt tiếp theo.`;render();});
  setInterval(()=>{
    const now=Date.now(),elapsed=(now-clockLast)/1000;clockLast=now;
    if(!state.remaining||state.winner)return;
    state.remaining[state.turn]=Math.max(0,state.remaining[state.turn]-elapsed);
    q('#aiClocks').textContent=clockText();
    if(state.remaining[state.turn]===0){token++;worker?.terminate();worker=null;busy=false;state.winner=E.opposite(state.turn);state.reason='đối phương hết giờ';selected=null;moves=[];pending=[];note=`Phe ${sideLabel(state.turn)} hết thời gian.`;render();}
  },250);
  render();
})();
