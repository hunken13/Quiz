(function () {
  const { title, subtitle, questions } = window.QUIZ;
  const cfg = window.QUIZ_CONFIG;
  const store = window.QuizStore;
  const T = window.QUIZ_TEXT;
  const app = document.getElementById("app");
  const STATE_KEY = "quiz-state-" + cfg.SESSION;
  const LETTERS = "ABCDEFGH";
  const SECONDS = cfg.SECONDS_PER_QUESTION || 30;

  // ?ny i adressen startar om quizet som en ny deltagare (för att testa).
  if (new URLSearchParams(location.search).has("ny")) {
    try {
      localStorage.removeItem(STATE_KEY);
    } catch {}
    history.replaceState(null, "", location.pathname);
  }
  let state = load();
  if (!state || !Array.isArray(state.pending)) state = { playerId: newId(), name: "", joined: false, started: false, index: 0, startedAt: null, pending: [] };
  let timers = [];

  function newId() {
    return (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2);
  }
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY));
    } catch {
      return null;
    }
  }
  function save() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {}
  }
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
  const fmt = (n) => Number(n).toLocaleString(T.locale, { maximumFractionDigits: 1 });
  function clearTimers() {
    timers.forEach((t) => clearTimeout(t) || clearInterval(t));
    timers = [];
  }

  // Skickar sparade svar; misslyckade ligger kvar och försöks igen senare.
  let flushing = false;
  async function flush() {
    if (flushing) return;
    flushing = true;
    try {
      while (state.pending.length) {
        await store.saveAnswer(state.pending[0]);
        state.pending.shift();
        save();
      }
    } catch {
      // nytt försök vid nästa svar eller från topplistan
    } finally {
      flushing = false;
    }
  }

  function render() {
    clearTimers();
    app.replaceChildren();
    if (!state.name) return renderStart();
    if (!state.started) return renderLobby();
    if (state.index >= questions.length) return renderLeaderboard();
    renderQuestion();
  }

  function renderStart() {
    const input = el("input", { type: "text", id: "name", maxlength: "40", autocomplete: "name", placeholder: T.namePlaceholder });
    const btn = el("button", { class: "btn-primary", type: "submit", disabled: true }, T.join);
    input.addEventListener("input", () => (btn.disabled = !input.value.trim()));
    app.append(
      el(
        "form",
        {
          class: "card",
          onsubmit: (e) => {
            e.preventDefault();
            state.name = input.value.trim().slice(0, 40);
            save();
            render();
          },
        },
        el("h1", {}, title),
        el("p", { class: "lead" }, subtitle),
        el("p", { class: "muted" }, T.intro(questions.length, SECONDS)),
        el("label", { for: "name" }, T.nameLabel),
        input,
        btn
      )
    );
    input.focus();
  }

  // Väntrum: visar vilka som anslutit tills admin startar quizet.
  function renderLobby() {
    const count = el("span", { class: "muted" });
    const chips = el("ul", { class: "chips" });
    const status = el("p", { class: "muted" });
    app.append(
      el(
        "section",
        { class: "card" },
        el("h1", {}, T.youreIn(state.name)),
        el("p", { class: "waiting" }, el("span", { class: "pulse", "aria-hidden": "true" }), T.waitingForQuiz),
        el("p", { class: "muted" }, T.keepOpen)
      ),
      el("section", { class: "card", style: "margin-top:16px" }, el("div", { class: "lobby-head" }, el("h2", {}, T.inTheQuiz), count), chips, status)
    );

    const update = async () => {
      if (state.started) return;
      try {
        if (!state.joined) {
          await store.join(state.playerId, state.name);
          state.joined = true;
          save();
        }
        const lobby = await store.lobby(state.playerId);
        if (lobby.started_at) {
          state.started = true;
          save();
          return render();
        }
        const n = lobby.players.length;
        count.textContent = T.joinedCount(n);
        chips.replaceChildren(...lobby.players.map((p) => el("li", { class: p.me ? "me" : "" }, p.name)));
        status.textContent = "";
      } catch {
        status.textContent = T.lostConnection;
      }
    };
    update();
    timers.push(setInterval(update, 2000));
  }

  function renderQuestion() {
    const q = questions[state.index];
    if (!state.startedAt) {
      state.startedAt = Date.now();
      save();
    }
    const remainingMs = () => SECONDS * 1000 - (Date.now() - state.startedAt);

    let done = false;
    const submit = (answer) => {
      if (done) return;
      done = true;
      clearTimers();
      state.pending.push({ player_id: state.playerId, player_name: state.name, question_id: q.id, answer: String(answer) });
      state.index += 1;
      state.startedAt = null;
      save();
      flush();
      render();
      window.scrollTo(0, 0);
    };

    // Om sidan laddas om efter att tiden gått ut räknas frågan som obesvarad.
    if (remainingMs() <= 0) return submit("");

    const fill = el("span", { class: "timer-fill" });
    const secs = el("span", { class: "timer-secs", "aria-live": "off" });
    const card = el(
      "section",
      { class: "card" },
      el("div", { class: "progress" }, el("span", { class: "muted" }, T.questionOf(state.index + 1, questions.length)), secs),
      el("div", { class: "timer", role: "timer", "aria-label": T.timeLeft }, fill),
      el("h2", {}, q.text)
    );

    let getEstimate = null;
    if (q.type === "mc" || q.type === "tf") {
      const opts = q.type === "tf" ? [["true", T.true], ["false", T.false]] : q.options.map((o, i) => [String(i), o]);
      const list = el("div", { class: "options" + (q.type === "tf" ? " tf" : "") });
      opts.forEach(([value, label], i) => {
        list.append(
          el(
            "button",
            { class: "option", type: "button", onclick: () => submit(value) },
            q.type === "mc" ? el("span", { class: "key", "aria-hidden": "true" }, LETTERS[i]) : null,
            el("span", {}, label)
          )
        );
      });
      card.append(list);
    } else {
      const input = el("input", { type: "number", inputmode: "decimal", id: "est", step: "any", "aria-label": T.answerIn(q.unit) });
      const btn = el("button", { class: "btn-primary", type: "submit", disabled: true }, T.answer);
      input.addEventListener("input", () => (btn.disabled = input.value === ""));
      getEstimate = () => (input.value === "" ? "" : String(Number(input.value)));
      card.append(
        el(
          "form",
          {
            onsubmit: (e) => {
              e.preventDefault();
              if (input.value !== "") submit(getEstimate());
            },
          },
          el("div", { class: "estimate-row" }, input, el("span", { class: "unit" }, q.unit)),
          btn
        )
      );
      timers.push(setTimeout(() => input.focus(), 0));
    }
    app.append(card);

    // Stapeln krymper linjärt; sekundräknaren och färgen uppdateras separat.
    fill.style.width = (remainingMs() / (SECONDS * 1000)) * 100 + "%";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        fill.style.transition = "width " + remainingMs() / 1000 + "s linear";
        fill.style.width = "0%";
      })
    );
    const tick = () => {
      const left = Math.max(0, Math.ceil(remainingMs() / 1000));
      secs.textContent = left + " s";
      card.classList.toggle("hurry", left <= 10);
      card.classList.toggle("critical", left <= 5);
    };
    tick();
    timers.push(setInterval(tick, 250));
    // När tiden är ute skickas ett påbörjat skattningssvar, annars ett tomt svar.
    timers.push(setTimeout(() => submit(getEstimate ? getEstimate() : ""), remainingMs()));
  }

  function renderLeaderboard() {
    const scoreLine = el("div", { class: "score-big" }, "–");
    const list = el("ol", { class: "board" });
    const status = el("p", { class: "muted" }, T.loadingBoard);
    app.append(
      el(
        "section",
        { class: "card" },
        el("h1", {}, T.wellDone(state.name)),
        el("p", { class: "lead" }, T.yourPoints),
        scoreLine,
        el("p", { class: "muted" }, T.ofPossible(questions.length))
      ),
      el("section", { class: "card", style: "margin-top:16px" }, el("h2", {}, T.leaderboard), list, status)
    );

    const update = async () => {
      await flush();
      if (state.pending.length) {
        status.textContent = T.sendingLast;
        return;
      }
      try {
        // Admin har nollställt: tillbaka till väntrummet med samma namn.
        const lobby = await store.lobby(state.playerId);
        if (!lobby.started_at) {
          backToLobby();
          return render();
        }
        const rows = await store.leaderboard(state.playerId);
        const me = rows.findIndex((r) => r.is_me);
        if (me >= 0) scoreLine.textContent = fmt(rows[me].points);
        list.replaceChildren(
          ...rows.map((r, i) =>
            el(
              "li",
              { class: r.is_me ? "me" : "" },
              el("span", { class: "rank" }, i + 1 + "."),
              el("span", { class: "name" }, r.player_name, r.answered < questions.length ? el("span", { class: "sub" }, T.playing) : null),
              el("span", { class: "pts" }, fmt(r.points))
            )
          )
        );
        status.textContent = me >= 0 ? T.yourPlace(me + 1, rows.length) : "";
      } catch {
        status.textContent = T.boardError;
      }
    };
    update();
    timers.push(setInterval(update, 5000));
  }

  function backToLobby() {
    state = { playerId: state.playerId, name: state.name, joined: false, started: false, index: 0, startedAt: null, pending: [] };
    save();
  }

  render();
  // Om admin har nollställt medan sidan var stängd hamnar man i väntrummet när den öppnas igen.
  if (state.started) {
    store
      .lobby(state.playerId)
      .then((lobby) => {
        if (!lobby.started_at && state.started) {
          backToLobby();
          render();
        }
      })
      .catch(() => {});
  }
})();
