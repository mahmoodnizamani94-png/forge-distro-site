/**
 * Forge Distro — Motion (FR-8/9) + Data Layer (FR-2–5)
 * ES2022 module · ≤ 20 KB · zero innerHTML · zero hardcoded repo refs
 */
const MQ=matchMedia('(prefers-reduced-motion: reduce)');
let noMo=MQ.matches;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>r.querySelectorAll(s);
document.documentElement.classList.add('js-enabled');

/* CSP-compliant font loading — replaces inline onload="this.media='all'" */
const fl=document.getElementById('gfonts-preload');
if(fl){const ls=document.createElement('link');ls.rel='stylesheet';ls.href=fl.href;document.head.appendChild(ls)}

/* Nav blur */
const hdr=$('.site-header');
let ns=false;
const onS=()=>{const s=scrollY>48;if(s!==ns){ns=s;hdr.classList.toggle('nav--scrolled',s)}};
addEventListener('scroll',onS,{passive:true});onS();

/* Hero entry */
const hc=$$('.hero-copy > *'),tw=$('.terminal-window');
const show=el=>el?.classList.add('is-visible');
if(noMo){hc.forEach(show);show(tw)}else requestAnimationFrame(()=>{hc.forEach(show);show(tw)});

/* Feature cards IO */
const fc=$$('.feature-card');let cr=0;
if(noMo)fc.forEach(c=>c.classList.add('is-visible'));
else{const io=new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;const c=e.target;c.classList.add('is-visible');io.unobserve(c);if(++cr>=fc.length)io.disconnect()})},{threshold:0.15,rootMargin:'0px 0px -40px 0px'});fc.forEach(c=>io.observe(c))}

/* Terminal typewriter */
const tb=$('#terminal-body'),tc=tb?.querySelector('code'),SF=tc?.textContent??'';
const L=[['C','$ forge analyze pixel-9p-march-2026-ota.zip'],['S','► FORMAT        payload.bin (A/B Full OTA)'],['S','► DEVICE        Pixel 9 Pro — BP1A.250305.019'],['S','► SECURITY      2026-03-05'],['S','► TIER          SUPPORTED'],['S','► PARTITIONS    34 detected (6 extractable)'],['B',200],['C','$ forge extract boot.img init_boot.img'],['P'],['B',150],['R','✓ boot.img         SHA-256 verified  [31.4 MB]'],['R','✓ init_boot.img    SHA-256 verified  [ 8.1 MB]'],['D','─'],['Y','Ready. 2 artifacts exported to /storage/OTA/']];
let ac=null;
const sl=(ms,sig)=>new Promise((res,rej)=>{const id=setTimeout(res,ms);sig?.addEventListener('abort',()=>{clearTimeout(id);rej()},{once:true})});
async function typ(t,txt,ms,sig){for(const ch of txt){if(sig?.aborted)return;t.textContent+=ch;await sl(ms,sig)}}
async function prog(t,sig){const n=23,f=Math.round(n*0.88),d=1200/f;t.textContent+='⋮ [';for(let i=0;i<f;i++){if(sig?.aborted)return;t.textContent+='█';await sl(d,sig)}t.textContent+='░'.repeat(n-f)+'] 88% — boot.img'}
async function run(sig){if(!tc)return;tc.textContent='';for(let i=0;i<L.length;i++){if(sig?.aborted)return;const[k,v]=L[i];if(i>0)tc.textContent+='\n';if(k==='C')await typ(tc,v,28,sig);else if(k==='S'){await sl(80,sig);tc.textContent+=v}else if(k==='B')await sl(v,sig);else if(k==='P')await prog(tc,sig);else if(k==='R'){await sl(100,sig);tc.textContent+=v}else if(k==='D'){await sl(150,sig);tc.textContent+=v}else if(k==='Y'){await sl(200,sig);tc.textContent+=v}}}
async function loop(){while(!noMo){ac=new AbortController();try{await run(ac.signal);await sl(4000,ac.signal)}catch{return}}}
function stop(){ac?.abort();if(tc)tc.textContent=SF}
MQ.addEventListener('change',e=>{noMo=e.matches;if(noMo)stop();else loop()});
if(!noMo&&tb)loop();

