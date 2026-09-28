# Kapitaltäckningsquiz

Quiz till föredraget om vägen från konsumentkreditinstitut till bank. Publiceras via Vercel.

- `index.html`: quizet. Deltagarna går med i ett väntrum och ser vilka som anslutit, och frågorna startar när admin trycker på start. 30 sekunder per fråga och en topplista när man är klar.
- `admin.html`: admin-vy som kräver inloggning (Supabase Auth). Visar väntrummet med startknapp, sedan frågor med facit, allas svar och topplistan live. Här kan topplistan också nollställas.
- `questions.js`: frågornas text och alternativ (utan facit)
- `config.js`: Supabase-uppgifter, session och sekunder per fråga
- `supabase.sql`: tabeller, rättning (trigger), topplista (RPC) och behörigheter

Kör lokalt med `npm run dev` och öppna http://localhost:3000 (quizet) eller http://localhost:3000/admin.html.

Facit och admin-e-post ligger i `private/answer-key.js`, som inte checkas in.
Efter en ändring kör du `node tools/build-private-sql.js | clip` och kör resultatet i Supabase SQL Editor.

Byt `SESSION` i `config.js` före föredraget, så att testsvar inte syns.
