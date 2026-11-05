# Audit du 5 novembre 2026
Brackmard 08e4b2b, Samoth b54146a, Kentaro eeb458d et Kobe 102e82f examinés avec leurs branches et historiques. La base fonctionnelle retenue est le Lot 5 ad57cd9 (PR #6) pour conserver Table Libre, le cache versionné et les illustrations validées.

La barre des Companions lit un état mutable global. Kobe reconstruit le DOM à chaque transaction. Le shell doit donc lire directement le store Kobe. Pour le carnet, conserver un panneau DOM stable et exposer une projection du journal au module Kentaro. L’importeur reste dans Kentaro avec son identifiant historique. Aucun changement de protocole V5.
