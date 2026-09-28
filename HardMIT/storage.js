// Camada de persistência. Para adicionar backend/login no futuro, troque apenas load/save.
const Storage = {
  KEY: 'hardmit.v1',
  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { logs: [], config: {} }; }
    catch { return { logs: [], config: {} }; }
  },
  save(state) { try { localStorage.setItem(this.KEY, JSON.stringify(state)); } catch {} }
};
// Utilitários de data (strings YYYY-MM-DD, fuso local)
const U = {
  fmt: d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  parse: s => new Date(s + 'T12:00:00'),
  add: (s, n) => { const d = U.parse(s); d.setDate(d.getDate() + n); return U.fmt(d); },
  today: () => U.fmt(new Date()),
  weekStart: s => { const d = U.parse(s); return U.add(s, -((d.getDay() + 6) % 7)); }, // segunda
  br: s => s.slice(8) + '/' + s.slice(5, 7)
};
