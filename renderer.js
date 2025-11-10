// Call API: http://api.alquran.cloud/v1/surah
const API = 'http://api.alquran.cloud/v1/surah';
const listEl = document.getElementById('list');
const loadingEl = document.getElementById('loading');
const searchEl = document.getElementById('search');
const btnJournal = document.getElementById('btn-journal');

btnJournal.addEventListener('click', () => {
  location.href = 'journal.html';
});

async function fetchSurah() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    if (data.code !== 200) throw new Error('API error');
    renderList(data.data);
  } catch (err) {
    loadingEl.textContent = 'Failed to load surah list. Check connection.';
    console.error(err);
  }
}

function renderList(surahArray) {
  loadingEl.style.display = 'none';
  listEl.innerHTML = '';
  surahArray.forEach(s => {
    const li = document.createElement('li');
    li.className = 'surah-item';
    li.innerHTML = `
      <strong>${s.number}. ${s.englishName} (${s.name})</strong>
      <div class="meta">Ayahs: ${s.numberOfAyahs} • ${s.revelationType}</div>
      <div class="actions">
        <button data-number="${s.number}" class="open-journal">Open / Add Note</button>
        <button data-number="${s.number}" class="view-details">View Detail</button>
      </div>
    `;
    listEl.appendChild(li);
  });

  // attach handlers
  document.querySelectorAll('.open-journal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const num = e.target.dataset.number;
      // Save selected surah in sessionStorage then go to journal page
      sessionStorage.setItem('selectedSurah', num);
      location.href = 'journal.html';
    });
  });

  document.querySelectorAll('.view-details').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const num = e.target.dataset.number;
      const r = await fetch(`${API}/${num}`);
      const d = await r.json();
      const s = d.data;
      alert(`${s.number}. ${s.englishName} (${s.name})\nEnglish translation: ${s.englishNameTranslation}\nAyahs: ${s.numberOfAyahs}\nRevelation: ${s.revelationType}`);
    });
  });

  // search
  searchEl.addEventListener('input', () => {
    const q = searchEl.value.toLowerCase();
    document.querySelectorAll('.surah-item').forEach(li => {
      const text = li.innerText.toLowerCase();
      li.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

fetchSurah();
