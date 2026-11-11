// ===================================================
// Кіно для тебе — логіка картотеки
// Фільтри, пошук, сортування, досьє і схожі справи
// ===================================================

const DECADES = ["classic", "90s", "00s", "10s", "20s"];
const DECADE_LABELS = {
  classic: "Класика · до 90-х",
  "90s": "90-ті",
  "00s": "00-ті",
  "10s": "10-ті",
  "20s": "20-ті",
};

const TAG_LABELS = {
  crime: "кримінал",
  comedy: "комедія",
  action: "екшн",
  thriller: "трилер",
  drama: "драма",
  heist: "пограбування",
  sport: "спорт",
  horror: "горор",
};

// стан фільтрів
let state = {
  filter: "all",   // all | decade | tag | series | date | planned
  search: "",
  sort: "default", // default | rating | year | title
};

// ---------- допоміжні ----------

function caseNo(f) {
  // номер справи = позиція фільму в базі, з нулями як у справжніх архівах
  return String(films.indexOf(f) + 1).padStart(3, "0");
}

function stampHTML(f) {
  if (f.rating === null) return `<div class="stamp wanted">В розшуку</div>`;
  if (f.rating >= 12) return `<div class="stamp legend">${f.rating}/10 !!!</div>`;
  if (f.rating === 10) return `<div class="stamp legend">10/10</div>`;
  return `<div class="stamp">★ ${f.rating}/10</div>`;
}

function tagsHTML(f) {
  const genre = f.tags.map(t => `<span class="tag ${t}">${TAG_LABELS[t] || t}</span>`).join("");
  const series = f.series ? `<span class="tag series">серіал</span>` : "";
  const date = f.date ? `<span class="tag date">💘 побачення</span>` : "";
  return series + genre + date;
}

// ---------- фото-вещдок ----------
// обкладинки генеруються програмно: дуотон за головним жанром,
// зерно плівки і "ініціали" фільму. Якщо у фільму задано poster —
// замість згенерованої показується справжня картинка.

const TAG_PHOTO = {
  crime:    ["#7a2018", "#2a0c08"],
  comedy:   ["#8a6a1a", "#3a2a08"],
  action:   ["#2e5a3e", "#0e2416"],
  thriller: ["#27405c", "#0c1826"],
  drama:    ["#4e3566", "#1e1228"],
  heist:    ["#5e3222", "#26120a"],
  sport:    ["#1e565a", "#0a2426"],
  horror:   ["#46224a", "#1a0a1c"],
};

