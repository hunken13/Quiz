(function () {
  const { title, subtitle, questions } = window.QUIZ;
  const cfg = window.QUIZ_CONFIG;
  const store = window.QuizStore;
  const app = document.getElementById("app");
  const STATE_KEY = "quiz-state-" + cfg.SESSION;
  const LETTERS = "ABCDEFGH";

  let state = load() || { playerId: newId(), name: "", index: 0, points: 0, results: {} };

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
  function fmtPoints(p) {
    return String(p).replace(".", ",");
  }

  function render() {
    app.replaceChildren();
    if (!store.remote) {
      app.append(el("div", { class: "demo-banner" }, "Demoläge: svaren sparas bara i den här webbläsaren."));
    }
    if (!state.name) return renderStart();
    if (state.index >= questions.length) return renderEnd();
    renderQuestion();
  }

  function renderStart() {
    const input = el("input", { type: "text", id: "name", maxlength: "40", autocomplete: "name", placeholder: "Förnamn och efternamnets initial" });
    const btn = el("button", { class: "btn-primary", type: "submit", disabled: true }, "Starta quizet");
    input.addEventListener("input", () => (btn.disabled = !input.value.trim()));
    const form = el(
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
      el("p", { class: "muted" }, questions.length + " frågor. Du får se rätt svar och en förklaring efter varje fråga."),
      el("label", { for: "name" }, "Ditt namn (visas i topplistan)"),
      input,
      btn
    );
    app.append(form);
    input.focus();
  }

  function renderQuestion() {
    const q = questions[state.index];
    const answered = state.results[q.id];
    const card = el("section", { class: "card" });
    const pct = (state.index / questions.length) * 100;
    card.append(
      el(
        "div",
        { class: "progress" },
        el("span", { class: "muted" }, "Fråga " + (state.index + 1) + " av " + questions.length),
        el("div", { class: "progress-bar", "aria-hidden": "true" }, el("span", { style: "width:" + pct + "%" }))
      ),
      el("h2", {}, q.text)
    );

    const submit = (answer) => {
      if (state.results[q.id]) return;
      const res = store.score(q, answer);
      state.results[q.id] = { answer, ...res };
      state.points += res.points;
      save();
      render();
      store
        .saveAnswer({
          player_id: state.playerId,
          player_name: state.name,
          question_id: q.id,
          answer: String(answer),
          correct: res.correct,
          points: res.points,
        })
        .catch((err) => {
          const box = document.querySelector(".feedback");
          if (box) box.after(el("p", { class: "error" }, err.message + ". Kontrollera uppkopplingen."));
        });
    };

    if (q.type === "mc" || q.type === "tf") {
      const opts = q.type === "tf" ? [["true", "Sant"], ["false", "Falskt"]] : q.options.map((o, i) => [String(i), o]);
      const correctValue = String(q.correct);
      const list = el("div", { class: "options" + (q.type === "tf" ? " tf" : "") });
      opts.forEach(([value, label], i) => {
        let cls = "option";
        if (answered) {
          if (value === correctValue) cls += " is-correct";
          else if (value === answered.answer) cls += " is-wrong";
        }
        list.append(
          el(
            "button",
            { class: cls, type: "button", disabled: Boolean(answered), onclick: () => submit(value) },
            q.type === "mc" ? el("span", { class: "key", "aria-hidden": "true" }, LETTERS[i]) : null,
            el("span", {}, label)
          )
        );
      });
      card.append(list);
    } else {
      const input = el("input", { type: "number", inputmode: "decimal", id: "est", step: "any", "aria-label": "Ditt svar i " + q.unit });
      if (answered) {
        input.value = answered.answer;
        input.disabled = true;
      }
      const btn = el("button", { class: "btn-primary", type: "submit", disabled: true }, "Svara");
      input.addEventListener("input", () => (btn.disabled = input.value === ""));
      card.append(
        el(
          "form",
          {
            onsubmit: (e) => {
              e.preventDefault();
              if (input.value !== "") submit(String(Number(input.value)));
            },
          },
          el("div", { class: "estimate-row" }, input, el("span", { class: "unit" }, q.unit)),
          answered ? null : btn
        )
      );
      if (!answered) setTimeout(() => input.focus(), 0);
    }

    if (answered) {
      let kind = answered.points === 1 ? "good" : answered.points > 0 ? "partial" : "bad";
      let heading = kind === "good" ? "✓ Rätt!" : kind === "partial" ? "◐ Nära! Halv poäng" : "✗ Fel";
      if (q.type === "estimate") heading += " Rätt svar: " + q.correct.toLocaleString("sv-SE") + " " + q.unit + ".";
      card.append(
        el("div", { class: "feedback " + kind, role: "status" }, el("strong", {}, heading), el("p", {}, q.explanation)),
        el(
          "button",
          {
            class: "btn-primary",
            type: "button",
            onclick: () => {
              state.index += 1;
              save();
              render();
              window.scrollTo(0, 0);
            },
          },
          state.index + 1 < questions.length ? "Nästa fråga" : "Se resultat"
        )
      );
    }
    app.append(card);
  }

  async function renderEnd() {
    const rankLine = el("p", { class: "muted" }, "Hämtar din placering…");
    app.append(
      el(
        "section",
        { class: "card" },
        el("h1", {}, "Bra jobbat, " + state.name + "!"),
        el("p", { class: "lead" }, "Du fick"),
        el("div", { class: "score-big" }, fmtPoints(state.points) + " / " + questions.length),
        el("p", { class: "muted" }, "poäng"),
        rankLine
      )
    );
    try {
      const board = store.leaderboard(await store.fetchAnswers());
      const pos = board.findIndex((p) => p.id === state.playerId);
      rankLine.textContent = pos >= 0 ? "Just nu ligger du på plats " + (pos + 1) + " av " + board.length + "." : "";
    } catch {
      rankLine.textContent = "";
    }
  }

  render();
})();
