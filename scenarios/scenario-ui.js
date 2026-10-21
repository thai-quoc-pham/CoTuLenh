(function(){
  const data=window.ScenarioData, engine=window.ScenarioEngine, progress=window.ScenarioProgress;
  const all=engine.active(data).filter(engine.validate), box=document.getElementById('scenarioRoom');if(!box)return;
  let state=progress.load(), revealHint=false, transient='';
  if(!all.some(s=>s.id===state.current))state.current=all[0].id;
  const q=id=>box.querySelector(id), current=()=>all.find(s=>s.id===state.current), commit=()=>progress.save(state);
  const label=s=>data.categories.find(c=>c.id===s.category)?.name||s.category;
  const answered=s=>state.mode==='assessment'?state.assessment.answers[s.id]:state.guided[s.id]?.completed?s.answer:null;
  const attempts=s=>state.guided[s.id]?.attempts||0;
  const pieceName=i=>pieces?.[i]?.name||'Quân cờ';
  const asset=(i,side)=>`assets/cutouts/board/${pieces[i].asset}-${side}.png`;
  const terrain=(s,at)=>s.terrain?.water?.includes(at)?'water':s.terrain?.mixed?.includes(at)?'mixed':'land';
  function board(s){
    const tried=state.mode==='guided'?attempts(s)>0:Object.hasOwn(state.assessment.answers,s.id);
    const show=revealHint||tried;
    const cells=[];
    for(let row=6;row>=1;row--)for(const col of 'abcdefg'){
      const at=col+row,p=s.pieces.find(x=>x[2]===at),isChoice=s.choices?.includes(at);
      const disabled=!isChoice||!!answered(s);
      const classes=['scenario-cell',terrain(s,at),p?'occupied':'',show&&s.highlight?.includes(at)?'highlight':'',show&&at===s.answer?'solution':''].filter(Boolean).join(' ');
      const aria=`${at.toUpperCase()}, ${terrain(s,at)==='water'?'ô nước':terrain(s,at)==='mixed'?'ô hỗn hợp':'ô đất'}${p?', '+pieceName(p[0])+' phe '+(p[1]==='do'?'Đỏ':'Xanh'):''}${isChoice?', lựa chọn':''}`;
      cells.push(`<button type="button" class="${classes}" data-square="${at}" aria-label="${aria}" ${disabled?'disabled':''}><small>${at.toUpperCase()}</small>${p?`<img src="${asset(p[0],p[1])}" alt="">`:''}</button>`);
    }
    q('#scenarioBoard').innerHTML=cells.join('');
    q('#scenarioBoard').setAttribute('aria-label',`Bàn cờ tình huống ${s.id}, 7 cột A đến G và 6 hàng 1 đến 6`);
    q('#scenarioLegend').innerHTML='<span><i class="land"></i>Đất</span><span><i class="water"></i>Nước</span><span><i class="mixed"></i>Ô hỗn hợp</span>'+(show?'<span><i class="focus"></i>Điểm cần xem</span>':'');
  }
  function render(){
    const s=current(), total=all.length, done=Object.keys(state.guided).filter(id=>state.guided[id].completed&&all.some(x=>x.id===id)).length;
    const graded=engine.grade(all,state.assessment.answers), isAssessment=state.mode==='assessment', response=answered(s);
    q('#scenarioModes').innerHTML=`<button type="button" data-mode="guided" aria-pressed="${!isAssessment}" class="${!isAssessment?'selected':''}">Học có hướng dẫn</button><button type="button" data-mode="assessment" aria-pressed="${isAssessment}" class="${isAssessment?'selected':''}">Tự kiểm tra</button>`;
    q('#scenarioProgress').textContent=isAssessment?`${graded.answered} / ${graded.total} câu đã trả lời · Chỉ tính lần đầu`:`${done} / ${total} tình huống đã hiểu`;
    q('#scenarioCategories').innerHTML=data.categories.map(c=>`<button type="button" data-category="${c.id}" aria-pressed="${s.category===c.id}">${c.name} <small>${all.filter(x=>x.category===c.id).length}</small></button>`).join('');
    q('#scenarioList').innerHTML=all.filter(x=>x.category===s.category).map(x=>`<button type="button" data-scenario="${x.id}" aria-current="${x.id===s.id?'true':'false'}">${x.id} · ${x.title}${state.guided[x.id]?.completed?' ✓':''}</button>`).join('');
    q('#scenarioEyebrow').textContent=`${s.id} · ${label(s)} · ${s.difficulty}`;
    q('#scenarioTitle').textContent=s.title;
    q('#scenarioQuestion').textContent=s.question;
    q('#scenarioInstruction').textContent=s.choices?'Chọn trực tiếp một ô trên bàn cờ. Các ô trả lời không được đánh dấu trước.':'Chọn một trong các phương án bên dưới.';
    board(s);
    q('#scenarioOptions').innerHTML=s.options?s.options.map(([id,text])=>`<button type="button" data-answer="${id}" ${response?'disabled':''}>${text}</button>`).join(''):'';
    const tried=isAssessment?Object.hasOwn(state.assessment.answers,s.id):attempts(s)>0;
    const correct=response===s.answer;
    q('#scenarioFeedback').innerHTML=tried?`<strong>${correct?'Đúng rồi.':isAssessment?'Chưa đúng.':'Chưa đúng, hãy thử lại.'}</strong><p>${s.explanation}</p><a href="${s.source}" target="_blank" rel="noopener noreferrer">Xem quy tắc nguồn ↗</a>`:'<span>Hãy tự chọn trước khi xem lời giải.</span>';
    q('#scenarioFeedback').className='scenario-feedback '+(tried?(correct?'correct':'incorrect'):'');
    q('#scenarioHint').hidden=isAssessment||!!response;
    q('#scenarioHintText').textContent=revealHint?s.hint:'';
    q('#scenarioReset').textContent='Làm lại tình huống này ↺';
    q('#scenarioNext').disabled=all.indexOf(s)===all.length-1;
    const wrong=all.filter(x=>Object.hasOwn(state.assessment.answers,x.id)&&state.assessment.answers[x.id]!==x.answer);
    q('#scenarioSummary').innerHTML=isAssessment?`<strong>${graded.correct} / ${graded.total} câu đúng · ${graded.percent}%</strong><span>${graded.answered===graded.total?(graded.passed?'Đạt mốc luyện tập 80%.':'Chưa đạt mốc 80%; xem lại các câu sai rồi làm lại.'): 'Trả lời đủ 12 câu để nhận kết quả cuối.'}</span>${graded.answered===graded.total&&wrong.length?`<div class="scenario-mistakes"><b>Câu cần xem lại:</b> ${wrong.map(x=>`${x.id} · ${x.title}`).join('; ')}</div>`:''}<button type="button" id="scenarioResetAssessment">Làm lại phần tự kiểm tra</button>`:`<strong>${done} / ${total} tình huống đã hiểu</strong><span>Có thể luyện lại từng tình huống bất cứ lúc nào.</span>`;
    q('#scenarioStatus').textContent=transient;transient='';
  }
  function choose(value){const s=current(), judged=engine.judge(s,value);if(!progress.answer(state,s.id,value,judged.correct))return;if(state.mode==='assessment')state.assessment.finished=engine.grade(all,state.assessment.answers).answered===all.length;commit();transient=judged.correct?'Đã ghi nhận câu trả lời đúng.':state.mode==='guided'?'Bạn có thể thử lại.':'Đã ghi nhận đáp án đầu tiên.';render();}
  box.addEventListener('click',e=>{
    const mode=e.target.closest('[data-mode]');if(mode){state.mode=mode.dataset.mode;revealHint=false;commit();render();return;}
    const cat=e.target.closest('[data-category]');if(cat){state.current=all.find(s=>s.category===cat.dataset.category).id;revealHint=false;commit();render();return;}
    const item=e.target.closest('[data-scenario]');if(item){state.current=item.dataset.scenario;revealHint=false;commit();render();return;}
    const answer=e.target.closest('[data-answer]');if(answer){choose(answer.dataset.answer);return;}
    const square=e.target.closest('[data-square]');if(square&&!square.disabled){choose(square.dataset.square);return;}
    if(e.target.closest('#scenarioHint')){revealHint=true;render();return;}
    if(e.target.closest('#scenarioReset')){progress.restart(state,state.current);revealHint=false;commit();render();return;}
    if(e.target.closest('#scenarioNext')){state.current=all[Math.min(all.indexOf(current())+1,all.length-1)].id;revealHint=false;commit();render();return;}
    if(e.target.closest('#scenarioResetAssessment')){progress.restartAssessment(state);revealHint=false;commit();render();}
  });
  render();
})();
