const Streak = {
  status(s, date) { // 'rest' (sem obrigações) | 'done' | 'miss'
    const req = requiredFor(date);
    if (!req.length) return 'rest';
    return req.every(t => Points.done(s, date, t)) ? 'done' : 'miss';
  },
  first: s => s.logs.length ? s.logs.map(l => l.date).sort()[0] : null,
  // Hoje incompleto não quebra a sequência: o dia ainda não acabou.
  compute(s) {
    const first = Streak.first(s), today = U.today();
    let run = 0, best = 0, missed = 0;
    if (first) for (let d = first; d <= today; d = U.add(d, 1)) {
      const st = Streak.status(s, d);
      if (st === 'done') { run++; best = Math.max(best, run); }
      else if (st === 'miss' && d !== today) { run = 0; missed++; }
    }
    return { current: run, best, missed };
  },
  month(s, date) {
    const ym = date.slice(0, 8), today = U.today();
    let active = 0, run = 0, maxRun = 0, missed = 0;
    for (let i = 1; i <= 31; i++) {
      const d = ym + String(i).padStart(2, '0');
      if (U.parse(d).getMonth() !== U.parse(ym + '01').getMonth() || d > today) break;
      const st = Streak.status(s, d);
      if (st === 'done') { active++; run = 0; }
      else if (st === 'miss' && d !== today) { run++; missed++; maxRun = Math.max(maxRun, run); }
    }
    return { active, maxRun, missed };
  },
  reward(s, date) {
    const xp = Points.month(s, date), m = Streak.month(s, date);
    const c = [
      { label: `${REWARD.xp.toLocaleString('pt-BR')} XP no mês`, now: xp, goal: REWARD.xp, ok: xp >= REWARD.xp },
      { label: `${REWARD.activeDays} dias ativos`, now: m.active, goal: REWARD.activeDays, ok: m.active >= REWARD.activeDays },
      { label: `No máximo ${REWARD.maxMissRun} dias seguidos sem cumprir`, now: m.maxRun, goal: REWARD.maxMissRun, ok: m.maxRun <= REWARD.maxMissRun }
    ];
    return { xp, m, criteria: c, unlocked: c.every(x => x.ok) };
  }
};
