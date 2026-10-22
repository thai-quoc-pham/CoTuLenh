const assets = 'assets/';
const pieces = [
  {name:'Chỉ huy',group:'Chỉ huy',qty:1,move:'Đi ngang hoặc dọc trên đường thoáng; ăn quân ở ô liền kề.',feature:'Không được đi nước khiến Chỉ huy của mình bị chiếu. Tầm di chuyển và tầm ăn quân khác nhau.',tip:'Trước khi đi Chỉ huy, hãy xem ô đích có bị quân đối phương tấn công không.',dir:'orth',range:Infinity,asset:'01-tu-lenh'},
  {name:'Tổng Hành Dinh',group:'Chỉ huy',qty:2,move:'Đứng yên.',feature:'Căn cứ cần bảo vệ; kiểm soát Tổng Hành Dinh đối phương đủ 3 lượt liên tiếp có thể thắng.',tip:'Theo dõi số lượt liên tiếp kiểm soát căn cứ.',dir:'none',range:0,asset:'02-so-chi-huy'},
  {name:'Bộ binh',group:'Bộ',qty:2,move:'Đi ngang hoặc dọc 1 ô.',feature:'Quân bộ cơ bản; phải xét địa hình trước khi dừng.',tip:'Bộ binh đi một ô theo bốn hướng ngang và dọc.',dir:'orth',range:1,asset:'03-bo-binh'},
  {name:'Công binh',group:'Bộ',qty:2,move:'Đi ngang hoặc dọc 1 ô.',feature:'Hỗ trợ chở quân nặng phù hợp, đặc biệt quanh tuyến vượt sông.',tip:'Dùng Công binh để hỗ trợ triển khai Pháo và Phòng không.',dir:'orth',range:1,asset:'04-cong-binh'},
  {name:'Dân quân',group:'Bộ',qty:1,move:'Đi ngang, dọc hoặc chéo 1 ô.',feature:'Có thể đi một ô theo cả bốn hướng chéo.',tip:'Khác bộ binh ở bốn đường chéo.',dir:'all',range:1,asset:'05-dan-quan'},
  {name:'Phòng không',group:'Phòng không',qty:2,move:'Đi ngang hoặc dọc 1 ô.',feature:'Tạo vùng kiểm soát máy bay ở gần.',tip:'Đừng nhầm tầm đi trên đất với vùng hỏa lực phòng không.',dir:'orth',range:1,asset:'06-cao-xa'},
  {name:'Xe tăng',group:'Cơ giới',qty:2,move:'Đi ngang hoặc dọc tối đa 2 ô.',feature:'Có thể mang Chỉ huy, bộ binh hoặc dân quân trong tổ hợp phù hợp.',tip:'Đi tối đa hai ô thẳng; quân chắn đường vẫn phải được tính đến.',dir:'orth',range:2,asset:'07-xe-tang'},
  {name:'Pháo',group:'Hỏa lực',qty:2,move:'Đi ngang, dọc hoặc chéo tối đa 3 ô.',feature:'Một số tình huống cho phép bắn mà không cần tiến vào ô mục tiêu.',tip:'Pháo đi tối đa ba ô; khi ăn quân, hãy kiểm tra vật cản và cách tấn công.',dir:'all',range:3,asset:'08-phao-binh'},
  {name:'Tên lửa',group:'Phòng không',qty:1,move:'Đi ngang hoặc dọc tối đa 2 ô; đi chéo 1 ô.',feature:'Tạo vùng khống chế máy bay.',tip:'Ghi nhớ: tối đa hai ô theo đường thẳng, một ô theo đường chéo.',dir:'missile',range:2,asset:'09-ten-lua'},
  {name:'Máy bay',group:'Không quân',qty:2,move:'Đi ngang, dọc hoặc chéo tối đa 4 ô.',feature:'Máy bay bay qua được quân chắn nhưng vẫn có thể bị Phòng không tấn công.',tip:'Kiểm tra cả đường bay và vị trí đáp.',dir:'all',range:4,asset:'10-may-bay'},
  {name:'Hải quân',group:'Hải quân',qty:2,move:'Trên biển, đi tối đa 4 ô theo hàng ngang, cột dọc hoặc đường chéo.',feature:'Hải quân chỉ dừng trên ô biển hoặc ô hỗn hợp; tầm bắn thay đổi theo loại hỏa lực.',tip:'Bàn tập chuyển thành vùng biển để bạn thấy đủ tám hướng đi. Hải quân không dừng trên ô đất thường.',dir:'all',range:4,asset:'11-tau-chien'}
];
const imageOf = (p,side,small=false) => `${assets}${small?'thumbs/':''}${p.asset}-${side}.${small?'jpg':'png'}`;
const filters = ['Tất cả','Chỉ huy','Bộ','Cơ giới','Hỏa lực','Phòng không','Không quân','Hải quân'];
let currentFilter = 'Tất cả';

