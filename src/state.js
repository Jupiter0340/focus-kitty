var KittyState = (() => {
  const fresh = () => ({ version: 1, xp: 0, totalMinutes: 0, sessions: 0, selected: 25, sound: false, history: [], session: null, notice: null });
  const validMinutes = n => Number.isInteger(n) && n >= 1 && n <= 180;
  function restore(raw) {
    try {
      const s = JSON.parse(raw);
      if (!s || s.version !== 1) return fresh();
      const result = fresh();
      for (const key of ['xp', 'totalMinutes', 'sessions']) if (Number.isSafeInteger(s[key]) && s[key] >= 0) result[key] = s[key];
      if (validMinutes(s.selected)) result.selected = s.selected;
      result.sound = s.sound === true;
      result.history = Array.isArray(s.history) ? s.history.filter(h => h && validMinutes(h.minutes) && Number.isFinite(h.at)).slice(0, 20) : [];
      const a = s.session;
      if (a && validMinutes(a.minutes) && Number.isFinite(a.start) && a.end === a.start + a.minutes * 60000) result.session = { minutes: a.minutes, start: a.start, end: a.end };
      if (s.notice && ['complete', 'cancel'].includes(s.notice.type)) result.notice = s.notice;
      return result;
    } catch { return fresh(); }
  }
  function level(xp) {
    let n = 1, progress = xp;
    while (progress >= n * 100) { progress -= n * 100; n++; }
    return { level: n, progress, needed: n * 100 };
  }
  function start(s, minutes, now) {
    if (!validMinutes(minutes)) throw new Error('请输入 1–180 之间的整数分钟。');
    if (s.session) return s;
    return { ...s, selected: minutes, notice: null, session: { minutes, start: now, end: now + minutes * 60000 } };
  }
  const remaining = (s, now) => s.session ? Math.max(0, s.session.end - now) : s.selected * 60000;
  function tick(s, now) {
    if (!s.session || now < s.session.end) return s;
    const minutes = s.session.minutes, reward = minutes * 2;
    return { ...s, xp: s.xp + reward, totalMinutes: s.totalMinutes + minutes, sessions: s.sessions + 1, session: null,
      history: [{ minutes, at: s.session.end }, ...s.history].slice(0, 20),
      notice: { type: 'complete', minutes, reward, upgraded: level(s.xp + reward).level > level(s.xp).level } };
  }
  function cancel(s, now) {
    const settled = tick(s, now);
    if (settled !== s || !s.session) return settled;
    return { ...s, session: null, notice: { type: 'cancel' } };
  }
  return { fresh, restore, level, start, remaining, tick, cancel };
})();
