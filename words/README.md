# Daily Words

Farsi and Russian vocabulary practice, served at `/words/`.

These files are a standalone static app. GitHub Pages serves `words/index.html`
and redirects `/words` to `/words/`. No build, backend, account, or API key is needed.

Study ten entries per language each local calendar day, then take a graded quiz.
The exact Swadesh 100 concept set forms the foundation. Later levels use frequency
bands from OpenSubtitles2018; these are difficulty estimates, not school grades.
281 Farsi and 283 Russian entries are included. Missed words return for review.

Each language advances after two consecutive completed quizzes at 80% or higher
and correct answers on at least 80% of its current level's pool. Scores below 50%
move back one level. Progress is saved to this browser on this domain.
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
