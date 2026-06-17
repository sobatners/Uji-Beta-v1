const TRANS={
  'dyspnea':'dispnea napas','shortness of breath':'sesak napas','sob':'sesak napas',
  'fever':'demam panas','pain':'nyeri sakit','acute pain':'nyeri akut',
  'diarrhea':'diare BAB cair','nausea':'mual','vomiting':'muntah',
  'dehydration':'dehidrasi cairan','edema':'edema bengkak',
  'anxiety':'cemas ansietas','insomnia':'sulit tidur',
  'wound':'luka kulit','infection':'infeksi',
  'malnutrition':'malnutrisi nutrisi','tachycardia':'takikardia nadi',
  'cyanosis':'sianosis biru','hyperthermia':'demam hipertermia',
  'hypothermia':'hipotermia dingin','wheezing':'mengi napas',
  'airway':'jalan napas','nutrition':'nutrisi makan',
  'fluid':'cairan','sleep':'tidur istirahat',
  'pressure ulcer':'dekubitus luka','decubitus':'dekubitus'
};

let curUser=null,lastQ='';

function doLogin(){
  const u=document.getElementById('lu').value.trim();
  const p=document.getElementById('lp').value;
  const found=USERS.find(x=>x.u===u&&x.p===p);
  if(!found){document.getElementById('lerr').textContent='⚠ Username atau password salah.';return;}
  curUser=found;
  document.getElementById('ls').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('ibtn').style.display='flex';
  document.getElementById('uname').textContent=found.d;
  document.getElementById('gname').textContent=found.d;
  document.getElementById('uav').textContent=found.d[0].toUpperCase();
  document.getElementById('cnt-sdki').textContent=SDKI.length;
  document.getElementById('cnt-siki').textContent=SIKI.length;
  document.getElementById('cnt-slki').textContent=SLKI.length;
  buildGrids();
}
document.getElementById('lp').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
document.getElementById('lu').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('lp').focus();});

function doLogout(){
  curUser=null;
  document.getElementById('ls').style.display='flex';
  document.getElementById('app').style.display='none';
  document.getElementById('ibtn').style.display='none';
  ['lu','lp'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('lerr').textContent='';
  clearSearch();
}

function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sitem').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  const n=document.getElementById('nav-'+name);
  if(n)n.classList.add('active');
  document.querySelector('.carea').scrollTop=0;
}

