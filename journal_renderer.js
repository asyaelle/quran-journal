const API = 'http://api.alquran.cloud/v1/surah';
const btnBack = document.getElementById('btn-back');
const surahTitle = document.getElementById('surah-title');
const surahMeta = document.getElementById('surah-meta');

const ayahsInput = document.getElementById('ayahs');
const notesInput = document.getElementById('notes');
const saveBtn = document.getElementById('save');
const deleteBtn = document.getElementById('delete');
const entriesEl = document.getElementById('entries');

btnBack.addEventListener('click', () => location.href = 'index.html');

let currentSurah = null;
let journal = JSON.parse(localStorage.getItem('quranJournal')) || {}; // object keyed by surahNumber

async function loadSelectedSurah() {
  const sel = sessionStorage.getItem('selectedSurah');
  if (!sel) {
    surahTitle.textContent = 'Select a surah from the Surah List first';
    return;
  }
  const res = await fetch(`${API}/${sel}`);
  const data = await res.json();
  currentSurah = data.data;
  surahTitle.textContent = `${currentSurah.number}. ${currentSurah.englishName} (${currentSurah.name})`;
  surahMeta.textContent = `Ayahs: ${currentSurah.numberOfAyahs} • ${currentSurah.revelationType}`;
  loadEntryForCurrent();
  renderEntries();
}

function loadEntryForCurrent() {
  const key = String(currentSurah.number);
  const entry = journal[key];
  if (entry) {
    ayahsInput.value = entry.ayahsCompleted || '';
    notesInput.value = entry.notes || '';
  } else {
    ayahsInput.value = '';
    notesInput.value = '';
  }
}

saveBtn.addEventListener('click', () => {
  if (!currentSurah) return alert('No surah selected.');
  const key = String(currentSurah.number);
  const entry = {
    surahNumber: currentSurah.number,
    surahName: currentSurah.englishName,
    ayahsCompleted: Number(ayahsInput.value) || 0,
    notes: notesInput.value.trim(),
    updatedAt: new Date().toISOString()
  };
  journal[key] = entry;
  localStorage.setItem('quranJournal', JSON.stringify(journal));
  alert('Saved successfully.');
  renderEntries();
});

deleteBtn.addEventListener('click', () => {
  if (!currentSurah) return;
  const key = String(currentSurah.number);
  if (journal[key]) {
    if (!confirm('Delete this journal entry?')) return;
    delete journal[key];
    localStorage.setItem('quranJournal', JSON.stringify(journal));
    ayahsInput.value = '';
    notesInput.value = '';
    renderEntries();
    alert('Deleted.');
  } else {
    alert('No entry to delete.');
  }
});

function renderEntries() {
  entriesEl.innerHTML = '';
  const keys = Object.keys(journal).sort((a,b)=> Number(a)-Number(b));
  if (keys.length === 0) {
    entriesEl.innerHTML = '<li>No entries yet.</li>';
    return;
  }
  keys.forEach(k => {
    const e = journal[k];
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${e.surahNumber}. ${e.surahName}</strong>
      <div>Ayahs: ${e.ayahsCompleted} • updated: ${new Date(e.updatedAt).toLocaleString()}</div>
      <div class="entry-notes">${escapeHtml(e.notes)}</div>
      <div class="entry-actions">
        <button data-num="${e.surahNumber}" class="edit">Edit</button>
        <button data-num="${e.surahNumber}" class="export">Export JSON</button>
      </div>
    `;
    entriesEl.appendChild(li);
  });

  document.querySelectorAll('.edit').forEach(b => {
    b.addEventListener('click', (ev) => {
      const n = ev.target.dataset.num;
      sessionStorage.setItem('selectedSurah', n);
      loadSelectedSurah();
    });
  });

  document.querySelectorAll('.export').forEach(b => {
    b.addEventListener('click', (ev) => {
      const n = ev.target.dataset.num;
      const data = journal[n];
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal_surah_${n}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}

loadSelectedSurah();
