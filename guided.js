(() => {
  const lessonNames = ['Làm quen với ván cờ','Khám phá bàn cờ','Nhận biết 11 loại quân','Tự thử nước đi','Ăn quân và luật đặc biệt','Sáu lượt tình huống','Kiểm tra trước khi tự chơi'];
  const lessonDescriptions = ['Biết phe nào đi trước và hai cách thắng chính.','Tìm ô cầu, ô nước và làm quen với cách xếp 3 quân Đỏ.','Nhìn hình để nhận biết từng loại quân.','Thử chọn ô đi đúng và ô đi sai cho từng loại quân.','Phân biệt di chuyển, ăn quân và hành động đặc biệt.','Chọn cách xử lý cho sáu tình huống thường gặp.','Trả lời ba câu tình huống rồi xem lại luật cần nhớ.'];
  const key = 'ctl-learning-v2';
  const legacyKey = 'ctl-lessons-v1';
  const clampStep = (value,max) => Number.isInteger(value) ? Math.min(Math.max(value,0),max) : 0;
  let saved = null, legacyCompleted = [];
  try { const data=JSON.parse(localStorage.getItem(key)||'null');if(data && typeof data==='object' && !Array.isArray(data) && data.version===2)saved=data; } catch {}
  if(!saved)try { const data=JSON.parse(localStorage.getItem(legacyKey)||'[]');if(Array.isArray(data))legacyCompleted=data; } catch {}
  let completed = [...new Set((Array.isArray(saved?.completed)?saved.completed:legacyCompleted).filter(n=>Number.isInteger(n)&&n>=0&&n<7))];
  const migrated = !saved;
  let current = saved?clampStep(saved.current,6):Math.max(0,lessonNames.findIndex((_,i)=>!completed.includes(i)));
  let coordinateStep = saved ? clampStep(saved.coordinateStep,3) : completed.includes(1)?3:0;
  let placementStep = saved ? clampStep(saved.placementStep,3) : completed.includes(1)?3:0;
  let recognizeStep = saved ? clampStep(saved.recognizeStep,11) : completed.includes(2)?11:0;
  let moveIndex = saved ? clampStep(saved.moveIndex,10) : 0;
  let moveMode = saved?.moveMode==='capture'?'capture':'move';
  let moveRight = saved?.moveRight===true, moveWrong = saved?.moveWrong===true;
  let specialStep = saved ? clampStep(saved.specialStep,4) : completed.includes(4)?4:0;
  let turnStep = saved ? clampStep(saved.turnStep,6) : completed.includes(5)?6:0;
  let finalStep = saved ? clampStep(saved.finalStep,3) : completed.includes(6)?3:0;
  let selectedPlacement = Number.isInteger(saved?.selectedPlacement)&&saved.selectedPlacement>=0&&saved.selectedPlacement<=2?saved.selectedPlacement:null;
  const movePassed = new Set(saved && Array.isArray(saved.movePassed)?saved.movePassed.filter(n=>Number.isInteger(n)&&n>=0&&n<11):completed.includes(3)?Array.from({length:11},(_,i)=>i):[]);
  let fullSetupAchievement = saved?.fullSetupAchievement===true;
  const list = document.getElementById('lessonList');
  const panel = document.getElementById('lessonPanel');
  const feedback = (message, success) => `<p class="lesson-feedback ${success ? 'success' : 'error'}" role="status">${message}</p>`;
  const boardCutout = (i,side='do') => `${assets}cutouts/board/${pieces[i].asset}-${side}.png`;
  const order = [2,3,4,5,6,7,8,9,0,10,1];
  const opening = [
    {title:'Lượt 1 · Trước nước đi đầu tiên', prompt:'Trước nước đầu tiên, bạn nên kiểm tra điều gì?', options:['Quân định đi, ô đích, địa hình và an toàn Chỉ huy','Chỉ quân đối phương gần nhất','Chỉ xem có bắt được quân hay không'], correct:0, why:'Cần kiểm tra tầm đi, đường đi, địa hình ô đích và sự an toàn của Chỉ huy.'},
    {title:'Lượt 2 · Di chuyển Bộ binh', prompt:'Bộ binh ở E9 muốn đi một ô dọc đến E8 trên ô đất trống. Hướng đi cơ bản này có đúng không?', options:['Đúng, E8 cách E9 một ô dọc','Sai, Bộ binh chỉ đi chéo'], correct:0, why:'Bộ binh đi ngang hoặc dọc một ô. Trong ván thật vẫn cần kiểm tra ô đích và vật cản.'},
    {title:'Lượt 3 · Qua sông', prompt:'Khi đưa quân bộ qua sông, bạn nên tìm vị trí nào trước?', options:['Một trong bốn ô cầu','Một ô nước bất kỳ'], correct:0, why:'Các cầu ở f6, f7, h6 và h7 là vị trí cần chú ý khi vượt sông.'},
    {title:'Lượt 4 · Dùng Máy bay', prompt:'Bạn định dùng Máy bay. Điều gì còn phải xét dù quân này có thể vượt vật cản?', options:['Vùng phòng không và vị trí đáp','Không cần xét gì thêm'], correct:0, why:'Vượt vật cản không có nghĩa là an toàn trước phòng không.'},
    {title:'Lượt 5 · Giữ an toàn cho Chỉ huy', prompt:'Nước tấn công này sẽ khiến Chỉ huy của bạn bị chiếu. Bạn làm gì?', options:['Đổi nước khác để giữ Chỉ huy an toàn','Vẫn đi vì đang tấn công'], correct:0, why:'Không được tự đưa Chỉ huy vào thế bị chiếu.'},
    {title:'Lượt 6 · Nhớ mục tiêu thắng', prompt:'Ngoài chiếu hết Chỉ huy, bạn cần theo dõi mục tiêu nào?', options:['Kiểm soát Tổng Hành Dinh đối phương','Chỉ đếm số quân đã ăn'], correct:0, why:'Theo phiên bản web, kiểm soát Tổng Hành Dinh đối phương đủ số lượt quy định cũng là một cách thắng.'}
  ];
  const special = [
    {prompt:'Pháo có thể bắn trong một số tình huống mà vẫn ở ô cũ. Đây là hành động nào?', options:['Bắn tại chỗ','Di chuyển thông thường'], correct:0, why:'Bắn tại chỗ là hành động tấn công riêng; chỉ áp dụng khi tình huống và phiên bản luật cho phép.'},
    {prompt:'Xe tăng muốn chở Bộ binh. Chỉ biết tầm đi của Xe tăng đã đủ để kết luận hợp lệ chưa?', options:['Chưa, còn phải xét tổ hợp chở quân và ô đích','Đủ rồi'], correct:0, why:'Chở quân là luật đặc biệt, không suy ra chỉ từ sơ đồ tầm di chuyển.'},
    {prompt:'Máy bay đi qua vật cản. Nó có miễn nhiễm trước Phòng không không?', options:['Không','Có'], correct:0, why:'Vẫn cần xét vùng phòng không và tuyến bay.'},
    {prompt:'Chỉ huy có thể đi xa trên đường thoáng. Quân này có ăn được đối phương ở xa như vậy không?', options:['Không, tầm ăn cơ bản là 1 ô','Có, tầm đi và ăn luôn giống nhau'], correct:0, why:'Tầm đi và tầm ăn của Chỉ huy được mô tả khác nhau trong nguồn.'}
  ];
  const finalQuestions = [
    {prompt:'Từ g4, Bộ binh chọn ô nào là một bước ngang hoặc dọc?', options:['g5','h5','g6'], correct:0, why:'g5 cách g4 đúng một ô dọc; h5 là chéo và g6 xa hai ô.'},
    {prompt:'Khi kiểm tra một nước đi trong ván thật, sau tầm đi bạn phải xem tiếp điều gì?', options:['Địa hình, vật cản và an toàn Chỉ huy','Chỉ màu quân cờ'], correct:0, why:'Tầm đi đúng chưa đủ; ô đích và đường đi cũng phải hợp lệ.'},
    {prompt:'Bộ binh muốn dừng ở ô nước không có cầu. Theo phiên bản web, điều đó có được phép không?', options:['Không được dừng ở đó','Luôn được dừng'], correct:0, why:'Quân bộ phải xét địa hình; ô nước không có cầu không phải nơi quân bộ được dừng theo mô tả phiên bản web.'}
  ];
  function persist() {
    const state={version:2,completed,current,coordinateStep,placementStep,selectedPlacement,recognizeStep,moveIndex,moveMode,moveRight,moveWrong,movePassed:[...movePassed],specialStep,turnStep,finalStep,selfPlaced:[...placed],activePiece,fullSetupAchievement};
    try { localStorage.setItem(key,JSON.stringify(state)); } catch {}
  }
  function saveProgress(){persist();renderNav();}
  function markDone(index) { if (!completed.includes(index)) { completed.push(index); persist(); renderNav(); if(index===current){const status=panel.querySelector('.lesson-end span');if(status)status.textContent='✓ Bài này đã hoàn thành';if(index===4){const link=panel.querySelector('#scenarioLessonLink');if(link)link.hidden=false;}} } }
  function lessonStatus(index){
    if(completed.includes(index))return '✓ Đã hoàn thành';
    const progress=[null,`${coordinateStep}/3 tọa độ · ${placementStep}/3 quân`,`${recognizeStep}/11 quân`,`${movePassed.size}/11 quân`,`${specialStep}/4 câu`,`${turnStep}/6 lượt`,`${finalStep}/3 câu`][index];
    return progress || 'Bài học';
  }
  function renderNav() {
    list.innerHTML = lessonNames.map((name,i) => `<button type="button" class="lesson-tab ${i===current?'active':''} ${completed.includes(i)?'done':''}" data-lesson="${i}" aria-current="${i===current?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span><strong>${name}</strong><small>${lessonStatus(i)}</small></button>`).join('');
    const count=completed.length;
    document.getElementById('lessonProgressText').textContent=`${count} / 7 bài hoàn thành`;
    document.getElementById('lessonProgressBar').style.width=`${count/7*100}%`;
    document.getElementById('fullSetupBadge').hidden=!fullSetupAchievement;
  }
  function selectLesson(i,scroll=false) { current=i; persist(); renderNav(); renderLesson(); if(scroll) document.getElementById('hoc-tung-buoc').scrollIntoView({behavior:'smooth'}); }
  function shell(index,body) { return `<div class="lesson-title"><span class="kicker">BÀI ${String(index+1).padStart(2,'0')} / 07</span><h3>${lessonNames[index]}</h3><p>${lessonDescriptions[index]}</p></div>${body}<div class="lesson-end"><span>${completed.includes(index)?'✓ Bài này đã hoàn thành':'Tiến độ được lưu trên trình duyệt này'}</span><div class="lesson-end-actions"><button type="button" class="lesson-restart" data-reset-lesson="${index}">Học lại bài này ↺</button><button type="button" data-next-lesson="${Math.min(index+1,6)}">${index===6?'Xem lại bài cuối':'Bài tiếp theo →'}</button></div></div>`; }
  function renderLesson() {
    let body='';
    if(current===0) body=`<div class="intro-grid"><div><strong>1. Hai phe</strong><p>Mỗi phe Đỏ và Xanh có 19 quân. Trong phiên bản web đang học, Đỏ ở phía dưới và đi trước.</p></div><div><strong>2. Một lượt</strong><p>Đến lượt mình, chọn quân, kiểm tra ô đích và xem Chỉ huy có an toàn sau nước đi không.</p></div><div><strong>3. Mục tiêu</strong><p>Chiếu hết Chỉ huy, hoặc kiểm soát Tổng Hành Dinh của đối phương đủ số lượt theo quy tắc đang áp dụng.</p></div></div><div class="win-visuals"><div><img src="${boardCutout(0,'xanh')}" alt="Quân Chỉ huy phe Xanh"><span>CÁCH THẮNG 1</span><strong>Chiếu hết Chỉ huy</strong><p>Chỉ huy bị chiếu và không còn nước hợp lệ để thoát.</p></div><div><img src="${boardCutout(1,'xanh')}" alt="Tổng Hành Dinh phe Xanh"><span>CÁCH THẮNG 2</span><strong>Kiểm soát căn cứ</strong><p>Kiểm soát Tổng Hành Dinh đối phương trong 3 lượt liên tiếp theo phiên bản web.</p></div></div><div class="lesson-example"><div class="mini-win"><span>CHỈ HUY ĐỎ</span><b>← giữ an toàn →</b><span>TỔNG HÀNH DINH</span></div><p>Một nước ăn quân có thể hấp dẫn, nhưng bạn có thể thua nếu để Chỉ huy hoặc căn cứ mất an toàn.</p></div><div class="lesson-question"><strong>Trước khi chạm vào quân đầu tiên, hãy chọn điều cần làm:</strong><div class="lesson-options"><button data-intro="wrong">Ăn quân gần nhất bằng mọi giá</button><button data-intro="right">Quan sát mục tiêu, địa hình và an toàn Chỉ huy</button></div><div id="introFeedback"></div></div>`;
    if(current===1) body=`<p class="lesson-copy">Bàn cờ có 11 cột A–K và 12 hàng 1–12; quân đứng trên giao điểm của các đường kẻ. Ghép chữ cột với số hàng để đọc tọa độ, chẳng hạn <strong>F6</strong>. Dải xanh tới đường cột C và dải xanh giữa hàng 6–7 là mặt nước; hãy tìm bốn vị trí cầu F6, F7, H6, H7.</p><div class="terrain-key"><span><i class="water"></i>Nước</span><span><i class="mixed"></i>Ven nước</span><span><i class="bridge"></i>Cầu</span><span><i class="base"></i>Căn cứ</span></div><div class="coordinate-task"><div class="coordinate-board" id="coordinateBoard"></div><div><strong id="coordinatePrompt"></strong><p id="coordinateFeedback" role="status">Chọn đúng ô trên bàn cờ.</p><a href="#xep-quan">Xem sơ đồ xếp quân và các lớp hiển thị ↓</a></div></div><div class="placement-task"><h4>Bài tập làm quen: 3 quân</h4><p>Đặt Chỉ huy, Bộ binh và Xe tăng của phe Đỏ vào đúng ô. Hoàn thành bài này giúp bạn nhớ ba vị trí đầu tiên; thử thách xếp đủ 19 quân nằm trong phần Xếp quân.</p><div class="placement-palette" id="placementPalette"></div><div class="placement-targets" id="placementTargets"></div><p id="placementFeedback" role="status">Bắt đầu từ Chỉ huy.</p><a class="lesson-link" href="#full-setup-challenge">Đến thử thách đầy đủ: 19 quân ↗</a><p id="fullSetupLessonStatus" class="challenge-status"></p></div>`;
    if(current===2) body=`<p class="lesson-copy">Chọn tên khớp với hình quân. Nếu chưa nhớ biểu tượng, mở mục Quân cờ để xem lại.</p><div class="recognize-card"><img id="recognizeImage" alt="Hình quân cờ cần nhận diện"><div><span id="recognizeCount" class="kicker"></span><h4>Đây là quân nào?</h4><div id="recognizeOptions" class="lesson-options"></div><p id="recognizeFeedback" role="status"></p></div></div><a class="lesson-link" href="#quan-co">Mở thư viện 11 loại quân ↗</a>`;
    if(current===3) body=`<p class="lesson-copy">Quân đứng ở giao điểm giữa bàn. Với mỗi quân, hãy chọn một điểm trong tầm và một điểm ngoài tầm. Sơ đồ dưới đây minh họa <strong>hướng và tầm cơ bản trên bàn trống</strong>; chưa xét vật cản, địa hình, thế chiếu hoặc hành động đặc biệt.</p><div class="move-learning"><div><label for="movePieceSelect">Chọn quân</label><select id="movePieceSelect">${order.map((n,pos)=>`<option value="${pos}">${pieces[n].name}</option>`).join('')}</select><div class="mode-switch" id="moveModeSwitch"></div><div id="moveGrid" class="move-grid"></div></div><div class="move-notes"><span id="moveCount" class="kicker"></span><h4 id="moveTitle"></h4><p id="moveDescription"></p><div class="movement-facts"><div><strong>Tầm đi cơ bản</strong><span id="moveRange"></span></div><div><strong>Ăn quân / tấn công</strong><span id="moveCapture"></span></div><div><strong>Luật riêng cần nhớ</strong><span id="moveSpecial"></span></div></div><p id="moveFeedback" role="status">Chọn một ô để thử.</p><button id="nextMovePiece" type="button">Quân tiếp theo →</button></div></div>`;
    if(current===4) body=`<p class="lesson-copy">Trong một lượt, quân có thể di chuyển, ăn quân đối phương hoặc thực hiện hành động đặc biệt nếu luật cho phép. Các ô được tô sáng chưa thể hiện hết điều kiện để đi hoặc ăn quân.</p><div class="action-columns"><div><strong>Di chuyển</strong><p>Di chuyển theo hướng và tầm cơ bản; sau đó kiểm tra vật cản và địa hình ô đích.</p></div><div><strong>Ăn hoặc bắn</strong><p>Ăn quân đối phương bằng cách tiến vào ô đích hoặc bắn tại chỗ nếu luật cho phép.</p></div><div><strong>Luật đặc biệt</strong><p>Khi chở quân, bắn tại chỗ hoặc vượt sông, hãy kiểm tra điều kiện riêng của hành động đó.</p></div></div><div class="lesson-question"><span id="specialCount" class="kicker"></span><h4 id="specialPrompt"></h4><div id="specialOptions" class="lesson-options"></div><p id="specialFeedback" role="status"></p></div><a class="lesson-link" href="#luat-choi">Xem chi tiết các luật ↗</a>`;
    if(current===5) body=`<p class="lesson-copy">Chọn cách xử lý ở từng lượt. Sáu câu hỏi này giúp bạn tập kiểm tra nước đi trước khi vào một ván thật.</p><div class="turn-track" id="turnTrack"></div><div class="guided-turn"><div class="turn-board"><img src="assets/so-do-xep-quan-ban-dau.svg" alt="Bàn cờ minh họa cho ván hướng dẫn"><span id="turnMarker"></span></div><div><span id="turnCount" class="kicker"></span><h4 id="turnTitle"></h4><p id="turnPrompt"></p><div id="turnOptions" class="lesson-options"></div><p id="turnFeedback" role="status"></p></div></div>`;
    if(current===6) body=`<p class="lesson-copy">Trả lời ba câu hỏi về ô cờ và địa hình. Sau đó, bạn có thể làm thêm 12 câu ở cuối trang.</p><div class="lesson-question"><span id="finalCount" class="kicker"></span><h4 id="finalPrompt"></h4><div id="finalOptions" class="lesson-options"></div><p id="finalFeedback" role="status"></p></div><div class="final-links"><a href="#kiem-tra">Làm bộ 12 câu kiểm tra ↗</a><a href="#xep-quan">Xem lại sơ đồ xếp quân ↗</a></div>`;
    if(current===4) body+=`<div class="lesson-example"><strong>Bước luyện tiếp theo</strong><p>Đem các quy tắc vừa học vào 12 thế cờ về vật cản, địa hình, ăn quân, không quân và an toàn Chỉ huy.</p><a id="scenarioLessonLink" class="lesson-link" href="#phong-tinh-huong" ${completed.includes(4)?'':'hidden'}>Luyện tình huống thực tế ↗</a></div>`;
    if(current===5){let practiced=0;try{const saved=JSON.parse(localStorage.getItem('ctl-scenarios-v1')||'{}');practiced=Object.values(saved.guided||{}).filter(x=>x.completed).length;}catch{}body+=`<p class="lesson-copy">Phòng luyện tình huống: ${practiced}/12 câu đã hiểu. <a href="#phong-tinh-huong">Luyện thêm trước hoặc sau bài này ↗</a></p>`;}
    panel.innerHTML=shell(current,body);
    if(current===1){renderCoordinate();renderPlacement();}
    if(current===2)renderRecognition();
    if(current===3)renderMovement();
    if(current===4)renderQuestion(special,specialStep,'special');
    if(current===5)renderTurn();
    if(current===6)renderQuestion(finalQuestions,finalStep,'final');
  }
  const coordinates=['f6','a4','h11'];
  function renderCoordinate(){
    const labels=['cầu F6','ô nước A4','Tổng Hành Dinh H11'];
    document.getElementById('coordinatePrompt').textContent=coordinateStep<3?`Hãy tìm ${labels[coordinateStep]}.`:'✓ Bạn đã tìm đúng cả ba vị trí.';
    document.getElementById('coordinateBoard').innerHTML=Array.from({length:12},(_,r)=>[...'abcdefghijk'].map(c=>{const n=12-r,id=`${c}${n}`,type=hqs.has(id)?'base':terrainAt(id);return `<button type="button" data-coordinate="${id}" class="coordinate-cell ${type} ${c==='c'?'shore':''}" aria-label="Ô ${id.toUpperCase()}"><small>${id.toUpperCase()}</small></button>`}).join('')).join('');
  }
  const placement=[{piece:0,coord:'g1'},{piece:2,coord:'c5'},{piece:6,coord:'f4'}];
  function renderPlacement(){
    document.getElementById('placementPalette').innerHTML=placement.map((item,i)=>`<button type="button" draggable="true" data-placement-piece="${i}" class="${selectedPlacement===i?'selected':''}"><img src="${boardCutout(item.piece)}" alt=""><span>${pieces[item.piece].name}</span></button>`).join('');
    document.getElementById('placementTargets').innerHTML=placement.map((item,i)=>`<button type="button" data-placement-target="${i}" class="${i<placementStep?'placed':''}"><strong>${item.coord.toUpperCase()}</strong><span>${i<placementStep?pieces[item.piece].name:'Đặt quân vào đây'}</span></button>`).join('');
    document.getElementById('placementFeedback').textContent=placementStep===placement.length?'✓ Bài tập làm quen hoàn thành. Bạn có thể thử xếp đủ 19 quân bên dưới.':placementStep>0?`Đã đặt ${placementStep}/3 quân. Tiếp tục với quân còn lại.`:'Bắt đầu từ Chỉ huy.';
    document.getElementById('fullSetupLessonStatus').textContent=fullSetupAchievement?'🏅 Thành tích riêng: đã xếp đủ 19 quân phe Đỏ.':'Thử thách 19 quân chưa hoàn thành.';
    if(placementStep===placement.length&&coordinateStep===coordinates.length)markDone(1);
  }
  const recognize=[2,6,9,0,1,3,4,5,7,8,10];
  function renderRecognition(){
    const target=recognize[Math.min(recognizeStep,recognize.length-1)];
    document.getElementById('recognizeImage').src=boardCutout(target);
    document.getElementById('recognizeImage').alt=`Hình quân cờ câu ${Math.min(recognizeStep+1,recognize.length)}`;
    document.getElementById('recognizeCount').textContent=recognizeStep<recognize.length?`HÌNH ${recognizeStep+1} / ${recognize.length}`:'ĐÃ HOÀN THÀNH';
    document.getElementById('recognizeOptions').innerHTML=recognizeStep<recognize.length?[target,(target+3)%11,(target+7)%11].map(i=>`<button type="button" data-recognize="${i}">${pieces[i].name}</button>`).join(''):'<a href="#quan-co">Xem đủ 11 quân trong thư viện ↗</a>';
  }
  function legalMove(p,x,y,mode){const ax=Math.abs(x),ay=Math.abs(y),d=Math.max(ax,ay),orth=(x===0||y===0)&&d>0,diag=ax===ay&&ax>0;if(p.name==='Tổng Hành Dinh')return false;if(p.name==='Chỉ huy'&&mode==='capture')return orth&&d===1;if(p.dir==='orth')return orth&&d<=p.range;if(p.dir==='all')return (orth||diag)&&d<=p.range;if(p.dir==='missile')return (orth&&d<=2)||(diag&&d===1);return false;}
  function renderMovement(){
    document.getElementById('movePieceSelect').value=String(moveIndex);
    const p=pieces[order[moveIndex]];
    document.getElementById('moveCount').textContent=`QUÂN ${moveIndex+1} / 11 · ĐÃ THỬ ${movePassed.size} / 11`;
    document.getElementById('moveTitle').textContent=p.name;
    document.getElementById('moveDescription').textContent=p.name==='Hải quân'?'Bàn tập này là vùng biển. Chọn một ô sáng theo hàng ngang, cột dọc hoặc đường chéo, rồi thử một ô ngoài tầm.':p.name==='Tổng Hành Dinh'?'Tổng Hành Dinh thông thường đứng yên. Hãy chọn một ô để xem kết quả.':`${p.move} Chọn một ô sáng trong tầm và một ô ngoài tầm để tự kiểm tra.`;
    document.getElementById('moveRange').textContent=p.move;
    document.getElementById('moveCapture').textContent=p.name==='Chỉ huy'?'Ăn quân ở ô liền kề; chọn “Tầm ăn” để thử.':p.name==='Tổng Hành Dinh'?'Không ăn quân.':p.name==='Hải quân'?'Tùy loại hỏa lực và mục tiêu; xem luật chi tiết.':p.name==='Pháo'?'Có trường hợp ăn quân bằng cách bắn tại chỗ.':'Chưa suy ra đầy đủ từ tầm đi; cần xét quân địch và luật riêng.';
    document.getElementById('moveSpecial').textContent=p.feature;
    document.getElementById('moveModeSwitch').innerHTML=p.name==='Chỉ huy'?`<button data-move-mode="move" class="${moveMode==='move'?'active':''}">Tầm đi</button><button data-move-mode="capture" class="${moveMode==='capture'?'active':''}">Tầm ăn</button>`:'';
    const moveGrid=document.getElementById('moveGrid');moveGrid.classList.toggle('sea-board',p.name==='Hải quân');moveGrid.setAttribute('aria-label',p.name==='Hải quân'?'Bàn tập vùng biển của Hải quân':'Bàn tập hướng đi');moveGrid.innerHTML=Array.from({length:81},(_,i)=>{const x=i%9-4,y=Math.floor(i/9)-4,origin=x===0&&y===0,legal=legalMove(p,x,y,moveMode);return `<button type="button" data-move-x="${x}" data-move-y="${y}" class="move-cell ${origin?'origin':legal?'legal':''}" aria-label="${origin?'Vị trí '+p.name:`Ô lệch ${x} cột, ${y} hàng`}">${origin?`<img src="${boardCutout(order[moveIndex],'xanh')}" alt="">`:legal?'·':''}</button>`}).join('');
    document.getElementById('moveFeedback').textContent=moveRight&&moveWrong?'✓ Bạn đã chọn được ô trong tầm và ô ngoài tầm. Hãy chuyển sang quân tiếp theo.':moveRight?'Đúng. Hãy chọn thêm một ô ngoài tầm.':moveWrong?'Ô này ngoài tầm cơ bản. Hãy thử tìm ô trong tầm.':'Chọn một ô để thử.';
    document.getElementById('nextMovePiece').disabled=!(moveRight&&moveWrong);
  }
  function renderQuestion(data,index,prefix){const q=data[Math.min(index,data.length-1)];document.getElementById(`${prefix}Count`).textContent=index<data.length?`CÂU ${index+1} / ${data.length}`:'HOÀN THÀNH';document.getElementById(`${prefix}Prompt`).textContent=index<data.length?q.prompt:'Bạn đã trả lời xong các tình huống.';document.getElementById(`${prefix}Options`).innerHTML=index<data.length?q.options.map((o,i)=>`<button type="button" data-${prefix}-answer="${i}">${o}</button>`).join(''):'<span>✓ Có thể xem tiếp phần tra cứu bên dưới.</span>';}
  function renderTurn(){const q=opening[Math.min(turnStep,opening.length-1)];document.getElementById('turnTrack').innerHTML=opening.map((_,i)=>`<span class="${i<turnStep?'done':i===turnStep?'active':''}">${i+1}</span>`).join('');document.getElementById('turnCount').textContent=turnStep<opening.length?`LƯỢT ${turnStep+1} / 6`:'HOÀN THÀNH';document.getElementById('turnTitle').textContent=turnStep<opening.length?q.title:'Bạn đã đi qua sáu quyết định đầu tiên.';document.getElementById('turnPrompt').textContent=turnStep<opening.length?q.prompt:'Xem lại bàn cờ, rồi thử bộ câu hỏi tình huống.';document.getElementById('turnOptions').innerHTML=turnStep<opening.length?q.options.map((o,i)=>`<button type="button" data-turn-answer="${i}">${o}</button>`).join(''):'<a href="#kiem-tra">Đến bài kiểm tra ↗</a>';document.getElementById('turnMarker').textContent=turnStep<opening.length?`LƯỢT ${turnStep+1}`:'✓';}
  function resetLesson(index){
    completed=completed.filter(n=>n!==index);
    if(index===1){coordinateStep=0;placementStep=0;selectedPlacement=null;}
    if(index===2)recognizeStep=0;
    if(index===3){moveIndex=0;moveMode='move';moveRight=false;moveWrong=false;movePassed.clear();}
    if(index===4)specialStep=0;
    if(index===5)turnStep=0;
    if(index===6)finalStep=0;
    persist();renderNav();renderLesson();
  }
  list.addEventListener('click',e=>{const b=e.target.closest('[data-lesson]');if(b)selectLesson(Number(b.dataset.lesson));});
  document.getElementById('continueLesson').addEventListener('click',()=>{const next=lessonNames.findIndex((_,i)=>!completed.includes(i));selectLesson(!completed.includes(current)?current:next<0?current:next,true);});
  panel.addEventListener('click',e=>{
    const restart=e.target.closest('[data-reset-lesson]');if(restart){resetLesson(Number(restart.dataset.resetLesson));return;}
    const next=e.target.closest('[data-next-lesson]');if(next){selectLesson(Number(next.dataset.nextLesson));return;}
    const intro=e.target.closest('[data-intro]');if(intro){const good=intro.dataset.intro==='right';document.getElementById('introFeedback').innerHTML=feedback(good?'Đúng. Bạn đã nắm ý đầu tiên của một lượt chơi.':'Hãy nhìn cả mục tiêu và sự an toàn trước khi đi.',good);if(good)markDone(0);return;}
    const coord=e.target.closest('[data-coordinate]');if(coord&&coordinateStep<3){const good=coord.dataset.coordinate===coordinates[coordinateStep];document.getElementById('coordinateFeedback').textContent=good?`✓ Đúng: ${coordinates[coordinateStep].toUpperCase()}.`:`Ô ${coord.dataset.coordinate.toUpperCase()} chưa đúng. Hãy đọc cột rồi đọc hàng.`;if(good){coordinateStep++;saveProgress();if(coordinateStep===3&&placementStep===placement.length)markDone(1);setTimeout(()=>{if(current===1)renderCoordinate()},450);}return;}
    const palette=e.target.closest('[data-placement-piece]');if(palette){selectedPlacement=Number(palette.dataset.placementPiece);saveProgress();renderPlacement();return;}
    const target=e.target.closest('[data-placement-target]');if(target){const i=Number(target.dataset.placementTarget),good=i===placementStep&&selectedPlacement===i;document.getElementById('placementFeedback').textContent=good?`✓ ${pieces[placement[i].piece].name} ở ${placement[i].coord.toUpperCase()}.`:'Chọn quân tương ứng rồi đặt vào ô xuất phát đúng.';if(good){placementStep++;selectedPlacement=null;saveProgress();renderPlacement();}return;}
    const rec=e.target.closest('[data-recognize]');if(rec){const good=Number(rec.dataset.recognize)===recognize[recognizeStep];document.getElementById('recognizeFeedback').textContent=good?`✓ Đúng, đây là ${pieces[recognize[recognizeStep]].name}.`:'Chưa đúng. Hãy nhìn biểu tượng ở giữa quân rồi thử lại.';if(good){recognizeStep++;saveProgress();if(recognizeStep===recognize.length)markDone(2);setTimeout(()=>{if(current===2)renderRecognition()},550);}return;}
    const mode=e.target.closest('[data-move-mode]');if(mode){moveMode=mode.dataset.moveMode;moveRight=false;moveWrong=false;saveProgress();renderMovement();return;}
    const move=e.target.closest('[data-move-x]');if(move){const x=Number(move.dataset.moveX),y=Number(move.dataset.moveY),p=pieces[order[moveIndex]],origin=x===0&&y===0,legal=!origin&&legalMove(p,x,y,moveMode);if(origin){document.getElementById('moveFeedback').textContent='Quân đang đứng ở ô này. Hãy chọn ô khác.';return;}if(legal)moveRight=true;else moveWrong=true;saveProgress();document.getElementById('moveFeedback').textContent=legal?`✓ Đúng trong sơ đồ tầm cơ bản của ${p.name}. Hãy nhớ kiểm tra địa hình và vật cản trong ván thật.`:p.name==='Tổng Hành Dinh'?'✓ Tổng Hành Dinh đứng yên, không có ô di chuyển.':`✓ Ô này ngoài tầm cơ bản của ${p.name}.`;move.classList.add(legal?'picked-right':'picked-wrong');document.getElementById('nextMovePiece').disabled=p.name==='Tổng Hành Dinh'?!moveWrong:!(moveRight&&moveWrong);return;}
    if(e.target.closest('#nextMovePiece')){movePassed.add(moveIndex);saveProgress();if(movePassed.size===11)markDone(3);if(moveIndex<10){moveIndex++;moveMode='move';moveRight=false;moveWrong=false;saveProgress();renderMovement();}else{document.getElementById('moveFeedback').textContent=movePassed.size===11?'✓ Bạn đã thử cả 11 loại quân. Xem luật chi tiết trước khi chơi ván thật.':'Đã ghi nhận quân này. Hãy chọn các quân còn lại trong danh sách để luyện tiếp.';e.target.disabled=true;}return;}
    for(const [prefix,data,varName] of [['special',special,'special'],['final',finalQuestions,'final']]){const b=e.target.closest(`[data-${prefix}-answer]`);if(!b)continue;const index=prefix==='special'?specialStep:finalStep,q=data[index],good=Number(b.dataset[`${prefix}Answer`])===q.correct;document.getElementById(`${prefix}Feedback`).textContent=`${good?'✓ Đúng.':'Chưa đúng.'} ${q.why}`;if(good){if(prefix==='special')specialStep++;else finalStep++;saveProgress();if((prefix==='special'?specialStep:finalStep)===data.length)markDone(prefix==='special'?4:6);setTimeout(()=>{if(current===(prefix==='special'?4:6))renderQuestion(data,prefix==='special'?specialStep:finalStep,prefix)},800);}return;}
    const turn=e.target.closest('[data-turn-answer]');if(turn){const q=opening[turnStep],good=Number(turn.dataset.turnAnswer)===q.correct;document.getElementById('turnFeedback').textContent=`${good?'✓ Đúng.':'Chưa đúng.'} ${q.why}`;if(good){turnStep++;saveProgress();if(turnStep===opening.length)markDone(5);setTimeout(()=>{if(current===5)renderTurn()},850);}return;}
  });
  panel.addEventListener('change',e=>{if(e.target.id==='movePieceSelect'){moveIndex=Number(e.target.value);moveMode='move';moveRight=false;moveWrong=false;saveProgress();renderMovement();}});
  panel.addEventListener('dragstart',e=>{const b=e.target.closest('[data-placement-piece]');if(b)e.dataTransfer.setData('text/plain',b.dataset.placementPiece);});
  panel.addEventListener('dragover',e=>{if(e.target.closest('[data-placement-target]'))e.preventDefault();});
  panel.addEventListener('drop',e=>{const b=e.target.closest('[data-placement-target]');if(!b)return;e.preventDefault();selectedPlacement=Number(e.dataTransfer.getData('text/plain'));b.click();});
  const setupHead=document.querySelector('.setup-board-head');
  setupHead.insertAdjacentHTML('beforeend','<div class="board-layers" aria-label="Các lớp của bàn cờ"><button type="button" data-layer="coordinates" aria-pressed="true">Tọa độ</button><button type="button" data-layer="terrain" aria-pressed="true">Địa hình</button><button type="button" data-layer="pieces" aria-pressed="true">Quân cờ</button></div>');
  setupHead.addEventListener('click',e=>{const b=e.target.closest('[data-layer]');if(!b)return;const hidden=setupBoard.classList.toggle(`hide-${b.dataset.layer}`);b.setAttribute('aria-pressed',String(!hidden));});
  const selfSetupHost=document.querySelector('#xep-quan .setup-board-wrap');
  selfSetupHost.insertAdjacentHTML('afterend','<div class="self-setup" id="full-setup-challenge"><div class="self-setup-head"><div><span class="kicker">THỬ THÁCH ĐẦY ĐỦ</span><h3>Xếp đủ 19 quân phe Đỏ</h3><p>Sau bài làm quen 3 quân, hãy đặt toàn bộ 19 quân vào ô xuất phát ở hàng 1–5. Bạn có thể chọn hoặc kéo quân; phe Xanh xếp đối xứng.</p><p id="selfSetupAchievement" class="challenge-achievement"></p></div><button id="resetSelfSetup" type="button">Làm lại</button></div><div class="self-setup-layout"><div><div class="self-setup-board" id="selfSetupBoard"></div><div class="self-terrain-legend"><span><i class="sea"></i> Nước</span><span><i class="mixed"></i> Ven nước</span><span><i class="bridge"></i> Cầu</span><span><i class="land"></i> Đất</span></div><p id="selfSetupFeedback" role="status">Chọn một loại quân rồi đặt vào bàn.</p></div><div><strong id="selfSetupCount">0 / 19 quân</strong><div id="selfSetupPalette" class="self-setup-palette"></div></div></div></div>');
  const selfBoard=document.getElementById('selfSetupBoard'),selfPalette=document.getElementById('selfSetupPalette'),selfFeedback=document.getElementById('selfSetupFeedback');
  const redTargets=new Map(redSetup.map(([coord,index])=>[coord,index]));
  const placed=new Map();
  if(saved && Array.isArray(saved.selfPlaced))for(const entry of saved.selfPlaced){if(Array.isArray(entry)&&entry.length===2&&redTargets.get(entry[0])===entry[1])placed.set(entry[0],entry[1]);}
  if(placed.size===redSetup.length)fullSetupAchievement=true;
  let activePiece=Number.isInteger(saved?.activePiece)&&redSetup.some(([,index])=>index===saved.activePiece)?saved.activePiece:null;
  function renderSelfSetup(){
    const counts=new Map();for(const [,index] of redSetup)counts.set(index,(counts.get(index)||0)+1);
    for(const index of placed.values())counts.set(index,counts.get(index)-1);
    selfPalette.innerHTML=[...counts].map(([index,count])=>`<button type="button" draggable="${count>0}" data-self-piece="${index}" class="${activePiece===index?'selected':''}" ${count===0?'disabled':''}><img src="${boardCutout(index)}" alt=""><span>${pieces[index].name}<small>Còn ${count}</small></span></button>`).join('');
    selfBoard.innerHTML=Array.from({length:12},(_,r)=>[...'abcdefghijk'].map(c=>{
      const n=12-r,coord=`${c}${n}`,index=placed.get(coord);
      const terrain=hqs.has(coord)?'base':terrainAt(coord)==='water'?'sea':terrainAt(coord);
      const active=n<=5;
      return `<button type="button" data-self-target="${coord}" class="${terrain} ${c==='c'?'shore':''} ${index!==undefined?'filled':''}" aria-label="Ô ${coord.toUpperCase()}, ${terrain==='sea'?'nước':terrain==='mixed'?'ven nước':terrain==='bridge'?'cầu':terrain==='base'?'căn cứ':'đất'}${index!==undefined?`, ${pieces[index].name}`:''}" ${active?'':'disabled'}><small>${coord.toUpperCase()}</small>${index!==undefined?`<img src="${boardCutout(index)}" alt="${pieces[index].name}">`:''}</button>`;
    }).join('')).join('');
    document.getElementById('selfSetupCount').textContent=`${placed.size} / 19 quân`;
    document.getElementById('selfSetupAchievement').textContent=fullSetupAchievement?'🏅 Thành tích đã đạt: xếp đủ 19 quân phe Đỏ.':'Thành tích riêng: hoàn thành thử thách để mở khóa.';
    const lessonChallengeStatus=document.getElementById('fullSetupLessonStatus');if(lessonChallengeStatus)lessonChallengeStatus.textContent=fullSetupAchievement?'🏅 Thành tích riêng: đã xếp đủ 19 quân phe Đỏ.':'Thử thách 19 quân chưa hoàn thành.';
    if(placed.size===19)selfFeedback.textContent='✓ Bạn đã xếp đủ 19 quân phe Đỏ. Phe Xanh dùng vị trí đối xứng qua giữa bàn.';
    else if(placed.size>0&&selfFeedback.textContent==='Chọn một loại quân rồi đặt vào bàn.')selfFeedback.textContent=`Đã xếp ${placed.size}/19 quân. Tiếp tục với quân còn lại.`;
  }
  function placeSelfPiece(coord,index){
    if(index===null){selfFeedback.textContent='Chọn một quân trong danh sách trước.';return;}
    if(placed.has(coord)){selfFeedback.textContent=`Ô ${coord.toUpperCase()} đã có quân. Chọn ô khác.`;return;}
    if(redTargets.get(coord)!==index){selfFeedback.textContent=`Chưa đúng: ${pieces[index].name} không bắt đầu ở ${coord.toUpperCase()}. Hãy thử ô khác.`;return;}
    placed.set(coord,index);if(placed.size===redSetup.length)fullSetupAchievement=true;selfFeedback.textContent=`✓ Đúng: ${pieces[index].name} ở ${coord.toUpperCase()}.`;activePiece=null;saveProgress();renderSelfSetup();
  }
  selfPalette.addEventListener('click',e=>{const b=e.target.closest('[data-self-piece]');if(!b||b.disabled)return;activePiece=Number(b.dataset.selfPiece);persist();renderSelfSetup();});
  selfBoard.addEventListener('click',e=>{const b=e.target.closest('[data-self-target]');if(b)placeSelfPiece(b.dataset.selfTarget,activePiece);});
  selfPalette.addEventListener('dragstart',e=>{const b=e.target.closest('[data-self-piece]');if(b&&!b.disabled)e.dataTransfer.setData('text/plain',b.dataset.selfPiece);});
  selfBoard.addEventListener('dragover',e=>{if(e.target.closest('[data-self-target]'))e.preventDefault();});
  selfBoard.addEventListener('drop',e=>{const b=e.target.closest('[data-self-target]');if(!b)return;e.preventDefault();placeSelfPiece(b.dataset.selfTarget,Number(e.dataTransfer.getData('text/plain')));});
  document.getElementById('resetSelfSetup').addEventListener('click',()=>{placed.clear();activePiece=null;selfFeedback.textContent=fullSetupAchievement?'Đã làm lại bàn tập. Thành tích 19 quân của bạn vẫn được giữ.':'Đã làm lại. Chọn một quân để bắt đầu.';persist();renderSelfSetup();});
  renderSelfSetup();
  if(migrated)persist();
  renderNav();renderLesson();
})();