/* ═══════════════════════════════════════
   DATA LAYER — FR-2 through FR-5
   ═══════════════════════════════════════ */

const OWNER=$('meta[name="forge:repo-owner"]')?.getAttribute('content')??'';
const REPO=$('meta[name="forge:repo-name"]')?.getAttribute('content')??'';
const REL_URL=`https://github.com/${OWNER}/${REPO}/releases`;
const API=`https://api.github.com/repos/${OWNER}/${REPO}`;
const CK='forge-release-cache',CLK='forge-changelog-cache',TTL=3e5,TMO=8e3;

/* DOM refs */
const els={
  sk:$('#release-skeleton'),st:$('#release-status'),
  rd:$('#release-data'),rv:$('#release-version'),
  rdt:$('#release-date'),rs:$('#release-size'),
  hb:$('#hash-block'),hv:$('#hash-value'),hc:$('#hash-copy-btn'),
  dc:$('#download-cta'),rdc:$('#release-download-cta'),
  vb:$('#version-badge'),fv:$('#footer-version'),
  csk:$('#changelog-skeleton'),cst:$('#changelog-status'),
  ce:$('#changelog-entries'),sr:$('#sr-announcements')
};

function announce(m){if(!els.sr)return;els.sr.textContent=m;setTimeout(()=>{els.sr.textContent=''},3e3)}

/* Fetch + AbortController (Rule #10) */
async function apiFetch(url){
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),TMO);
  try{const r=await fetch(url,{signal:ctrl.signal,headers:{Accept:'application/vnd.github+json'}});clearTimeout(tid);return r}
  catch(e){clearTimeout(tid);throw e}
}

/* Cache (sessionStorage, 5-min TTL) */
function getC(k){try{const r=sessionStorage.getItem(k);if(!r)return null;const p=JSON.parse(r);if(!p||typeof p.t!=='number'||!p.d)return null;if(Date.now()-p.t>TTL){sessionStorage.removeItem(k);return null}return p.d}catch{return null}}
function setC(k,d){try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d}))}catch{console.warn('[forge] sessionStorage write failed')}}

/* Validation (Rule #11) */
function validR(r){return r&&typeof r.tag_name==='string'&&typeof r.published_at==='string'&&Array.isArray(r.assets)}
function findApk(a){if(!Array.isArray(a))return null;const f=a.filter(x=>x&&typeof x.name==='string'&&x.name.endsWith('.apk'));if(f.length>1)console.warn('[forge] Multiple APK assets — using first');return f[0]||null}
function getHash(b){if(typeof b!=='string')return null;const m=b.match(/SHA-256:\s+([a-fA-F0-9]{64})/);return m?m[1]:null}
function fmtDate(iso){try{return new Date(iso).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}catch{return iso}}
function fmtSize(b){return typeof b==='number'&&b>0?(b/1048576).toFixed(1)+' MB':'Unknown'}

