const Points = {
  on: (s, date) => s.logs.filter(l => l.date === date),
  xpOf: (task, val) => TASKS[task].type === 'time' ? val : TASKS[task].xp * val,
  minutes: (s, date, t) => Points.on(s, date).filter(l => l.task === t).reduce((a, l) => a + (l.minutes || 0), 0),
  done: (s, date, t) => Points.minutes(s, date, t) >= Math.max(1, TASKS[t].min),
  range: (s, from, to) => s.logs.filter(l => l.date >= from && l.date <= to).reduce((a, l) => a + l.xp, 0),
  day: (s, date) => Points.range(s, date, date),
  week: (s, date) => { const w = U.weekStart(date); return Points.range(s, w, U.add(w, 6)); },
  month: (s, date) => Points.range(s, date.slice(0, 8) + '01', date.slice(0, 8) + '31'),
  count: (s, from, to, t) => s.logs.filter(l => l.task === t && l.date >= from && l.date <= to).reduce((a, l) => a + (l.count || 1), 0),
  essays: (s, date) => { const w = U.weekStart(date); return Points.count(s, w, U.add(w, 6), 'essay'); }
};