let stimer=null;
function handleSearch(val){
  const q=val.toLowerCase().trim();
  document.getElementById('scl').style.display=q?'block':'none';
  clearTimeout(stimer);
  stimer=setTimeout(()=>runSearch(q),220);
}
function clearSearch(){
  document.getElementById('si').value='';
  document.getElementById('ssug').textContent='';
  document.getElementById('scl').style.display='none';
  document.getElementById('sres').innerHTML='';
  document.getElementById('srlbl').style.display='none';
  lastQ='';
}
function submitSearch(){
  const q=document.getElementById('si').value.toLowerCase().trim();
  if(q)runSearch(q,true);
}
function runSearch(q,force=false){
  if(!q){clearSearch();return;}
  lastQ=q;
  let translated='';
  for(const[en,id] of Object.entries(TRANS)){if(q.includes(en)){translated=id;break;}}
  document.getElementById('ssug').textContent=translated?'💡 Mungkin yang Anda cari: "'+translated.split(' ')[0]+'"':'';
  const eQ=translated?translated:q;
  const results=searchDx(eQ);
  renderSidebarRes(results);
  if(force||results.length>0){renderSearchPage(results,eQ,q);showPage('search');}
}
function searchDx(q){
  const ws=q.split(/\s+/).filter(w=>w.length>1);
  return SDKI.filter(dx=>{
    const hay=[dx.name,dx.def,dx.kat,dx.type,...dx.kw,...dx.mds,...dx.mdo,...dx.nds,...dx.ndo,...dx.faktor].join(' ').toLowerCase();
    return ws.some(w=>hay.includes(w));
  });
}
function getMatched(dx,q){
  const ws=q.split(/\s+/).filter(w=>w.length>1);
  return [...dx.mds,...dx.mdo,...dx.nds,...dx.ndo].filter(k=>ws.some(w=>k.toLowerCase().includes(w))).slice(0,4);
}
function renderSidebarRes(results){
  const el=document.getElementById('sres'),lbl=document.getElementById('srlbl');
  lbl.style.display='block';
  if(!results.length){el.innerHTML='<div style="font-size:12px;color:var(--t3);padding:4px 8px">Tidak ditemukan.</div>';return;}
  el.innerHTML=results.map(dx=>`<div class="sri" onclick="openDx('${dx.code}')"><span class="src">${dx.code}</span><span class="srn">${dx.name}</span></div>`).join('');
}
function renderSearchPage(results,eQ,orgQ){
  const sa=document.getElementById('srarea'),da=document.getElementById('detarea');
  da.innerHTML='';
  if(!results.length){sa.innerHTML='<div class="empty"><div class="ei">🔍</div><div class="et">Tidak Ada Hasil</div><div class="es">Coba kata kunci lain seperti nama gejala, diagnosa, atau istilah medis.</div></div>';return;}
  const multi=results.length>1?`<div class="multiinfo">⚠ Ditemukan <strong>${results.length} diagnosa</strong> yang cocok dengan "<strong>${orgQ}</strong>". Klik salah satu untuk melihat detail lengkap.</div>`:'';
  sa.innerHTML=`<div class="srhead"><div class="srtit">Hasil Pencarian</div><div class="srcnt">${results.length} diagnosa ditemukan untuk "<strong>${orgQ}</strong>"</div></div>${multi}<div class="srgrid">${results.map(dx=>{
    const m=getMatched(dx,eQ);
    const tags=[...dx.mds.slice(0,2),...dx.mdo.slice(0,2)];
    return `<div class="srcard" id="src-${dx.code}" onclick="openDx('${dx.code}')"><div class="srtop"><span class="srcbadge">${dx.code}</span><div class="srinfo"><div class="srname">${dx.name}</div><div class="srmeta">${dx.kat} · ${dx.type}</div>${m.length?`<div class="srmatch">Cocok: ${m.slice(0,2).join(', ')}</div>`:''}<div class="srtags">${tags.map(t=>`<span class="srtag ${m.includes(t)?'m':''}">${t.substring(0,28)}${t.length>28?'…':''}</span>`).join('')}</div></div></div><div class="srfoot">📖 Klik untuk detail lengkap ›</div></div>`;
  }).join('')}</div>`;
}
function openDx(code){
  const dx=SDKI.find(d=>d.code===code);
  if(!dx)return;
  showPage('search');
  document.querySelectorAll('.srcard').forEach(c=>c.classList.remove('sel'));
  const sc=document.getElementById('src-'+code);
  if(sc){sc.classList.add('sel');sc.scrollIntoView({behavior:'smooth',block:'nearest'});}
  const rSIKI=SIKI.filter(s=>s.dx.includes(code));
  const rSLKI=SLKI.filter(s=>s.dx.includes(code));
  const m=lastQ?getMatched(dx,lastQ):[];
  document.getElementById('detarea').innerHTML=buildDetail(dx,rSIKI,rSLKI,m);
  document.getElementById('detarea').scrollIntoView({behavior:'smooth',block:'start'});
}
function buildDetail(dx,rSIKI,rSLKI,matched){
  const tc=dx.type==='Aktual'?'ta':dx.type==='Risiko'?'tr':'tp';
  const criteriaHtml=dx.type!=='Risiko'?`<div style="margin-top:14px"><div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Tanda & Gejala — Kriteria Diagnostik</div><div class="cgrid"><div class="cbox"><h4 class="mh">🔴 Mayor <small style="font-weight:400;color:var(--t3)">(≥80% kasus)</small></h4><div class="csub">Subjektif (DS)</div><ul class="clist">${dx.mds.length?dx.mds.map(k=>`<li class="ml">${k}</li>`).join(''):`<li class="eli">—</li>`}</ul><div class="csub">Objektif (DO)</div><ul class="clist">${dx.mdo.length?dx.mdo.map(k=>`<li class="ml">${k}</li>`).join(''):`<li class="eli">—</li>`}</ul></div><div class="cbox"><h4 class="nh">🟡 Minor <small style="font-weight:400;color:var(--t3)">(<80% kasus)</small></h4><div class="csub">Subjektif (DS)</div><ul class="clist">${dx.nds.length?dx.nds.map(k=>`<li class="nl">${k}</li>`).join(''):`<li class="eli">—</li>`}</ul><div class="csub">Objektif (DO)</div><ul class="clist">${dx.ndo.length?dx.ndo.map(k=>`<li class="nl">${k}</li>`).join(''):`<li class="eli">—</li>`}</ul></div></div></div>`:'<div style="margin-top:12px;padding:10px;background:var(--ol);border-radius:6px;font-size:12px;color:var(--orange)">ℹ️ Diagnosa risiko tidak memiliki tanda dan gejala; ditegakkan berdasarkan faktor risiko yang ada.</div>';
  const fCols=dx.faktor.length>4?`<div class="fgrid">${dx.faktor.map(f=>`<div class="fitem">${f}</div>`).join('')}</div>`:`<ul class="clist">${dx.faktor.map(f=>`<li style="border-bottom:1px solid var(--border)">${f}</li>`).join('')}</ul>`;
  const siHtml=rSIKI.length?rSIKI.map(s=>`<div class="skicard"><div class="skichead"><span class="scode">${s.code}</span><span class="sname">${s.name}</span></div><div class="sdef">${s.def}</div><div class="agrid"><div class="ag ag-o"><h5>👁 Observasi</h5><ul>${s.obs.map(a=>`<li>${a}</li>`).join('')}</ul></div><div class="ag ag-t"><h5>🤝 Terapeutik</h5><ul>${s.ter.map(a=>`<li>${a}</li>`).join('')}</ul></div><div class="ag ag-e"><h5>📚 Edukasi</h5><ul>${s.edu.map(a=>`<li>${a}</li>`).join('')}</ul></div><div class="ag ag-k"><h5>🔗 Kolaborasi</h5><ul>${s.kol.length?s.kol.map(a=>`<li>${a}</li>`).join(''):'<li>Sesuai kondisi klinis</li>'}</ul></div></div></div>`).join(''):`<div class="empty" style="padding:24px"><div class="ei">⚕️</div><div class="es">SIKI untuk diagnosa ini belum tersedia.</div></div>`;
  const slHtml=rSLKI.length?rSLKI.map(s=>{
    const ec=s.eks==='Meningkat'?'em':s.eks==='Menurun'?'ed':'eb2';
    const sc3=s.kr.slice(0,3).map((k,i)=>`${i+1}. ${k.n} (${k.s.split('→')[1].trim()})`).join('<br>');
    return `<div class="slkicard"><div class="slkichead"><span class="slkicode">${s.code}</span><span class="slkiname">${s.name}</span><span class="eb ${ec}">${s.eks}</span></div><div class="slkidef">${s.def}</div><div style="font-size:11px;font-weight:700;color:var(--t3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.7px">Format Penulisan Dokumentasi:</div><div class="slkifmt">Setelah dilakukan intervensi keperawatan selama <u>…×… jam</u>, maka <strong>${s.name}</strong> <em>${s.eks}</em>, dengan kriteria hasil:<br>${sc3}<br>…</div><table class="ctbl"><thead><tr><th>Kriteria Hasil</th><th>Kondisi Saat Ini → Target</th></tr></thead><tbody>${s.kr.map(k=>`<tr><td>${k.n}</td><td>${k.s}</td></tr>`).join('')}</tbody></table></div>`;
  }).join(''):`<div class="empty" style="padding:24px"><div class="ei">🎯</div><div class="es">SLKI untuk diagnosa ini belum tersedia.</div></div>`;
  return `<div class="detpanel"><button class="backbtn" onclick="scrollToSR()">← Kembali ke hasil pencarian</button><div class="dhead"><div class="dcodrow"><span class="dcbadge">${dx.code}</span><span class="tchip ${tc}">${dx.type}</span><span class="tchip tk">${dx.kat}</span></div><div class="dtit">${dx.name}</div>${matched.length?`<div class="dmatch">💡 Ditemukan berdasarkan: ${matched.slice(0,3).join(', ')}</div>`:''}</div>
  <div class="sbox"><div class="shead h1" onclick="tSec('sb1','st1')">📋 Standar Diagnosis Keperawatan (SDKI) — ${dx.code}<span class="schev o" id="st1">▲</span></div><div class="sbody" id="sb1"><div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Definisi</div><div class="deftxt">${dx.def}</div>${criteriaHtml}<div class="fsec"><h4>Faktor ${dx.type==='Risiko'?'Risiko':'Penyebab / Etiologi'}</h4>${fCols}</div></div></div>
  <div class="sbox"><div class="shead h2" onclick="tSec('sb2','st2')">⚕️ Standar Intervensi Keperawatan (SIKI)<span class="schev o" id="st2">▲</span></div><div class="sbody" id="sb2">${siHtml}</div></div>
  <div class="sbox"><div class="shead h3" onclick="tSec('sb3','st3')">🎯 Standar Luaran Keperawatan (SLKI)<span class="schev o" id="st3">▲</span></div><div class="sbody" id="sb3">${slHtml}</div></div>
  <div class="sbox"><div class="shead h4" onclick="tSec('sb4','st4')">🏷️ Diagnosa Medis Terkait (ICD-10)<span class="schev o" id="st4">▲</span></div><div class="sbody" id="sb4"><div style="font-size:12px;color:var(--t3);margin-bottom:12px">Kode ICD-10 yang umumnya berkaitan dengan <strong>${dx.name}</strong>:</div><ul class="icdlist">${dx.icd.map(i=>`<div class="icditem"><span class="icdcode">${i.c}</span><span class="icdname">${i.n}</span></div>`).join('')}</ul></div></div>
  <div class="sbox"><div class="shead h5" onclick="tSec('sb5','st5')">📝 Contoh Kasus Narasi Klinis<span class="schev o" id="st5">▲</span></div><div class="sbody" id="sb5"><div class="casebox">${dx.kasus}</div></div></div>
  </div>`;
}
function tSec(bid,tid){
  const b=document.getElementById(bid),t=document.getElementById(tid);
  b.classList.toggle('col');
  t.textContent=b.classList.contains('col')?'▼':'▲';
  t.classList.toggle('o',!b.classList.contains('col'));
}
function scrollToSR(){document.getElementById('srarea').scrollIntoView({behavior:'smooth'});}
// ... (kode data SDKI, SIKI, SLKI, dll tetap ada di atas)

  // 1. FUNGSI YANG DIPERBARUI (Timpa yang lama)
  function buildGrids(){
    // Grid SDKI (Tetap)
    document.getElementById('sdki-grid').innerHTML = SDKI.map(dx => 
      `<div class="bcard" onclick="openDx('${dx.code}')"><span class="bcode bs-sdki">${dx.code}</span><div class="bname">${dx.name}</div><div class="bmeta">${dx.kat} · ${dx.type}</div></div>`
    ).join('');
    
    // Grid SIKI (Sudah diperbarui dengan onclick)
    document.getElementById('siki-grid').innerHTML = SIKI.map(s => 
    `<div class="bcard" onclick="openSiki('${s.code}')"><span class="bcode bs-siki">${s.code}</span><div class="bname">${s.name}</div><div class="bmeta">Terkait: ${Array.isArray(s.dx) ? s.dx.join(', ') : s.dx}</div></div>`
  ).join('');
    
    // Grid SLKI (Sudah diperbarui dengan onclick)
    document.getElementById('slki-grid').innerHTML = SLKI.map(s => 
      `<div class="bcard" onclick="openSlki('${s.code}')"><span class="bcode bs-slki">${s.code}</span><div class="bname">${s.name}</div><div class="bmeta">Terkait: ${Array.isArray(s.dx) ? s.dx.join(', ') : s.dx}</div></div>`
    ).join('');
  }

  // 2. TAMBAHKAN FUNGSI BARU DI BAWAHNYA
  function openSiki(code) {
const siki = SIKI.find(s => s.code === code);
  if(!siki) return;
  
  // Helper untuk merender list tindakan keperawatan
  const renderList = (data) => {
    if(!data) return '<li>-</li>';
    if(Array.isArray(data)) return data.map(item => `<li>${item}</li>`).join('');
    return `<li>${data}</li>`; // jika sudah berupa string/HTML langsung dimasukkan
  };

  let html = `
    <div class="sr-header">
      <span class="bcode bs-siki">${siki.code}</span>
      <h2 style="margin-top:10px;">${siki.name}</h2>
      <div style="margin-top:5px; color:var(--t2); font-size:0.9rem;">Intervensi Keperawatan (SIKI)</div>
    </div>
    <div class="sr-body" style="margin-top:15px;">
      <div class="sbox">
        <div class="shead h5" onclick="tSec('sk-def','st-def')">📝 Definisi Intervensi<span class="schev o" id="st-def">▲</span></div>
        <div class="sbody" id="sk-def">${siki.def || siki.definisi || '-'}</div>
      </div>
      
      <div class="sbox">
        <div class="shead h5" onclick="tSec('sk-tindakan','st-tindakan')">📋 Tindakan Keperawatan<span class="schev o" id="st-tindakan">▲</span></div>
        <div class="sbody" id="sk-tindakan">
          <p style="color:var(--accent); font-weight:bold; margin-bottom:5px;">Observasi:</p>
          <ul style="padding-left:20px; margin-bottom:15px;">${renderList(siki.obs || siki.observasi)}</ul>
          
          <p style="color:var(--green); font-weight:bold; margin-bottom:5px;">Terapeutik:</p>
          <ul style="padding-left:20px; margin-bottom:15px;">${renderList(siki.ter || siki.terapeutik)}</ul>
          
          <p style="color:var(--orange); font-weight:bold; margin-bottom:5px;">Edukasi:</p>
          <ul style="padding-left:20px; margin-bottom:15px;">${renderList(siki.edu || siki.edukasi)}</ul>
          
          <p style="color:var(--purple); font-weight:bold; margin-bottom:5px;">Kolaborasi:</p>
          <ul style="padding-left:20px;">${renderList(siki.kol || siki.kolaborasi)}</ul>
        </div>
      </div>

      <div class="sbox">
        <div class="shead h5" onclick="tSec('sk-dx','st-dx')">🔗 Tautan Diagnosis (SDKI Terkait)<span class="schev o" id="st-dx">▲</span></div>
        <div class="sbody" id="sk-dx">
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${siki.dx ? (Array.isArray(siki.dx) ? siki.dx : [siki.dx]).map(d => `<span class="bcode bs-sdki" style="cursor:pointer;" onclick="openDx('${d}')">${d}</span>`).join('') : '-'}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('srarea').innerHTML = html;
  scrollToSR();
  }

  function openSlki(code) {
const slki = SLKI.find(s => s.code === code);
  if(!slki) return;

  const renderList = (data) => {
    if(!data) return '<li>-</li>';
    if(Array.isArray(data)) return data.map(item => `<li>${item}</li>`).join('');
    return `<li>${data}</li>`;
  };

  let html = `
    <div class="sr-header">
      <span class="bcode bs-slki">${slki.code}</span>
      <h2 style="margin-top:10px;">${slki.name}</h2>
      <div style="margin-top:5px; color:var(--t2); font-size:0.9rem;">Luaran Keperawatan (SLKI)</div>
    </div>
    <div class="sr-body" style="margin-top:15px;">
      <div class="sbox">
        <div class="shead h5" onclick="tSec('sl-def','st-def')">📝 Definisi & Ekspektasi<span class="schev o" id="st-def">▲</span></div>
        <div class="sbody" id="sl-def">
          <p><b>Definisi:</b> ${slki.def || slki.definisi || '-'}</p>
          <p style="margin-top:8px;"><b>Ekspektasi:</b> <span style="color:var(--green); font-weight:bold;">${slki.eks || slki.ekspektasi || '-'}</span></p>
        </div>
      </div>
      
      <div class="sbox">
        <div class="shead h5" onclick="tSec('sl-kh','st-kh')">📊 Kriteria Hasil & Indikator<span class="schev o" id="st-kh">▲</span></div>
        <div class="sbody" id="sl-kh">
          <ul style="padding-left:20px;">${renderList(slki.kh || slki.kriteria_hasil || slki.kriteria)}</ul>
        </div>
      </div>

      <div class="sbox">
        <div class="shead h5" onclick="tSec('sl-dx','st-dx')">🔗 Tautan Diagnosis (SDKI Terkait)<span class="schev o" id="st-dx">▲</span></div>
        <div class="sbody" id="sl-dx">
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${slki.dx ? (Array.isArray(slki.dx) ? slki.dx : [slki.dx]).map(d => `<span class="bcode bs-sdki" style="cursor:pointer;" onclick="openDx('${d}')">${d}</span>`).join('') : '-'}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('srarea').innerHTML = html;
  scrollToSR();
  }

  // ... (kode fungsi tSec dan lainnya tetap di bawah)
function openInfo(){document.getElementById('iov').classList.toggle('open');}
function closeIov(e){if(e.target===document.getElementById('iov'))openInfo();}
</script>
