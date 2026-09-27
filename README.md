# Kapitaltäckningsquiz

Quiz till föredraget om vägen från konsumentkreditinstitut till bank.

- `index.html` – quizet som deltagarna gör (länken som delas på Slack)
- `admin.html` – presentatörsvy med live-topplista och svarsstatistik per fråga
- `questions.js` – frågorna, rätta svar och förklaringar
- `config.js` – Supabase-uppgifter och session
- `supabase.sql` – skapar tabellen för svaren

Utan Supabase-uppgifter i `config.js` körs quizet i demoläge, där svaren bara sparas lokalt i webbläsaren.
Byt `SESSION` i `config.js` före föredraget så att testsvar inte syns i topplistan.
