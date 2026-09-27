# Kapitaltäckningsquiz

Quiz till föredraget om vägen från konsumentkreditinstitut till bank. Publiceras via Vercel.

- `index.html`: quizet, med 30 sekunder per fråga och en topplista när man är klar
- `admin.html`: admin-vy som kräver inloggning (Supabase Auth). Visar frågor med facit, allas svar och topplistan live.
- `questions.js`: frågornas text och alternativ (utan facit)
- `config.js`: Supabase-uppgifter, session och sekunder per fråga
- `supabase.sql`: tabeller, rättning (trigger), topplista (RPC) och behörigheter

Facit och admin-e-post ligger i `private/answer-key.js`, som inte checkas in.
Efter en ändring kör du `node tools/build-private-sql.js | clip` och kör resultatet i Supabase SQL Editor.

Byt `SESSION` i `config.js` före föredraget, så att testsvar inte syns.
