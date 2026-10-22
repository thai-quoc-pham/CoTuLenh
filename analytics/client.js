(() => {
  const endpoint=window.CoTuLenhVisitorConfig?.endpoint?.trim();
  if(!endpoint || !/^https:\/\//i.test(endpoint)) return;
  if(navigator.globalPrivacyControl === true || navigator.doNotTrack === '1') return;

  const idKey='ctl-visitor-browser-v1';
  const sentKey='ctl-visitor-recorded-v1';
  let visitorId;
  try {
    if(localStorage.getItem(sentKey)==='1') return;
    visitorId=localStorage.getItem(idKey);
    if(!visitorId){
      visitorId=crypto.randomUUID();
      localStorage.setItem(idKey,visitorId);
    }
  } catch { return; } // Không thể lưu ID ổn định thì không ghi nhận để tránh đếm trùng.

  fetch(`${endpoint.replace(/\/$/,'')}/visit`,{
    method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({visitorId})
  }).then(response=>{
    if(!response.ok) return;
    try { localStorage.setItem(sentKey,'1'); } catch {}
  }).catch(()=>{}); // Không ảnh hưởng đến việc học/chơi khi dịch vụ thống kê tạm lỗi.
})();
