const today = new Date();

export const d = (off, h = 9) => {
  const x = new Date(today);
  x.setDate(x.getDate() + off);
  x.setHours(h, 0, 0, 0);
  return x;
};

export const fmtShort = (date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export const fmtRel = (date) => {
  const diff = today - date;
  if (diff < 0) return fmtShort(date);
  if (diff < 86400000) return "Aujourd'hui";
  if (diff < 172800000) return "Hier";
  if (diff < 604800000) return date.toLocaleDateString("fr-FR", { weekday: "long" });
  return fmtShort(date);
};

export const isToday = (date) => date.toDateString() === today.toDateString();

export const isThisWeek = (date) => {
  const s = new Date(today);
  s.setDate(today.getDate() - today.getDay() + 1);
  s.setHours(0, 0, 0, 0);
  const e = new Date(s);
  e.setDate(s.getDate() + 7);
  return date >= s && date < e;
};

export const isThisMonth = (date) =>
  date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

export const truncate = (s, n = 65) => (s.length > n ? s.slice(0, n) + "…" : s);
