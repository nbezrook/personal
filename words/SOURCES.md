# Vocabulary sources and adaptations

The included vocabulary snapshot contains 281 Persian and 283 Russian entries.
The first level contains exactly 100 concepts per language. The source pages are
207-entry lists; the foundation is the actual 100-concept subset, not their first
100 rows.

## Foundation

- Concepticon contributors, **Swadesh-1955-100**:
  https://github.com/concepticon/concepticon-data/blob/master/concepticondata/conceptlists/Swadesh-1955-100.tsv
- Wiktionary contributors, **Appendix:Persian Swadesh list**:
  https://en.wiktionary.org/wiki/Appendix:Persian_Swadesh_list
- Wiktionary contributors, **Appendix:Russian Swadesh list**:
  https://en.wiktionary.org/wiki/Appendix:Russian_Swadesh_list

Selected the first native-language form and its transliteration from each entry.
Alternative senses and forms are not exhaustive. Retained page revision IDs in
vocabulary.json. The claw concept is represented by the fingernail entry. The
Persian reading for گاز گرفتن is corrected to 'gâz gereftan' using its individual
Wiktionary entry: https://en.wiktionary.org/wiki/گاز_گرفتن .
The
person concept maps to 'man (human being)', distinct from 'man (adult male)'.
The refresh script checks the foundation against Concepticon's published list.
Swadesh is a historical-linguistics concept list, not an official beginner syllabus.

## Frequency-based expansion

hermitdave, **FrequencyWords**, OpenSubtitles2018 corpus word-form frequencies:
https://github.com/hermitdave/FrequencyWords

Source files:
- https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/fa/fa_50k.txt
- https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ru/ru_50k.txt

Additional vocabulary combines the remaining Swadesh 207 concepts with a curated
90-entry seed per language, removing supplements whose native form already exists
in the Swadesh list. The supplemental seed is in words.js.
Rank is the source file's one-based row number, including all original tokens.
Lookup normalizes diacritics, Persian/Arabic kaf and yeh, Russian ё/е, and Persian
joiners. The first matching normalized token supplies the rank. Whole phrases or
infinitives may be unranked even when their parts or inflected forms are common.

Stage 1: Swadesh 100, regardless of frequency.
Stage 2: other available entries with a matched frequency rank <= 2,000.
Stage 3: other available entries ranked > 2,000 or unranked.

These are transparent app difficulty bands, not school grades or CEFR ratings.
The app does not automatically translate all 50,000 frequency-list tokens. Only
entries with an English gloss in the included source pool are eligible for quizzes.
Words and short expressions are both included.

## Attribution and license

Wiktionary adaptations and FrequencyWords content are distributed under
Creative Commons Attribution-ShareAlike 4.0:
https://creativecommons.org/licenses/by-sa/4.0/

The adapted vocabulary data in vocabulary.json, the supplemental words.js data,
and generated refreshed data are distributed under CC BY-SA 4.0. Preserve these
attributions and this license when redistributing modified data. Access to the
adapted data remains available from the app's How it works dialog.

Concepticon data is CC BY 4.0:
https://github.com/concepticon/concepticon-data/blob/master/LICENSE

The application code, apart from the licensed vocabulary data, is MIT licensed.