function initials(title) {
  const words = title.replace(/[«»"':,.!?()]/g, "").split(/[\s-]+/).filter(w => w.length);
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function polaroidHTML(f, big = false) {
  const [c1, c2] = TAG_PHOTO[f.tags[0]] || ["#4a4a4a", "#1a1a1a"];
  const photo = f.poster
    ? `<img src="${f.poster}" alt="${f.title}">`
    : `<div class="ph-gen" style="background:linear-gradient(160deg,${c1},${c2})">
         <span class="ph-init">${initials(f.title)}</span>
         <span class="ph-year">${f.year}</span>
       </div>`;
  return `<div class="polaroid${big ? " big" : ""}">
    <div class="pin"></div>
    <div class="ph-frame">${photo}</div>
    <div class="ph-caption">спр. № ${caseNo(f)}</div>
  </div>`;
}

function cardHTML(f) {
  const idx = films.indexOf(f);
  return `<div class="card" data-case="${caseNo(f)}" data-idx="${idx}">
    <div class="card-top">
      <div>
        <div class="card-title">${f.title}</div>
        <div class="year-badge">${f.year}</div>
      </div>
      ${polaroidHTML(f)}
    </div>
    ${stampHTML(f)}
    <div class="tags">${tagsHTML(f)}</div>
    <div class="card-desc">${f.desc}</div>
  </div>`;
}

// ---------- фільтрація і сортування ----------

function applyFilters() {
  let list = films.slice();
  const f = state.filter;

  if (DECADES.includes(f)) list = list.filter(x => x.decade === f);
  else if (f === "series") list = list.filter(x => x.series);
  else if (f === "date") list = list.filter(x => x.date);
  else if (f === "planned") list = list.filter(x => x.rating === null);
  else if (f !== "all") list = list.filter(x => x.tags.includes(f));

  if (state.search) {
    const q = state.search.toLowerCase().trim();
    list = list.filter(x =>
      x.title.toLowerCase().includes(q) ||
      x.desc.toLowerCase().includes(q) ||
      String(x.year).includes(q)
    );
  }
  return list;
}

function sortList(list) {
  const s = state.sort;
  const copy = list.slice();
  if (s === "rating") copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  else if (s === "year") copy.sort((a, b) => b.year - a.year);
  else if (s === "title") copy.sort((a, b) => a.title.localeCompare(b.title, "uk"));
  return copy;
}

// ---------- рендер ----------

function render() {
  const main = document.getElementById("main-content");
  const list = sortList(applyFilters());

  if (!list.length) {
    main.innerHTML = `<div class="empty">Справу не знайдено. Архіваріус розводить руками 🤷<br>Спробуй інший запит або скинь фільтри.</div>`;
    return;
  }

  let html = "";

  if (state.filter === "date") {
    html += `<div class="date-banner">перевірено на побаченнях: цікаво обом, є що обговорити, ніхто не заснув 💘</div>`;
  }

  const grouped = state.sort === "default" && state.filter === "all" && !state.search;

  if (grouped) {
    DECADES.forEach(d => {
      const group = list.filter(x => x.decade === d);
      if (!group.length) return;
      html += `<div class="decade-label">${DECADE_LABELS[d]}</div><div class="grid">`;
      html += group.map(cardHTML).join("");
      html += `</div>`;
    });
  } else {
    html += `<div class="section-title">Знайдено справ: ${list.length}</div><div class="grid">`;
    html += list.map(cardHTML).join("");
    html += `</div>`;
  }

  main.innerHTML = html;
}

// ---------- схожі справи ----------

function similarFilms(f, count = 4) {
  return films
    .filter(x => x !== f)
    .map(x => {
      let score = 0;
      // спільні жанри — головний критерій
      score += x.tags.filter(t => f.tags.includes(t)).length * 3;
      // та сама епоха — плюс до вайбу
      if (x.decade === f.decade) score += 1;
      // серіал до серіалу
      if (!!x.series === !!f.series) score += 1;
      // близькі оцінки (якщо обидва оцінені)
      if (f.rating !== null && x.rating !== null && Math.abs(f.rating - x.rating) <= 1) score += 1;
      return { film: x, score };
    })
    .filter(s => s.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(s => s.film);
}

// ---------- досьє ----------

function openDossier(idx, randomMode = false) {
  const f = films[idx];
  if (!f) return;

  // прибираємо попереднє досьє, якщо відкрите
  document.querySelectorAll(".dossier-overlay").forEach(el => el.remove());

  const status = f.rating === null
    ? "В РОЗШУКУ — ще не переглянуто"
    : "ПЕРЕГЛЯНУТО, вирок винесено";

  const similar = similarFilms(f);
  const similarHTML = similar.length
    ? `<div class="similar-title">Схожі справи в архіві</div>
       <div class="similar-list">${similar.map(s => `
         <div class="similar-item" data-idx="${films.indexOf(s)}">
           <span class="s-title">${s.title}</span>
           <span class="s-meta">${s.year} · ${s.rating === null ? "в розшуку" : (s.rating >= 10 ? s.rating + "/10 🔥" : "★ " + s.rating)}</span>
         </div>`).join("")}
       </div>`
    : "";

  const trailerURL = "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(`${f.title} ${f.year} трейлер`);

  const overlay = document.createElement("div");
  overlay.className = "dossier-overlay";
  overlay.innerHTML = `<div class="dossier">
    ${stampHTML(f)}
    <div class="case-no">${randomMode ? "🎲 випадкова справа" : "архів · справа"} № ${caseNo(f)}</div>
    <div class="dossier-head">
      <h2>${f.title}</h2>
      ${polaroidHTML(f, true)}
    </div>
    <table>
      <tr><td>Рік</td><td>${f.year}</td></tr>
      <tr><td>Категорія</td><td>${f.tags.map(t => TAG_LABELS[t] || t).join(", ")}${f.series ? " · серіал" : ""}</td></tr>
      ${f.cast ? `<tr><td>Фігуранти</td><td>${f.cast.join(", ")}</td></tr>` : ""}
      <tr><td>Статус</td><td>${status}</td></tr>
      ${f.date ? `<tr><td>Примітка</td><td>перевірено: підходить для побачення 💘</td></tr>` : ""}
    </table>
    <div class="note">${f.desc}</div>
    <a class="trailer-btn" href="${trailerURL}" target="_blank" rel="noopener">▶ Дивитись трейлер на YouTube</a>
    <div class="verdict-slot">${verdictSummaryHTML(f)}</div>
    ${similarHTML}
    ${randomMode ? `<button class="redraw-btn" data-action="redraw">🎲 Витягнути іншу</button>` : ""}
    ${f.custom ? `<button class="destroy-btn" data-action="destroy">🔥 Знищити справу</button>` : ""}
    <button class="close-btn" data-action="close">Закрити справу</button>
  </div>`;

  overlay.addEventListener("click", e => {
    if (e.target === overlay) { overlay.remove(); return; }

    // --- вирок присяжного ---
    const slot = overlay.querySelector(".verdict-slot");
    const action = e.target.closest("[data-action]");

    if (action && action.dataset.action === "verdict-form") {
      slot.innerHTML = verdictFormHTML(f);
      return;
    }
    if (e.target.closest(".score-btn")) {
      slot.querySelectorAll(".score-btn").forEach(b => b.classList.remove("picked"));
      e.target.closest(".score-btn").classList.add("picked");
      return;
    }
    if (action && action.dataset.action === "verdict-save") {
      if (collectAndSaveVerdict(f, slot)) slot.innerHTML = verdictSummaryHTML(f);
      return;
    }
    if (action && action.dataset.action === "verdict-delete") {
      deleteVerdict(f);
      slot.innerHTML = verdictSummaryHTML(f);
      return;
    }
    if (e.target.closest(".verdict-form") || e.target.closest(".verdict-box")) return;

    // --- решта кнопок досьє ---
    if (action) {
      if (action.dataset.action === "destroy") {
        if (!confirm(`Точно знищити справу «${f.title}»? Назад дороги нема.`)) return;
        removeCustomFilm(f);
        overlay.remove();
        renderStats();
        render();
        return;
      }
      overlay.remove();
      if (action.dataset.action === "redraw") randomFilm();
      return;
    }
    const sim = e.target.closest(".similar-item");
    if (sim) openDossier(Number(sim.dataset.idx));
  });

  document.body.appendChild(overlay);
}

// ---------- рулетка ----------

function randomFilm() {
  // рулетка поважає активний фільтр: стоїть «комедія» — випаде комедія
  const pool = applyFilters();
  const list = pool.length ? pool : films;
  const f = list[Math.floor(Math.random() * list.length)];
  openDossier(films.indexOf(f), true);
}

// ---------- обробники ----------

function filter(type, btn) {
  state.filter = type;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  if (btn) btn.classList.add("active");
  render();
}

function search(value) {
  state.search = value;
  render();
}

function setSort(value) {
  state.sort = value;
  render();
}

// ---------- статистика ----------

function renderStats() {
  const rated = films.filter(f => f.rating !== null);
  const avg = (rated.reduce((s, f) => s + Math.min(f.rating, 10), 0) / rated.length).toFixed(1);
  const tens = films.filter(f => f.rating >= 10).length;

  document.getElementById("total-count").textContent = films.length;
  document.getElementById("avg-rating").textContent = avg;
  document.getElementById("tens-count").textContent = tens;
}

// ---------- дошка слідчого ----------
// центральний фільм + схожі справи навколо, з'єднані червоними нитками.
// клік по сусідній справі — вона стає центром. Так можна гуляти архівом.

function closeBoard() {
  document.querySelectorAll(".board-overlay").forEach(el => el.remove());
}

function openBoard(idx) {
  closeBoard();
  document.querySelectorAll(".dossier-overlay").forEach(el => el.remove());

  // якщо не сказали з кого почати — беремо випадкову справу з вироком 9+
  if (idx === undefined) {
    const top = films.filter(f => f.rating !== null && f.rating >= 9);
    idx = films.indexOf(top[Math.floor(Math.random() * top.length)]);
  }

  const f = films[idx];
  const neighbors = similarFilms(f, 6);

  const overlay = document.createElement("div");
  overlay.className = "board-overlay";
  overlay.innerHTML = `
    <div class="board-title">🧵 Дошка слідчого <span>— клікай по справах, щоб тягнути нитку далі</span></div>
    <button class="board-close">✕ Закрити дошку</button>
    <svg class="board-lines"></svg>
    <div class="board-nodes"></div>`;
  document.body.appendChild(overlay);

  const nodesBox = overlay.querySelector(".board-nodes");
  const svg = overlay.querySelector(".board-lines");
  const W = overlay.clientWidth, H = overlay.clientHeight;
  const cx = W / 2, cy = H / 2 + 14;
  const rx = Math.min(W * 0.34, 380), ry = Math.min(H * 0.30, 250);

  function nodeHTML(film, x, y, center = false) {
    const el = document.createElement("div");
    el.className = "board-node" + (center ? " center" : "");
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.setProperty("--rot", (Math.random() * 6 - 3).toFixed(1) + "deg");
    el.dataset.idx = films.indexOf(film);
    el.innerHTML = `${polaroidHTML(film, center)}
      <div class="bn-title">${film.title}</div>
      <div class="bn-meta">${film.rating === null ? "в розшуку" : "★ " + film.rating + "/10"}</div>`;
    return el;
  }

  // центр
  nodesBox.appendChild(nodeHTML(f, cx, cy, true));

  // сусіди по колу + нитки
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  neighbors.forEach((n, i) => {
    const angle = (Math.PI * 2 * i) / neighbors.length - Math.PI / 2;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    nodesBox.appendChild(nodeHTML(n, x, y));

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", cx); line.setAttribute("y1", cy);
    line.setAttribute("x2", x);  line.setAttribute("y2", y);
    svg.appendChild(line);
  });

  overlay.addEventListener("click", e => {
    if (e.target.closest(".board-close")) { closeBoard(); return; }
    const node = e.target.closest(".board-node");
    if (node && !node.classList.contains("center")) openBoard(Number(node.dataset.idx));
  });
}

// ---------- кінопрофіль ----------

function openProfile() {
  document.querySelectorAll(".dossier-overlay").forEach(el => el.remove());

  const rated = films.filter(f => f.rating !== null);
  const avg = (rated.reduce((s, f) => s + Math.min(f.rating, 10), 0) / rated.length).toFixed(1);
  const tens = films.filter(f => f.rating >= 10).length;
  const wanted = films.length - rated.length;

  // розподіл вироків
  const marks = [5, 6, 7, 8, 9, 10, 12];
  const markCounts = marks.map(m => ({
    m,
    n: rated.filter(f => Math.round(f.rating) === m || (m === 12 && f.rating >= 12)).length,
  })).filter(x => x.n > 0);
  const maxMark = Math.max(...markCounts.map(x => x.n));

  // жанри
  const tagCounts = Object.keys(TAG_LABELS).map(t => ({
    t, n: films.filter(f => f.tags.includes(t)).length,
  })).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  const maxTag = Math.max(...tagCounts.map(x => x.n));

  // епохи
  const decCounts = DECADES.map(d => ({
    d, n: films.filter(f => f.decade === d).length,
  })).filter(x => x.n > 0);
  const maxDec = Math.max(...decCounts.map(x => x.n));

  const bar = (label, n, max, suffix = "") =>
    `<div class="bar-row">
       <div class="bar-label">${label}</div>
       <div class="bar-track"><div class="bar-fill" style="width:${Math.round(n / max * 100)}%"></div></div>
       <div class="bar-val">${n}${suffix}</div>
     </div>`;

  const overlay = document.createElement("div");
  overlay.className = "dossier-overlay";
  overlay.innerHTML = `<div class="dossier profile">
    <div class="case-no">архів · зведення по фігуранту</div>
    <h2>Мій кінопрофіль</h2>
    <div class="profile-stats">
      <div><strong>${films.length}</strong>справ</div>
      <div><strong>${avg}</strong>середній вирок</div>
      <div><strong>${tens}</strong>на 10/10</div>
      <div><strong>${wanted}</strong>в розшуку</div>
    </div>
    <div class="similar-title">Розподіл вироків</div>
    ${markCounts.map(x => bar((x.m >= 12 ? "12/10 🔥" : x.m + "/10"), x.n, maxMark)).join("")}
    <div class="similar-title" style="margin-top:18px">Жанровий профіль</div>
    ${tagCounts.map(x => bar(TAG_LABELS[x.t], x.n, maxTag)).join("")}
    <div class="similar-title" style="margin-top:18px">Епохи</div>
    ${decCounts.map(x => bar(DECADE_LABELS[x.d], x.n, maxDec)).join("")}
    <div class="profile-verdict">Висновок слідства: суб'єкт має стійку залежність від кримінальних комедій та екшну. Виправленню не підлягає.</div>
    <button class="close-btn" data-action="close">Закрити зведення</button>
  </div>`;

  overlay.addEventListener("click", e => {
    if (e.target === overlay || e.target.closest("[data-action='close']")) overlay.remove();
  });
  document.body.appendChild(overlay);
}

// ---------- стіна особливо важливих справ ----------
// топ-вироки (10/10) впереміш з парою свіжих надходжень.
// склад стіни трохи міняється при кожному оновленні сторінки.

function renderFeatured() {
  const strip = document.getElementById("featured-strip");
  if (!strip) return;

  const tops = films.filter(f => f.rating !== null && f.rating >= 10);
  const shuffled = tops.slice().sort(() => Math.random() - 0.5).slice(0, 6);

  // свіжі надходження — найновіші за роком, яких ще нема серед топів
  const fresh = films
    .filter(f => !shuffled.includes(f))
    .sort((a, b) => b.year - a.year)
    .slice(0, 2);

  const items = [...shuffled, ...fresh];

  strip.innerHTML = items.map(f => {
    const isFresh = fresh.includes(f);
    return `<div class="featured-item" data-idx="${films.indexOf(f)}">
      ${polaroidHTML(f)}
      <div class="fi-title">${f.title}</div>
      <div class="fi-badge${isFresh ? " fresh" : ""}">${isFresh ? "свіже надходження" : (f.rating >= 12 ? f.rating + "/10 🔥" : "10/10")}</div>
    </div>`;
  }).join("");

  strip.addEventListener("click", e => {
    const item = e.target.closest(".featured-item");
    if (item) openDossier(Number(item.dataset.idx));
  });
}

// ---------- завести нову справу ----------

function openAddForm() {
  document.querySelectorAll(".dossier-overlay").forEach(el => el.remove());

  const tagChecks = Object.entries(TAG_LABELS)
    .map(([k, label]) => `<label class="quick-opt tag-check">
       <input type="checkbox" name="tags" value="${k}"><span>${label}</span>
     </label>`).join("");

  const scoreOpts = ['<option value="">ще не дивився (в розшуку)</option>']
    .concat(Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}/10</option>`))
    .join("");

  const overlay = document.createElement("div");
  overlay.className = "dossier-overlay";
  overlay.innerHTML = `<div class="dossier">
    <div class="case-no">архів · нове провадження</div>
    <h2>Завести справу</h2>

    <div class="vf-label">Назва фільму *</div>
    <input type="text" class="add-input" id="add-title" maxlength="80" placeholder="Наприклад: Джентльмени">

    <div class="vf-label">Рік *</div>
    <input type="number" class="add-input" id="add-year" min="1900" max="2030" placeholder="2019">

    <div class="vf-label">Категорія (можна кілька)</div>
    <div class="tag-checks">${tagChecks}</div>

    <div class="vf-label">Вирок</div>
    <select class="add-input" id="add-rating">${scoreOpts}</select>

    <div class="add-flags">
      <label class="quick-opt"><input type="checkbox" id="add-series"><span>це серіал</span></label>
      <label class="quick-opt"><input type="checkbox" id="add-date"><span>💘 підходить на побачення</span></label>
    </div>

    <div class="vf-label">Нотатка до справи</div>
    <textarea class="verdict-text" id="add-desc" maxlength="200" placeholder="Пара слів від себе..."></textarea>

    <button class="verdict-save-btn" data-action="add-save">Відкрити провадження</button>
    <button class="close-btn" data-action="close" style="margin-top:8px">Скасувати</button>
  </div>`;

  overlay.addEventListener("click", e => {
    if (e.target === overlay) { overlay.remove(); return; }
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    if (btn.dataset.action === "close") { overlay.remove(); return; }

    if (btn.dataset.action === "add-save") {
      const title = overlay.querySelector("#add-title").value.trim();
      const year = overlay.querySelector("#add-year").value.trim();

      if (!title || !year || Number(year) < 1900 || Number(year) > 2030) {
        alert("Без назви і нормального року справу не заводимо. Порядок є порядок.");
        return;
      }
      if (films.some(f => f.title.toLowerCase() === title.toLowerCase() && f.year === Number(year))) {
        alert("Така справа вже є в архіві. Двічі не судимо.");
        return;
      }

      const idx = addCustomFilm({
        title,
        year,
        tags: Array.from(overlay.querySelectorAll('input[name="tags"]:checked')).map(i => i.value),
        rating: overlay.querySelector("#add-rating").value,
        series: overlay.querySelector("#add-series").checked,
        date: overlay.querySelector("#add-date").checked,
        desc: overlay.querySelector("#add-desc").value,
      });

      overlay.remove();
      renderStats();
      render();
      openDossier(idx);
    }
  });

  document.body.appendChild(overlay);
}

// ---------- про архів ----------

function openAbout() {
  document.querySelectorAll(".dossier-overlay").forEach(el => el.remove());

  const overlay = document.createElement("div");
  overlay.className = "dossier-overlay";
  overlay.innerHTML = `<div class="dossier profile">
    <div class="case-no">архів · службова записка</div>
    <h2>Про цей архів</h2>
    <div class="note" style="margin-bottom:16px">
      Все почалося з нотатки в телефоні, куди я роками записував переглянуті фільми.
      Коли список перевалив за 300 рядків і перетворився на хаос — стало ясно,
      що нотатками тут не обійтись. Так і з'явилась ця картотека.
    </div>
    <div class="note" style="margin-bottom:18px">
      Чому саме справи і досьє? Гляньте на жанровий профіль у «Кінопрофілі» —
      половина архіву так чи інакше про криміналітет. Сайт просто чесно
      відображає смаки свого архіваріуса.
    </div>

    <div class="similar-title">Технічна довідка</div>
    <table>
      <tr><td>Архіваріус</td><td>Лучников Іван, група 316, ХТУ «ШАГ»</td></tr>
      <tr><td>Фронтенд</td><td>HTML + CSS + чистий JavaScript, без фреймворків</td></tr>
      <tr><td>Дані</td><td>власна база у js/films.js + власні справи у сховищі браузера</td></tr>
      <tr><td>Постери</td><td>TMDB API з кешуванням; без інтернету — згенеровані обкладинки</td></tr>
      <tr><td>Бекенд</td><td>відсутній свідомо: сайт статичний і працює звідусіль</td></tr>
    </table>

    <div class="similar-title" style="margin-top:18px">Історія версій</div>
    <div class="changelog">
      <div><span>v0.1</span> один HTML-файл, 5 фільмів і великі плани</div>
      <div><span>v0.2</span> фільтри за роками та жанрами, пошук, темна тема</div>
      <div><span>v0.3</span> повний редизайн у картотеку справ — найкраще рішення за весь проєкт</div>
      <div><span>v0.4</span> досьє фільмів, схожі справи, дошка слідчого, кінопрофіль</div>
      <div><span>v0.5</span> справжні постери через TMDB API, вироки присяжних</div>
      <div><span>v1.0</span> можна заводити власні справи. Архів оголошується відкритим</div>
    </div>

    <button class="close-btn" data-action="close" style="margin-top:20px">Закрити записку</button>
  </div>`;

  overlay.addEventListener("click", e => {
    if (e.target === overlay || e.target.closest("[data-action='close']")) overlay.remove();
  });
  document.body.appendChild(overlay);
}

// ---------- старт ----------

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderFeatured();
  render();

  // делегування кліків по картках
  document.getElementById("main-content").addEventListener("click", e => {
    const card = e.target.closest(".card");
    if (card) openDossier(Number(card.dataset.idx));
  });

  // Esc закриває досьє і дошку
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      document.querySelectorAll(".dossier-overlay").forEach(el => el.remove());
      closeBoard();
    }
  });
});
