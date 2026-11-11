// ===================================================
// Вирок присяжного — оцінки відвідувачів
// ---------------------------------------------------
// Слідчий (тобто я) свій вирок вже виніс. А тут кожен,
// хто зайшов на сайт, може винести власний: оцінка 1-10,
// чи передивився б, швидкий вердикт і нотатка.
// Вироки зберігаються локально в браузері відвідувача.
// ===================================================

const QUICK_VERDICTS = {
  reco: "🔥 Рекомендую всім і кожному",
  once: "👍 Разок глянути можна",
  trash: "🗑 Жахливо. Викинути справу і дивитись нормальні фільми",
};

// сховище з запасним варіантом: якщо localStorage недоступний,
// вироки живуть до перезавантаження сторінки
const verdictStore = {
  mem: {},
  read() {
    try { return JSON.parse(localStorage.getItem("kino-verdicts") || "{}"); }
    catch (e) { return this.mem; }
  },
  write(map) {
    this.mem = map;
    try { localStorage.setItem("kino-verdicts", JSON.stringify(map)); }
    catch (e) { /* нічого, працюємо з пам'яті */ }
  },
};

function verdictKey(f) {
  return `${f.title}|${f.year}`;
}

function getVerdict(f) {
  return verdictStore.read()[verdictKey(f)] || null;
}

function saveVerdict(f, verdict) {
  const map = verdictStore.read();
  map[verdictKey(f)] = verdict;
  verdictStore.write(map);
}

function deleteVerdict(f) {
  const map = verdictStore.read();
  delete map[verdictKey(f)];
  verdictStore.write(map);
}

// ---------- HTML блоку вироку в досьє ----------

function verdictSummaryHTML(f) {
  const v = getVerdict(f);
  if (!v) {
    return `<button class="verdict-open-btn" data-action="verdict-form">⚖️ Винести свій вирок</button>`;
  }
  return `<div class="verdict-box">
    <div class="similar-title">Вирок присяжного</div>
    <div class="verdict-stamp">★ ${v.score}/10</div>
    <div class="verdict-details">
      ${v.quick ? `<div>${QUICK_VERDICTS[v.quick]}</div>` : ""}
      <div>Передивився б: <strong>${v.rewatch ? "так" : "ні"}</strong></div>
      ${v.note ? `<div class="verdict-note">«${v.note}»</div>` : ""}
    </div>
    <button class="verdict-edit-btn" data-action="verdict-form">Змінити вирок</button>
  </div>`;
}

function verdictFormHTML(f) {
  const v = getVerdict(f) || {};
  const scoreBtns = Array.from({ length: 10 }, (_, i) => i + 1)
    .map(n => `<button class="score-btn${v.score === n ? " picked" : ""}" data-score="${n}">${n}</button>`)
    .join("");
  const quickOpts = Object.entries(QUICK_VERDICTS)
    .map(([k, label]) => `<label class="quick-opt">
       <input type="radio" name="quick" value="${k}" ${v.quick === k ? "checked" : ""}>
       <span>${label}</span>
     </label>`).join("");

  return `<div class="verdict-form">
    <div class="similar-title">Протокол присяжного</div>

    <div class="vf-label">Оцінка</div>
    <div class="score-row">${scoreBtns}</div>

    <div class="vf-label">Передивився б ще раз?</div>
    <div class="rewatch-row">
      <label class="quick-opt"><input type="radio" name="rewatch" value="yes" ${v.rewatch ? "checked" : ""}><span>Так, залюбки</span></label>
      <label class="quick-opt"><input type="radio" name="rewatch" value="no" ${v.rewatch === false ? "checked" : ""}><span>Ні, одного разу досить</span></label>
    </div>

    <div class="vf-label">Швидкий вердикт</div>
    ${quickOpts}

    <div class="vf-label">Нотатка присяжного (за бажанням)</div>
    <textarea class="verdict-text" maxlength="200" placeholder="Твої дві копійки про цей фільм...">${v.note || ""}</textarea>

    <button class="verdict-save-btn" data-action="verdict-save">Затвердити вирок</button>
    ${getVerdict(f) ? `<button class="verdict-delete-btn" data-action="verdict-delete">Скасувати вирок</button>` : ""}
  </div>`;
}

// зчитує форму і зберігає вирок; повертає true якщо все ок
function collectAndSaveVerdict(f, formRoot) {
  const scoreBtn = formRoot.querySelector(".score-btn.picked");
  if (!scoreBtn) {
    alert("Присяжний, без оцінки вирок не приймається. Обери від 1 до 10.");
    return false;
  }
  const rewatch = formRoot.querySelector('input[name="rewatch"]:checked');
  const quick = formRoot.querySelector('input[name="quick"]:checked');
  const note = (formRoot.querySelector(".verdict-text").value || "").trim();

  saveVerdict(f, {
    score: Number(scoreBtn.dataset.score),
    rewatch: rewatch ? rewatch.value === "yes" : false,
    quick: quick ? quick.value : null,
    note,
  });
  return true;
}
