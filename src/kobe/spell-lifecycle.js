// Lifecycle extensions called by the existing combat engine, never a second clock.
export function cleanupSpellEffect(s, e) {
  if (e.spellId === "aid" && e.applied) {
    for (const id of e.targetIds) {
      const hp =
        id === "kobe" ? s.hp : s.combat.targets.find((t) => t.id === id)?.hp;
      if (hp) {
        hp.max = Math.max(1, hp.max - e.amount);
        hp.current = Math.max(0, Math.min(hp.max, hp.current - e.amount));
      }
    }
  }
  if (e.spellId === "enhance-ability" && e.ability === "CON") {
    for (const id of e.targetIds) {
      const hp =
        id === "kobe" ? s.hp : s.combat.targets.find((t) => t.id === id)?.hp;
      if (hp?.source === e.id) {
        hp.temp = 0;
        hp.source = null;
        if (id !== "kobe") s.combat.targets.find((t) => t.id === id).temp = 0;
      }
    }
  }
}
export function removeSpellEffects(s, predicate) {
  const removed = s.effects.filter(predicate);
  for (const e of removed) cleanupSpellEffect(s, e);
  s.effects = s.effects.filter((e) => !removed.includes(e));
  s.pendingResolutions = s.pendingResolutions.filter(
    (r) => !removed.some((e) => e.id === r.effectId),
  );
  return removed;
}

export function validateSpellState(s, spellById) {
  const need = (ok) => {
    if (!ok) throw Error("Données persistantes de sort invalides.");
  };
  const integer = (n, min, max) =>
    Number.isSafeInteger(n) && n >= min && n <= max;
  for (const e of s.effects.filter((e) => e.kind === "spell")) {
    need(!!spellById(e.spellId));
    if (e.spellId === "aid")
      need(e.applied === true && integer(e.amount, 5, 20));
    if (e.spellId === "mirror-image") need(integer(e.duplicates, 1, 3));
    if (e.spellId === "enhance-ability")
      need(["FOR", "DEX", "CON", "INT", "SAG", "CHA", "table"].includes(e.ability));
    if (e.repeat) need(e.repeat === "end");
    if (e.turns)
      for (const n of Object.values(e.turns)) need(integer(n, 1, 1000000));
  }
  for (const r of s.pendingResolutions.filter((r) => r.kind === "spell")) {
    const sp = spellById(r.spellId);
    need(
      !!sp &&
        r.targetIds?.length === 1 &&
        integer(r.level, sp?.level ?? 0, 5) &&
        integer(r.amount, 0, 10000) &&
        r.dc === 17,
    );
    if (sp.attack)
      need(integer(r.natural, 1, 20) && r.attackTotal === r.natural + 9);
  }
}
