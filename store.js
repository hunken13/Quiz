// Poängräkning och lagring (Supabase eller lokalt demoläge).
(function () {
  const cfg = window.QUIZ_CONFIG;
  const remote = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const LOCAL_KEY = "quiz-demo-answers";

  function score(q, answer) {
    if (q.type === "mc") {
      const ok = Number(answer) === q.correct;
      return { correct: ok, points: ok ? 1 : 0 };
    }
    if (q.type === "tf") {
      const ok = (answer === "true") === q.correct;
      return { correct: ok, points: ok ? 1 : 0 };
    }
    const diff = Math.abs(Number(answer) - q.correct) / Math.abs(q.correct);
    if (diff <= q.tolerance) return { correct: true, points: 1 };
    if (diff <= q.tolerance * 2) return { correct: false, points: 0.5 };
    return { correct: false, points: 0 };
  }

  function headers() {
    return {
      apikey: cfg.SUPABASE_ANON_KEY,
      Authorization: "Bearer " + cfg.SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    };
  }

  function readLocal() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    } catch {
      return [];
    }
  }

  async function saveAnswer(row) {
    const full = { session: cfg.SESSION, ...row };
    if (!remote) {
      const rows = readLocal().filter(
        (r) => !(r.session === full.session && r.player_id === full.player_id && r.question_id === full.question_id)
      );
      rows.push({ ...full, created_at: new Date().toISOString() });
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
      } catch {}
      return;
    }
    const url = cfg.SUPABASE_URL + "/rest/v1/answers?on_conflict=session,player_id,question_id";
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers(), Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify(full),
    });
    if (!res.ok) throw new Error("Kunde inte spara svaret (" + res.status + ")");
  }

  async function fetchAnswers() {
    if (!remote) return readLocal().filter((r) => r.session === cfg.SESSION);
    const url =
      cfg.SUPABASE_URL +
      "/rest/v1/answers?select=player_id,player_name,question_id,answer,correct,points,created_at" +
      "&session=eq." + encodeURIComponent(cfg.SESSION) + "&order=created_at.asc&limit=10000";
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("Kunde inte hämta svar (" + res.status + ")");
    return res.json();
  }

  // Summerar per spelare, sorterat på poäng och sedan på vem som blev klar först.
  function leaderboard(rows) {
    const players = new Map();
    for (const r of rows) {
      const p = players.get(r.player_id) || { id: r.player_id, name: r.player_name, points: 0, answered: 0, last: "" };
      p.points += Number(r.points);
      p.answered += 1;
      if (r.created_at > p.last) p.last = r.created_at;
      players.set(r.player_id, p);
    }
    return [...players.values()].sort((a, b) => b.points - a.points || a.last.localeCompare(b.last));
  }

  window.QuizStore = { remote, score, saveAnswer, fetchAnswers, leaderboard };
})();
