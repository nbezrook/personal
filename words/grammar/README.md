# Grammar reference and practice

Available at `/words/grammar/`, linked from the daily vocabulary app.

The reference covers standard Iranian Persian, Russian, French, and Mandarin
Chinese (simplified characters and pinyin). Its 30 reference sections remain
readable without JavaScript and include source links. Browser printing hides
the interactive quiz and navigation.

The optional quiz uses a local 40-question bank: ten questions per language.
Each attempt shuffles question and choice order. Mixed attempts include at least
two questions from each language. A first answer is locked, explained, and graded;
the result includes explanations and links to the relevant reference sections.
Starting another quiz replaces the saved attempt.

Progress is stored only in this browser under `daily-words-grammar-quiz-v1`.
It is separate from vocabulary grades. The quiz remains usable for the current
visit if browser storage is unavailable. No account, backend, or API is needed.

## Files

- `index.html`: static reference and optional quiz container.
- `grammar.css`: reference, quiz, responsive, and print styles.
- `questions.js`: question bank, answer keys, explanations, and reference IDs.
- `quiz-engine.js`: randomization, grading, and saved-attempt validation.
- `quiz.js`: browser UI and local progress persistence.

When editing a question, verify its answer against the linked reference, give it
four distinct choices and one answer key, and link its explanation to a section
ID. Saved attempts whose question data no longer matches the bank are discarded
with a message so they cannot be graded against changed answers.

From the repository root, run the dependency-free checks with a current Node.js:

```text
node words/grammar/quiz.test.mjs
```

The checks cover exact scores for every possible result in all five modes,
duplicate-click protection, resuming attempts, corrupt saved data, the mixed
set's language coverage, and links from questions to the reference.
