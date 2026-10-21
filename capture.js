(() => {
  // These are teaching positions, not a move generator. Every answer is tied to
  // the depicted target, route, terrain and the normal (non-hero) piece state.
  const scenarios = [
    {
      normal:'Ăn quân ở ô liền kề theo hàng ngang hoặc dọc; tầm đi trên đường thoáng dài hơn tầm ăn.',
      cannot:'Không thể ăn quân cách hai ô theo cách thông thường, dù đường đi tới đó có thể thoáng.',
      special:'Không được đi nước khiến Chỉ huy của mình bị chiếu. Hai Chỉ huy đối mặt trên cùng hàng hoặc cột mà không có quân chắn là tình huống nguy hiểm.',
      good:[0,-1],bad:[0,-2],goodWhy:'Chỉ huy ăn quân Xanh ở ô liền kề phía trước, nếu sau đó vẫn an toàn.',badWhy:'Mục tiêu cách 2 ô, trong khi Chỉ huy chỉ ăn quân ở ô liền kề.'
    },
    {
      normal:'Trong trạng thái thường, Tổng Hành Dinh đứng yên và không ăn quân.',
      cannot:'Không thể dùng căn cứ như quân cơ động để ăn quân ở ô bên cạnh.',
      special:'Tổng Hành Dinh thông thường không ăn quân. Nếu căn cứ chuyển sang trạng thái “anh hùng”, hãy xem luật đang áp dụng; bàn tập chưa mô phỏng trạng thái này.',
      bad:[0,-1],badWhy:'Tổng Hành Dinh trạng thái thường không di chuyển và không ăn quân.'
    },
    {
      normal:'Đi và ăn quân địch ở ô liền kề theo hàng ngang hoặc dọc.',
      cannot:'Trong trạng thái thường, không ăn chéo hoặc ăn quân cách xa hơn 1 ô.',
      special:'Bàn tập dùng Bộ binh thông thường. Nếu quân đã lên trạng thái “anh hùng”, tầm đi có thể khác.',
      good:[0,-1],bad:[1,-1],goodWhy:'Mục tiêu ngay trước mặt, cách 1 ô dọc.',badWhy:'Bộ binh thông thường không ăn quân theo đường chéo.'
    },
    {
      normal:'Đi và ăn quân địch 1 ô theo hàng ngang hoặc dọc.',
      cannot:'Trong trạng thái thường, không ăn quân theo đường chéo.',
      special:'Nếu Công binh đang chở quân, hãy kiểm tra luật chở và tách quân trước khi đi.',
      good:[1,0],bad:[1,-1],goodWhy:'Mục tiêu nằm ở ô liền kề theo hàng ngang.',badWhy:'Mục tiêu nằm chéo; Công binh cơ bản không ăn theo đường chéo.'
    },
    {
      normal:'Đi và ăn 1 ô theo cả tám hướng: ngang, dọc và chéo.',
      cannot:'Không ăn mục tiêu xa hơn 1 ô trong trạng thái thường.',
      special:'Nếu Dân quân lên trạng thái “anh hùng”, hãy xem lại tầm đi hiển thị trong ván.',
      good:[1,-1],bad:[2,-1],goodWhy:'Mục tiêu nằm chéo liền kề, thuộc tám hướng ăn.',badWhy:'Mục tiêu lệch 2 cột và 1 hàng, không phải một bước theo tám hướng.'
    },
    {
      normal:'Ăn quân ở ô liền kề theo hướng ngang hoặc dọc.',
      cannot:'Không thể ăn quân cách 2 ô trên cùng hàng hoặc cột theo cách thông thường.',
      special:'Ngoài cách ăn quân trên đất, Phòng không còn khống chế máy bay ở các ô gần. Đây là cơ chế riêng, khác với việc tiến vào ô có quân địch.',
      good:[0,-1],bad:[0,-2],goodWhy:'Quân Xanh ở ô liền kề phía trước, trong tầm ăn thông thường.',badWhy:'Mục tiêu cách 2 ô, ngoài tầm ăn thông thường của Phòng không.'
    },
    {
      normal:'Ăn mục tiêu tối đa 2 ô theo hàng ngang hoặc dọc khi đường đi không bị chặn.',
      cannot:'Không thể đi xuyên qua quân cùng phe để ăn quân phía sau.',
      special:'Khi mục tiêu ở địa hình Xe tăng không được chiếm, trò chơi có thể cho phép bắn tại chỗ. Xe tăng còn có luật chở quân.',
      good:[0,-2],bad:[2,0],blocker:[1,0],goodWhy:'Mục tiêu cách 2 ô dọc và đường tới đó đang thoáng.',badWhy:'Bộ binh Đỏ đứng giữa đường ngang: Xe tăng không thể đi xuyên qua để tiến vào mục tiêu.'
    },
    {
      normal:'Ăn mục tiêu trong tầm tối đa 3 ô theo hàng ngang, dọc hoặc đường chéo trong ví dụ cơ bản.',
      cannot:'Không ăn được quân ở cách xa hơn 3 ô.',
      special:'Pháo có thể bắn xuyên quân chắn trong một số tình huống. Điều đó không có nghĩa Pháo được đi xuyên quân chắn tới ô trống.',
      good:[0,-3],bad:[4,-4],goodWhy:'Mục tiêu cùng cột, cách 3 ô trên đường thoáng.',badWhy:'Mục tiêu ở góc cách 4 ô, vượt tầm cơ bản 3 ô của Pháo.'
    },
    {
      normal:'Ăn tối đa 2 ô theo hàng ngang/dọc; trên đường chéo chỉ 1 ô theo mô tả đang áp dụng.',
      cannot:'Không ăn quân cách 2 ô theo đường chéo trong bài tập này.',
      special:'Tên lửa có thể bắn xuyên quân chắn hoặc bắn tại chỗ khi luật cho phép. Nó còn tạo vùng phòng không.',
      good:[2,0],bad:[2,-2],goodWhy:'Mục tiêu cách 2 ô ngang, trong tầm cơ bản.',badWhy:'Đường chéo dài 2 ô, vượt giới hạn chéo 1 ô của Tên lửa.'
    },
    {
      normal:'Ăn tối đa 4 ô theo tám hướng; Máy bay có thể bay qua quân chắn.',
      cannot:'Không ăn mục tiêu ở ô lệch 3 cột và 2 hàng vì không cùng hàng, cột hoặc đường chéo.',
      special:'Trước khi bay, hãy kiểm tra vùng khống chế của Phòng không, Tên lửa và Hải quân. Máy bay có thể tấn công rồi ở lại vị trí cũ khi không thể đáp ở ô mục tiêu.',
      good:[3,-3],bad:[3,-2],blocker:[1,-1],goodWhy:'Mục tiêu cách 3 ô chéo; Máy bay có thể vượt quân chắn trong ví dụ chưa có vùng phòng không.',badWhy:'Ô đích lệch 3 cột và 2 hàng nên không nằm trên hàng ngang, cột dọc hoặc đường chéo.'
    },
    {
      normal:'Đi và ăn trong tầm tối đa 4 ô theo tám hướng trên nước hoặc ô hỗn hợp.',
      cannot:'Không thể tiến vào ô đất thông thường, dù khoảng cách đến mục tiêu vẫn nằm trong tầm đi cơ bản.',
      special:'Hải quân có thể bắn mục tiêu ở xa. Nếu không thể tiến vào ô đích, hãy xem trò chơi có cho phép bắn tại chỗ hay không.',
      good:[-2,0],bad:[3,0],water:true,goodWhy:'Mục tiêu trên vùng nước cùng hàng, cách 2 ô, trong ví dụ đường thoáng.',badWhy:'Ô mục tiêu là ô đất thông thường: Hải quân không thể tiến vào để ăn. Hỏa lực bắn tại chỗ là hành động khác, cần được trò chơi xác nhận.'
    }
  ];

  const select=document.getElementById('captureSelect');
  const grid=document.getElementById('captureGrid');
  const feedback=document.getElementById('captureFeedback');
  let showingMoves=false;
  select.innerHTML=pieces.map((piece,index)=>`<option value="${index}">${piece.name}</option>`).join('');

  function same(point,x,y){return point && point[0]===x && point[1]===y;}
  function canMoveTo(index,scenario,x,y){
    if(index===1||x===0&&y===0)return false;
    const ax=Math.abs(x),ay=Math.abs(y),distance=Math.max(ax,ay);
    const orth=(x===0||y===0),diag=ax===ay;
    const shape=index===8?(orth&&distance<=2||diag&&distance===1):
      (index===4||index===7||index===9||index===10)?(orth||diag)&&distance<=pieces[index].range:
      orth&&distance<=pieces[index].range;
    if(!shape||index===10&&x>1)return false; // Hải quân chỉ dừng trên nước/ô hỗn hợp.
    if(index===9)return true; // Máy bay có thể bay qua quân chắn trong bài tập này.
    const stepX=Math.sign(x),stepY=Math.sign(y);
    for(let step=1;step<distance;step++){
      const px=stepX*step,py=stepY*step;
      if(same(scenario.good,px,py)||same(scenario.bad,px,py)||same(scenario.blocker,px,py))return false;
    }
    return true;
  }
  function showMoves(index,scenario){
    showingMoves=!showingMoves;
    grid.querySelectorAll('.capture-cell').forEach(cell=>{
      const x=Number(cell.dataset.x),y=Number(cell.dataset.y);
      cell.classList.toggle('move-option',showingMoves&&cell.dataset.captureRole==='empty'&&canMoveTo(index,scenario,x,y));
    });
    grid.querySelector('.capture-cell.origin').setAttribute('aria-pressed',String(showingMoves));
    feedback.textContent=showingMoves?index===1?'Tổng Hành Dinh trạng thái thường không có ô đi.':'Chấm xanh lá đánh dấu ô trống mà quân có thể đi tới trong ví dụ này. Chọn lại quân Đỏ để ẩn; chọn quân Xanh để thử ăn.':'Đã ẩn các ô đi. Chọn quân Đỏ để hiện lại.';
    feedback.className='capture-feedback note';
  }
  function render(){
    const index=Number(select.value),piece=pieces[index],scenario=scenarios[index];
    showingMoves=false;
    document.getElementById('captureScenarioCount').textContent=`${String(index+1).padStart(2,'0')} / 11`;
    document.getElementById('capturePieceImage').src=`${assets}cutouts/board/${piece.asset}-do.png`;
    document.getElementById('capturePieceImage').alt=`${piece.name} phe Đỏ`;
    document.getElementById('capturePieceName').textContent=piece.name;
    document.getElementById('captureNormal').textContent=scenario.normal;
    document.getElementById('captureCannot').textContent=scenario.cannot;
    document.getElementById('captureSpecial').textContent=scenario.special;
    feedback.textContent=scenario.good?'Chọn quân Đỏ để xem các ô có thể đi, hoặc chọn quân Xanh để thử ăn.':'Chọn quân Đỏ để xem các ô có thể đi; chọn quân Xanh để thử ăn.';
    feedback.className='capture-feedback';
    grid.classList.toggle('water-scenario',Boolean(scenario.water));
    grid.innerHTML=Array.from({length:81},(_,cell)=>{
      const x=cell%9-4,y=Math.floor(cell/9)-4;
      const role=x===0&&y===0?'origin':same(scenario.good,x,y)?'good':same(scenario.bad,x,y)?'bad':same(scenario.blocker,x,y)?'blocker':'empty';
      const isTarget=role==='good'||role==='bad';
      const terrain=scenario.water?(x<=0?'sea':x===1?'mixed':'land'):'';
      const image=role==='origin'?`${piece.asset}-do.png`:isTarget?'03-bo-binh-xanh.png':role==='blocker'?'03-bo-binh-do.png':'';
      const label=role==='origin'?`${piece.name} phe Đỏ đang tấn công`:isTarget?`Quân Bộ binh phe Xanh, lệch ${x} cột và ${y} hàng`:role==='blocker'?'Bộ binh cùng phe chắn đường':`Ô trống, lệch ${x} cột và ${y} hàng`;
      return `<button type="button" class="capture-cell ${role} ${terrain}" data-x="${x}" data-y="${y}" data-capture-role="${role}" ${role==='origin'?'aria-pressed="false"':''} aria-label="${label}${role==='origin'?', chạm để hiện hoặc ẩn ô có thể đi':''}">${image?`<img src="${assets}cutouts/board/${image}" alt="" loading="lazy">`:''}</button>`;
    }).join('');
  }

  grid.addEventListener('click',event=>{
    const cell=event.target.closest('[data-capture-role]');if(!cell)return;
    const scenario=scenarios[Number(select.value)],role=cell.dataset.captureRole;
    grid.querySelector('.chosen')?.classList.remove('chosen');cell.classList.add('chosen');
    if(role==='origin'){showMoves(Number(select.value),scenario);return;}
    if(role==='good'){feedback.textContent=`✓ Có thể ăn trong tình huống minh họa. ${scenario.goodWhy}`;feedback.className='capture-feedback success';}
    else if(role==='bad'){feedback.textContent=`✕ Không thể ăn quân ở ô này theo cách đang xét. ${scenario.badWhy}`;feedback.className='capture-feedback error';}
    else if(role==='blocker'){feedback.textContent='Đây là quân cùng phe. Không được ăn quân mình; hãy xét nó có chắn đường hay không.';feedback.className='capture-feedback note';}
    else{feedback.textContent='Ô này trống, nên không có quân địch để ăn. Hãy chọn quân Xanh trên bàn.';feedback.className='capture-feedback note';}
  });
  select.addEventListener('change',render);
  document.getElementById('captureNext').addEventListener('click',()=>{select.value=(Number(select.value)+1)%pieces.length;render();});
  render();
})();
