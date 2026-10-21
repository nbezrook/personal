export const SOURCES={
 fa:'https://en.wiktionary.org/wiki/Appendix:Persian_Swadesh_list',
 ru:'https://en.wiktionary.org/wiki/Appendix:Russian_Swadesh_list',
 concepts:'https://github.com/concepticon/concepticon-data/blob/master/concepticondata/conceptlists/Swadesh-1955-100.tsv',
 frequency:'https://github.com/hermitdave/FrequencyWords',
 license:'https://creativecommons.org/licenses/by-sa/4.0/'
};
export function clean(s){return s.replace(/<[^>]*>/g,'').replace(/&#x([a-f\d]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();}
export function normalize(s){return s.normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670]/g,'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/ё/g,'е').replace(/[\u200c\u200dـ]/g,'').toLowerCase().trim();}
export function parseSwadesh(html,lang){
 const table=html.match(/<table\b[\s\S]*?<\/table>/)?.[0];if(!table)throw Error('Swadesh table not found');
 const out=[];
 for(const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)){
 const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(m=>m[1]);
 if(cells.length<3||!/^\d+$/.test(clean(cells[0])))continue;
 const word=cells[2].match(new RegExp('<span[^>]*lang="'+lang+'"[^>]*>([\\s\\S]*?)<\\/span>'));
 const reading=cells[2].match(/<span[^>]*class="[^"]*\btr\b[^"]*"[^>]*>([\s\S]*?)<\/span>/);
 if(!word)throw Error('Missing translation for '+clean(cells[0]));
 out.push({id:`${lang}-sw-${clean(cells[0])}`,index:+clean(cells[0]),word:clean(word[1]),reading:reading?clean(reading[1]):'',meaning:clean(cells[1]),source:SOURCES[lang]});
 }
 if(out.length!==207||new Set(out.map(w=>w.index)).size!==207)throw Error('Expected 207 unique Swadesh entries');
 // The expanded Persian table mismatches this reading; the individual entry
 // https://en.wiktionary.org/wiki/گاز_گرفتن gives gâz gereftan.
 if(lang==='fa'){const bite=out.find(w=>w.index===94);if(bite.word==='گاز گرفتن')bite.reading='gâz gereftan';}
 return out;
}
// Explicit concept alignment to the 207-entry table, checked against Concepticon's
// Swadesh-1955-100. This is NOT the first 100 rows of the expanded list.
export const SWADESH100=[17,168,58,85,27,46,94,176,64,65,89,169,79,160,181,122,109,47,92,195,73,159,93,67,74,66,70,167,45,120,80,182,128,185,173,71,83,72,102,90,68,1,110,82,103,56,123,91,28,48,37,18,63,148,171,76,207,87,183,177,75,16,22,38,151,172,170,57,190,157,140,101,55,124,62,107,32,166,125,149,156,147,119,69,8,7,2,78,77,51,23,121,180,150,4,12,175,11,36,174];
async function get(url,json=false){const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('Source unavailable: '+r.status);return json?r.json():r.text();}
export async function fetchSources(seed){
 const result={fa:[],ru:[]};
 await Promise.all(['fa','ru'].map(async lang=>{
 const name=lang==='fa'?'Persian':'Russian';
 const [j,frequencies]=await Promise.all([get(`https://en.wiktionary.org/w/api.php?action=parse&page=Appendix:${name}_Swadesh_list&prop=text%7Crevid&format=json&origin=*`,true),get(`https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/${lang}/${lang}_50k.txt`)]);
 const sw=parseSwadesh(j.parse.text['*'],lang);const ranks=new Map();
 frequencies.trim().split('\n').forEach((line,i)=>{const term=normalize(line.slice(0,line.lastIndexOf(' ')));if(!ranks.has(term))ranks.set(term,i+1);});
 const native=new Set(sw.map(w=>normalize(w.word)));
 const extra=seed[lang].filter(w=>!native.has(normalize(w.word))).map(w=>({...w,id:w.id.replace(`${lang}-`,`${lang}-extra-`),source:'Curated supplement'}));
 result[lang]=[...sw,...extra].map(w=>{const rank=ranks.get(normalize(w.word))||null;return {...w,rank,level:SWADESH100.includes(w.index)?0:rank&&rank<=2000?1:2,swadesh100:SWADESH100.includes(w.index),revision:j.parse.revid};});
 }));
 return {words:result,updated:new Date().toISOString()};
}
