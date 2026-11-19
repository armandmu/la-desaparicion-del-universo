(function lduApp(){
"use strict";
const data=window.LDU_DATA;
const root=document.getElementById("main");
if(!data||!data.practices||data.practices.length!==51){root.textContent="No se ha podido cargar el contenido.";return;}
const key="ldu-cuaderno-personal-v1";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pById=id=>data.practices.find(p=>p.id===id);
const chapter=num=>data.chapters.find(c=>c.number===+num);
const fresh=()=>({version:1,favorites:[],drafts:{},entries:[]});
function validate(obj){
if(!obj||obj.version!==1||!Array.isArray(obj.entries))throw Error("No es una copia válida de este cuaderno.");
if(obj.entries.length>20000)throw Error("El archivo contiene demasiadas anotaciones.");
const allowed=new Set(data.practices.map(p=>p.id));
const safe=s=>typeof s==="string"?s.slice(0,15000):"";
const z=fresh();
z.favorites=[...new Set((Array.isArray(obj.favorites)?obj.favorites:[]).filter(x=>allowed.has(x)))];
for(const [id,d] of Object.entries(obj.drafts||{})){
 if(allowed.has(id)&&d&&typeof d==="object")z.drafts[id]={note:safe(d.note),steps:[0,1,2].map(i=>Boolean(d.steps?.[i]))};
}
z.entries=obj.entries.filter(e=>e&&allowed.has(e.practiceId)&&typeof e.date==="string"&&!Number.isNaN(Date.parse(e.date))).map((e,i)=>({
 id:String(e.id??`import-${i}`).slice(0,100),practiceId:e.practiceId,date:e.date,note:safe(e.note),steps:[0,1,2].map(j=>Boolean(e.steps?.[j]))
}));
return z;
}
let state=fresh();
try{const raw=localStorage.getItem(key);if(raw)state=validate(JSON.parse(raw));}catch(e){console.warn("No se pudo recuperar el cuaderno",e);}
let filter="todas",query="",chapterFilter=0,diaryQuery="",editId=null,timer;
const count=id=>state.entries.filter(e=>e.practiceId===id).length;
const done=id=>count(id)>0;
const completed=()=>data.practices.filter(p=>done(p.id)).length;
const draft=id=>state.drafts[id]||{note:"",steps:[false,false,false]};
const favorite=id=>state.favorites.includes(id);
const newest=()=>[...state.entries].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
const stamp=v=>new Date(v).toLocaleString("es-ES",{dateStyle:"medium",timeStyle:"short"});
function toast(t){const el=document.getElementById("toast");if(!el)return;el.textContent=t;el.classList.add("show");clearTimeout(timer);timer=setTimeout(()=>el.classList.remove("show"),3200);}
function persist(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch(e){toast("No se ha podido guardar. Comprueba el espacio del navegador.");return false;}}
function badge(id){return `<span class="chip ${done(id)?"done":""}">${done(id)?"✓ Realizada":"○ Pendiente"}</span>`;}
function progress(){const n=completed();document.getElementById("sidebar-progress").textContent=`${n}/51`;document.getElementById("sidebar-bar").style.width=(n/51*100)+"%";}
function card(p){return `<article class="practice-card"><a class="practice-card-main" href="#/tecnica/${p.id}"><span class="eyebrow">CAPÍTULO ${p.chapter} · TÉCNICA ${p.n}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></a><div class="practice-card-side">${badge(p.id)}<button type="button" class="pill-plain" data-act="fav" data-id="${p.id}" aria-label="${favorite(p.id)?"Quitar de favoritos":"Añadir a favoritos"}" title="Favorito">${favorite(p.id)?"★":"☆"}</button></div></article>`;}
function chapterCard(c){const n=data.practices.filter(p=>p.chapter===c.number&&done(p.id)).length;return `<a href="#/capitulo/${c.number}" class="chapter-card"><div class="chapter-numeral">CAPÍTULO ${String(c.number).padStart(2,"0")}</div><h3>${esc(c.name)}</h3><div class="card-meta"><span>3 técnicas</span><span>${n} / 3 realizadas</span></div><div class="micro-track"><div style="width:${n/3*100}%"></div></div></a>`;}
function entry(e,short=false){const p=pById(e.practiceId);if(!p)return "";return `<article class="entry-card"><div class="entry-header"><div><span class="date-label">${esc(stamp(e.date))}</span><h3><a href="#/tecnica/${p.id}">${esc(p.title)}</a></h3><span class="fine muted">Capítulo ${p.chapter}, técnica ${p.n}</span></div><span class="chip done">✓ Realizada</span></div>${editId===e.id&&!short?`<label for="edit-note">Editar anotación</label><textarea id="edit-note" maxlength="15000" rows="5" class="textarea">${esc(e.note)}</textarea><div class="entry-actions"><button class="button button-small" data-act="save-edit" data-id="${esc(e.id)}">Guardar cambios</button><button class="button button-outline button-small" data-act="cancel-edit">Cancelar</button></div>`:`<p>${e.note?esc(short&&e.note.length>180?e.note.slice(0,180)+"…":e.note):'<span class="muted">Sin anotaciones.</span>'}</p>${short?"":`<div class="entry-actions"><button class="button button-outline button-small" data-act="edit-entry" data-id="${esc(e.id)}">Editar anotación</button><button class="button button-danger button-small" data-act="delete-entry" data-id="${esc(e.id)}">Eliminar registro</button></div>`}`}</article>`;}
function home(){
const next=data.practices.find(p=>!done(p.id))||data.practices[0];
return `<section class="hero"><span class="eyebrow">CUADERNO PERSONAL · GARY R. RENARD</span><h1>Un espacio para volver<br>a la práctica.</h1><p>Las técnicas de tu documento «La Desaparición del Universo», organizadas por capítulos, con instrucciones, diario personal y seguimiento de cada realización.</p><div class="hero-actions"><a href="#/tecnica/${next.id}" class="button">Continuar con una técnica ↗</a><a href="#/capitulos" class="button button-outline">Explorar todos los capítulos</a></div></section><section class="stats"><div class="stat-card"><div class="stat-number">${completed()} <small>/ 51</small></div><span>Técnicas realizadas</span></div><div class="stat-card"><div class="stat-number">${state.entries.length}</div><span>Registros en el diario</span></div><div class="stat-card"><div class="stat-number">${state.favorites.length}</div><span>Favoritos</span></div></section><div class="section-head"><h2>Capítulos</h2><a href="#/capitulos">Ver todos ↗</a></div><div class="chapter-grid">${data.chapters.slice(0,6).map(chapterCard).join("")}</div><div class="section-head"><h2>Últimas realizaciones</h2><a href="#/diario">Mi diario ↗</a></div>${state.entries.length?newest().slice(0,3).map(e=>entry(e,true)).join(""):`<div class="empty">Todavía no has registrado ninguna práctica. Cuando completes una, aparecerá aquí.</div>`}<div class="notice neutral">Las interpretaciones espirituales del documento reflejan un marco de creencias, no hechos científicos. El contenido no se ha cotejado directamente con el libro comercial.</div>`;
}
function catalog(){
return `<div class="page-intro"><span class="eyebrow">BIBLIOTECA DE PRÁCTICAS</span><h1>Capítulos y técnicas</h1><p>Consulta los 17 capítulos y sus 51 ejercicios. Puedes buscar palabras, filtrar por favoritos o retomar aquellos que todavía no has realizado.</p></div><div class="filters"><input id="catalog-search" class="input" type="search" placeholder="Buscar una técnica…" value="${esc(query)}" aria-label="Buscar técnicas"><select class="select" id="chapter-filter" aria-label="Filtrar por capítulo"><option value="0">Todos los capítulos</option>${data.chapters.map(c=>`<option value="${c.number}" ${chapterFilter===c.number?"selected":""}>${c.number} · ${esc(c.name)}</option>`).join("")}</select><select id="status-filter" class="select" aria-label="Filtrar por estado">${[["todas","Todas"],["pendientes","Pendientes"],["realizadas","Realizadas"],["favoritas","Favoritas"]].map(([v,t])=>`<option value="${v}" ${filter===v?"selected":""}>${t}</option>`).join("")}</select></div><div id="catalog-count" class="results-bar"></div><div id="catalog-list"></div>`;
}
function results(){
const list=document.getElementById("catalog-list");if(!list)return;
const q=query.toLocaleLowerCase("es").trim();
const ps=data.practices.filter(p=>(!chapterFilter||p.chapter===chapterFilter)&&(filter!=="pendientes"||!done(p.id))&&(filter!=="realizadas"||done(p.id))&&(filter!=="favoritas"||favorite(p.id))&&(!q||[p.title,p.description,...p.steps,chapter(p.chapter).name].join(" ").toLocaleLowerCase("es").includes(q)));
document.getElementById("catalog-count").textContent=`${ps.length} ${ps.length===1?"técnica":"técnicas"}`;
list.innerHTML=ps.length?ps.map(card).join(""):'<div class="empty">No hay resultados. Prueba con otro filtro.</div>';
}
function chapterView(n){
const c=chapter(n);if(!c)return missing();
return `<a class="back-link" href="#/capitulos">← Todos los capítulos</a><div class="page-intro"><span class="eyebrow">CAPÍTULO ${c.number} DE 17</span><h1>${esc(c.name)}</h1><p>Tres prácticas para recorrer a tu ritmo. Puedes repetirlas y guardar una anotación distinta cada vez.</p></div>${data.practices.filter(p=>p.chapter===c.number).map(card).join("")}<div class="stack">${c.number>1?`<a class="button button-outline" href="#/capitulo/${c.number-1}">← Capítulo anterior</a>`:""}${c.number<17?`<a class="button button-outline" href="#/capitulo/${c.number+1}">Siguiente capítulo →</a>`:""}</div>`;
}
function practiceView(id){
const p=pById(id);if(!p)return missing();const d=draft(id),history=newest().filter(e=>e.practiceId===id);
return `<a class="back-link" href="#/capitulo/${p.chapter}">← Capítulo ${p.chapter}: ${esc(chapter(p.chapter).name)}</a><div class="page-intro"><span class="eyebrow">CAPÍTULO ${p.chapter} · TÉCNICA ${p.n}</span><h1>${esc(p.title)}</h1><p>${esc(p.description)}</p></div><div class="detail-grid"><div><section class="surface"><div class="chapter-heading"><h2>Protocolo</h2>${badge(p.id)}</div><p class="muted">Marca los pasos cuando los vayas completando.</p><ol class="protocol">${p.steps.map((s,i)=>`<li class="${d.steps[i]?"checked":""}"><input type="checkbox" id="s${i}" data-act="step" data-id="${p.id}" data-index="${i}" ${d.steps[i]?"checked":""}><label for="s${i}">${esc(s)}</label></li>`).join("")}</ol></section><section class="surface"><h2>Mis anotaciones</h2><p class="muted">Puedes volver a hacer esta práctica y guardar cada experiencia por separado.</p><label for="practice-note">Reflexión de hoy</label><textarea class="textarea" id="practice-note" data-id="${p.id}" maxlength="15000" rows="6" placeholder="¿Qué he observado al realizar esta práctica?">${esc(d.note)}</textarea><p class="fine muted">El borrador se guarda automáticamente en este navegador.</p><div class="detail-actions"><button class="button" data-act="save-session" data-id="${p.id}" ${d.steps.every(Boolean)?"":"disabled"}>✓ Registrar práctica realizada</button><button class="button button-outline" data-act="reset-draft" data-id="${p.id}">Vaciar borrador</button></div></section>${p.chapter===15?'<div class="notice">Este capítulo recoge interpretaciones espirituales sobre la enfermedad. Los síntomas físicos requieren valoración sanitaria cuando proceda; la enfermedad no debe atribuirse a culpa personal ni estas prácticas sustituir la atención médica.</div>':""}</div><aside class="detail-side"><div class="surface"><h3>Mi seguimiento</h3><div class="stat-number">${history.length}</div><p>${history.length===1?"realización":"realizaciones"} registradas</p>${history.length?`<p class="muted">Última: ${esc(stamp(history[0].date))}</p>`:""}</div><div class="surface"><h3>Favoritos</h3><button class="button button-outline" data-act="fav" data-id="${p.id}">${favorite(p.id)?"★ Quitar de favoritos":"☆ Añadir a favoritos"}</button></div><div class="surface"><h3>Referencia</h3><p>Recopilación facilitada · Capítulo ${p.chapter}, técnica ${p.n}. No se ha cotejado con el texto comercial original.</p></div></aside></div><div class="section-head"><h2>Historial de esta técnica</h2></div>${history.length?history.slice(0,10).map(e=>entry(e,true)).join(""):'<div class="empty">Aún no hay anotaciones registradas.</div>'}`;
}
function diary(){return `<div class="page-intro"><span class="eyebrow">MI ESPACIO</span><h1>Mi diario</h1><p>Cada vez que realizas una técnica queda registrada con su fecha y sus propias anotaciones.</p></div><div class="stats"><div class="stat-card"><div class="stat-number">${state.entries.length}</div><span>Realizaciones</span></div><div class="stat-card"><div class="stat-number">${completed()}</div><span>Técnicas distintas</span></div></div><input class="input" id="diary-search" type="search" value="${esc(diaryQuery)}" placeholder="Buscar en tus notas…" aria-label="Buscar en el diario"><div class="results-bar" id="diary-count"></div><section id="diary-list"></section>`;}
function diaryResults(){const target=document.getElementById("diary-list");if(!target)return;const q=diaryQuery.toLocaleLowerCase("es").trim();const rows=newest().filter(e=>!q||[e.note,pById(e.practiceId)?.title].join(" ").toLocaleLowerCase("es").includes(q));document.getElementById("diary-count").textContent=`${rows.length} registros`;target.innerHTML=rows.length?rows.map(e=>entry(e)).join(""):'<div class="empty">No hay registros que coincidan con la búsqueda.</div>';}
function phrases(){return `<div class="page-intro"><span class="eyebrow">PARA RECORDAR</span><h1>Frases clave</h1><p>Las diez frases recogidas al final del documento. Puedes releerlas cuando te apetezca.</p></div><div class="phrase-grid">${data.phrases.map((s,i)=>`<div class="phrase"><span class="eyebrow">FRASE ${String(i+1).padStart(2,"0")}</span><blockquote>${esc(s)}</blockquote><button class="button button-outline button-small" data-act="copy" data-index="${i}">Copiar frase</button></div>`).join("")}</div>`;}
function privacy(){return `<div class="page-intro"><span class="eyebrow">CONTROL PERSONAL</span><h1>Mis datos</h1><p>Tu diario se guarda únicamente en este navegador. Puedes descargar una copia y recuperarla cuando quieras.</p></div><section class="surface"><h2>Copia de seguridad</h2><p class="muted">La exportación incluye anotaciones, realizaciones, favoritos y borradores.</p><div class="detail-actions"><button class="button" data-act="export">↓ Descargar copia JSON</button><label class="button button-outline file-label" for="import-file">↑ Importar copia</label><input id="import-file" class="file-input" type="file" accept=".json,application/json"></div><p class="fine muted">Importar reemplaza los datos del navegador actual. Te pediremos confirmación antes de hacerlo.</p></section><section class="surface"><h2>Privacidad y límites</h2><p>Las notas no se envían a GitHub ni a ningún servidor de esta aplicación. No se sincronizan entre dispositivos. Si borras los datos del navegador, podrías perderlas; exporta copias regularmente.</p><p>Otros proyectos publicados bajo el mismo dominio <code>armandmu.github.io</code> comparten el origen del navegador y, técnicamente, pueden acceder al mismo almacenamiento local. Evita guardar datos clínicos o información confidencial de terceras personas.</p></section><section class="surface"><h2>Borrar cuaderno</h2><p>Elimina todo el historial, favoritos, borradores y notas de este navegador. Esta acción no se puede deshacer sin copia.</p><button class="button button-danger" data-act="erase">Eliminar mis datos locales</button></section>`;}
function missing(){return `<div class="empty"><h2>Esta página no existe</h2><a class="button" href="#/inicio">Volver al inicio</a></div>`;}
function render(){
const [route,a]=location.hash.replace(/^#\/?/,"").split("/");
root.innerHTML=route==="capitulos"?catalog():route==="capitulo"?chapterView(a):route==="tecnica"?practiceView(a):route==="diario"?diary():route==="frases"?phrases():route==="datos"?privacy():route==="inicio"||!route?home():missing();
progress();
document.querySelectorAll("[data-nav]").forEach(el=>{const which=route==="capitulo"||route==="tecnica"?"capitulos":route||"inicio";el.classList.toggle("active",el.dataset.nav===which);});
if(route==="capitulos")results();if(route==="diario")diaryResults();
}
document.addEventListener("click",event=>{
const btn=event.target.closest("[data-act]");if(!btn)return;const act=btn.dataset.act,id=btn.dataset.id;
if(act==="fav"){state.favorites=favorite(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];if(persist()){toast(favorite(id)?"Añadida a favoritos":"Eliminada de favoritos");render();}}
if(act==="save-session"){
 const d=draft(id);if(!d.steps.every(Boolean))return;
 state.entries.push({id:(globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random()),practiceId:id,date:new Date().toISOString(),note:d.note,steps:[...d.steps]});
 delete state.drafts[id];if(persist()){toast("Práctica registrada en el diario");render();}
}
if(act==="reset-draft"){if(!confirm("¿Vaciar los pasos y la anotación pendiente de esta técnica?"))return;delete state.drafts[id];persist();render();}
if(act==="edit-entry"){editId=id;render();}
if(act==="cancel-edit"){editId=null;render();}
if(act==="save-edit"){const e=state.entries.find(x=>x.id===id);const note=document.getElementById("edit-note");if(e&&note){e.note=note.value.slice(0,15000);if(persist()){editId=null;render();toast("Nota actualizada");}}}
if(act==="delete-entry"){if(!confirm("¿Eliminar este registro de práctica y su anotación?"))return;state.entries=state.entries.filter(x=>x.id!==id);if(persist()){render();toast("Registro eliminado");}}
if(act==="export"){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="la-desaparicion-del-universo-copia-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
if(act==="copy"){navigator.clipboard?.writeText(data.phrases[Number(btn.dataset.index)]).then(()=>toast("Frase copiada")).catch(()=>toast("No se ha podido copiar"));}
if(act==="erase"){if(!confirm("Se borrarán todas tus anotaciones y tu historial de este navegador. ¿Continuar?"))return;if(!confirm("¿Confirmas que quieres borrar el cuaderno completo?"))return;state=fresh();if(persist()){render();toast("Datos locales borrados");}}
});
document.addEventListener("input",e=>{
const el=e.target;
if(el.id==="catalog-search"){query=el.value;results();}
if(el.id==="diary-search"){diaryQuery=el.value;diaryResults();}
if(el.id==="practice-note"){const id=el.dataset.id;state.drafts[id]={...draft(id),note:el.value};persist();}
});
document.addEventListener("change",e=>{
const el=e.target;
if(el.id==="chapter-filter"){chapterFilter=Number(el.value);results();}
if(el.id==="status-filter"){filter=el.value;results();}
if(el.dataset.act==="step"){
 const id=el.dataset.id,idx=Number(el.dataset.index),d=draft(id);d.steps=[...d.steps];d.steps[idx]=el.checked;state.drafts[id]=d;persist();
 el.closest("li")?.classList.toggle("checked",el.checked);const save=document.querySelector('[data-act="save-session"]');if(save)save.disabled=!d.steps.every(Boolean);
}
if(el.id==="import-file"&&el.files?.[0]){
const file=el.files[0];if(file.size>10_000_000){toast("Archivo demasiado grande");el.value="";return;}
file.text().then(text=>{const incoming=validate(JSON.parse(text));if(confirm(`¿Reemplazar los datos actuales por ${incoming.entries.length} registros de la copia?`)){const old=state;state=incoming;if(!persist())state=old;else{render();toast("Copia importada correctamente");}}}).catch(e=>toast(e.message||"No se pudo leer el archivo")).finally(()=>el.value="");
}
});
document.getElementById("quick-search")?.addEventListener("click",()=>{location.hash="#/capitulos";requestAnimationFrame(()=>document.getElementById("catalog-search")?.focus());});
window.addEventListener("hashchange",()=>{editId=null;render();window.scrollTo(0,0);});
if(!location.hash)location.hash="#/inicio";render();
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();