function renderUnits(){
  const filterEl=document.getElementById('unitFilters');
  filterEl.innerHTML=filters.map(g=>`<button class="filter ${currentFilter===g?'active':''}" type="button" data-filter="${g}" aria-pressed="${currentFilter===g}">${g}</button>`).join('');
  const shown=pieces.map((p,i)=>({...p,i})).filter(p=>currentFilter==='Tất cả'||p.group===currentFilter);
  document.getElementById('unitCount').textContent=`${shown.length} / 11 LOẠI QUÂN`;
  document.getElementById('unitGrid').innerHTML=shown.map(p=>`<button class="unit-card" type="button" data-piece="${p.i}" aria-label="Xem quân ${p.name}"><div class="unit-images"><img src="${imageOf(p,'xanh',true)}" alt="${p.name} phe Xanh" loading="lazy"><img src="${imageOf(p,'do',true)}" alt="${p.name} phe Đỏ" loading="lazy"></div><div class="unit-content"><div class="unit-index"><span>QUÂN ${String(p.i+1).padStart(2,'0')}</span><span>${p.qty} / PHE</span></div><h3>${p.name}</h3><p>${p.move}</p></div></button>`).join('');
}
document.getElementById('unitFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;currentFilter=b.dataset.filter;renderUnits()});
document.getElementById('unitGrid').addEventListener('click',e=>{const b=e.target.closest('[data-piece]');if(!b)return;openPiece(Number(b.dataset.piece))});
function openPiece(i){const p=pieces[i];document.getElementById('dialogContent').innerHTML=`<div class="dialog-body"><span class="kicker">QUÂN ${String(i+1).padStart(2,'0')} / 11 · ${p.group}</span><h2 id="dialogTitle">${p.name}</h2><p>${p.feature}</p><div class="dialog-images"><figure><img src="${imageOf(p,'xanh')}" alt="Hình minh họa quân ${p.name} phe Xanh"><figcaption>PHE XANH</figcaption></figure><figure><img src="${imageOf(p,'do')}" alt="Hình minh họa quân ${p.name} phe Đỏ"><figcaption>PHE ĐỎ</figcaption></figure></div><div class="dialog-facts"><div><strong>SỐ LƯỢNG</strong><span>${p.qty} quân mỗi phe</span></div><div><strong>HƯỚNG VÀ TẦM CƠ BẢN</strong><span>${p.move}</span></div></div><p><strong>Ghi nhớ:</strong> ${p.tip}</p></div>`;document.getElementById('pieceDialog').showModal()}
document.getElementById('closeDialog').addEventListener('click',()=>document.getElementById('pieceDialog').close());
document.getElementById('pieceDialog').addEventListener('click',e=>{if(e.target.id==='pieceDialog')e.target.close()});
renderUnits();

const bridges=new Set(['f6','f7','h6','h7']);const hqs=new Set(['f2','h2','f11','h11']);
function terrainAt(coord){
  if(bridges.has(coord))return 'bridge';
  if(coord[0]==='c'||['d6','e6','d7','e7'].includes(coord))return 'mixed';
  if(coord[0]==='a'||coord[0]==='b')return 'water';
  return 'land';
}
const redSetup = [
  ['g1',0],['b2',10],['e2',9],['f2',1],['h2',1],['i2',9],
  ['d3',7],['g3',8],['j3',7],['c4',10],['e4',5],['f4',6],
  ['h4',6],['i4',5],['c5',2],['d5',3],['g5',4],['j5',3],['k5',2]
];
const setupPieces = new Map();
for(const [coord,index] of redSetup){
  setupPieces.set(coord,{index,side:'Đỏ',fileSide:'do'});
  setupPieces.set(`${coord[0]}${13-Number(coord.slice(1))}`,{index,side:'Xanh',fileSide:'xanh'});
}
const setupBoard=document.getElementById('setupBoard');
const setupInfo=document.getElementById('setupPieceInfo');
setupBoard.innerHTML='<span class="setup-coordinate"></span>'+[...'abcdefghijk'].map(c=>`<span class="setup-coordinate">${c.toUpperCase()}</span>`).join('')+Array.from({length:12},(_,row)=>{
  const n=12-row;
  return `<span class="setup-coordinate">${n}</span>`+[...'abcdefghijk'].map(c=>{
    const coord=`${c}${n}`,piece=setupPieces.get(coord),isBridge=bridges.has(coord);
    const terrain=terrainAt(coord);
    const content=piece?`<button class="setup-piece" type="button" data-piece-name="${pieces[piece.index].name}" data-piece-side="${piece.side}" data-coord="${coord}" data-tooltip="${pieces[piece.index].name} · ${piece.side}" title="${pieces[piece.index].name} · phe ${piece.side} · ô ${coord.toUpperCase()}" aria-label="${pieces[piece.index].name}, phe ${piece.side}, ô ${coord}"><img src="${assets}cutouts/board/${pieces[piece.index].asset}-${piece.fileSide}.png" alt="" loading="lazy"></button>`:'';
    return `<div class="setup-square ${terrain} ${c==='c'?'shore':''}" role="gridcell"><span class="square-coordinate">${coord}</span>${content}</div>`;
  }).join('')
}).join('');
function showSetupPiece(target){const b=target.closest('.setup-piece');if(!b)return;setupInfo.textContent=`${b.dataset.pieceName} · phe ${b.dataset.pieceSide} · ô ${b.dataset.coord.toUpperCase()}`}
setupBoard.addEventListener('mouseover',e=>showSetupPiece(e.target));
setupBoard.addEventListener('focusin',e=>showSetupPiece(e.target));
setupBoard.addEventListener('click',e=>showSetupPiece(e.target));
const setupZoom=document.getElementById('setupZoom');
setupZoom.addEventListener('click',()=>{
  const zoomed=setupZoom.closest('.setup-board-wrap').classList.toggle('zoomed');
  setupZoom.setAttribute('aria-pressed',String(zoomed));
  setupZoom.textContent=zoomed?'Vừa màn hình':'Phóng to';
});

const board=document.getElementById('boardGrid');
board.innerHTML='<span class="board-label"></span>'+[...'abcdefghijk'].map(c=>`<span class="board-label">${c}</span>`).join('')+Array.from({length:12},(_,row)=>{const n=12-row;return `<span class="board-label">${n}</span>`+[...'abcdefghijk'].map(c=>{const id=c+n;const special=hqs.has(id)?'hq':terrainAt(id);const icon=bridges.has(id)?'◇':hqs.has(id)?'◆':'';return `<button class="board-cell ${special} ${c==='c'?'shore':''}" type="button" data-coord="${id}" role="gridcell" aria-label="${id}${bridges.has(id)?', cầu':hqs.has(id)?', Tổng Hành Dinh':''}">${icon}</button>`}).join('')}).join('');
board.addEventListener('click',e=>{const b=e.target.closest('[data-coord]');if(!b)return;board.querySelector('.selected')?.classList.remove('selected');b.classList.add('selected');const id=b.dataset.coord;document.getElementById('boardStatus').textContent=`${id.toUpperCase()} · ${bridges.has(id)?'Ô cầu':hqs.has(id)?'Tổng Hành Dinh':terrainAt(id)==='water'?'Vùng nước':terrainAt(id)==='mixed'?'Ô hỗn hợp ven nước':'Ô đất'}`});

const practiceSelect=document.getElementById('practiceSelect');practiceSelect.innerHTML=pieces.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('');
function renderPractice(){const i=Number(practiceSelect.value),p=pieces[i],naval=p.name==='Hải quân',grid=document.getElementById('practiceGrid');document.getElementById('practiceTitle').textContent=p.name;document.getElementById('practiceMove').textContent=p.move;document.getElementById('practiceTip').textContent=p.tip;document.getElementById('practicePiece').innerHTML=`<img src="${imageOf(p,'xanh',true)}" alt="Quân ${p.name} phe Xanh">`;grid.classList.toggle('sea-board',naval);grid.setAttribute('aria-label',naval?'Bàn tập vùng biển: các ô sáng là hướng đi của Hải quân':'Lưới minh họa tầm đi');document.getElementById('practiceSeaLegend').hidden=!naval;grid.innerHTML=Array.from({length:81},(_,i)=>{const x=i%9-4,y=Math.floor(i/9)-4,ax=Math.abs(x),ay=Math.abs(y),orth=(x===0||y===0)&&ax+ay>0,diag=ax===ay&&ax>0;let reach=false;if(p.dir==='orth')reach=orth&&Math.max(ax,ay)<=p.range;else if(p.dir==='all')reach=(orth||diag)&&Math.max(ax,ay)<=p.range;else if(p.dir==='missile')reach=(orth&&Math.max(ax,ay)<=2)||(diag&&ax===1);return `<div class="practice-cell ${x===0&&y===0?'origin':reach?'reach':''}" aria-label="${x===0&&y===0?'Vị trí quân':reach?'Trong tầm minh họa':'Ngoài tầm'}">${x===0&&y===0?`<img src="${assets}cutouts/board/${p.asset}-xanh.png" alt="${p.name}" loading="lazy">`:reach?'•':''}</div>`}).join('')}
practiceSelect.addEventListener('change',renderPractice);document.getElementById('nextPiece').addEventListener('click',()=>{practiceSelect.value=(Number(practiceSelect.value)+1)%pieces.length;renderPractice()});renderPractice();

const questions=[
 ['Ô nào là một trong bốn ô cầu?', ['f6','a1','k12'],0,'Các ô cầu là f6, f7, h6 và h7.'],
 ['Phe nào đi trước trong phiên bản web?', ['Xanh','Đỏ','Ngẫu nhiên'],1,'Đỏ ở phía dưới và đi trước.'],
 ['Điều kiện thắng nào gắn với Tổng Hành Dinh?', ['Giữ căn cứ địch 3 lượt liên tiếp','Đi qua căn cứ một lần','Phá một xe tăng'],0,'Cần kiểm soát Tổng Hành Dinh đối phương trong 3 lượt liên tiếp.'],
 ['Tổng Hành Dinh phía Đỏ ở đâu?', ['f2 và h2','f6 và h6','a1 và b1'],0,'Hai căn cứ phía dưới ở f2 và h2.'],
 ['Quân bộ có thể dừng ở ô nước không có cầu không?', ['Có','Không'],1,'Theo phiên bản web, quân bộ không được dừng ở ô nước không có cầu.'],
 ['Quân nào hỗ trợ chở pháo và phòng không phù hợp?', ['Công binh','Dân quân','Bộ binh'],0,'Công binh hỗ trợ cơ động các quân nặng phù hợp.'],
 ['Bộ binh cơ bản đi theo hướng nào?', ['Ngang/dọc 1 ô','Chéo 2 ô','Mọi hướng 4 ô'],0,'Bộ binh đi ngang hoặc dọc một ô.'],
 ['Xe tăng cơ bản đi tối đa bao xa?', ['2 ô ngang/dọc','4 ô chéo','1 ô mọi hướng'],0,'Xe tăng đi tối đa hai ô theo hàng ngang hoặc cột dọc.'],
 ['“Bắn tại chỗ” nghĩa là gì?', ['Ăn quân đối phương nhưng vẫn ở ô cũ','Luôn tiến vào ô mục tiêu'],0,'Hành động này chỉ có khi tình huống và hệ thống cho phép.'],
 ['Máy bay vượt vật cản có an toàn tuyệt đối không?', ['Có','Không'],1,'Vẫn phải xét phòng không và tuyến bay.'],
 ['Trước khi xác nhận nước đi, bạn cần kiểm tra gì?', ['Chỉ tầm đi','Tầm, địa hình và Chỉ huy'],1,'Cần kiểm tra cả tầm đi, địa hình và an toàn của Chỉ huy.'],
 ['Khi hai nguồn luật khác nhau, bạn nên theo luật nào lúc chơi trên cotulenh.vn?', ['Luật của trò chơi đang sử dụng','Tự áp dụng luật năm 2017'],0,'Hướng dẫn này ưu tiên luật của phiên bản web.']
];
let quizAnswers={};try{quizAnswers=JSON.parse(localStorage.getItem('ctl-quiz-v1')||'{}')}catch{}let quizIndex=0;
function renderQuiz(){const done=Object.keys(quizAnswers).length,correct=questions.filter((q,i)=>quizAnswers[i]===q[2]).length;document.getElementById('quizProgress').textContent=`${done} / ${questions.length} ĐÃ TRẢ LỜI${done===questions.length?` · ${correct} ĐÚNG`:''}`;document.getElementById('quizProgressBar').style.width=`${done/questions.length*100}%`;const q=questions[quizIndex],answer=quizAnswers[quizIndex];document.getElementById('quizCard').innerHTML=`<span class="question-index">CÂU ${String(quizIndex+1).padStart(2,'0')} / ${questions.length}</span><h3>${q[0]}</h3>${q[1].map((opt,j)=>`<button type="button" class="quiz-option ${answer===undefined?'':j===q[2]?'correct':answer===j?'wrong':''}" data-answer="${j}" ${answer!==undefined?'disabled':''}>${String.fromCharCode(65+j)}. ${opt}</button>`).join('')}<p class="quiz-feedback" aria-live="polite">${answer===undefined?'Chọn một đáp án để xem giải thích.':`${answer===q[2]?'✓ Chính xác.':'✕ Chưa đúng.'} ${q[3]}`}</p><button type="button" class="quiz-next" id="quizNext" ${answer===undefined?'disabled':''}>${quizIndex===questions.length-1?'Về câu đầu':'Câu tiếp theo →'}</button>`}
document.getElementById('quizCard').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(b&&quizAnswers[quizIndex]===undefined){quizAnswers[quizIndex]=Number(b.dataset.answer);try{localStorage.setItem('ctl-quiz-v1',JSON.stringify(quizAnswers))}catch{}renderQuiz()}if(e.target.closest('#quizNext')){quizIndex=(quizIndex+1)%questions.length;renderQuiz()}});
document.getElementById('resetQuiz').addEventListener('click',()=>{quizAnswers={};quizIndex=0;try{localStorage.removeItem('ctl-quiz-v1')}catch{}renderQuiz()});renderQuiz();

const menuToggle=document.getElementById('menuToggle'),nav=document.getElementById('siteNav');menuToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open))});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}});
