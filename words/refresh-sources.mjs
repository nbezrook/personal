// Run from any directory: node path/to/words/refresh-sources.mjs
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {fetchSources} from './sources.js';
import {WORDS} from './words.js';
import {LANGUAGE_IDS} from './languages.js';
import {validPool} from './pool.js';
const data=await fetchSources(WORDS);
assert.ok(validPool(data),'Invalid source pool; existing snapshot was not replaced');
const reference=JSON.parse(await readFile(new URL('./swadesh100-reference.json',import.meta.url)));
for(const l of LANGUAGE_IDS){
 assert.deepEqual(data.words[l].filter(w=>w.swadesh100).map(w=>w.meaning.toLowerCase().replace(/^to (?!lie)/,'')).sort(),reference.verifiedConcepts);
 assert.ok(data.words[l].every(w=>w.word&&w.reading&&w.meaning));
}
await writeFile(new URL('./vocabulary.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
console.log('Updated and verified all four vocabulary pools.');
