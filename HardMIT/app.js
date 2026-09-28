let S = Storage.load();
let tab = 'hoje', hist = { mode: 'week', off: 0 };
const $ = q => document.querySelector(q);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const DOW = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const n = x => x.toLocaleString('pt-BR');
const commit = () => { Storage.save(S); render(); };
const bar = (v, g, cls = '') => `<div class="bar"><i class="${cls}" style="width:${Math.min(100, g ? v / g * 100 : 0)}%"></i></div>`;
const taskName = l => l.task === 'extra' && l.label ? 'Extra: ' + esc(l.label) : TASKS[l.task].name;

function addLog(task, val, label) {
  const t = TASKS[task], today = U.today();
  if (t.daily && Points.on(S, today).some(l => l.task === task)) return alert('Já registrada hoje.');
  if (t.type === 'time' && !(val > 0)) return alert('Informe os minutos.');
  S.logs.push({ id: Date.now() + Math.random(), date: today, task, minutes: t.type === 'time' ? val : 0, count: t.type === 'count' ? 1 : 0, label: label || '', xp: Points.xpOf(task, t.type === 'time' ? val : 1) });
  commit();
}

function taskCard(t, today) {
  const T = TASKS[t], m = Points.minutes(S, today, t), ok = Points.done(S, today, t), need = Math.max(1, T.min);
  return `<div class="card task ${ok ? 'done' : ''}"><div><div class="name">${ok ? '✓ ' : ''}${T.name}</div>
    <div class="mu">${m} min · ${m} XP · mínimo ${need} min</div>${bar(m, need, ok ? 'g' : '')}</div>
    <div class="row"><input type="number" min="1" id="in-${t}" placeholder="min" aria-label="Minutos de ${T.name}"><button class="btn" data-act="add" data-t="${t}">Concluir</button></div></div>`;
}

function viewHoje() {
  const today = U.today(), req = requiredFor(today), st = Streak.compute(S), r = Streak.reward(S, today), m = Streak.month(S, today);
  const allDone = req.length && req.every(t => Points.done(S, today, t));
  const essays = Points.essays(S, today);
  const cnt = (t, label) => `<div class="row" style="justify-content:space-between;padding:6px 0"><span>${label} <span class="mu">+${TASKS[t].xp} XP</span></span><button class="btn ghost" data-act="cnt" data-t="${t}">Registrar</button></div>`;
  return `<h1>O que preciso fazer hoje?</h1><p class="sub">${DOW[new Date().getDay()]}, ${U.br(today)}</p>
  ${req.length ? req.map(t => taskCard(t, today)).join('') : '<div class="card">Hoje não há tarefas obrigatórias. Descanse ou registre algo extra.</div>'}
  ${req.length ? `<span class="status ${allDone ? 'ok' : ''}">${allDone ? 'DIA COMPLETO' : 'DIA EM ANDAMENTO'}</span>` : ''}
  <h2>Quanto eu já fiz?</h2>
  <div class="stats">
    <div class="stat"><b>🔥 ${st.current}</b><span>Streak atual</span></div>
    <div class="stat"><b>${n(Points.day(S, today))}</b><span>XP hoje</span></div>
    <div class="stat"><b>${n(Points.week(S, today))}</b><span>XP na semana</span></div>
    <div class="stat"><b>${n(r.xp)}</b><span>XP no mês</span></div>
    <div class="stat"><b>${m.active}</b><span>Dias ativos no mês</span></div>
  </div>
  <h2>Quanto falta para minha recompensa?</h2>
  <div class="card reward"><div class="row" style="justify-content:space-between"><span>${n(r.xp)} / ${n(REWARD.xp)} XP</span><span class="mu">${r.unlocked ? 'Reward unlocked' : 'Reward locked'}</span></div>${bar(r.xp, REWARD.xp)}</div>
  <details><summary>Outras atividades</summary>
    <div class="card"><div class="row" style="justify-content:space-between"><span>Essays da semana: <b>${essays}/2</b> ${essays >= 2 ? '<span class="ok-t">meta concluída</span>' : ''}</span><button class="btn ghost" data-act="cnt" data-t="essay">+ Essay (100 XP)</button></div>${bar(essays, 2, essays >= 2 ? 'g' : '')}
    ${S.config.app ? cnt('app', 'Sessão de application') : ''}
    <label class="mu" style="display:block;margin:8px 0"><input type="checkbox" data-act="appToggle" ${S.config.app ? 'checked' : ''}> Período de application ativo</label>
    ${cnt('rec', 'Gravar aula')}${cnt('plan', 'Planejar aula')}${cnt('aula', 'Dar aula')}
    <div class="row" style="margin-top:10px"><input type="text" id="ex-label" placeholder="Atividade extra"><input type="number" min="1" id="in-extra" placeholder="min"><button class="btn ghost" data-act="add" data-t="extra">Registrar</button></div></div>
  </details>`;
}

