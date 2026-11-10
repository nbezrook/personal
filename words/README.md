# Daily Words

Farsi, Russian, French, and Mandarin Chinese vocabulary practice, served at `/words/`.

These files are a standalone static app. GitHub Pages serves `words/index.html`
and redirects `/words` to `/words/`. No build, backend, account, or API key is needed.

Study ten entries per language each local calendar day, then take a graded quiz.
The exact Swadesh 100 concept set forms the foundation. Later levels use frequency
bands from OpenSubtitles2018; these are difficulty estimates, not school grades.
281 Farsi, 283 Russian, 207 French, and 207 Mandarin entries are included. French uses IPA pronunciation; Mandarin uses simplified characters and pinyin. Missed words return for review.

Each language advances after two consecutive completed quizzes at 80% or higher
and correct answers on at least 80% of its current level's pool. Scores below 50%
move back one level. Progress is saved to this browser on this domain.
Existing Farsi/Russian progress and backups migrate automatically, preserving daily questions, grades, and historical streaks. New streak days require all four quizzes.
Use Export progress and Restore backup to transfer it between devices or sites.

**How it works → Refresh online word lists** updates the Wiktionary entries and
frequency rankings. Today's existing quiz questions remain fixed during refresh.
Refresh requires access to en.wiktionary.org and raw.githubusercontent.com.
An unavailable source leaves the saved pool intact. Daily practice uses the
bundled `vocabulary.json` or a successfully refreshed browser-local copy.

When updating the app, keep its JS modules, CSS, `vocabulary.json`, and `SOURCES.md`
together in this directory. Do not replace the site's root `index.html`.

Vocabulary data: CC BY-SA 4.0; preserve `SOURCES.md` and its attributions.
Application code: MIT; see `LICENSE`.

Maintainer checks: `node --test --test-isolation=none words.test.mjs grammar/quiz.test.mjs`.
To rebuild the bundled snapshot from all four online sources, run
`node refresh-sources.mjs`. It validates all pools and the independent Swadesh 100
concept reference before replacing the snapshot.
