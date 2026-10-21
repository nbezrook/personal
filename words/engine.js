export const WORDS={fa:[],ru:[]};
export function setVocabulary(words){for(const lang of ['fa','ru'])WORDS[lang]=words[lang];}
export const LEVELS=['Swadesh 100','Frequent vocabulary','Extended vocabulary'];
export function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function fresh(){return {version:1,profiles:{fa:{level:0,strong:0},ru:{level:0,strong:0}},days:{},memory:{fa:{},ru:{}}};}
function hash(s){let a=2166136261;for(const c of s)a=Math.imul(a^c.charCodeAt(0),16777619);a=Math.imul(a^(a>>>16),0x85ebca6b);a=Math.imul(a^(a>>>13),0xc2b2ae35);return (a^(a>>>16))>>>0;}
export function plan(state,day,lang){
 state.days[day]??={};
 if(state.days[day][lang])return state.days[day][lang];
 const level=state.profiles[lang].level,m=state.memory[lang];
 const pool=WORDS[lang].filter(w=>w.level<=level);
 const tie=(a,b)=>hash(day+a.id)-hash(day+b.id);
 const reviews=pool.filter(w=>m[w.id]?.wrong).sort((a,b)=>m[a.id].last.localeCompare(m[b.id].last)||tie(a,b)).slice(0,3);
 const unseen=pool.filter(w=>!m[w.id]).sort((a,b)=>a.level-b.level||((a.rank||99999)-(b.rank||99999))||tie(a,b));
 const other=pool.filter(w=>m[w.id]&&!reviews.includes(w)).sort((a,b)=>m[a.id].last.localeCompare(m[b.id].last)||m[a.id].hits-m[b.id].hits||tie(a,b));
 const items=[...reviews,...unseen,...other].slice(0,10).map(w=>({...w,review:!!m[w.id]}));
 if(items.length!==10)throw Error('Vocabulary pool must contain at least ten entries');
 // Snapshots freeze both questions and choices when tomorrow's online pool changes.
 return state.days[day][lang]={ids:items.map(w=>w.id),items,options:items.map(w=>choices(w,day)),level,seen:[],answers:[],complete:false};
}
export function choices(word,day){
 const unique=[...new Map(WORDS[word.id.slice(0,2)].filter(w=>w.meaning!==word.meaning&&normalizeNative(w.word)!==normalizeNative(word.word)).map(w=>[w.meaning,w])).values()];
 const same=unique.filter(w=>w.level===word.level),pool=same.length>=3?same:unique;
 const others=pool.sort((a,b)=>hash(day+word.id+a.id)-hash(day+word.id+b.id)).slice(0,3).map(w=>w.meaning);
 return [...others,word.meaning].sort((a,b)=>hash(day+word.id+a)-hash(day+word.id+b));
}
export function answer(state,day,lang,value){
 const p=plan(state,day,lang);if(p.complete||p.answers.length>=10)return;
 const w=p.items[p.answers.length];
 if(!p.options[p.answers.length].includes(value))throw Error('Invalid answer');
 p.answers.push({value,correct:value===w.meaning});
 if(!p.seen.includes(w.id))p.seen.push(w.id);
 if(p.answers.length===10){
 p.complete=true;p.score=p.answers.filter(a=>a.correct).length*10;
 p.ids.forEach((id,i)=>{const old=state.memory[lang][id]||{hits:0};state.memory[lang][id]={hits:old.hits+(p.answers[i].correct?1:0),wrong:!p.answers[i].correct,last:day};});
 const prof=state.profiles[lang];
 if(p.score>=80){prof.strong++;const current=WORDS[lang].filter(w=>w.level===prof.level);const coverage=current.filter(w=>state.memory[lang][w.id]?.hits>0).length/current.length;if(prof.strong>=2&&coverage>=.8&&prof.level<2){prof.level++;prof.strong=0;}}
 else {prof.strong=0;if(p.score<50)prof.level=Math.max(0,prof.level-1);}
 p.nextLevel=prof.level;
 }
}
function normalizeNative(s){return s.normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f]/g,'').trim();}
export function validProgress(s){
 try{
 if(s?.version!==1||!s.days||!s.memory||!s.profiles)return false;
 for(const l of ['fa','ru']){const p=s.profiles[l];if(!Number.isInteger(p?.level)||p.level<0||p.level>2||!Number.isInteger(p.strong)||p.strong<0||!s.memory[l])return false;
 for(const m of Object.values(s.memory[l]))if(!Number.isInteger(m.hits)||m.hits<0||typeof m.wrong!=='boolean'||!/^\d{4}-\d{2}-\d{2}$/.test(m.last))return false;}
 for(const [day,languages] of Object.entries(s.days)){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return false;
 for(const [l,p] of Object.entries(languages)){
 if(!['fa','ru'].includes(l)||!Number.isInteger(p.level)||p.level<0||p.level>2||p.ids.length!==10||new Set(p.ids).size!==10||p.items.length!==10||p.options.length!==10||p.seen.length>10||new Set(p.seen).size!==p.seen.length||!p.seen.every(id=>p.ids.includes(id))||p.answers.length>10||typeof p.complete!=='boolean')return false;
 for(let i=0;i<10;i++){const w=p.items[i],o=p.options[i];if(w.id!==p.ids[i]||!w.id.startsWith(l+'-')||!['word','meaning','reading'].every(k=>typeof w[k]==='string')||o.length!==4||!o.every(v=>typeof v==='string')||new Set(o).size!==4||!o.includes(w.meaning))return false;}
 if(!p.answers.every((a,i)=>p.options[i].includes(a.value)&&a.correct===(a.value===p.items[i].meaning)))return false;
 if(p.complete!==(p.answers.length===10)||p.complete&&p.score!==p.answers.filter(a=>a.correct).length*10)return false;
 }}return true;
 }catch{return false;}
}
