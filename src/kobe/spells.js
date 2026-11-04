import {applyHP, roll, hpOf} from "./health.js";
import { SPELLS, spellById, maxTargets, diceFor } from "./spell-catalog.js";
import {
  spendAction,
  assertCanAct,
  endConcentration,
  advance,
} from "./combat.js";
import { removeSpellEffects } from "./spell-lifecycle.js";
const need = (ok, msg) => {
  if (!ok) throw Error(msg);
};
const integer = (v, min, max) =>
  need(Number.isSafeInteger(v) && v >= min && v <= max, "Nombre hors limites.");
const targetExists = (s, id) =>
  id === "kobe" || s.combat.targets.some((t) => t.id === id);
function effect(s, c, spell, ids, extra = {}) {
  const e = {
    id: c.id,
    kind: "spell",
    spellId: spell.id,
    name: spell.name,
    targetIds: ids,
    expires: s.combat.elapsed + spell.duration,
    ...(spell.concentration ? { concentrationId: c.id } : {}),
    ...extra,
  };
  s.effects.push(e);
  return e;
}
export function spellAvailability(
  s,
  spell,
  level = spell.level,
  ritual = false,
) {
  try {
    assertCanAct(s);
    need(s.combat.phase === "active", "Hors tour");
    need(s.economy[spell.economy], "Action utilisée");
    need(
      !spell.components.includes("V") ||
        !s.combat.conditions.includes("silenced"),
      "Silence",
    );
    if (spell.economy === "bonusAvailable")
      need(!s.combat.leveledAction, "Sort de niveau déjà lancé");
    else if (s.combat.bonusSpell)
      need(
        spell.level === 0 && spell.seconds === 0,
        "Sort bonus : tour de magie en action seulement",
      );
    need(!ritual || spell.ritual, "Pas un rituel");
    if (spell.level && !ritual) {
      integer(level, spell.level, 5);
      need(s.slots[level] > 0, "Emplacement épuisé");
    }
    return { ok: true, label: "Disponible" };
  } catch (e) {
    return { ok: false, label: e.message };
  }
}
export function availableLevels(s, spell) {
  return spell.level === 0
    ? [0]
    : [1, 2, 3, 4, 5].filter((n) => n >= spell.level && s.slots[n] > 0);
}
function saveEffect(s, c, r, id) {
  const spell = spellById(r.spellId);
  if (!spell.condition || r.effectId) return;
  const base = s.effects.find((e) => e.id === r.sourceId);
  if (spell.concentration && !base) return;
  const expires =
    base?.expires ??
    r.expires ??
    s.combat.elapsed + (spell.condition === "mockery" ? 12 : spell.duration);
  s.effects.push({
    id: c.id + ":effect",
    kind: "spell",
    spellId: spell.id,
    name: spell.name,
    targetIds: [id],
    expires,
    condition: spell.condition,
    repeat: spell.repeat ?? null,
    sourceId: r.sourceId,
    ...(r.concentrationId ? { concentrationId: r.concentrationId } : {}),
  });
}
export function spellCommand(s, c) {
  const p = c.payload ?? {},
    b = s.combat;
  let label,
    kind = "info",
    targetIds = [],
    costs = {},
    rolls = [];
  switch (c.type) {
    case "favorites":
      need(
        Array.isArray(p.ids) &&
          p.ids.length <= 4 &&
          new Set(p.ids).size === p.ids.length &&
          p.ids.every(spellById),
        "Choisissez au plus quatre sorts connus distincts.",
      );
      s.preferences.favorites = [...p.ids];
      return { label: "Favoris mis à jour", kind, targetIds, costs, rolls };
    case "slot-correct":
      integer(p.level, 1, 5);
      integer(p.value, 0, [0, 4, 3, 3, 3, 2][p.level]);
      need(typeof p.reason === "string" && p.reason.trim(), "Motif requis.");
      s.slots[p.level] = p.value;
      label = `Emplacements N${p.level} → ${p.value} · ${p.reason}`;
      break;
    case "target-hp":
      need(
        targetExists(s, p.targetId) && p.targetId !== "kobe",
        "Cible externe inconnue.",
      );
      integer(p.max, 1, 10000);
      integer(p.current, 0, p.max);
      integer(p.temp ?? 0, 0, 10000);
      need(p.confirmed === true, "PV confirmés à la table requis.");
      {
        const t = b.targets.find((t) => t.id === p.targetId);
        t.hp = { current: p.current, max: p.max, temp: p.temp ?? 0 };
        t.temp = p.temp ?? 0;
        targetIds = [t.id];
        label = `PV locaux déclarés pour ${t.name} : ${p.current}/${p.max}`;
      }
      break;
    case "spell-cast": {
      const spell = spellById(p.spellId);
      need(spell, "Sort inconnu de Kobe.");
      const level = spell.level ? p.level : 0,
        ritual = p.ritual === true;
      const av = spellAvailability(s, spell, level, ritual);
      need(av.ok, av.label);
      need(
        p.eligible === true && p.components === true,
        "Confirmez cibles, portée, conditions et composantes.",
      );
      targetIds = spell.maxTargets === 0 ? ["kobe"] : (p.targetIds ?? []);
      if (spell.maxTargets !== 0)
        need(
          Array.isArray(targetIds) &&
            targetIds.length > 0 &&
            targetIds.length <= maxTargets(spell, level) &&
            new Set(targetIds).size === targetIds.length &&
            targetIds.every((id) => targetExists(s, id)),
          "Cibles invalides.",
        );
      if (spell.concentration || spell.seconds || ritual)
        need(
          !s.concentration || p.replaceConcentration === true,
          "Confirmez le remplacement de concentration.",
        );
      if (spell.seconds || ritual)
        need(
          p.uninterrupted === true,
          "Incantation longue : confirmer concentration ininterrompue et actions consacrées pendant toute la durée.",
        );
      spendAction(s, spell.economy, null, costs);
      if (spell.level && !ritual) {
        s.slots[level]--;
        costs.slot = { level, amount: 1 };
      }
      if (spell.economy === "bonusAvailable") b.bonusSpell = true;
      else if (spell.level) b.leveledAction = true;
      if (spell.concentration || spell.seconds || ritual) endConcentration(s);
      if (spell.seconds || ritual)
        advance(s, spell.seconds + (ritual ? 600 : 0));
      if (spell.concentration) s.concentration = { id: c.id, name: spell.name };
      let amount = 0;
      const dice = diceFor(spell, level);
      if (dice) {
        amount = roll(p.rolls, ...dice) + (spell.healing ? 5 : 0);
        rolls = p.rolls;
      }
      if (spell.id === "minor-illusion")
        removeSpellEffects(s, (e) => e.spellId === spell.id);
      if (spell.id === "prestidigitation") {
        need(
          typeof p.detail === "string" && p.detail.trim(),
          "Décrivez l’effet choisi.",
        );
        need(
          s.effects.filter((e) => e.spellId === spell.id).length < 3,
          "Trois effets actifs : terminez un effet avant d’en créer un autre.",
        );
      }
      if (spell.id === "enhance-ability") {
        need(
          ["FOR", "DEX", "CON", "INT", "SAG", "CHA"].includes(p.ability),
          "Caractéristique requise.",
        );
        if (p.ability === "CON") {
          amount = roll(p.rolls, 2, 6);
          rolls = p.rolls;
        }
      }
      if (spell.id === "aid") {
        const bonus = 5 * (level - 1);
        const overlapping = s.effects.filter(
          (e) =>
            e.spellId === "aid" &&
            e.targetIds.some((id) => targetIds.includes(id)),
        );
        need(
          !overlapping.length || p.replaceEffect === true,
          "Aide ne se cumule pas : terminer les Aides chevauchantes (tous leurs bénéficiaires) à confirmer.",
        );
        need(
          !overlapping.some((e) => e.amount >= bonus),
          "Aide existante de puissance égale ou supérieure.",
        );
        removeSpellEffects(s, (e) => overlapping.includes(e));
        for (const id of targetIds) {
          const hp = hpOf(s, id);
          if (hp) {
            need(hp.max + bonus <= 10000, "PV maximum hors limites.");
            hp.max += bonus;
            hp.current += bonus;
            if (id === "kobe" && hp.current > 0)
              s.combat.death = {
                success: 0,
                failure: 0,
                stable: false,
                dead: false,
              };
          }
        }
        effect(s, c, spell, targetIds, { amount: bonus, applied: true });
        label = `Aide : +${bonus} PV actuels et maximum par cible, 8 h ; annoncer aux cibles sans PV suivis`;
        break;
      }
      if (
        spell.duration > 0 &&
        (spell.concentration || !spell.save) &&
        !(spell.id === "prestidigitation" && p.effectSeconds === 0)
      ) {
        const e = effect(s, c, spell, spell.save ? [] : targetIds, {
          level,
          ability: p.ability ?? null,
          detail: p.detail ?? null,
          ...(spell.id === "prestidigitation"
            ? {
                expires: b.elapsed + (p.effectSeconds === 6 ? 12 : 3600),
                ...(p.effectSeconds === 6
                  ? { untilEndTurn: s.turn.startRevision + 1 }
                  : {}),
              }
            : {}),
          ...(spell.id === "mirror-image" ? { duplicates: 3 } : {}),
        });
        if (spell.id === "enhance-ability" && p.ability === "CON") {
          for (const id of targetIds) {
            const hp = hpOf(s, id);
            if (hp && amount > hp.temp) {
              hp.temp = amount;
              hp.source = e.id;
              if (id !== "kobe")
                b.targets.find((t) => t.id === id).temp = amount;
            }
          }
        }
      }
      if (spell.healing) {
        need(
          p.healingEligible === true,
          "Non morte-vivante, non artificielle ; soin possible à confirmer.",
        );
        kind = "heal";
        label =
          `${spell.name} N${level} : ${amount} PV · ` +
          targetIds
            .map((id) => `${id} : ${applyHP(s, id, amount, true, c)}`)
            .join(" ; ");
      } else if (spell.save || spell.attack) {
        const attackRoll = spell.attack
          ? roll(
              p.attackRolls,
              p.attackMode === "normal" || !p.attackMode ? 1 : 2,
              20,
            )
          : null;
        if (spell.attack)
          need(
            ["normal", "advantage", "disadvantage"].includes(
              p.attackMode ?? "normal",
            ),
            "Mode d’attaque invalide.",
          );
        const natural = spell.attack
          ? p.attackMode === "advantage"
            ? Math.max(...p.attackRolls)
            : p.attackMode === "disadvantage"
              ? Math.min(...p.attackRolls)
              : attackRoll
          : null;
        for (const id of targetIds)
          s.pendingResolutions.push({
            id: c.id + ":" + id,
            kind: "spell",
            spellId: spell.id,
            targetIds: [id],
            sourceId: c.id,
            level,
            amount,
            dc: 17,
            attackTotal: natural === null ? null : natural + 9,
            natural,
            ...(spell.concentration ? { concentrationId: c.id } : {}),
            expires: spell.duration
              ? s.combat.elapsed +
                (spell.condition === "mockery" ? 12 : spell.duration)
              : null,
          });
        rolls = [...rolls, ...(p.attackRolls ?? [])];
        label = `${spell.name} N${level} · ${spell.attack ? `attaque ${natural}+9 = ${natural + 9}` : spell.save + " DD17"} · ${amount ? amount + " " + spell.damageType + " bruts · " : ""}${targetIds.length} résultat(s) MJ attendu(s)`;
      } else if (spell.id === "dispel-magic") {
        need(
          Array.isArray(p.spellLevels) &&
            p.spellLevels.length > 0 &&
            p.spellLevels.length <= 30,
          "Renseignez le niveau de chaque sort à dissiper.",
        );
        let index = 0;
        const outcomes = p.spellLevels.map((n) => {
          integer(n, 1, 9);
          if (n <= level) return `N${n} : dissipé automatiquement`;
          const natural = p.checkRolls?.[index++];
          integer(natural, 1, 20);
          return `N${n} : ${natural}+7 / DD${10 + n} → ${natural + 7 >= 10 + n ? "dissipé" : "échec"}`;
        });
        need(
          (p.checkRolls ?? []).length === index,
          "Nombre de tests de dissipation incorrect.",
        );
        rolls = p.checkRolls ?? [];
        label = spell.name + " · " + outcomes.join(" ; ");
      } else
        label = `${spell.name}${ritual ? " en rituel" : " N" + level} · ${spell.summary}${p.detail ? " · " + p.detail : ""}`;
      break;
    }
    case "spell-resolve": {
      const r = s.pendingResolutions.find(
        (r) => r.id === p.id && r.kind === "spell",
      );
      need(r, "Résolution de sort absente.");
      const spell = spellById(r.spellId);
      targetIds = r.targetIds;
      const id = targetIds[0];
      need(
        !r.expires || r.expires > s.combat.elapsed,
        "Effet arrivé à échéance.",
      );
      need(
        !r.concentrationId || r.concentrationId === s.concentration?.id,
        "Concentration perdue.",
      );
      const attack = spell.attack;
      need(
        (attack
          ? ["hit", "miss", "critical", "refused"]
          : ["success", "failure", "refused"]
        ).includes(p.result),
        "Résultat MJ requis.",
      );
      if (attack && p.result !== "refused") {
        if (r.natural === 1) need(p.result === "miss", "1 naturel : raté.");
        if (r.natural === 20)
          need(p.result === "critical", "20 naturel : critique.");
        else
          need(
            p.result !== "critical" || p.criticalEligible === true,
            "Critique hors 20 naturel : effet imposant le critique à confirmer par le MJ.",
          );
      }
      let amount = r.amount;
      if (attack && p.result === "critical") {
        amount = roll(p.rolls, ...diceFor(spell, r.level, true));
        rolls = p.rolls;
      }
      const applies = attack
        ? ["hit", "critical"].includes(p.result)
        : ["failure", "success"].includes(p.result);
      if (spell.dice && applies) {
        if (p.result === "miss") amount = 0;
        if (p.result === "success")
          amount = spell.half ? Math.floor(amount / 2) : 0;
        need(
          ["normal", "resistant", "immune", "vulnerable", "manual"].includes(
            p.defense ?? "normal",
          ),
          "Défense inconnue.",
        );
        if (p.defense === "resistant") amount = Math.floor(amount / 2);
        if (p.defense === "immune") amount = 0;
        if (p.defense === "vulnerable") amount *= 2;
        if (p.defense === "manual") {
          integer(p.effective, 0, 10000);
          need(
            typeof p.reason === "string" && p.reason.trim(),
            "Motif du montant effectif requis.",
          );
          amount = p.effective;
        }
        if (amount > 0) applyHP(s, id, amount, false, c);
        kind = "damage";
        label = `${spell.name} · ${id} · ${p.result} · ${amount} dégâts ${spell.damageType} effectifs${hpOf(s, id) ? " appliqués localement" : " à annoncer (PV inconnus)"}`;
      } else
        label = `${spell.name} · ${id} · ${p.result}${p.result === "miss" ? " · 0 dégât" : ""}`;
      if (!attack && p.result === "failure") saveEffect(s, c, r, id);
      if (spell.id === "dissonant-whispers" && p.result === "failure") {
        const t = b.targets.find((t) => t.id === id);
        if (p.moveReaction === true) {
          need(
            t?.reaction === true && p.safeMovement === true,
            "Réaction disponible et trajet sûr confirmés requis.",
          );
          t.reaction = false;
          label +=
            " · Réaction de fuite confirmée et consommée ; opportunités gérées à la table";
        } else
          label +=
            " · Réaction de fuite à confirmer par le MJ (réaction disponible, trajet sûr, opportunités)";
      }
      if (r.effectId && p.result === "success")
        removeSpellEffects(s, (e) => e.id === r.effectId);
      s.pendingResolutions = s.pendingResolutions.filter((x) => x.id !== r.id);
      break;
    }
    case "spell-target-turn": {
      need(
        ["start", "end"].includes(p.phase) && targetExists(s, p.targetId),
        "Frontière de tour invalide.",
      );
      integer(p.sequence, 1, 1000000);
      targetIds = [p.targetId];
      let count = 0;
      for (const e of s.effects.filter(
        (e) => e.kind === "spell" && e.targetIds.includes(p.targetId),
      )) {
        e.turns ??= {};
        const key = p.targetId + ":" + p.phase;
        need(p.sequence > (e.turns[key] ?? 0), "Tour déjà traité.");
        e.turns[key] = p.sequence;
        if (e.condition === "mockery" && p.phase === "end")
          e.expires = b.elapsed;
        if (
          e.repeat === p.phase &&
          !s.pendingResolutions.some((r) => r.effectId === e.id)
        ) {
          s.pendingResolutions.push({
            id: c.id + ":" + count++,
            kind: "spell",
            spellId: e.spellId,
            targetIds: [p.targetId],
            sourceId: e.sourceId,
            level: spellById(e.spellId).level,
            amount: 0,
            dc: 17,
            concentrationId: e.concentrationId,
            expires: e.expires,
            effectId: e.id,
          });
        }
      }
      removeSpellEffects(s, (e) => e.expires <= b.elapsed);
      label = `${p.phase === "end" ? "Fin" : "Début"} du tour de ${p.targetId} · sauvegardes répétées proposées`;
      break;
    }
    case "spell-trigger": {
      const e = s.effects.find(
        (e) => e.id === p.effectId && e.kind === "spell",
      );
      need(e, "Effet absent.");
      targetIds = e.targetIds;
      if (e.spellId === "mirror-image") {
        need(
          p.applicable === true,
          "Confirmez attaque et capacité de voir les doubles.",
        );
        integer(p.roll, 1, 20);
        const threshold = [0, 11, 8, 6][e.duplicates];
        const redirected = p.roll >= threshold;
        let destroyed = false;
        if (redirected) {
          integer(p.attackTotal, 0, 1000);
          destroyed = p.attackTotal >= 12;
          if (destroyed) e.duplicates--;
        }
        rolls = [p.roll];
        label = `Image miroir · ${redirected ? "attaque redirigée vers double CA12" : "attaque contre Kobe"} · ${destroyed ? "double détruit · " : ""}${e.duplicates} double(s) restant(s)`;
        if (!e.duplicates) removeSpellEffects(s, (x) => x.id === e.id);
      } else if (e.condition === "slow" && p.operation === "casting") {
        integer(p.roll, 1, 20);
        rolls = [p.roll];
        e.delayedCasting = p.roll >= 11;
        label = `Lenteur · d20 ${p.roll} · ${e.delayedCasting ? "sort retardé : action du prochain tour requise pour achever, sinon sort perdu" : "sort lancé normalement"}`;
      } else if (e.spellId === "circle-of-power") {
        need(
          p.inAura === true && p.friendly === true && p.magical === true,
          "Aura9 m, créature amicale et effet magique à confirmer.",
        );
        need(typeof p.success === "boolean", "Sauvegarde requise.");
        integer(p.amount, 0, 10000);
        const amount =
          p.halfOnSave === true
            ? p.success
              ? 0
              : Math.floor(p.amount / 2)
            : p.success
              ? 0
              : p.amount;
        label = `Cercle de pouvoir · avantage à la sauvegarde ; ${p.halfOnSave ? "effet moitié à la réussite : " + amount + " dégâts avant autres défenses" : "aucune réduction spéciale sans clause moitié"} · à annoncer`;
        if (p.apply === true) {
          need(
            p.halfOnSave === true,
            "Application automatique uniquement pour un effet moitié sur sauvegarde.",
          );
          need(targetExists(s, p.targetId), "Cible inconnue.");
          let effective = amount;
          if (p.useEffective === true) {
            integer(p.effective, 0, 10000);
            need(
              p.defensesConfirmed === true,
              "Autres défenses à confirmer pour modifier le montant calculé.",
            );
            effective = p.effective;
          }
          targetIds = [p.targetId];
          if (effective > 0) applyHP(s, p.targetId, effective, false, c);
          kind = "damage";
          label += ` · ${effective} dégâts effectifs : ${hpOf(s, p.targetId) ? "PV locaux actualisés" : "à annoncer (PV inconnus)"}`;
        }
      } else {
        need(p.confirmed === true, "Déclencheur confirmé par le MJ requis.");
        removeSpellEffects(s, (x) => x.id === e.id);
        label = `${e.name} terminé sur déclencheur confirmé (hostilité, départ du refuge, prochaine attaque ou autre condition de fin)`;
      }
      break;
    }
    default:
      return null;
  }
  return { label, kind, targetIds, costs, rolls, options: structuredClone(p) };
}
