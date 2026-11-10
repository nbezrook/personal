import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {WORDS,setVocabulary,fresh,plan,answer,dateKey,choices,validProgress} from './engine.js';
import {SWADESH100,parseSwadesh,normalize} from './sources.js';
import {migrateProgress,streak,completeDay} from './engine.js';
import {validPool,mergePools} from './pool.js';
const data=JSON.parse(await readFile(new URL('./vocabulary.json',import.meta.url)));
setVocabulary(data.words);
function finish(s,d,l,correct=10){const p=plan(s,d,l);while(!p.complete){const i=p.answers.length,w=p.items[i];answer(s,d,l,i<correct?w.meaning:p.options[i].find(x=>x!==w.meaning));}return p;}
test('exactly 100 distinct foundation concepts in each language',()=>{assert.equal(new Set(SWADESH100).size,100);for(const l of ['fa','ru','fr','zh']){const a=WORDS[l];assert.equal(a.filter(w=>w.level===0).length,100);assert.equal(new Set(a.map(w=>w.id)).size,a.length);assert.ok(a.every(w=>w.word&&w.meaning&&w.reading));assert.ok(a.filter(w=>w.index).length===207);}});
test('foundation matches independently downloaded Concepticon reference',async()=>{const ref=JSON.parse(await readFile(new URL('./swadesh100-reference.json',import.meta.url)));for(const l of ['fa','ru','fr','zh'])assert.deepEqual(WORDS[l].filter(w=>w.swadesh100).map(w=>w.meaning.toLowerCase().replace(/^to (?!lie)/,'')).sort(),ref.verifiedConcepts);});
test('local date formatting handles year and month boundaries',()=>{assert.equal(dateKey(new Date(2026,0,1,0,0)),'2026-01-01');assert.equal(dateKey(new Date(2026,11,31,23,59)),'2026-12-31');});
test('ten distinct daily questions, four unique choices, no ambiguous same-form distractors',()=>{for(const l of ['fa','ru','fr','zh']){for(const w of WORDS[l]){const a=choices(w,'2026-10-20');assert.equal(a.length,4);assert.equal(new Set(a).size,4);assert.equal(a.filter(v=>v===w.meaning).length,1);}const p=plan(fresh(),'2026-10-20',l);assert.equal(p.ids.length,10);assert.equal(new Set(p.ids).size,10);assert.ok(p.items.every(w=>w.swadesh100));}});
test('persisted daily snapshot survives source changes',()=>{const s=fresh(),p=plan(s,'2026-10-20','fa'),snapshot=JSON.stringify(p);setVocabulary({...data.words,fa:WORDS.fa.map(w=>({...w,meaning:'changed '+w.meaning})),ru:WORDS.ru});assert.equal(JSON.stringify(plan(s,'2026-10-20','fa')),snapshot);answer(s,'2026-10-20','fa',p.items[0].meaning);assert.equal(p.answers[0].correct,true);setVocabulary(data.words);});
test('grading boundaries, resumability, completed quiz cannot earn duplicate credit',()=>{for(const score of [0,4,5,8,10]){const s=fresh();let p=plan(s,'2026-10-20','ru');answer(s,'2026-10-20','ru',p.items[0].meaning);const resumed=JSON.parse(JSON.stringify(s));assert.equal(plan(resumed,'2026-10-20','ru').answers.length,1);const t=fresh();p=finish(t,'2026-10-20','ru',score);assert.equal(p.score,score*10);const snapshot=JSON.stringify(t);answer(t,'2026-10-20','ru','anything');assert.equal(JSON.stringify(t),snapshot);}});
test('reject invalid answers without changing state',()=>{const s=fresh();plan(s,'2026-10-20','fa');const before=JSON.stringify(s);assert.throws(()=>answer(s,'2026-10-20','fa','not a choice'));assert.equal(JSON.stringify(s),before);});
test('higher grades require coverage to unlock level and languages remain independent',()=>{const s=fresh();finish(s,'2026-10-20','fa');finish(s,'2026-10-21','fa');assert.equal(s.profiles.fa.level,0);for(let n=22;n<=27;n++)finish(s,`2026-10-${n}`,'fa');assert.equal(s.profiles.fa.level,1);assert.equal(s.profiles.ru.level,0);assert.equal(Object.values(s.memory.fa).filter(m=>m.hits>0).length,80);});
test('weak grades lower difficulty, level stays within bounds',()=>{const s=fresh();s.profiles.ru.level=2;finish(s,'2026-10-20','ru',4);assert.equal(s.profiles.ru.level,1);finish(s,'2026-10-21','ru',0);finish(s,'2026-10-22','ru',0);assert.equal(s.profiles.ru.level,0);s.profiles.fa.level=2;for(const w of WORDS.fa)s.memory.fa[w.id]={hits:1,last:'2026-01-01',wrong:false};finish(s,'2026-10-20','fa');finish(s,'2026-10-21','fa');assert.equal(s.profiles.fa.level,2);});
test('missed words return with room for new vocabulary',()=>{const s=fresh(),a=finish(s,'2026-10-20','fa',0),b=plan(s,'2026-10-21','fa');assert.equal(b.ids.filter(id=>a.ids.includes(id)).length,3);assert.equal(b.ids.filter(id=>!a.ids.includes(id)).length,7);});
test('reject damaged online tables rather than replacing working vocabulary',()=>{assert.throws(()=>parseSwadesh('<table></table>','fa'));assert.equal(normalize('خِيلي'),'خیلی');});
test('backups round-trip and reject incomplete or inconsistent data',()=>{assert.equal(validProgress(fresh()),true);const s=fresh();finish(s,'2026-10-20','ru',8);assert.equal(validProgress(JSON.parse(JSON.stringify(s))),true);s.days['2026-10-20'].ru.score=100;assert.equal(validProgress(s),false);assert.equal(validProgress({version:1}),false);});
test('quiz choices vary by day and question, with varied answer positions',()=>{const w=WORDS.fa[0];assert.notDeepEqual(choices(w,'2026-10-20'),choices(w,'2026-10-21'));const positions=new Set(WORDS.fa.filter(w=>w.level===0).map(w=>choices(w,'2026-10-20').indexOf(w.meaning)));assert.equal(positions.size,4);});

