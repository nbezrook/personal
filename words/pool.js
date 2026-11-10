import {LANGUAGE_IDS} from './languages.js';
export function validLanguagePool(d,l){try{const a=d?.words?.[l];return Array.isArray(a)&&a.length>=200&&new Set(a.map(w=>w.id)).size===a.length&&a.filter(w=>w.swadesh100&&w.level===0).length===100&&a.every(w=>typeof w.id==='string'&&w.id.startsWith(l+'-')&&['word','meaning','reading'].every(k=>typeof w[k]==='string')&&Number.isInteger(w.level)&&w.level>=0&&w.level<=2);}catch{return false;}}
export function validPool(d){return LANGUAGE_IDS.every(l=>validLanguagePool(d,l));}
export function mergePools(cached,bundled){
 if(!validPool(bundled))throw Error('Invalid bundled vocabulary');
 const words={},updatedByLanguage={};
 for(const l of LANGUAGE_IDS){const source=validLanguagePool(cached,l)?cached:bundled;words[l]=source.words[l];updatedByLanguage[l]=source.updatedByLanguage?.[l]||source.updated;}
 return {words,updated:bundled.updated,updatedByLanguage};
}