/* Strip markdown */
function stripMd(t){
  if(typeof t!=='string')return '';
  return t.replace(/^#{1,6}\s+/gm,'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/\*(.+?)\*/g,'$1')
    .replace(/__(.+?)__/g,'$1').replace(/_(.+?)_/g,'$1').replace(/~~(.+?)~~/g,'$1')
    .replace(/`(.+?)`/g,'$1').replace(/^\s*[-*+]\s/gm,'• ').replace(/^\s*\d+\.\s/gm,'• ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/!\[([^\]]*)\]\([^)]+\)/g,'').trim()
}

/* Terminal message (createElement only — zero innerHTML) */
function tMsg(type,icon,msg,lnkTxt,lnkHref){
  const c=document.createElement('div');c.className=`terminal-message terminal-message-${type}`;c.setAttribute('role','alert');
  const i=document.createElement('span');i.className='terminal-message-icon';i.textContent=icon;c.appendChild(i);
  const m=document.createElement('span');m.className='terminal-message-text';m.textContent=msg+' ';c.appendChild(m);
  if(lnkTxt&&lnkHref){const a=document.createElement('a');a.href=lnkHref;a.target='_blank';a.rel='noopener noreferrer';a.className='terminal-message-link';a.textContent=lnkTxt;c.appendChild(a)}
  return c
}

/* Skeleton show/hide */
function showSk(){[els.sk,els.st,els.csk,els.cst].forEach(e=>{if(e)e.hidden=false})}
function hideSk(){[els.sk,els.st,els.csk,els.cst].forEach(e=>{if(e)e.hidden=true})}

/* CTA states (FR-3) */
function ctaSet(el,txt,href,attrs){
  if(!el)return;
  el.textContent=txt;
  if(href)el.setAttribute('href',href);
  el.removeAttribute('aria-busy');el.removeAttribute('aria-disabled');
  for(const[k,v]of Object.entries(attrs||{})){if(v===null)el.removeAttribute(k);else el.setAttribute(k,v)}
}

function ctaIdle(){
  if(els.dc){els.dc.textContent='Fetching latest…';els.dc.setAttribute('aria-busy','true');els.dc.setAttribute('aria-disabled','true');els.dc.classList.add('is-loading');els.dc.removeAttribute('download')}
  if(els.rdc){els.rdc.textContent='Fetching latest…';els.rdc.setAttribute('aria-busy','true');els.rdc.setAttribute('aria-disabled','true')}
}

function ctaReady(tag,sz,url,name){
  const lbl=`Download ${tag} (${sz})`;
  ctaSet(els.dc,lbl,url,{download:name,target:null,rel:null,'aria-label':`Download Forge OTA Lab ${tag}`});
  if(els.dc)els.dc.classList.remove('is-loading');
  ctaSet(els.rdc,lbl,url,{download:name,target:null,rel:null})
}

function ctaErr(){
  const h=`${REL_URL}/latest`;
  ctaSet(els.dc,'Download from GitHub →',h,{target:'_blank',rel:'noopener noreferrer',download:null,'aria-label':'Download Forge OTA Lab from GitHub Releases'});
  if(els.dc)els.dc.classList.remove('is-loading');
  ctaSet(els.rdc,'Download from GitHub →',h,{target:'_blank',rel:'noopener noreferrer',download:null})
}

function ctaNoRel(){
  if(els.dc){els.dc.textContent='No releases yet — check back soon.';els.dc.removeAttribute('aria-busy');els.dc.classList.remove('is-loading','download-cta');els.dc.classList.replace('btn-primary','btn-secondary');els.dc.setAttribute('href',REL_URL);els.dc.setAttribute('target','_blank');els.dc.setAttribute('rel','noopener noreferrer');els.dc.removeAttribute('download')}
  if(els.rdc)els.rdc.hidden=true
}

/* Populate release (FR-2) */
function popRelease(r){
  const tag=r.tag_name,date=fmtDate(r.published_at),apk=findApk(r.assets),hash=getHash(r.body);
  if(els.vb)els.vb.textContent=`${tag} — Latest Release`;
  if(els.fv)els.fv.textContent=`Current: ${tag}`;
  if(els.rv)els.rv.textContent=tag;
  if(els.rdt)els.rdt.textContent=date;
  if(apk){
    const sz=fmtSize(apk.size);
    if(els.rs)els.rs.textContent=sz;
    ctaReady(tag,sz,apk.browser_download_url,apk.name)
  }else{
    if(els.rs)els.rs.textContent='N/A';ctaErr();
    if(els.rdc){els.rdc.textContent='APK not available in this release';els.rdc.classList.replace('btn-primary','btn-secondary');els.rdc.setAttribute('href',`${REL_URL}/tag/${tag}`)}
    console.warn('[forge] No APK asset found in latest release')
  }
  if(hash){
    if(els.hb)els.hb.hidden=false;
    if(els.hv){els.hv.textContent=hash.slice(0,8)+'…'+hash.slice(-8);els.hv.setAttribute('data-full-hash',hash);els.hv.setAttribute('title',hash)}
  }else{if(els.hb)els.hb.hidden=true}
  hideSk();if(els.rd)els.rd.hidden=false;
  announce(`Release ${tag} loaded. Released ${date}.`);
  console.log(`[forge] Release data loaded: ${tag}`)
}

/* Error states */
function relErr(status,rl){
  hideSk();const rc=$('#release-card');if(!rc)return;
  if(els.rd)els.rd.hidden=true;if(els.hb)els.hb.hidden=true;
  const msg=rl?'Could not load release data. GitHub API may be rate-limited.':'ERR: API_TIMEOUT — Could not load latest release.';
  rc.appendChild(tMsg('warning','⚠',msg,'View releases on GitHub →',`${REL_URL}/latest`));
  ctaErr();if(els.vb)els.vb.textContent='Latest Release';
  announce('Could not load release data. Visit GitHub for downloads.');
  console.error(`[forge] API error: ${status}`)
}

function noRel(){
  hideSk();const rc=$('#release-card');if(!rc)return;
  if(els.rd)els.rd.hidden=true;if(els.hb)els.hb.hidden=true;
  rc.appendChild(tMsg('info','ℹ',"Development in progress. The first release hasn't landed yet.",'Watch the repo for updates →',`https://github.com/${OWNER}/${REPO}`));
  ctaNoRel();if(els.vb)els.vb.textContent='Coming Soon';
  announce("No releases yet. The first release hasn't landed.");console.log('[forge] No releases found')
}

/* Accordion (FR-5) */
function buildAcc(releases){
  if(!els.ce)return;
  while(els.ce.firstChild)els.ce.removeChild(els.ce.firstChild);
  if(!releases.length){
    els.ce.appendChild(tMsg('info','ℹ','Changelog unavailable.','View full release history on GitHub →',REL_URL));
    els.ce.hidden=false;return
  }
  const hdrs=[];
  releases.forEach((r,i)=>{
    if(!validR(r))return;
    const tag=r.tag_name,date=fmtDate(r.published_at),body=r.body?stripMd(r.body):'',first=i===0;
    const eid=`changelog-entry-${i}`,cid=`changelog-content-${i}`;
    const entry=document.createElement('div');entry.className='changelog-entry';entry.setAttribute('aria-expanded',first?'true':'false');entry.id=eid;
    const hdr=document.createElement('button');hdr.type='button';hdr.className='changelog-entry-header';hdr.setAttribute('aria-expanded',first?'true':'false');hdr.setAttribute('aria-controls',cid);hdr.id=`${eid}-header`;
    const vs=document.createElement('span');vs.className='changelog-entry-version';vs.textContent=tag;hdr.appendChild(vs);
    const ds=document.createElement('span');ds.className='changelog-entry-date';ds.textContent=date;hdr.appendChild(ds);
    const ts=document.createElement('span');ts.className='changelog-entry-toggle';ts.setAttribute('aria-hidden','true');ts.textContent='▼';hdr.appendChild(ts);
    entry.appendChild(hdr);hdrs.push(hdr);
    const ct=document.createElement('div');ct.className='changelog-entry-content';ct.id=cid;ct.setAttribute('role','region');ct.setAttribute('aria-labelledby',`${eid}-header`);
    const inn=document.createElement('div');inn.className='changelog-entry-content-inner';
    const bd=document.createElement('div');bd.className='changelog-entry-body';bd.textContent=body||'No changelog provided.';
    inn.appendChild(bd);ct.appendChild(inn);entry.appendChild(ct);els.ce.appendChild(entry)
  });
  els.ce.hidden=false;
  function toggle(th){
    const te=th.closest('.changelog-entry'),exp=th.getAttribute('aria-expanded')==='true';
    hdrs.forEach(h=>{const e=h.closest('.changelog-entry');h.setAttribute('aria-expanded','false');if(e)e.setAttribute('aria-expanded','false')});
    if(!exp){th.setAttribute('aria-expanded','true');if(te)te.setAttribute('aria-expanded','true')}
  }
  hdrs.forEach(h=>h.addEventListener('click',()=>toggle(h)));
  hdrs.forEach((h,i)=>h.addEventListener('keydown',e=>{
    let t=null;
    switch(e.key){
      case'ArrowDown':e.preventDefault();t=hdrs[(i+1)%hdrs.length];break;
      case'ArrowUp':e.preventDefault();t=hdrs[(i-1+hdrs.length)%hdrs.length];break;
      case'Home':e.preventDefault();t=hdrs[0];break;
      case'End':e.preventDefault();t=hdrs[hdrs.length-1];break;
      case'Enter':case' ':e.preventDefault();toggle(h);return;
      default:return
    }
    if(t)t.focus()
  }))
}

function clErr(){
  hideSk();if(!els.ce)return;
  while(els.ce.firstChild)els.ce.removeChild(els.ce.firstChild);
  els.ce.appendChild(tMsg('warning','⚠','Changelog unavailable.','View full release history on GitHub →',REL_URL));
  els.ce.hidden=false
}

/* Clipboard (FR-4) */
function initClip(){
  if(!els.hc||!els.hv)return;
  if(!navigator.clipboard?.writeText){
    els.hc.textContent='Unavailable';els.hc.disabled=true;
    els.hc.setAttribute('title',els.hv.getAttribute('data-full-hash')||'');return
  }
  els.hc.addEventListener('click',async()=>{
    const h=els.hv.getAttribute('data-full-hash');if(!h)return;
    try{
      await navigator.clipboard.writeText(h);
      els.hc.textContent='Copied ✓';els.hc.classList.add('is-copied');
      announce('Hash copied to clipboard');console.log('[forge] SHA-256 hash copied to clipboard');
      setTimeout(()=>{els.hc.textContent='Copy';els.hc.classList.remove('is-copied')},2e3)
    }catch{
      els.hc.textContent='Copy failed — select manually';console.error('[forge] Clipboard write failed');
      setTimeout(()=>{els.hc.textContent='Copy'},3e3)
    }
  })
}

/* Fetchers */
async function fetchRel(){
  const cd=getC(CK);
  if(cd){console.log('[forge] Using cached release data');try{if(validR(cd)){popRelease(cd);return}}catch{}}
  try{
    const r=await apiFetch(`${API}/releases/latest`);
    if(r.status===404){noRel();return}
    if(r.status===403){relErr(403,true);return}
    if(!r.ok){relErr(r.status,false);return}
    const d=await r.json();
    if(!validR(d)){relErr('MALFORMED',false);return}
    setC(CK,d);popRelease(d)
  }catch(e){relErr(e.name==='AbortError'?'TIMEOUT':e.message,false)}
}

async function fetchCL(){
  const cd=getC(CLK);
  if(cd){console.log('[forge] Using cached changelog data');try{if(Array.isArray(cd)&&cd.length>0){buildAcc(cd);return}}catch{}}
  try{
    const r=await apiFetch(`${API}/releases?per_page=3`);
    if(!r.ok){clErr();console.error(`[forge] Changelog API error: ${r.status}`);return}
    const d=await r.json();
    if(!Array.isArray(d)){clErr();return}
    if(!d.length){buildAcc([]);return}
    setC(CLK,d);buildAcc(d)
  }catch(e){clErr();console.error(`[forge] Changelog API error: ${e.name==='AbortError'?'TIMEOUT':e.message}`)}
}

/* Init */
async function init(){
  if(!OWNER||!REPO||OWNER==='{OWNER}'||REPO==='{REPO}'){
    console.warn('[forge] Repo config missing or placeholder — skipping API calls');
    showSk();setTimeout(()=>{relErr('CONFIG',false);clErr()},100);return
  }
  showSk();ctaIdle();
  await Promise.allSettled([fetchRel(),fetchCL()]);
  initClip()
}
init();
