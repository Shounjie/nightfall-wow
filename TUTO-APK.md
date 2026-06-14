# 🌙 Nightfall — Créer ton APK Android (pour tests entre amis)

Ce guide te fait passer de ton fichier HTML à un **vrai APK** que tu peux envoyer à
tes amis. On ne touche pas encore au Play Store.

**Important à comprendre avant de commencer :**
L'APK qu'on va créer ne contient PAS ton site — il **affiche ton site hébergé en
ligne** en plein écran, sans barre d'adresse. C'est pour ça qu'il faut d'abord
mettre ton app en ligne. C'est gratuit et ça prend 15 minutes.

Et comme ton app appelle Raider.IO et Wowhead, on règle aussi le **problème du CORS**
(sinon l'app afficherait "Character not found" pour tout le monde). C'est déjà
préparé dans les fichiers fournis.

---

## 📦 Les fichiers fournis

Dans le dossier que je t'ai donné, tu as :

| Fichier | Rôle |
|---|---|
| `index.html` | Ton app, version en ligne (appelle le proxy au lieu de Raider.IO directement) |
| `manifest.json` | Décrit l'app (nom, icône, couleurs) — obligatoire pour la PWA |
| `service-worker.js` | Permet à l'app d'être installable |
| `netlify.toml` | Configuration de l'hébergement + redirections du proxy |
| `netlify/functions/proxy.js` | Le proxy CORS (relaie les appels vers Raider.IO / Wowhead) |
| `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` | Les icônes de l'app |

⚠️ Garde **toute cette arborescence telle quelle**, surtout le dossier
`netlify/functions/`.

---

## Étape 1 — Mettre l'app en ligne (Netlify, gratuit)

On utilise **Netlify** : hébergement gratuit + le proxy CORS fonctionne directement.

1. Va sur **https://app.netlify.com** et crée un compte gratuit (avec Google ou GitHub, c'est le plus rapide).
2. Une fois connecté, cherche la zone **"Add new site" → "Deploy manually"**
   (ou la grande zone "Drag and drop your site folder here").
3. **Glisse-dépose le dossier entier** (celui qui contient `index.html`,
   `netlify.toml` et le dossier `netlify/`) dans cette zone.
4. Netlify déploie en ~30 secondes et te donne une URL du type :
   `https://random-name-123.netlify.app`
5. **Renomme l'URL** (optionnel mais conseillé) : dans le site,
   **Site configuration → Change site name** → mets par exemple `nightfall-wow`.
   Ton URL devient `https://nightfall-wow.netlify.app`.

### ✅ Test immédiat
Ouvre ton URL sur ton ordinateur, tape `Kramër` / `ysondre` / `EU` → **Analyze**.
Si tu vois ton équipement, **le CORS est réglé et l'app marche en ligne**. 🎉

Si tu vois "Character not found" :
- Vérifie que le dossier `netlify/functions/` a bien été uploadé.
- Dans Netlify : **Functions** (menu de gauche) → tu dois voir `proxy` listé.
- Re-déploie si besoin.

---

## Étape 2 — Tester que c'est bien une PWA

1. Ouvre ton URL dans **Chrome sur ton téléphone Android**.
2. Menu (⋮) → tu devrais voir **"Installer l'application"** ou **"Ajouter à l'écran d'accueil"**.
3. Si l'option apparaît : ta PWA est valide ✅ (c'est le prérequis pour l'APK).

Tu peux déjà t'arrêter là si l'installation PWA te suffit pour tes amis —
ça crée une icône sur l'écran d'accueil sans passer par un APK. Mais pour un
**vrai fichier APK à envoyer**, continue.

---

## Étape 3 — Générer l'APK avec PWABuilder (sans terminal)

**PWABuilder** est l'outil officiel (Microsoft + Google) avec une interface web.
Pas de ligne de commande.

1. Va sur **https://www.pwabuilder.com**
2. Colle ton URL Netlify (`https://nightfall-wow.netlify.app`) → **Start**.
3. PWABuilder analyse ta PWA et affiche un score. Les points manifest /
   service worker doivent être verts (on les a préparés).
4. Clique sur **"Package for stores"** → choisis **Android**.
5. Dans les options Android :
   - **Package ID** : mets quelque chose d'unique comme
     `app.nightfall.wow` (note-le, il sera demandé plus tard).
   - Laisse le reste par défaut pour l'instant.
   - Décoche éventuellement "Include source code" si tu veux juste l'APK.
6. Clique **Download**. Tu reçois un `.zip`.

### Dans le zip
Tu trouveras :
- `app-release-signed.apk` → **c'est LE fichier à envoyer à tes amis.**
- un `.aab` → garde-le pour plus tard (c'est pour le Play Store).
- un fichier de clé de signature (`signing.keystore` + mot de passe) →
  **GARDE-LE PRÉCIEUSEMENT.** Sans lui tu ne pourras jamais mettre à jour l'app.

---

## Étape 4 — Envoyer et installer l'APK

1. Envoie `app-release-signed.apk` à tes amis (WhatsApp, Discord, Drive, mail…).
2. Sur leur téléphone Android, à l'ouverture du fichier, Android demandera
   d'**autoriser l'installation depuis cette source** (Paramètres → autoriser
   pour l'app qui ouvre le fichier, ex. Fichiers ou Chrome). C'est normal pour
   un APK hors Play Store.
3. L'app s'installe avec l'icône lune 🌙.

### ⚠️ La "barre d'adresse" en haut
Au premier lancement, il peut y avoir un petit bandeau "Running in Chrome" en bas,
ou une barre d'adresse en haut. C'est parce que le **lien de confiance** entre
l'APK et ton site n'est pas encore établi. Pour tes tests entre amis, **ce n'est
pas grave, l'app marche pareil**. Pour l'enlever, il faudra ajouter un fichier
`assetlinks.json` (étape facultative ci-dessous).

---

## Étape 5 (facultative) — Enlever la barre d'adresse

Pour que l'app soit vraiment plein écran, Android doit "faire confiance" à ton site.

1. Dans le zip PWABuilder, ouvre le fichier `assetlinks.json` fourni
   (ou récupère ton **SHA-256 fingerprint** dans les infos du package).
2. Crée le dossier `.well-known` à la racine de ton site Netlify et mets
   `assetlinks.json` dedans → ré-déploie.
   L'URL `https://nightfall-wow.netlify.app/.well-known/assetlinks.json`
   doit s'afficher.
3. Réinstalle l'APK → plus de barre d'adresse.

---

## 🔧 Mettre à jour l'app plus tard

Gros avantage de cette méthode : comme l'APK affiche ton site en ligne,
**quand tu modifies `index.html` et que tu le re-déploies sur Netlify,
l'app de tes amis se met à jour toute seule** — pas besoin de renvoyer un APK !

Tu ne renvoies un nouvel APK que si tu changes le nom, l'icône, ou les permissions.

---

## 🗺️ Pour plus tard : le Play Store

Quand tu voudras publier officiellement :
- Compte développeur Google Play : **25 $ une fois** (à vie).
- Tu uploades le fichier **`.aab`** (pas l'APK) généré par PWABuilder.
- Il faudra l'`assetlinks.json` (étape 5) et quelques visuels (captures, description).

On verra ça ensemble le moment venu.

---

## ❓ Problèmes fréquents

**"Character not found" pour tout le monde**
→ Le proxy n'est pas actif. Vérifie le dossier `netlify/functions/` et l'onglet
Functions dans Netlify.

**PWABuilder dit que le manifest est invalide**
→ Vérifie que `https://ton-site.netlify.app/manifest.json` s'ouvre bien dans le
navigateur et affiche du texte.

**L'APK ne s'installe pas**
→ Le téléphone bloque les sources inconnues. Paramètres → Sécurité →
autoriser l'installation pour l'app qui ouvre le fichier.

**Les icônes/images d'objets ne s'affichent pas**
→ Normal si pas de connexion : les icônes viennent de Wowhead/zamimg en direct.
Avec connexion, elles apparaissent.

---

Voilà ! Tu as un APK fonctionnel à partager. La partie la plus importante,
c'est l'**Étape 1** (hébergement + proxy) — une fois que ça marche en ligne,
le reste n'est que de l'emballage.
