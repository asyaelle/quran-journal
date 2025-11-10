// Expose a safe API (none needed for localStorage approach, but good pattern)
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appInfo', {
  name: 'QuranJournal'
});