function viewHist() {
  const today = U.today(); let from, to, title;
  if (hist.mode === 'week') { from = U.add(U.weekStart(today), hist.off * 7); to = U.add(from, 6); title = `${U.br(from)} a ${U.br(to)}`; }
  else { const d = U.parse(today); d.setMonth(d.getMonth() + hist.off, 1); from = U.fmt(d); d.setMonth(d.getMonth() + 1, 0); to = U.fmt(d); title = from.slice(5, 7) + '/' + from.slice(0, 4); }
  const days = [...new Set(S.logs.filter(l => l.date >= from && l.date <= to).map(l => l.date))].sort().reverse();
  return `<h1>Histórico</h1><div class="row" style="margin:12px 0">
    <button class="btn ghost" data-act="hm" data-v="week">Semana</button><button class="btn ghost" data-act="hm" data-v="month">Mês</button>
    <button class="btn ghost" data-act="ho" data-v="-1">‹</button><b>${title}</b><button class="btn ghost" data-act="ho" data-v="1">›</button></div>
    <p class="sub">Total no período: ${n(Points.range(S, from, to))} XP</p>
    ${days.map(d => `<div class="card"><b>${U.br(d)}</b> <span class="mu">${DOW[U.parse(d).getDay()]}</span>
      ${Points.on(S, d).map(l => `<div class="log"><span>${taskName(l)} — ${l.minutes ? l.minutes + ' min' : '1'} — ${l.xp} XP</span>
      <span class="row">${l.minutes ? `<button class="btn ghost" data-act="edit" data-id="${l.id}">Editar</button>` : ''}<button class="btn ghost" data-act="del" data-id="${l.id}">Excluir</button></span></div>`).join('')}
      <div class="mu" style="margin-top:6px">TOTAL: ${Points.day(S, d)} XP</div></div>`).join('') || '<div class="card mu">Nenhum registro neste período.</div>'}`;
}

function viewProg() {
  const today = U.today(), st = Streak.compute(S), m = Streak.month(S, today), ym = today.slice(0, 8);
  const last = [...Array(7)].map((_, i) => U.add(today, i - 6)), vals = last.map(d => Points.day(S, d)), mx = Math.max(1, ...vals);
  const mins = {}; let total = 0;
  S.logs.filter(l => l.date.startsWith(ym) && l.minutes).forEach(l => { const c = TASKS[l.task].cat; mins[c] = (mins[c] || 0) + l.minutes; total += l.minutes; });
  return `<h1>Progresso</h1>
  <h2>XP dos últimos 7 dias</h2><div class="card"><div class="chart">${last.map((d, i) => `<div><span>${vals[i]}</span><i style="height:${vals[i] / mx * 90}px"></i>${U.br(d).slice(0, 2)}</div>`).join('')}</div></div>
  <div class="stats"><div class="stat"><b>${n(Points.week(S, today))}</b><span>XP semana</span></div><div class="stat"><b>${n(Points.month(S, today))}</b><span>XP mês</span></div>
  <div class="stat"><b>${(total / 60).toFixed(1)} h</b><span>Estudadas no mês</span></div><div class="stat"><b>${m.active}</b><span>Dias ativos</span></div>
  <div class="stat"><b>🔥 ${st.current}</b><span>Streak atual</span></div><div class="stat"><b>${st.best}</b><span>Maior streak</span></div>
  <div class="stat"><b>${m.missed}</b><span>Não concluídos (mês)</span></div><div class="stat"><b>${Points.essays(S, today)}/2</b><span>Essays da semana</span></div></div>
  <h2>Tempo por categoria (mês)</h2><div class="card">${Object.keys(mins).map(c => `<div class="mu" style="margin-top:8px">${CATEGORIES[c]} — ${mins[c]} min</div>${bar(mins[c], total)}`).join('') || '<span class="mu">Sem dados ainda.</span>'}</div>`;
}

function viewReward() {
  const r = Streak.reward(S, U.today());
  const crit = `<div class="card">${r.criteria.map(c => `<div class="crit"><span>${c.label}</span><span class="${c.ok ? 'ok-t' : 'no-t'}">${c.ok ? '✓ ' : ''}${n(c.now)} / ${n(c.goal)}</span></div>`).join('')}</div>`;
  return r.unlocked
    ? `<div class="unlock"><h1>REWARD UNLOCKED</h1><p>Você desbloqueou seu dia de lazer.</p><p class="mu">Cinema, um filme, um dia sem application. Você escolhe.</p></div>${crit}`
    : `<h1>Reward locked</h1><p class="sub">Faltam critérios para o dia de lazer deste mês:</p>${crit}`;
}

function render() {
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $('#view').innerHTML = { hoje: viewHoje, historico: viewHist, progresso: viewProg, recompensa: viewReward }[tab]();
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-tab],[data-act]'); if (!b) return;
  if (b.dataset.tab) { tab = b.dataset.tab; return render(); }
  const { act, t, id, v } = b.dataset;
  if (act === 'add') addLog(t, parseInt($('#in-' + t).value, 10), t === 'extra' ? ($('#ex-label').value || '').trim() : '');
  else if (act === 'cnt') addLog(t, 1);
  else if (act === 'hm') { hist = { mode: v, off: 0 }; render(); }
  else if (act === 'ho') { hist.off += +v; render(); }
  else if (act === 'del') { if (confirm('Excluir este registro? Essa ação não pode ser desfeita.')) { S.logs = S.logs.filter(l => String(l.id) !== id); commit(); } }
  else if (act === 'edit') {
    const l = S.logs.find(l => String(l.id) === id), val = parseInt(prompt('Novo tempo (minutos):', l.minutes), 10);
    if (val > 0) { l.minutes = val; l.xp = val; commit(); }
  }
});
document.addEventListener('change', e => { if (e.target.dataset.act === 'appToggle') { S.config.app = e.target.checked; commit(); } });
render();
