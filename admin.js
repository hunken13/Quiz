(function () {
  const { title, questions } = window.QUIZ;
  const cfg = window.QUIZ_CONFIG;
  const store = window.QuizStore;
  const root = document.getElementById("admin");
  const tooltip = document.getElementById("tooltip");
  const LETTERS = "ABCDEFGH";
  const REFRESH_MS = 3000;

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") node.className = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else if (v != null) node.setAttribute(k, v);
    }
    for (const c of children.flat()) if (c != null) node.append(c);
    return node;
  }
  const fmt = (n, d = 1) => Number(n).toLocaleString("sv-SE", { maximumFractionDigits: d });

  function tile(value, label) {
    return el("div", { class: "tile" }, el("div", { class: "value" }, value), el("div", { class: "label" }, label));
  }

  function barRow(label, count, total, isCorrect) {
    const pct = total ? (count / total) * 100 : 0;
    const tip = label + ": " + count + " svar (" + fmt(pct, 0) + " %)" + (isCorrect ? ", rätt svar" : "");
    const row = el(
      "div",
      { class: "bar-row" },
      el("span", { class: "opt" + (isCorrect ? " correct" : "") }, isCorrect ? el("span", { class: "badge-correct" }, "✓ ") : null, label),
      el("div", { class: "bar-track" }, el("div", { class: "bar-fill" + (isCorrect ? " correct" : ""), style: "width:" + pct + "%" })),
      el("span", { class: "num" }, fmt(pct, 0) + " %")
    );
    row.addEventListener("mousemove", (e) => {
      tooltip.textContent = tip;
      tooltip.style.left = e.clientX + 14 + "px";
      tooltip.style.top = e.clientY + 14 + "px";
      tooltip.style.opacity = 1;
    });
    row.addEventListener("mouseleave", () => (tooltip.style.opacity = 0));
    return row;
  }

  function questionStat(q, i, rows) {
    const answers = rows.filter((r) => r.question_id === q.id);
    const n = answers.length;
    const correctShare = n ? (answers.filter((r) => r.correct).length / n) * 100 : 0;
    const card = el(
      "article",
      { class: "card qstat" },
      el("h3", {}, i + 1 + ". " + q.text),
      el("div", { class: "meta" }, n + " svar" + (n ? " · " + fmt(correctShare, 0) + " % rätt" : ""))
    );
    if (q.type === "estimate") {
      const vals = answers.map((r) => Number(r.answer)).filter(Number.isFinite).sort((a, b) => a - b);
      const median = vals.length ? (vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2) : null;
      card.append(
        el(
          "div",
          { class: "est-stats" },
          el("span", {}, "Rätt svar: ", el("b", {}, fmt(q.correct) + " " + q.unit)),
          el("span", {}, "Median: ", el("b", {}, median == null ? "–" : fmt(median) + " " + q.unit)),
          el("span", {}, "Lägst–högst: ", el("b", {}, vals.length ? fmt(vals[0]) + " – " + fmt(vals[vals.length - 1]) : "–"))
        )
      );
      return card;
    }
    const opts = q.type === "tf" ? [["true", "Sant"], ["false", "Falskt"]] : q.options.map((o, j) => [String(j), LETTERS[j] + ". " + o]);
    const bars = el("div", { class: "bars" });
    for (const [value, label] of opts) {
      const count = answers.filter((r) => r.answer === value).length;
      bars.append(barRow(label, count, n, value === String(q.correct)));
    }
    card.append(bars);
    return card;
  }

  let lastError = "";

  async function refresh() {
    let rows;
    try {
      rows = await store.fetchAnswers();
      lastError = "";
    } catch (err) {
      lastError = err.message;
      rows = null;
    }
    if (rows) draw(rows);
    else if (!root.hasChildNodes()) root.append(el("p", { class: "error" }, lastError));
  }

  function draw(rows) {
    const board = store.leaderboard(rows);
    const finished = board.filter((p) => p.answered === questions.length).length;
    const avg = board.length ? board.reduce((s, p) => s + p.points, 0) / board.length : 0;

    const header = el(
      "div",
      { class: "stats-header" },
      el("div", {}, el("h1", {}, title), el("p", { class: "muted" }, "Liveresultat · session ”" + cfg.SESSION + "”" + (store.remote ? "" : " · demoläge"))),
      el("div", { class: "tiles" }, tile(board.length, "deltagare"), tile(finished, "klara"), tile(fmt(avg), "snittpoäng av " + questions.length))
    );

    const list = el("ol", { class: "board" });
    board.slice(0, 15).forEach((p, i) => {
      list.append(
        el(
          "li",
          {},
          el("span", { class: "rank" }, i + 1 + "."),
          el("span", { class: "name", title: p.name }, p.name, " ", el("span", { class: "sub" }, p.answered + "/" + questions.length)),
          el("span", { class: "pts" }, fmt(p.points))
        )
      );
    });
    if (!board.length) list.append(el("li", {}, el("span"), el("span", { class: "muted" }, "Inga svar än…"), el("span")));

    const aside = el("aside", { class: "card" }, el("h2", {}, "Topplista"), list);
    const stats = el("div", { class: "qstats" }, questions.map((q, i) => questionStat(q, i, rows)));

    root.replaceChildren(header, el("div", { class: "layout" }, aside, stats), lastError ? el("p", { class: "error" }, lastError) : null);
  }

  refresh();
  setInterval(refresh, REFRESH_MS);
})();