test('old backups preserve grades, memory and frozen daily questions during migration',()=>{
 const old=fresh();finish(old,'2026-11-07','fa',8);finish(old,'2026-11-07','ru',9);plan(old,'2026-11-08','fa');old.version=1;
 delete old.profiles.fr;delete old.profiles.zh;delete old.memory.fr;delete old.memory.zh;
 const before=structuredClone(old),next=migrateProgress(old);assert.equal(next.version,2);assert.deepEqual(next.days,before.days);assert.deepEqual(next.memory.fa,before.memory.fa);assert.deepEqual(next.profiles.ru,before.profiles.ru);assert.deepEqual(old,before);
 assert.equal(validProgress(next),true);assert.equal(streak(next,'2026-11-08'),1);assert.equal(completeDay(next,'2026-11-08'),false);
 for(const l of ['fa','ru','fr'])finish(next,'2026-11-08',l);plan(next,'2026-11-08','zh');assert.equal(completeDay(next,'2026-11-08'),false);finish(next,'2026-11-08','zh');assert.equal(streak(next,'2026-11-08'),2);
});

test('old refreshed pools survive upgrade while new languages use bundled data',()=>{
 const cached={updated:'2026-01-01',words:{fa:structuredClone(data.words.fa),ru:data.words.ru}};cached.words.fa[0].reading='saved custom reading';
 const merged=mergePools(cached,data);assert.equal(validPool(merged),true);assert.equal(merged.words.fa[0].reading,'saved custom reading');assert.deepEqual(merged.words.zh,data.words.zh);assert.equal(merged.updatedByLanguage.fa,'2026-01-01');
 assert.equal(validPool(cached),false);assert.throws(()=>mergePools(null,cached));
});

test('French and Mandarin grading, coverage progression and missed-word reviews work independently',()=>{
 for(const l of ['fr','zh']){
  const s=fresh();for(let n=1;n<=8;n++)finish(s,`2026-11-${String(n).padStart(2,'0')}`,l);assert.equal(s.profiles[l].level,1);
  const missed=finish(s,'2026-11-09',l,0);assert.equal(missed.score,0);assert.equal(s.profiles[l].level,0);assert.equal(plan(s,'2026-11-10',l).items.filter(w=>w.review).length,3);
  for(const other of ['fa','ru','fr','zh'].filter(x=>x!==l))assert.deepEqual(s.profiles[other],{level:0,strong:0});
 }
 assert.notEqual(normalize('ou','fr'),normalize('où','fr'));
 assert.deepEqual(data.words.zh.slice(0,5).map(w=>[w.word,w.reading]),[['我','wǒ'],['你','nǐ'],['他','tā'],['我们','wǒmen'],['你们','nǐmen']]);
});
