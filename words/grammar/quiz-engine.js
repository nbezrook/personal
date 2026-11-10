import {QUESTIONS,LANGUAGES} from './questions.js';
export function shuffle(values,random=Math.random){const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function newAttempt(language,random=Math.random){
 if(!Object.hasOwn(LANGUAGES,language))throw Error('Unknown language');
 let chosen;
 if(language==='mixed'){
 const first=['fa','ru','fr','zh'].flatMap(l=>shuffle(QUESTIONS.filter(q=>q.language===l),random).slice(0,2));
 const ids=new Set(first.map(q=>q.id));chosen=[...first,...shuffle(QUESTIONS.filter(q=>!ids.has(q.id)),random).slice(0,2)];
 }else chosen=shuffle(QUESTIONS.filter(q=>q.language===language),random).slice(0,10);
 return {version:1,language,questions:shuffle(chosen,random).map(q=>({...q,choices:shuffle(q.choices,random)})),answers:[],cursor:0,phase:'question'};
}
export function recordAnswer(attempt,choiceId){
 if(attempt.phase!=='question')return attempt;
 const q=attempt.questions[attempt.cursor];if(!q.choices.some(c=>c.id===choiceId))throw Error('Unknown choice');
 return {...attempt,answers:[...attempt.answers,choiceId],phase:'feedback'};
}
export function advance(attempt){if(attempt.phase!=='feedback')return attempt;return attempt.cursor===9?{...attempt,phase:'result'}:{...attempt,cursor:attempt.cursor+1,phase:'question'};}
export function score(attempt){const correct=attempt.answers.filter((a,i)=>a===attempt.questions[i].correct).length;return {correct,answered:attempt.answers.length,total:attempt.questions.length,percent:correct*100/attempt.questions.length};}
export function validAttempt(a){try{
 if(a?.version!==1||!Object.hasOwn(LANGUAGES,a.language)||!Array.isArray(a.questions)||a.questions.length!==10||new Set(a.questions.map(q=>q.id)).size!==10||!Array.isArray(a.answers)||!Number.isInteger(a.cursor)||a.cursor<0||a.cursor>9||!['question','feedback','result'].includes(a.phase))return false;
 for(const q of a.questions){const original=QUESTIONS.find(x=>x.id===q.id);if(!original||a.language!=='mixed'&&q.language!==a.language)return false;
 for(const k of ['language','section','prompt','sentence','reading','choiceLanguage','correct','explanation'])if(q[k]!==original[k])return false;
 if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(c=>c.id)).size!==4||q.choices.some(c=>original.choices.find(x=>x.id===c.id)?.text!==c.text))return false;
 }
 const expected=a.phase==='question'?a.cursor:a.cursor+1;if(a.answers.length!==expected||a.phase==='result'&&a.cursor!==9)return false;
 return a.answers.every((id,i)=>a.questions[i].choices.some(c=>c.id===id));
 }catch{return false;}}
