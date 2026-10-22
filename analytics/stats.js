(() => {
  const endpoint=window.CoTuLenhVisitorConfig?.endpoint?.trim();
  const status=document.getElementById('statsStatus');
  if(!endpoint || !/^https:\/\//i.test(endpoint)){
    status.textContent='Chưa kết nối dịch vụ thống kê. Hãy xem analytics/README.md để thiết lập.';
    return;
  }
  fetch(`${endpoint.replace(/\/$/,'')}/stats`,{mode:'cors',credentials:'omit',cache:'no-store'})
    .then(response=>{if(!response.ok)throw Error('Không thể đọc số liệu');return response.json();})
    .then(data=>{
      const day=new Date().toISOString().slice(0,10);
      document.getElementById('totalBrowsers').textContent=Number(data.totalBrowsers||0).toLocaleString('vi-VN');
      document.getElementById('todayBrowsers').textContent=Number(data.byDay?.[day]||0).toLocaleString('vi-VN');
      const entries=Object.entries(data.byDay||{}).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,14);
      const list=document.getElementById('dailyStats');
      if(!entries.length){list.textContent='Chưa có lượt mở nào.';}
      else{
        for(const [date,count] of entries){
          const row=document.createElement('div');row.className='daily-row';
          const dateEl=document.createElement('span');dateEl.textContent=date;
          const countEl=document.createElement('strong');countEl.textContent=Number(count).toLocaleString('vi-VN');
          row.append(dateEl,countEl);list.append(row);
        }
      }
      status.textContent=data.updatedAt?`Cập nhật lần cuối: ${new Date(data.updatedAt).toLocaleString('vi-VN')}`:'Chưa có dữ liệu.';
    }).catch(()=>{status.textContent='Chưa đọc được số liệu. Hãy thử lại sau.';});
})();
