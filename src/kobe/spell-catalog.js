// Original French summaries, rules 2014. Only spells on Kobe's three-page sheet.
const PHB = "Manuel des Joueurs 2014";
const make = (
  id,
  name,
  level,
  school,
  categories,
  range,
  duration,
  components,
  summary,
  extra = {},
) =>
  Object.freeze({
    id,
    name,
    level,
    school,
    categories,
    range,
    duration,
    components,
    summary,
    castTime: "1 action",
    economy: "actionAvailable",
    seconds: 0,
    concentration: false,
    ritual: false,
    source: PHB,
    access: "Barde",
    maxTargets: 1,
    save: null,
    attack: false,
    scaling: "Aucun effet supplémentaire ; emplacement supérieur autorisé.",
    conditions:
      "Portée, perception, ligne d’effet et admissibilité confirmées à la table.",
    ...extra,
  });
export const SPELLS = Object.freeze([
  make(
    "vicious-mockery",
    "Moquerie cruelle",
    0,
    "Enchantement",
    ["Contrôle", "Dégâts"],
    "18 m",
    6,
    "V",
    "Une créature qui entend Kobe subit 2d4 psychiques si elle rate sa sauvegarde de Sagesse, et un désavantage à sa prochaine attaque avant la fin de son prochain tour.",
    {
      save: "SAG",
      dice: [2, 4],
      damageType: "psychique",
      condition: "mockery",
      scaling: "3d4 au niveau11, 4d4 au niveau17 ; aucun emplacement.",
    },
  ),
  make(
    "minor-illusion",
    "Illusion mineure",
    0,
    "Illusion",
    ["Contrôle", "Utilitaire"],
    "9 m",
    60,
    "S, M (laine)",
    "Produit un son ou l’image immobile d’un objet dans un cube de 1,50 m. Investigation contre DD17 en action ; interaction physique révélatrice. Un nouveau lancement met fin à la précédente illusion.",
    {
      maxTargets: 0,
      scaling: "Aucune.",
      conditions:
        "Son ou objet seulement, ni lumière ni odeur ; réalité de la tromperie arbitrée par le MJ.",
    },
  ),
  make(
    "prestidigitation",
    "Prestidigitation",
    0,
    "Transmutation",
    ["Utilitaire"],
    "3 m",
    3600,
    "V, S",
    "Petit effet sensoriel, nettoyage ou salissure de moins de 30 litres, flamme légère, saveur ou température de matière inerte, marque ou petit objet illusoire. Jusqu’à trois effets non instantanés.",
    {
      maxTargets: 0,
      scaling: "Aucune.",
      conditions:
        "Choisir et décrire un effet permis ; objets/illusions de main jusqu’à la fin du prochain tour, autres effets selon choix.",
    },
  ),
  make(
    "mending",
    "Réparation",
    0,
    "Transmutation",
    ["Utilitaire"],
    "Contact",
    0,
    "V, S, M (deux magnétites)",
    "Répare une seule cassure ou déchirure d’au plus 30 cm dans un objet touché. Ne restaure pas les propriétés magiques perdues.",
    { castTime: "1 minute", seconds: 60, maxTargets: 0, scaling: "Aucune." },
  ),
  make(
    "fire-bolt",
    "Trait de feu",
    0,
    "Évocation",
    ["Dégâts", "Utilitaire"],
    "36 m",
    0,
    "V, S",
    "Attaque de sort à distance +9 ; 2d10 feu à la touche. Un objet inflammable non porté peut s’enflammer.",
    {
      attack: true,
      dice: [2, 10],
      damageType: "feu",
      access: "Héritage draconique kobold MotM (CHA)",
      scaling: "3d10 au niveau11, 4d10 au niveau17 ; doubles dés au critique.",
    },
  ),
  make(
    "healing-word",
    "Mot de guérison",
    1,
    "Évocation",
    ["Soins"],
    "18 m",
    0,
    "V",
    "Une créature visible récupère 1d4+5 PV, sans dépasser son maximum. Aucun effet sur morts-vivants ou créatures artificielles.",
    {
      castTime: "1 action bonus",
      economy: "bonusAvailable",
      dice: [1, 4],
      healing: true,
      scaling: "+1d4 par niveau d’emplacement au-dessus du premier.",
    },
  ),
  make(
    "dissonant-whispers",
    "Murmures dissonants",
    1,
    "Enchantement",
    ["Dégâts", "Contrôle"],
    "18 m",
    0,
    "V",
    "Une créature qui entend la mélodie fait une sauvegarde de Sagesse. Échec : 3d6 psychiques et utilise immédiatement sa réaction disponible pour s’éloigner sans danger évident. Réussite : moitié des dégâts, sans mouvement.",
    {
      save: "SAG",
      dice: [3, 6],
      damageType: "psychique",
      half: true,
      scaling: "+1d6 par niveau d’emplacement au-dessus du premier.",
      conditions:
        "Cible assourdie : réussite automatique. Réaction, trajet, opportunités et obstacles confirmés par le MJ.",
    },
  ),
  make(
    "enhance-ability",
    "Amélioration de caractéristique",
    2,
    "Transmutation",
    ["Protection", "Utilitaire"],
    "Contact",
    3600,
    "V, S, M (poils ou plume)",
    "Avantage aux tests d’une caractéristique choisie. Endurance de l’ours ajoute 2d6 PV temporaires perdus à la fin. Force du taureau double la capacité de charge ; grâce du chat évite les dégâts des chutes de 6 m ou moins si non neutralisé.",
    {
      concentration: true,
      scaling:
        "+1 cible par niveau au-dessus du deuxième ; même caractéristique pour toutes.",
      conditions:
        "Choisir FOR, DEX, CON, INT, SAG ou CHA. Affecte les tests, pas les sauvegardes ni attaques.",
    },
  ),
  make(
    "suggestion",
    "Suggestion",
    2,
    "Enchantement",
    ["Contrôle", "Utilitaire"],
    "9 m",
    28800,
    "V, M (langue de serpent, miel ou huile)",
    "Une créature qui entend et comprend Kobe suit une tâche formulée en une ou deux phrases, raisonnable selon le MJ, après échec de Sagesse. Fin à l’accomplissement ou si Kobe/un allié blesse la cible.",
    {
      save: "SAG",
      concentration: true,
      condition: "suggestion",
      conditions:
        "Immunité au charme, langue et caractère raisonnable vérifiés ; injonction manifestement nuisible invalide.",
    },
  ),
  make(
    "mirror-image",
    "Image miroir",
    2,
    "Illusion",
    ["Protection"],
    "Personnelle",
    60,
    "V, S",
    "Trois doubles suivent Kobe. À chaque attaque contre lui, un d20 peut rediriger l’attaque vers un double (6+, puis 8+, puis 11+). CA des doubles12 ; une touche détruit un double.",
    {
      access: "Barde — liste étendue Tasha",
      maxTargets: 0,
      conditions:
        "Ne protège pas des effets sans attaque. Créature aveugle, vision aveugle ou vision véritable : doubles ignorés.",
    },
  ),
  make(
    "aid",
    "Aide",
    2,
    "Abjuration",
    ["Protection", "Soins"],
    "9 m",
    28800,
    "V, S, M (bande de tissu blanc)",
    "Jusqu’à trois créatures gagnent 5 PV actuels et maximum pendant huit heures. Ce sont de vrais PV, sans cumul de la même magie.",
    {
      access: "Barde — liste étendue Tasha",
      maxTargets: 3,
      scaling: "+5 PV actuels et maximum par niveau au-dessus du deuxième.",
    },
  ),
  make(
    "slow",
    "Lenteur",
    3,
    "Transmutation",
    ["Contrôle"],
    "36 m · cube de 12 m",
    60,
    "V, S, M (mélasse)",
    "Jusqu’à six créatures choisies : SAG DD17. Échec : vitesse divisée par deux, −2 CA et sauvegardes DEX, aucune réaction, action ou bonus seulement, au plus une attaque. Un sort en action peut être retardé (d20 : 11+). Nouvelle sauvegarde à la fin de chaque tour.",
    {
      access: "Barde — liste étendue Tasha",
      concentration: true,
      save: "SAG",
      maxTargets: 6,
      condition: "slow",
      repeat: "end",
      conditions:
        "Zone et cibles confirmées. Lancement retardé achevé avec l’action du tour suivant, sinon perdu ; application à la table.",
    },
  ),
  make(
    "dispel-magic",
    "Dissipation de la magie",
    3,
    "Abjuration",
    ["Contrôle", "Protection", "Utilitaire"],
    "36 m",
    0,
    "V, S",
    "Termine chaque sort affectant une créature, un objet ou un effet choisi si son niveau ne dépasse pas celui de l’emplacement. Pour chaque sort supérieur : test CHA+5, touche-à-tout+2, contre DD10+niveau du sort.",
    {
      maxTargets: 0,
      scaling:
        "Dissipation automatique des sorts de niveau inférieur ou égal à l’emplacement.",
      conditions:
        "Chaque sort séparément, niveau et nature magique annoncés par le MJ. Aucun 1/20 automatique sur ce test.",
    },
  ),
  make(
    "fireball",
    "Boule de feu",
    3,
    "Évocation",
    ["Dégâts"],
    "45 m · sphère de rayon 6 m",
    0,
    "V, S, M (guano et soufre)",
    "Une explosion inflige 8d6 feu à toutes les créatures dans la sphère. Sauvegarde de Dextérité : moitié des dégâts à la réussite. Le feu contourne les coins et enflamme les objets inflammables non portés.",
    {
      save: "DEX",
      dice: [8, 6],
      damageType: "feu",
      half: true,
      maxTargets: 100,
      secret: true,
      access: "Secrets magiques niveau10",
      scaling: "+1d6 par niveau d’emplacement au-dessus du troisième.",
    },
  ),
  make(
    "tiny-hut",
    "Refuge de Leomund",
    3,
    "Évocation",
    ["Protection", "Utilitaire"],
    "Personnelle · hémisphère de rayon 3 m",
    28800,
    "V, S, M (petite perle de cristal)",
    "Dôme immobile pour Kobe et jusqu’à neuf créatures de taille M ou inférieure présentes au lancement. Créatures/objets autorisés traversent, les autres sont bloqués ; sorts et effets magiques ne traversent pas. Le refuge cesse si Kobe le quitte.",
    {
      castTime: "1 minute",
      seconds: 60,
      ritual: true,
      maxTargets: 0,
      conditions:
        "Échec si trop de créatures ou taille trop grande ; climat confortable, couleur choisie, intérieur transparent et extérieur opaque.",
    },
  ),
  make(
    "hallucinatory-terrain",
    "Terrain hallucinatoire",
    4,
    "Illusion",
    ["Contrôle", "Utilitaire"],
    "90 m · cube de 45 m",
    86400,
    "V, S, M (pierre, brindille et plante verte)",
    "Modifie apparence, sons et odeurs d’un terrain naturel. Créatures, équipement et constructions gardent leur apparence. Toucher révèle le terrain ; Investigation DD17 en action pour percer l’illusion.",
    { castTime: "10 minutes", seconds: 600, maxTargets: 0 },
  ),
  make(
    "charm-monster",
    "Charme-monstre",
    4,
    "Enchantement",
    ["Contrôle", "Utilitaire"],
    "9 m",
    3600,
    "V, S",
    "Une créature visible : SAG DD17, avec avantage si Kobe ou ses compagnons la combattent. Échec : charmée, amicale envers Kobe ; fin si Kobe ou ses compagnons lui nuisent. Elle sait avoir été charmée à la fin.",
    {
      source: "Guide complet de Xanathar",
      save: "SAG",
      condition: "charmed",
      scaling:
        "+1 cible par niveau au-dessus du quatrième ; cibles à moins de9 m les unes des autres.",
    },
  ),
  make(
    "circle-of-power",
    "Cercle de pouvoir",
    5,
    "Abjuration",
    ["Protection"],
    "Personnelle · aura de rayon 9 m",
    600,
    "V",
    "Aura mobile : Kobe et les créatures amicales dans l’aura ont l’avantage aux sauvegardes contre les sorts et autres effets magiques. Quand un tel effet permet une sauvegarde pour moitié dégâts, réussite = aucun dégât ; échec = moitié.",
    {
      concentration: true,
      maxTargets: 0,
      secret: true,
      access: "Secrets magiques niveau10",
      conditions:
        "Portée et caractère amical vérifiés à chaque effet. Ne donne ni résistance générale ni avantage contre un effet non magique.",
    },
  ),
  make(
    "hold-monster",
    "Immobilisation de monstre",
    5,
    "Enchantement",
    ["Contrôle"],
    "27 m",
    60,
    "V, S, M (petite barre de fer)",
    "Une créature visible non morte-vivante : SAG DD17 ; paralysée en cas d’échec. Nouvelle sauvegarde à la fin de chacun de ses tours pour terminer l’effet sur elle.",
    {
      concentration: true,
      save: "SAG",
      condition: "paralyzed",
      repeat: "end",
      scaling:
        "+1 cible par niveau au-dessus du cinquième (aucun emplacement supérieur chez Kobe10).",
    },
  ),
]);
export const spellById = (id) => SPELLS.find((s) => s.id === id);
export const durationLabel = (s) =>
  s.id === "vicious-mockery"
    ? "Jusqu’à la fin du prochain tour de la cible"
    : s.duration === 0
      ? "Instantanée"
      : (s.concentration ? "Concentration · " : "") +
        (s.duration >= 3600
          ? s.duration / 3600 + " h"
          : s.duration >= 60
            ? s.duration / 60 + " min"
            : s.duration + " s");
export const maxTargets = (s, level) =>
  s.id === "enhance-ability"
    ? level - 1
    : s.id === "charm-monster"
      ? level - 3
      : s.maxTargets;
export function diceFor(s, level, critical = false) {
  if (!s.dice) return null;
  const extra = s.level ? level - s.level : 0;
  return [(s.dice[0] + extra) * (critical ? 2 : 1), s.dice[1]];
}
