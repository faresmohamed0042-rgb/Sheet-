import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,collection,addDoc,deleteDoc,doc,onSnapshot} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {firebaseConfig} from "./firebase-config.js";
const fbApp=initializeApp(firebaseConfig);
const db=initializeFirestore(fbApp,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
const auth=getAuth(fbApp);
const col=collection(db,'returns');

const RAFAH=['ك 37 ل 12','ك 38 ل 12','ك 39 ل 12','ك 226 بب','ك 240 مظلات','ك 38 مظلات','ك 285 بب','ك 99 اهرام','ك 100 اهرام','س 12 اهرام','ك 23 صاعقه','ك 31 صاعقه','ك 53 صاعقه','ك 103 صاعقه'];
const ARISH=['الفوج 1 ح.ح','ل 135 مش ميكا','ك 2 ح.ح','ك 101 ح.ح','قيادة القطاع','قيا ل 12 مش ميكا','ك 20 م.ع','المخابرات','امن الجيش'];
const SPECIAL=['قيادة القطاع','الفوج 1 ح.ح'];
const DN=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pd=s=>new Date(s+'T12:00:00Z');
const iso=d=>d.toISOString().slice(0,10);
const add=(s,n)=>{const d=pd(s);d.setUTCDate(d.getUTCDate()+n);return iso(d)};
const dow=s=>pd(s).getUTCDay();
const dm=s=>{const d=pd(s);return d.getUTCDate()+'/'+(d.getUTCMonth()+1)};
const dmy=s=>dm(s)+'/'+pd(s).getUTCFullYear();
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const ret=r=>add(r.leave,+r.days);
function app(r){if(r.ov)return r.ov;const d=ret(r),w=dow(d);
 return SPECIAL.includes(r.unit)?add(d,w===4?2:1):(w===5?add(d,1):d)}
let rows=[],coll=null,weekStart=null,delArm=null;
function curWeek(){let t=today();if(dow(t)===5)t=add(t,1);return add(t,-((dow(t)+1)%7))}
weekStart=curWeek();
function dash(){
 const days=[0,1,2,3,4,5].map(i=>add(weekStart,i)),t=today(),m={};
 rows.forEach(r=>{const a=app(r);const k=r.unit+'|'+a;m[k]=(m[k]||0)+(+r.count||0)});
 const get=(u,d)=>m[u+'|'+d]||0;
 const rowOf=u=>days.map(d=>get(u,d));
 const sum=a=>a.reduce((x,y)=>x+y,0);
 const tr=(name,vals,cls)=>`<tr class="${cls||''}"><td>${esc(name)}</td>${vals.map((v,i)=>`<td class="${v?'':'z'} ${days[i]===t?'today':''}">${v}</td>`).join('')}<td><b>${sum(vals)}</b></td></tr>`;
 let h=`<tr><th>الوحدة</th>${days.map(d=>`<th>${DN[dow(d)]}<br>${dm(d)}</th>`).join('')}<th>الإجمالي</th></tr>`;
 const grp=(list,label)=>{const rs=list.map(rowOf);h+=list.map((u,i)=>tr(u,rs[i])).join('');
  const s=days.map((_,i)=>sum(rs.map(r=>r[i])));h+=tr(label,s,'sub');return s};
 const a=grp(RAFAH,'إجمالي رفح'),b=grp(ARISH,'إجمالي العريش');
 const tot=a.map((v,i)=>v+b[i]);h+=tr('الإجمالي العام',tot,'tot');
 $('tb').innerHTML=h;
 $('wl').textContent='من '+dmy(days[0])+' إلى '+dmy(days[5])+(weekStart===curWeek()?' (الحالي)':'');
 const up=sum(tot.filter((_,i)=>days[i]>t));
 const all=(d)=>rows.reduce((s,r)=>s+(app(r)===d?+r.count||0:0),0);
 $('kpis').innerHTML=[[sum(tot),'إجمالي عودات الأسبوع'],[all(t),'عودات اليوم'],[all(add(t,1)),'عودات الغد'],[up,'عودات قادمة بالأسبوع']].map(x=>`<div class="kpi"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
}
function isDup(unit,retDate,exceptId){return rows.some(r=>r.id!==exceptId&&r.unit===unit&&ret(r)===retDate)}
function dupIds(){const seen={},d=new Set();rows.forEach(r=>{const k=r.unit+'|'+ret(r);(seen[k]=seen[k]||[]).push(r.id)});
 Object.values(seen).forEach(a=>{if(a.length>1)a.forEach(x=>d.add(x))});return d}
function list(){
 const dups=dupIds();
 const rs=[...rows].sort((a,b)=>(app(b)>app(a)?1:-1)).slice(0,60);
 $('ls').innerHTML=rs.length?rs.map(r=>`<div class="row ${dups.has(r.id)?'dup':''}"><div class="n">${esc(r.count)}</div><div style="flex:1"><b>${esc(r.unit)}</b>${dups.has(r.id)?' ⚠ مكرر':''}<small>نزول ${dm(r.leave)} + ${esc(r.days)} يوم ← عودة ${dmy(ret(r))} · تظهر ${DN[dow(app(r))]} ${dm(app(r))}</small>${r.note?`<small>${esc(r.note)}</small>`:''}</div><button class="del" data-id="${esc(r.id)}">${delArm===r.id?'تأكيد الحذف؟':'حذف'}</button></div>`).join(''):'<p class="note">لا توجد إدخالات بعد</p>';
}
function preview(){
 const u=$('fu').value,l=$('fd').value,y=+$('fy').value,c=+$('fc').value,o=$('fo').value;
 let ok=u&&l&&y>0&&c>0,w='';
 if(l&&y>0){const r={unit:u,leave:l,days:y,ov:o};const rd=ret(r),a=app(r);
  $('pvw').textContent='العودة: '+DN[dow(rd)]+' '+dmy(rd)+' — تظهر في الداشبورد: '+DN[dow(a)]+' '+dmy(a);
  if(isDup(u,rd))w='⚠ مكرر — نفس البند وتاريخ العودة مدخلين من قبل'}
 else $('pvw').textContent='اكتب النزول والمدة لتظهر العودة';
 $('wr').innerHTML=w?`<div class="warn">${w}</div>`:'';
 $('sv').disabled=!ok;
}
$('sv').onclick=async()=>{
 const d={unit:$('fu').value,leave:$('fd').value,days:+$('fy').value,count:+$('fc').value,ov:$('fo').value||'',note:$('fn').value.trim()};
 $('sv').disabled=true;
 try{
  addDoc(col,d).catch(e=>{$('st').textContent='تعذر الحفظ: '+(e.code||'')})
  ['fy','fc','fo','fn'].forEach(i=>$(i).value='');preview();
  $('st').textContent='تم الحفظ ✓';
 }catch(e){$('st').textContent='تعذر الحفظ: '+(e&&e.message||'')}
 preview();
};
$('ls').onclick=async e=>{const b=e.target.closest('.del');if(!b)return;const id=b.dataset.id;
 if(delArm!==id){delArm=id;list();return}
 delArm=null;deleteDoc(doc(db,'returns',id)).catch(e=>{$('st').textContent='تعذر الحذف: '+(e.code||'')});list()};
function render(){dash();list();preview()}
$('fu').innerHTML=`<optgroup label="رفح">${RAFAH.map(u=>`<option>${u}</option>`).join('')}</optgroup><optgroup label="العريش">${ARISH.map(u=>`<option>${u}</option>`).join('')}</optgroup>`;
['fu','fd','fy','fc','fo'].forEach(i=>{$(i).addEventListener('input',preview);$(i).addEventListener('change',preview)});
$('nx').onclick=()=>{weekStart=add(weekStart,7);dash()};
$('pv').onclick=()=>{weekStart=add(weekStart,-7);dash()};
const tab=n=>{$('v1').classList.toggle('hide',n!==1);$('v2').classList.toggle('hide',n!==2);$('t1').classList.toggle('on',n===1);$('t2').classList.toggle('on',n===2)};
$('t1').onclick=()=>tab(1);$('t2').onclick=()=>tab(2);
render();

function showLogin(on){$('lg').classList.toggle('hide',!on)}
let unsub=null;
onAuthStateChanged(auth,u=>{
 if(unsub){unsub();unsub=null}
 if(!u){rows=[];render();showLogin(true);return}
 showLogin(false);
 unsub=onSnapshot(col,{includeMetadataChanges:true},s=>{
  rows=s.docs.map(d=>({id:d.id,...d.data()}));
  $('st').textContent=s.metadata.hasPendingWrites?'⏳ بانتظار المزامنة (لا يوجد اتصال)':(s.metadata.fromCache?'بدون اتصال — البيانات من الجهاز':'✓ متزامن');
  render();
 },e=>{$('st').textContent='تعذر التحميل: '+(e.code||'')});
});
$('li').onclick=async()=>{$('le').textContent='';
 try{await signInWithEmailAndPassword(auth,$('em').value.trim(),$('pw').value)}
 catch(e){$('le').textContent='بيانات الدخول غير صحيحة أو لا يوجد اتصال'}};
$('lo').onclick=()=>signOut(auth);
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
