// Skriver ut SQL som lägger in facit och admin-e-post i Supabase.
// Användning: node tools/build-private-sql.js | clip   → klistra in i SQL Editor och kör.
const path = require("path");
const key = require(path.join(__dirname, "..", "private", "answer-key.js"));

const lit = (v) => (v == null ? "null" : "'" + String(v).replace(/'/g, "''") + "'");

const rows = Object.entries(key.questions).map(
  ([id, q]) => `  (${lit(id)}, ${lit(q.type)}, ${lit(q.correct)}, ${q.tolerance ?? "null"}, ${lit(q.explanation)})`
);

console.log(`insert into public.question_keys (id, type, correct, tolerance, explanation) values
${rows.join(",\n")}
on conflict (id) do update set type = excluded.type, correct = excluded.correct,
  tolerance = excluded.tolerance, explanation = excluded.explanation;

delete from public.question_keys where id not in (${Object.keys(key.questions).map(lit).join(", ")});

insert into public.admins (email) values ${key.admins.map((e) => `(${lit(e)})`).join(", ")}
on conflict do nothing;`);
