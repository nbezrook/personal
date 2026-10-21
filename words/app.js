import {WORDS,LEVELS,fresh,dateKey,plan,answer,setVocabulary,validProgress} from './engine.js';
import {WORDS as SEED} from './words.js';
import {fetchSources,SOURCES} from './sources.js';
const $=s=>document.querySelector(s),KEY='daily-words-v1',CACHE='daily-words-pool-v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=fresh(),lang='fa',day=dateKey(),revealed=new Set(),storageOK=true,poolDate='',lastQuizFocus=null;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3800);}
function storageFailed(){storageOK=false;$('#storage-warning').hidden=false;$('.local-badge').textContent='SAVED FOR THIS VISIT ONLY';}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageFailed();}}
function load(){try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!validProgress(parsed))throw Error('Unrecognized progress');state=parsed;}}catch{storageFailed();}}
function validPool(d){return d&&['fa','ru'].every(l=>Array.isArray(d.words?.[l])&&d.words[l].length>=200&&new Set(d.words[l].map(w=>w.id)).size===d.words[l].length&&d.words[l].filter(w=>w.swadesh100&&w.level===0).length===100&&d.words[l].every(w=>typeof w.id==='string'&&w.id.startsWith(l+'-')&&typeof w.word==='string'&&typeof w.meaning==='string'&&typeof w.reading==='string'&&Number.isInteger(w.level)&&w.level>=0&&w.level<=2));}
function shortDate(key){return new Date(key+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});}
function previous(key){const d=new Date(key+'T12:00:00');d.setDate(d.getDate()-1);return dateKey(d);}
function checkDay(){const current=dateKey();if(current!==day){day=current;revealed.clear();$('#modal').close();render();toast('A new day, a fresh set of words.');return true;}return false;}
function current(){return plan(state,day,lang);}
function showModal(html){lastQuizFocus=document.activeElement;$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function closeModal(){$('#modal').close();lastQuizFocus?.focus();}
$('.close').onclick=closeModal;
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
function render(){
 const fa=plan(state,day,'fa'),ru=plan(state,day,'ru'),p=current();save();
 $('#date').textContent=new Date(day+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
 $('#daily-stat').innerHTML=`${fa.seen.length+ru.seen.length} <small>/ 20 studied</small>`;
 let cursor=(fa.complete&&ru.complete)?day:previous(day),streak=0;
 while(state.days[cursor]?.fa?.complete&&state.days[cursor]?.ru?.complete){streak++;cursor=previous(cursor);}
 $('#streak-stat').innerHTML=`${streak} <small>${streak===1?'day':'days'}</small>`;
 const history=Object.entries(state.days).flatMap(([date,languages])=>Object.entries(languages).filter(([,p])=>p.complete).map(([l,p])=>({date,lang:l,...p}))).sort((a,b)=>b.date.localeCompare(a.date)||a.lang.localeCompare(b.lang));
 $('#average-stat').innerHTML=history.length?`${Math.round(history.reduce((a,p)=>a+p.score,0)/history.length)}% <small>across ${history.length} ${history.length===1?'quiz':'quizzes'}</small>`:'— <small>your first quiz awaits</small>';
 document.querySelectorAll('[data-lang]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.lang===lang));b.tabIndex=b.dataset.lang===lang?0:-1;});
 $('#language-panel').setAttribute('aria-labelledby','tab-'+lang);
 $('#level-tag').textContent=`LEVEL ${p.level+1} · ${LEVELS[p.level].toUpperCase()}`;
 $('#lesson-title').textContent=p.complete?'A little wiser today.':`Your ten ${lang==='fa'?'Farsi':'Russian'} words.`;
 $('#lesson-note').textContent=p.complete?`Quiz complete · ${p.score}% · Tomorrow’s level: ${LEVELS[state.profiles[lang].level]}`:`${p.seen.length} of 10 studied · ${p.answers.length} of 10 quiz answers · ${WORDS[lang].length} entries in your pool`;
 $('#quiz-start').innerHTML=p.complete?'View your results ↗':p.answers.length?'Continue quiz ↗':'Take today’s quiz ↗';
 $('#progress-fill').style.width=(p.seen.length*10)+'%';
 $('#cards').innerHTML=p.items.map((w,i)=>{const seen=p.seen.includes(w.id),show=revealed.has(w.id);return `<article class="word-card ${seen?'is-seen':''}"><div class="card-top"><span>${String(i+1).padStart(2,'0')}</span><span class="review">${w.review?'REVIEW':w.swadesh100?'SWADESH 100':w.rank?'RANK '+w.rank:'EXTENDED'}</span></div><button class="flip" data-flip="${esc(w.id)}" aria-expanded="${show}" aria-label="${esc(w.word)}: ${show?'hide':'reveal'} meaning"><span class="native" lang="${lang}" dir="${lang==='fa'?'rtl':'ltr'}">${esc(w.word)}</span><span class="reading">${esc(w.reading)}</span><span class="meaning ${show?'':'hidden-meaning'}">${show?esc(w.meaning):'tap to reveal'}</span></button><button class="studied" data-seen="${seen}" data-study="${esc(w.id)}">${seen?'✓ Studied':'○ Mark studied'}</button></article>`;}).join('');
 $('#steps').innerHTML=LEVELS.map((level,i)=>`<div class="step ${i===state.profiles[lang].level?'active':''}"><span>0${i+1}</span><strong>${esc(level)}</strong>${i===state.profiles[lang].level?'You are here':i<state.profiles[lang].level?'Unlocked':'Up next'}</div>`).join('');
 const band=WORDS[lang].filter(w=>w.level===state.profiles[lang].level),known=band.filter(w=>state.memory[lang][w.id]?.hits>0).length;
 $('.path p').textContent=`${known} of ${band.length} entries answered correctly at your current level. Move up after two consecutive completed quizzes at 80%+ and correct answers for at least 80% of this level’s pool. Below 50% moves you back one level. Each language progresses independently.`;
 $('#history').innerHTML=history.length?history.slice(0,6).map(h=>`<div class="history-row"><span>${esc(shortDate(h.date))}</span><b>${h.lang==='fa'?'Farsi':'Russian'}</b><span>Level ${h.level+1}</span><b>${h.score}%</b></div>`).join(''):'<div class="empty-history"><b>Your story starts with one quiz.</b>Complete a daily quiz to see your grades here.<br>A streak day means finishing both languages.</div>';
}
$('#cards').onclick=e=>{
 if(checkDay())return;
 const flip=e.target.closest('[data-flip]'),study=e.target.closest('[data-study]');
 if(flip){const id=flip.dataset.flip;revealed.has(id)?revealed.delete(id):revealed.add(id);render();document.querySelector(`[data-flip="${id}"]`)?.focus();}
 if(study){const id=study.dataset.study,p=current();if(p.seen.includes(id))p.seen=p.seen.filter(x=>x!==id);else {p.seen.push(id);revealed.add(id);}render();document.querySelector(`[data-study="${id}"]`)?.focus();}
};
$('#reveal-all').onclick=()=>{current().ids.forEach(id=>revealed.add(id));render();};
document.querySelectorAll('[data-lang]').forEach(b=>{b.onclick=()=>{checkDay();lang=b.dataset.lang;render();};b.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();lang=lang==='fa'?'ru':'fa';render();$('#tab-'+lang).focus();}};});
$('#quiz-start').onclick=()=>{if(!checkDay())quiz();};
function quiz(){
 const p=current();if(p.complete){results();return;}
 const i=p.answers.length,w=p.items[i];
 showModal(`<div class="eyebrow">${lang==='fa'?'FARSI':'RUSSIAN'} · DAILY QUIZ</div><div class="quiz-meta"><span>Question ${i+1} of 10</span><span>${esc(LEVELS[p.level])}</span></div><div class="lesson-progress"><div style="width:${i*10}%"></div></div><h2 class="native quiz-word" lang="${lang}" dir="${lang==='fa'?'rtl':'ltr'}">${esc(w.word)}</h2><p style="text-align:center;margin:0">${esc(w.reading)}</p><p style="text-align:center">What does this mean in English?</p><div class="quiz-options">${p.options[i].map((c,n)=>`<button class="option" data-choice="${n}">${esc(c)}</button>`).join('')}</div><div class="quiz-feedback" role="status">Choose one answer. Your first choice counts.</div><button class="primary quiz-next" hidden>Next word →</button><p style="font-size:10px;margin-bottom:0">You can close and resume. Answers are saved as you go.</p>`);
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
 if(checkDay())return;
 if(current().answers.length!==i){quiz();return;}
 const value=p.options[i][+b.dataset.choice];answer(state,day,lang,value);save();render();
 document.querySelectorAll('[data-choice]').forEach(el=>{el.disabled=true;const v=p.options[i][+el.dataset.choice];if(v===w.meaning)el.classList.add('correct');else if(el===b)el.classList.add('incorrect');});
 $('.quiz-feedback').textContent=value===w.meaning?'Correct. One more word in your world.':`The answer is “${w.meaning}”. We’ll bring this word back for review.`;
 const next=$('.quiz-next');next.hidden=false;next.textContent=p.complete?'See your grade →':'Next word →';next.onclick=()=>{if(!checkDay())quiz();};next.focus();
 });
}
function results(){const p=current(),wrong=p.items.filter((_,i)=>!p.answers[i].correct);
 showModal(`<div class="eyebrow">${lang==='fa'?'FARSI':'RUSSIAN'} · DAILY RESULTS</div><h2>${p.score>=80?'A good day for your vocabulary.':'Every attempt is progress.'}</h2><div class="result-score">${p.score}<small>%</small></div><p>${p.score/10} correct out of 10. Tomorrow’s level: <b>${esc(LEVELS[state.profiles[lang].level])}</b>.</p><p>${wrong.length?`${wrong.length} missed ${wrong.length===1?'entry joins':'entries join'} your review queue. Up to three missed entries return per day, leaving room for new vocabulary.`:'A clean sweep. Keep the habit going tomorrow.'}</p>${wrong.length?`<div class="result-review">${wrong.map(w=>`<div><span lang="${lang}" dir="${lang==='fa'?'rtl':'ltr'}">${esc(w.word)}</span><span>${esc(w.meaning)}</span></div>`).join('')}</div>`:''}<button class="primary quiz-next" id="done">Back to your words →</button>`);$('#done').onclick=closeModal;
}
$('#about').onclick=()=>showAbout();
function showAbout(){
 showModal(`<div class="eyebrow">THE DAILY WORDS METHOD</div><h2>A practice that grows with you.</h2><p>Study ten entries per language each local calendar day. Reveal meanings, mark cards studied, then take a ten-question multiple-choice quiz. Grades count once per language per day.</p><p><b>01 · Swadesh 100.</b> The 100 core concepts are aligned to <a href="${SOURCES.concepts}" target="_blank" rel="noopener"><u>Concepticon’s Swadesh-1955-100</u></a>, using translations from Wiktionary’s <a href="${SOURCES.fa}" target="_blank" rel="noopener"><u>Persian</u></a> and <a href="${SOURCES.ru}" target="_blank" rel="noopener"><u>Russian</u></a> expanded lists. We show one translation per concept.</p><p><b>02 · Frequent vocabulary.</b> Additional entries matching the top 2,000 word forms in <a href="${SOURCES.frequency}" target="_blank" rel="noopener"><u>FrequencyWords / OpenSubtitles2018</u></a>.</p><p><b>03 · Extended vocabulary.</b> Remaining entries from Swadesh 207 and a curated supplement, including less frequent and unranked forms. Frequency is a difficulty proxy, not a school grade or certified CEFR level. Swadesh is a core-concept list, not a graded curriculum.</p><p>Two consecutive completed quizzes at 80%+ and correct answers on at least 80% of your current level’s pool unlock the next level. Below 50% moves you back one level. Missed entries return for review. Pools are finite; mastered entries rotate when new ones run out.</p><p><b>Your pool:</b> ${WORDS.fa.length} Farsi and ${WORDS.ru.length} Russian entries. Last source refresh: ${esc(new Date(poolDate).toLocaleDateString())}. Refresh fetches both online lists and frequency rankings; today’s existing questions stay fixed. If a source is unavailable, your existing pool stays available.</p><button class="primary" id="refresh">Refresh online word lists ↻</button><p id="refresh-status" role="status" style="font-size:11px"></p><p>Progress stays in this browser on this website. It does not sync between devices. Export it below for a backup. Daily practice does not require a server or an API key.</p><p style="font-size:10px">Vocabulary adapted from Wiktionary contributors and frequency ranks from hermitdave/FrequencyWords, under <a href="${SOURCES.license}" target="_blank" rel="noopener"><u>CC BY-SA 4.0</u></a>. Modified data is available in <a href="vocabulary.json" download><u>vocabulary.json</u></a>. Transliteration is a reading aid. See <a href="SOURCES.md" target="_blank"><u>source notes</u></a>.</p>`);
 $('#refresh').onclick=async()=>{const button=$('#refresh');button.disabled=true;button.textContent='Refreshing…';try{const d=await fetchSources(SEED);if(!validPool(d))throw Error('Unexpected source format');setVocabulary(d.words);poolDate=d.updated;try{localStorage.setItem(CACHE,JSON.stringify(d));}catch{storageFailed();}render();if($('#refresh-status'))$('#refresh-status').textContent='Updated. New daily sets will use the refreshed pool.';button.textContent='Sources updated ✓';}catch{if($('#refresh-status'))$('#refresh-status').textContent='Could not refresh all sources. Your saved pool is still available. Try again later.';button.disabled=false;button.textContent='Try refresh again ↻';}};
}
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({exported:new Date().toISOString(),progress:state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`daily-words-progress-${day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Progress exported. Keep this file as your backup.');};
$('#restore').onclick=()=>$('#backup-file').click();
$('#backup-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>10000000)throw Error('Backup too large');const data=JSON.parse(await file.text());if(!validProgress(data.progress))throw Error('Invalid backup');showModal('<div class="eyebrow">RESTORE PROGRESS</div><h2>Use this backup?</h2><p>This replaces the progress currently saved in this browser. Export your current progress first if you want to keep it.</p><button class="primary" id="confirm-restore">Replace progress with backup</button> <button class="plain" id="cancel-restore">Cancel</button>');$('#confirm-restore').onclick=()=>{state=data.progress;day=dateKey();revealed.clear();save();render();closeModal();toast('Backup restored.');};$('#cancel-restore').onclick=closeModal;}catch{toast('This file is not a valid Daily Words progress backup.');}finally{e.target.value='';}};
window.addEventListener('storage',e=>{if(e.key===KEY){load();$('#modal').close();render();toast('Progress updated from another tab.');}});
setInterval(checkDay,15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDay();});
async function init(){
 load();let data=null;
 try{const cached=JSON.parse(localStorage.getItem(CACHE));if(validPool(cached))data=cached;}catch{}
 if(!data){const r=await fetch('./vocabulary.json');if(!r.ok)throw Error('Vocabulary unavailable');data=await r.json();if(!validPool(data))throw Error('Vocabulary is invalid');}
 setVocabulary(data.words);poolDate=data.updated;render();
}
init().catch(()=>{$('#cards').innerHTML='<p>Vocabulary could not load. Please reload the page. If you downloaded this app, serve it from a website or use the included local server.</p>';$('#quiz-start').disabled=true;});
