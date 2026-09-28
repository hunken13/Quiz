(function () {
  const { title, questions } = window.QUIZ;
  const cfg = window.QUIZ_CONFIG;
  const store = window.QuizStore;
  const T = window.QUIZ_TEXT;
  const root = document.getElementById("admin");
  const tooltip = document.getElementById("tooltip");
  const LETTERS = "ABCDEFGH";
  const REFRESH_MS = 3000;
  let poll = null;
  let keys = null;
  let busy = false;
  let actionError = "";

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") node.className = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) if (c != null) node.append(c);
    return node;
  }
  const fmt = (n, d = 1) => Number(n).toLocaleString(T.locale, { maximumFractionDigits: d });

  // ---------- Inloggning ----------
  function renderLogin(message) {
    clearInterval(poll);
    const email = el("input", { type: "text", inputmode: "email", autocomplete: "username", placeholder: T.email, "aria-label": T.email });
    const password = el("input", { type: "password", autocomplete: "current-password", placeholder: T.password, "aria-label": T.password });
    const error = el("p", { class: "error" }, message || "");
    root.replaceChildren(
      el(
        "form",
        {
          class: "card login",
          onsubmit: async (e) => {
            e.preventDefault();
            error.textContent = "";
            try {
              await store.login(email.value.trim(), password.value);
              start();
            } catch {
              error.textContent = T.wrongLogin;
            }
          },
        },
        el("h1", {}, "Admin"),
        el("p", { class: "muted" }, title),
        email,
        password,
        el("button", { class: "btn-primary", type: "submit" }, T.logIn),
        error
      )
    );
    email.focus();
  }

  // ---------- Hjälpare ----------
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

  function tile(value, label) {
    return el("div", { class: "tile" }, el("div", { class: "value" }, value), el("div", { class: "label" }, label));
  }

  function withTooltip(node, text) {
    node.addEventListener("mousemove", (e) => {
      tooltip.textContent = text;
      tooltip.style.left = Math.min(e.clientX + 14, innerWidth - tooltip.offsetWidth - 8) + "px";
      tooltip.style.top = e.clientY + 14 + "px";
      tooltip.style.opacity = 1;
    });
    node.addEventListener("mouseleave", () => (tooltip.style.opacity = 0));
    return node;
  }

  function barRow(label, count, total, isCorrect) {
    const pct = total ? (count / total) * 100 : 0;
    return withTooltip(
      el(
        "div",
        { class: "bar-row" },
        el("span", { class: "opt" + (isCorrect ? " correct" : "") }, isCorrect ? el("span", { class: "badge-correct" }, "✓ ") : null, label),
        el("div", { class: "bar-track" }, el("div", { class: "bar-fill" + (isCorrect ? " correct" : ""), style: "width:" + pct + "%" })),
        el("span", { class: "num" }, T.countUnit(count))
      ),
      T.barTooltip(label, count, fmt(pct, 0), isCorrect)
    );
  }

  function answerLabel(q, answer) {
    if (answer === "") return "–";
    if (q.type === "mc") return LETTERS[Number(answer)] || answer;
    if (q.type === "tf") return answer === "true" ? T.true : T.false;
    return fmt(answer) + " " + q.unit;
  }

  function questionCard(q, i, rows) {
    const key = keys[q.id];
    const answers = rows.filter((r) => r.question_id === q.id);
    const n = answers.length;
    const nCorrect = answers.filter((r) => r.correct).length;
    const card = el(
      "article",
      { class: "card qstat" },
      el("h3", {}, i + 1 + ". " + q.text),
      el("div", { class: "meta" }, T.answersMeta(n, n ? fmt((nCorrect / n) * 100, 0) : null))
    );

    const namesFor = (pred) =>
      answers
        .filter(pred)
        .map((r) => r.player_name)
        .join(", ");

    if (q.type === "estimate") {
      const vals = answers.map((r) => r.answer).filter((a) => a !== "").map(Number).sort((a, b) => a - b);
      const mid = vals.length >> 1;
      const median = vals.length ? (vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2) : null;
      card.append(
        el(
          "div",
          { class: "est-stats" },
          el("span", {}, T.correctAnswer, el("b", { class: "badge-correct" }, key ? fmt(key.correct) + " " + q.unit : "?")),
          el("span", {}, T.median, el("b", {}, median == null ? "–" : fmt(median) + " " + q.unit)),
          el("span", {}, T.range, el("b", {}, vals.length ? fmt(vals[0]) + " – " + fmt(vals[vals.length - 1]) : "–"))
        ),
        n
          ? el(
              "div",
              { class: "who" },
              answers
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((r, j) => [j ? ", " : "", el("b", {}, r.player_name), " " + answerLabel(q, r.answer)])
            )
          : null
      );
    } else {
      const opts = q.type === "tf" ? [["true", T.true], ["false", T.false]] : q.options.map((o, j) => [String(j), LETTERS[j] + ". " + o]);
      const bars = el("div", { class: "bars" });
      for (const [value, label] of opts) {
        bars.append(barRow(label, answers.filter((r) => r.answer === value).length, n, key && value === key.correct));
      }
      card.append(bars);
      const right = namesFor((r) => r.correct);
      const timedOut = namesFor((r) => r.answer === "");
      if (right) card.append(el("div", { class: "who" }, el("b", {}, T.correctNames), right));
      if (timedOut) card.append(el("div", { class: "who" }, el("b", {}, T.timedOutNames), timedOut));
    }
    if (key && key.explanation) card.append(el("div", { class: "explanation" }, key.explanation));
    return card;
  }

  function matrix(board, rows) {
    const byPlayer = new Map();
    for (const r of rows) byPlayer.set(r.player_id + "|" + r.question_id, r);
    const head = el("tr", {}, el("th", {}, T.nameCol), questions.map((q, i) => el("th", {}, T.questionAbbr + (i + 1))), el("th", {}, T.pointsCol));
    const body = board.map((p) =>
      el(
        "tr",
        {},
        el("td", {}, p.name),
        questions.map((q) => {
          const r = byPlayer.get(p.id + "|" + q.id);
          if (!r) return el("td", { class: "c-none" }, "·");
          const cls = r.points === 1 || Number(r.points) === 1 ? "c-good" : Number(r.points) > 0 ? "c-partial" : r.answer === "" ? "c-none" : "c-bad";
          const sym = cls === "c-good" ? "✓" : cls === "c-partial" ? "½" : cls === "c-none" ? "–" : "✗";
          return withTooltip(el("td", { class: cls }, sym), p.name + " · " + T.questionAbbr + (questions.indexOf(q) + 1) + ": " + answerLabel(q, r.answer));
        }),
        el("td", {}, el("b", {}, fmt(p.points)))
      )
    );
    return el(
      "section",
      { class: "card matrix-wrap" },
      el("h2", {}, T.allAnswers),
      el("p", { class: "muted" }, T.matrixLegend),
      el("table", { class: "matrix" }, el("thead", {}, head), el("tbody", {}, body))
    );
  }

  // ---------- Vy ----------
  function statsHeader(info, tiles) {
    return el(
      "div",
      { class: "stats-header" },
      el(
        "div",
        {},
        el("h1", {}, title),
        el(
          "p",
          { class: "muted" },
          "Admin · session ”" + cfg.SESSION + "” · " + info + " · ",
          el("button", { class: "link-btn", type: "button", disabled: busy, onclick: resetSession }, T.resetBoard),
          " · ",
          el("button", { class: "link-btn", type: "button", onclick: () => (store.logout(), renderLogin()) }, T.logOut)
        )
      ),
      el("div", { class: "tiles" }, tiles)
    );
  }

  async function adminAction(fn) {
    busy = true;
    actionError = "";
    try {
      await fn();
    } catch (err) {
      actionError = err.status === 401 || err.status === 403 ? T.noPermission : T.actionFailed;
    }
    busy = false;
    await refresh();
  }

  function resetSession() {
    const ok = confirm(T.resetConfirm(cfg.SESSION));
    if (ok) adminAction(store.resetQuiz);
  }

  // Väntrum innan start: vilka som anslutit och startknappen. Visar inget facit, så det går att visa på storskärm.
  function drawLobby(lobby) {
    const n = lobby.players.length;
    const joinUrl = new URL(".", location.href).href.replace(/^https?:\/\//, "").replace(/\/$/, "");
    root.replaceChildren(
      statsHeader(T.waitingForStart, tile(n, T.joinedTile(n))),
      el(
        "section",
        { class: "card lobby-admin" },
        el("p", { class: "waiting" }, el("span", { class: "pulse", "aria-hidden": "true" }), T.waitingForPlayers),
        el("p", { class: "join-url" }, T.goTo(el("b", {}, joinUrl))),
        el("ul", { class: "chips big" }, n ? lobby.players.map((p) => el("li", {}, p.name)) : el("li", { class: "empty" }, T.nobodyYet)),
        el(
          "button",
          { class: "btn-primary btn-start", type: "button", disabled: busy, onclick: () => adminAction(store.startQuiz) },
          busy ? T.pleaseWait : T.startQuiz(n)
        ),
        actionError ? el("p", { class: "error" }, actionError) : null
      )
    );
  }

  function draw(rows, lobby) {
    const board = leaderboard(rows);
    const finished = board.filter((p) => p.answered === questions.length).length;
    const avg = board.length ? board.reduce((s, p) => s + p.points, 0) / board.length : 0;
    const startedAt = new Date(lobby.started_at).toLocaleTimeString(T.locale, { hour: "2-digit", minute: "2-digit" });

    const header = statsHeader(T.startedInfo(startedAt, REFRESH_MS / 1000), [
      tile(Math.max(board.length, lobby.players.length), T.participants),
      tile(finished, T.finished),
      tile(fmt(avg), T.avgOf(questions.length)),
    ]);
    if (actionError) header.append(el("p", { class: "error" }, actionError));

    const list = el("ol", { class: "board" });
    board.forEach((p, i) =>
      list.append(
        el(
          "li",
          {},
          el("span", { class: "rank" }, i + 1 + "."),
          el("span", { class: "name", title: p.name }, p.name, " ", el("span", { class: "sub" }, p.answered + "/" + questions.length)),
          el("span", { class: "pts" }, fmt(p.points))
        )
      )
    );
    if (!board.length) list.append(el("li", {}, el("span"), el("span", { class: "muted" }, T.noAnswers), el("span")));

    const aside = el("aside", { class: "card" }, el("h2", {}, T.leaderboard), list);
    const stats = el("div", { class: "qstats" }, questions.map((q, i) => questionCard(q, i, rows)));
    root.replaceChildren(header, el("div", { class: "layout" }, aside, stats), matrix(board, rows));
  }

  async function refresh() {
    try {
      if (!keys) {
        const list = await store.fetchKeys();
        if (!list.length) {
          renderLogin(T.notAdmin);
          store.logout();
          return;
        }
        keys = Object.fromEntries(list.map((k) => [k.id, k]));
      }
      const lobby = await store.lobby();
      if (!lobby.started_at) drawLobby(lobby);
      else draw(await store.fetchAllAnswers(), lobby);
    } catch (err) {
      if (err.status === 401 || err.status === 403) renderLogin(T.loginAgain);
    }
  }

  async function start() {
    if (!(await store.accessToken())) return renderLogin();
    keys = null;
    root.replaceChildren(el("p", { class: "muted" }, T.loading));
    await refresh();
    clearInterval(poll);
    poll = setInterval(refresh, REFRESH_MS);
  }

  start();
})();
