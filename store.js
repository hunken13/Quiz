// Kommunikation med Supabase. Rättningen sker i databasen, inte här.
(function () {
  const cfg = window.QUIZ_CONFIG;
  const AUTH_KEY = "quiz-admin-auth";

  function headers(token) {
    return {
      apikey: cfg.SUPABASE_ANON_KEY,
      Authorization: "Bearer " + (token || cfg.SUPABASE_ANON_KEY),
      "Content-Type": "application/json",
    };
  }

  async function request(path, options = {}, token) {
    const res = await fetch(cfg.SUPABASE_URL + path, { ...options, headers: { ...headers(token), ...options.headers } });
    if (!res.ok) {
      const err = new Error("Serverfel (" + res.status + ")");
      err.status = res.status;
      throw err;
    }
    return res.status === 204 || res.headers.get("content-length") === "0" ? null : res.json();
  }

  // 409 betyder att frågan redan är besvarad (t.ex. vid omförsök) och räknas som sparat.
  async function saveAnswer(row) {
    try {
      await request("/rest/v1/answers", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ session: cfg.SESSION, ...row }),
      });
    } catch (err) {
      if (err.status !== 409) throw err;
    }
  }

  function leaderboard(playerId) {
    return request("/rest/v1/rpc/leaderboard", {
      method: "POST",
      body: JSON.stringify({ p_session: cfg.SESSION, p_player: playerId || null }),
    });
  }

  // --- Admin (inloggning via Supabase Auth) ---
  function readAuth() {
    try {
      return JSON.parse(sessionStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  }
  function writeAuth(data) {
    try {
      if (data) sessionStorage.setItem(AUTH_KEY, JSON.stringify(data));
      else sessionStorage.removeItem(AUTH_KEY);
    } catch {}
  }
  async function token(grant, body) {
    const data = await request("/auth/v1/token?grant_type=" + grant, { method: "POST", body: JSON.stringify(body) });
    const auth = { access: data.access_token, refresh: data.refresh_token, expires: Date.now() + data.expires_in * 1000 };
    writeAuth(auth);
    return auth;
  }
  function login(email, password) {
    return token("password", { email, password });
  }
  function logout() {
    writeAuth(null);
  }
  async function accessToken() {
    let auth = readAuth();
    if (!auth) return null;
    if (Date.now() > auth.expires - 60000) {
      try {
        auth = await token("refresh_token", { refresh_token: auth.refresh });
      } catch {
        writeAuth(null);
        return null;
      }
    }
    return auth.access;
  }
  async function adminGet(path) {
    const t = await accessToken();
    if (!t) {
      const err = new Error("Inte inloggad");
      err.status = 401;
      throw err;
    }
    return request(path, {}, t);
  }
  function fetchAllAnswers() {
    return adminGet(
      "/rest/v1/answers?select=player_id,player_name,question_id,answer,correct,points,created_at" +
        "&session=eq." + encodeURIComponent(cfg.SESSION) + "&order=created_at.asc&limit=10000"
    );
  }
  function fetchKeys() {
    return adminGet("/rest/v1/question_keys?select=id,type,correct,tolerance,explanation");
  }

  window.QuizStore = { saveAnswer, leaderboard, login, logout, accessToken, fetchAllAnswers, fetchKeys };
})();
