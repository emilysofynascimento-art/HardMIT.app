// Catálogo e rotina. Para criar atividades ou mudar dias, edite só este arquivo.
const CATEGORIES = { core: 'Core', research: 'Research', application: 'Application', projects: 'Projects', teaching: 'Teaching', extra: 'Extra' };
// type 'time': 1 XP/min, min = mínimo (min) para contar como concluída. type 'count': xp fixo por registro.
const TASKS = {
  mat:   { name: 'Matemática', cat: 'core', type: 'time', min: 30 },
  ing:   { name: 'Inglês', cat: 'core', type: 'time', min: 30 },
  neu:   { name: 'Neurociência', cat: 'core', type: 'time', min: 30 },
  sat:   { name: 'Simulado do SAT', cat: 'core', type: 'time', min: 1 },
  ic:    { name: 'Iniciação Científica', cat: 'research', type: 'time', min: 30 },
  dev:   { name: 'Desenvolvimento do Hard MIT', cat: 'projects', type: 'time', min: 30 },
  essay: { name: 'Essay', cat: 'application', type: 'count', xp: 100, weekly: 2 },
  app:   { name: 'Sessão de application', cat: 'application', type: 'count', xp: 30, daily: 1 },
  rec:   { name: 'Gravar aula', cat: 'teaching', type: 'count', xp: 30 },
  plan:  { name: 'Planejar aula', cat: 'teaching', type: 'count', xp: 15 },
  aula:  { name: 'Dar aula', cat: 'teaching', type: 'count', xp: 40 },
  extra: { name: 'Extra', cat: 'extra', type: 'time', min: 0 }
};
// 0 = domingo ... 6 = sábado
const SCHEDULE = { 0: [], 1: ['mat', 'ic'], 2: ['ing', 'dev'], 3: ['mat', 'ic'], 4: ['ing', 'dev'], 5: ['sat', 'dev'], 6: [] };
const NEURO_DAYS = [6]; // dias em que Neurociência é obrigatória (ajuste aqui)
const REWARD = { xp: 4000, activeDays: 25, maxMissRun: 3 };
const requiredFor = dateStr => {
  const d = U.parse(dateStr).getDay();
  return [...SCHEDULE[d], ...(NEURO_DAYS.includes(d) ? ['neu'] : [])];
};
