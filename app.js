const dateEl=document.getElementById("date"),sectionEl=document.getElementById("section"),subjectEl=document.getElementById("subject");
const grid=document.getElementById("rollGrid"),search=document.getElementById("search"),message=document.getElementById("message");
const totalEl=document.getElementById("total"),presentEl=document.getElementById("present"),absentEl=document.getElementById("absent"),percentEl=document.getElementById("percent");
let absentSet=new Set();

const today=new Date(); dateEl.value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
function rolls(){return sectionEl.value==="LE"?LE_ROLLS:REGULAR_ROLLS}
function key(){return `attendance-${sectionEl.value}-${dateEl.value}`}
function load(){try{absentSet=new Set(JSON.parse(localStorage.getItem(key())||"[]"))}catch{absentSet=new Set()};render()}
function save(){localStorage.setItem(key(),JSON.stringify([...absentSet]))}
function render(){
 const list=rolls(), q=search.value.trim().toUpperCase();
 grid.innerHTML="";
 list.filter(r=>r.includes(q)).forEach((r,i)=>{
   const b=document.createElement("button"); b.className="roll"+(absentSet.has(r)?" absent":"");
   b.innerHTML=`${r}<span class="badge">${absentSet.has(r)?"ABSENT":"PRESENT"}</span>`;
   b.onclick=()=>{absentSet.has(r)?absentSet.delete(r):absentSet.add(r);save();render()};
   grid.appendChild(b);
 });
 updateStats(list); updateMessage(list);
}
function updateStats(list){
 const total=list.length, absent=absentSet.size, present=total-absent, pct=total?Math.round(present/total*100):0;
 totalEl.textContent=total;presentEl.textContent=present;absentEl.textContent=absent;percentEl.textContent=pct+"%";
}
function niceDate(){
 if(!dateEl.value)return "";
 const [y,m,d]=dateEl.value.split("-"); return `${d}-${m}-${y}`;
}
function updateMessage(list){
 const absent=[...absentSet].sort();
 const subject=subjectEl.value.trim()||"Class";
 const present=list.length-absent.length, pct=list.length?Math.round(present/list.length*100):0;
 const lines=[
  `${niceDate()}`,
  `${subject} ${sectionEl.value} absentees:`,
  absent.length?absent.join(", "):"Nil",
  `Present: ${present}/${list.length}`,
  `Percentage: ${pct}%`
 ];
 message.value=lines.join("\n");
}
document.getElementById("clearBtn").onclick=()=>{absentSet.clear();save();render();};
document.getElementById("allBtn").onclick=()=>{absentSet.clear();save();render();};
dateEl.onchange=load;sectionEl.onchange=()=>{absentSet.clear();load()};subjectEl.oninput=()=>updateMessage(rolls());search.oninput=render;
document.getElementById("copyBtn").onclick=async()=>{try{await navigator.clipboard.writeText(message.value);toast("Message copied")}catch{message.select();document.execCommand("copy");toast("Message copied")}};
document.getElementById("shareBtn").onclick=async()=>{if(navigator.share){await navigator.share({text:message.value,title:"Attendance"}).catch(()=>{})}else toast("Share is not supported here")};
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1600)}
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
let deferred;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;document.getElementById("installBtn").hidden=false});
document.getElementById("installBtn").onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null}};
load();
