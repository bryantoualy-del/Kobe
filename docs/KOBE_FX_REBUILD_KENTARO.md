# Reconstruction des FX de sorts et capacités — référence Kentaro

**Périmètre strict : effets visuels de combat uniquement.** Aucun changement de navigation, bandeau, mécanique, calcul, grimoire, jet de dés, sauvegarde ou contrat RPG Connect. L'ancienne PR #23 de refonte globale a été fermée après clarification.

## Référence analysée
Kentaro `index.html` : `#fxOverlay`, effets de pulsation sun/moon/red, éclat eldritch, transition eclipse, animation temporaire et superposition non interactive. `rpg-combat-fx.js` : retour discret sur barre de tour, flash d'effet et soins +PV sans intercepter les clics. La référence à reproduire est **la qualité et la réactivité des effets** ; les couleurs et motifs doivent exprimer les capacités bardiques de Kobe, et non reproduire les pouvoirs d'occultiste.

## État actuel Kobe à remplacer progressivement
`src/ui/kobe-vfx.js` : cinématiques SVG `fireball`, `firebolt`, `mantle`, `kharvek` ; assets image approuvés Fireball/Firebolt ; routage `vfxForCommand()` ; appel `playKobeVfx()` après succès de `store.dispatch` dans `src/ui/app.js`.

## Contrat d'implémentation
- FX purement cosmétiques : aucune consommation de ressource, jet, notification réseau ou mutation des règles.
- Animation seulement après commande validée, pas en cas d'erreur ou de replay.
- Superposition `pointer-events:none`, durée courte, nettoyage garanti et aucune obstruction persistante.
- Compatibilité iPhone/iPad paysage ; respect de `prefers-reduced-motion`, option de désactivation ; performance raisonnable et disponibilité hors ligne.
- Pas de téléchargement d'assets externes à l'exécution ; pas de fallback non validé présenté comme une animation finale.

## FX à reconstruire
1. **Boule de feu** : incandescence, expansion explosive, braises puis disparition.
2. **Trait de feu** : projectile incandescent et impact bref.
3. **Manteau d'inspiration** : onde dorée musicale protectrice.
4. **Manteau de majesté** : couronne/aura de commandement bardique.
5. **Cri draconique** : onde draconique rouge cuivrée.
6. **Khar-Vek / Pulsation réparatrice** : vibration du tambour et onde de guérison.
7. **Khar-Vek / Rythme de ralliement** : pulsations simultanées de soutien.
8. **Khar-Vek / Manteau des survivants** : fusion du motif du tambour avec le manteau protecteur.
9. Les autres sorts/capacités : FX légers typés (soin, contrôle, protection), uniquement si la commande est effectivement représentée dans le moteur.

## Recette
Vérifier chaque FX par sa commande réelle, l'absence de modification mécanique, le nettoyage entre deux activations rapides, l'offline, le plein écran, l'ergonomie tactile et les animations réduites. Comparer le résultat à Kentaro avant toute fusion ; ne pas livrer un prototype comme effet final.
