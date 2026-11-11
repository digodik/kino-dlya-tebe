// ===================================================
// Постери з TMDB (The Movie Database)
// ---------------------------------------------------
// Як увімкнути справжні постери:
// 1. Реєструєшся на themoviedb.org (безкоштовно)
// 2. Settings → API → створюєш ключ (API Key v3)
// 3. Вставляєш ключ у рядок нижче між лапками
// 4. Відкриваєш сайт — постери підтягнуться самі
//
// Без ключа або без інтернету сайт показує згенеровані
// обкладинки-вещдоки — нічого не ламається.
// ===================================================

const TMDB_API_KEY = "6b743d6503917c985b78e1d7f68a097b"; // ← сюди ключ, наприклад: "a1b2c3d4..."

const TMDB_SEARCH = "https://api.themoviedb.org/3/search/";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

// простий кеш, щоб не смикати API при кожному відкритті сторінки
const posterCache = {
  read() {
    try { return JSON.parse(localStorage.getItem("kino-posters") || "{}"); }
    catch (e) { return {}; }
  },
  write(map) {
    try { localStorage.setItem("kino-posters", JSON.stringify(map)); }
    catch (e) { /* якщо сховище недоступне — просто працюємо без кешу */ }
  },
};

function posterKey(f) {
  return `${f.title}|${f.year}`;
}

// підставляє постер у вже намальовані картки без повного перерендеру
function applyPosterToDOM(idx, url) {
  document.querySelectorAll(`[data-idx="${idx}"] .ph-frame`).forEach(frame => {
    frame.innerHTML = `<img src="${url}" alt="" loading="lazy">`;
  });
}

async function fetchPoster(f) {
  const type = f.series ? "tv" : "movie";
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query: f.title,
    language: "uk-UA",
  });
  if (!f.series) params.set("year", f.year);
  else params.set("first_air_date_year", f.year);

  const res = await fetch(TMDB_SEARCH + type + "?" + params);
  if (!res.ok) throw new Error("TMDB " + res.status);
  const data = await res.json();
  const hit = (data.results || []).find(r => r.poster_path);
  return hit ? TMDB_IMG + hit.poster_path : null;
}

async function loadPosters() {
  if (!TMDB_API_KEY) return; // ключа нема — лишаємось на вещдоках

  const cache = posterCache.read();
  let updated = false;

  for (let i = 0; i < films.length; i++) {
    const f = films[i];
    if (f.poster) { applyPosterToDOM(i, f.poster); continue; }

    const key = posterKey(f);

    if (cache[key]) {
      f.poster = cache[key];
      applyPosterToDOM(i, f.poster);
      continue;
    }

    try {
      const url = await fetchPoster(f);
      if (url) {
        f.poster = url;
        cache[key] = url;
        updated = true;
        applyPosterToDOM(i, url);
      }
    } catch (e) {
      // немає інтернету / ліміт / не знайшовся — тихо їдемо далі,
      // згенерована обкладинка і так на місці
    }
  }

  if (updated) posterCache.write(cache);
}

document.addEventListener("DOMContentLoaded", () => {
  // даємо основному рендеру відпрацювати першим
  setTimeout(loadPosters, 300);
});
