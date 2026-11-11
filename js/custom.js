// ===================================================
// Власні справи — фільми, які додає користувач
// ---------------------------------------------------
// Каталог живий: можна завести нову справу прямо з сайту.
// Власні справи зберігаються в браузері і при наступному
// відкритті сайту знову підвантажуються в архів.
// ===================================================

const customStore = {
  mem: [],
  read() {
    try { return JSON.parse(localStorage.getItem("kino-custom") || "[]"); }
    catch (e) { return this.mem; }
  },
  write(arr) {
    this.mem = arr;
    try { localStorage.setItem("kino-custom", JSON.stringify(arr)); }
    catch (e) { /* працюємо з пам'яті */ }
  },
};

// простий захист від кривих символів у введених даних
function escapeHTML(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function decadeFromYear(y) {
  if (y < 1990) return "classic";
  if (y < 2000) return "90s";
  if (y < 2010) return "00s";
  if (y < 2020) return "10s";
  return "20s";
}

// підвантажуємо власні справи одразу, до першого рендера
(function loadCustomFilms() {
  customStore.read().forEach(c => {
    c.custom = true;
    films.push(c);
  });
})();

function addCustomFilm(data) {
  const film = {
    title: escapeHTML(data.title).trim(),
    year: Number(data.year),
    decade: decadeFromYear(Number(data.year)),
    tags: data.tags.length ? data.tags : ["drama"],
    rating: data.rating === "" ? null : Number(data.rating),
    desc: escapeHTML(data.desc).trim() || "Нотатки поки нема — справу щойно завели.",
    custom: true,
  };
  if (data.series) film.series = true;
  if (data.date) film.date = true;

  films.push(film);
  customStore.write(customStore.read().concat([{ ...film }]));
  return films.length - 1;
}

function removeCustomFilm(f) {
  const i = films.indexOf(f);
  if (i !== -1) films.splice(i, 1);
  customStore.write(customStore.read().filter(c => !(c.title === f.title && c.year === f.year)));
}
