# 🎬 EvoMediaPlayer.js

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge)

**Lecteur média unifié optimisé pour vidéo et audio avec synchronisation P2P**

[Installation](#-installation) • [Utilisation](#-utilisation) • [API](#-api-reference) • [Exemples](#-exemples)

</div>

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [API Reference](#-api-reference)
- [Exemples](#-exemples)
- [Configuration](#-configuration)
- [Structure du code](#-structure-du-code)

---

## 🎯 Vue d'ensemble

**EvoMediaPlayer** est une classe JavaScript complète qui fournit un lecteur média unifié pour la lecture de fichiers vidéo et audio. Il supporte deux modes d'utilisation distincts :

- **🎥 Mode Cinema** : Pour la lecture vidéo avec synchronisation en temps réel via WebSocket (P2P)
- **🎵 Mode Audio** : Pour la lecture audio avec interface simplifiée et recherche de lyrics

### Caractéristiques principales

- ✅ Support vidéo et audio natif
- ✅ Synchronisation multi-utilisateurs (mode cinema)
- ✅ Interface responsive et moderne
- ✅ Récupération automatique des couvertures d'album/pochette
- ✅ Recherche et affichage des paroles (lyrics)
- ✅ Contrôles de lecture avancés
- ✅ Mode plein écran
- ✅ Chat intégré (mode cinema)
- ✅ Gestion des métadonnées
- ✅ Parsing intelligent des noms de fichiers

---

## ✨ Fonctionnalités

### Mode Cinema
- 🎬 Lecture vidéo en plein écran
- 🔄 Synchronisation en temps réel entre utilisateurs
- 💬 Chat intégré avec système d'épinglage
- 🎮 Contrôles automatiques (masquage/apparition)
- 📊 Barre de progression interactive
- 🖼️ Récupération automatique des affiches de films (OMDB)

### Mode Audio
- 🎵 Interface audio optimisée
- 🎤 Recherche et affichage des paroles (MusicMatch)
- 🎨 Récupération automatique des pochettes d'album (MusicBrainz)
- 📱 Interface responsive
- ⏯️ Contrôles de lecture complets

### Fonctionnalités communes
- 🔊 Contrôle du volume avec icônes dynamiques
- ⏪⏩ Navigation (reculer/avancer de 10s)
- 🔍 Affichage des informations du média
- 📊 Barre de progression avec prévisualisation
- 🎨 Interface personnalisable via CSS
- 🧹 Nettoyage automatique des ressources

---

## 📦 Prérequis

### Dépendances JavaScript

| Dépendance | Version | Requis pour |
|------------|---------|-------------|
| **Socket.IO** | 4.x+ | Mode Cinema (synchronisation) |
| **Font Awesome** | 6.4.0+ | Icônes |

### Fichiers nécessaires

```
assets/
└── js/
    └── EvoMediaPlayer.js    # Fichier principal (2005 lignes)
```

**Note :** Le CSS est généré dynamiquement et inclus directement dans le JavaScript. Aucun fichier CSS externe n'est requis.

---

## 🚀 Installation

### 1. Inclure les fichiers dans votre HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Font Awesome (pour les icônes) -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <!-- Votre contenu -->
    
    <!-- Socket.IO (requis pour mode cinema uniquement) -->
    <script src="/socket.io/socket.io.js"></script>
    
    <!-- EvoMediaPlayer JS -->
    <script src="/assets/js/EvoMediaPlayer.js"></script>
</body>
</html>
```

**Note :** Le CSS est généré automatiquement et inclus dans le JavaScript. Aucun fichier CSS externe n'est nécessaire.

### 2. Initialisation de base

```javascript
// Créer une instance du lecteur
// clientInstance : votre instance de client (peut être null si mode audio uniquement)
// socketInstance : votre instance Socket.IO (peut être null si mode audio uniquement)
const evoPlayer = new EvoMediaPlayer(clientInstance, socketInstance);
```

---

## 💻 Utilisation

### Mode Audio

Pour lire un fichier audio :

```javascript
// Initialiser le lecteur en mode audio
evoPlayer.init('audio', {
    fileId: 'file-123',
    fileData: {
        id: 'file-123',
        name: 'ma-chanson.mp3',
        originalName: 'Ma Chanson.mp3',
        size: 5000000,
        type: 'audio/mpeg',
        data: arrayBuffer, // ou blob URL
        // ou
        shareUrl: 'https://example.com/files/ma-chanson.mp3',
        downloadUrl: 'https://example.com/download/ma-chanson.mp3'
    },
    metadata: {
        title: 'Titre de la chanson',
        artist: 'Nom de l\'artiste',
        year: '2024'
    },
    isHost: false,
    autoplay: true // optionnel
});
```

### Mode Cinema

Pour créer une salle de cinéma et lire une vidéo :

```javascript
// Initialiser le lecteur en mode cinema
evoPlayer.init('cinema', {
    fileId: 'file-456',
    fileData: {
        id: 'file-456',
        name: 'mon-film.mp4',
        originalName: 'Mon Film.mp4',
        size: 100000000,
        type: 'video/mp4',
        data: arrayBuffer, // ou blob URL
        // ou
        shareUrl: 'https://example.com/files/mon-film.mp4',
        downloadUrl: 'https://example.com/download/mon-film.mp4'
    },
    metadata: {
        title: 'Titre du film',
        movieName: 'Titre du film',
        videoName: 'Mon Film.mp4',
        year: '2024'
    },
    isHost: true, // true si vous êtes l'hôte de la salle
    roomInfo: {
        id: 'cinema-room-1',
        name: 'Ma Salle de Cinéma',
        password: 'ABC123XYZ',
        hostId: 'user-123',
        videoId: 'file-456',
        videoName: 'Mon Film.mp4'
    },
    autoplay: false // recommandé false pour le mode cinema
});
```

---

## 📚 API Reference

### Constructeur

```javascript
new EvoMediaPlayer(clientInstance, socketInstance)
```

**Paramètres :**
- `clientInstance` (Object|null) : Instance de votre client application
  - Doit implémenter : `getMediaType(filename, mimeType)`, `addMessage(type, message)`
  - Optionnel : `createCinemaChat()`, `closeCinemaRoom()`, `leaveCinemaRoom()`
- `socketInstance` (Object|null) : Instance Socket.IO pour la synchronisation (mode cinema)

**Exemple :**
```javascript
const client = {
    getMediaType: (filename, mimeType) => {
        if (mimeType?.startsWith('video/')) return 'video';
        if (mimeType?.startsWith('audio/')) return 'audio';
        return null;
    },
    addMessage: (type, message) => console.log(`[${type}] ${message}`)
};

const socket = io(); // Socket.IO instance
const player = new EvoMediaPlayer(client, socket);
```

---

### Méthodes principales

#### `init(mode, options)`

Initialise le lecteur avec un mode spécifique.

**Paramètres :**
- `mode` (string) : `'cinema'` ou `'audio'`
- `options` (Object) :
  - `fileId` (string) : ID unique du fichier
  - `fileData` (Object) : Données du fichier (voir structure ci-dessous)
  - `metadata` (Object) : Métadonnées du média (voir structure ci-dessous)
  - `isHost` (boolean) : Si true, l'utilisateur est l'hôte (cinema uniquement)
  - `roomInfo` (Object) : Informations de la salle (cinema uniquement)
  - `autoplay` (boolean) : Lecture automatique (défaut: false)

**Exemple :**
```javascript
player.init('audio', {
    fileId: 'audio-1',
    fileData: { /* ... */ },
    metadata: { /* ... */ },
    autoplay: true
});
```

---

#### `loadMedia(fileId, fileData, metadata, autoplay)`

Charge un nouveau média dans le lecteur.

**Paramètres :**
- `fileId` (string) : ID unique du fichier
- `fileData` (Object) : Données du fichier
- `metadata` (Object) : Métadonnées du média (optionnel)
- `autoplay` (boolean) : Lecture automatique (défaut: false)

**Exemple :**
```javascript
player.loadMedia('file-123', fileData, metadata, true);
```

---

### Contrôles de lecture

#### `play()`

Démarre la lecture du média.

```javascript
await player.play();
```

**Retourne :** Promise (peut être rejetée si autoplay bloqué)

---

#### `pause()`

Met en pause la lecture.

```javascript
player.pause();
```

---

#### `stop()`

Arrête la lecture et remet à zéro.

```javascript
player.stop();
```

---

#### `togglePlayPause()`

Bascule entre lecture et pause.

```javascript
player.togglePlayPause();
```

---

#### `seek(time)`

Va à une position spécifique dans le média.

**Paramètres :**
- `time` (number) : Temps en secondes

**Exemple :**
```javascript
player.seek(120); // Aller à 2 minutes
```

---

#### `rewind(seconds)`

Recule de X secondes.

**Paramètres :**
- `seconds` (number) : Nombre de secondes (défaut: 10)

**Exemple :**
```javascript
player.rewind(10); // Reculer de 10 secondes
```

---

#### `forward(seconds)`

Avance de X secondes.

**Paramètres :**
- `seconds` (number) : Nombre de secondes (défaut: 10)

**Exemple :**
```javascript
player.forward(10); // Avancer de 10 secondes
```

---

### Gestion du mode

#### `setMode(mode)`

Change le mode du lecteur.

**Paramètres :**
- `mode` (string) : `'cinema'` ou `'audio'`

```javascript
player.setMode('audio');
```

---

### Chat (Mode Cinema uniquement)

#### `toggleChat()`

Affiche/Masque le chat.

```javascript
player.toggleChat();
```

---

#### `showChat()`

Affiche le chat.

```javascript
player.showChat();
```

---

#### `hideChat()`

Masque le chat.

```javascript
player.hideChat();
```

---

#### `toggleChatPin()`

Épingle/Désépingle le chat.

```javascript
player.toggleChatPin();
```

---

### Plein écran

#### `toggleFullscreen()`

Active/Désactive le mode plein écran.

```javascript
player.toggleFullscreen();
```

---

#### `enterFullscreen()`

Active le mode plein écran.

```javascript
player.enterFullscreen();
```

---

#### `exitFullscreen()`

Désactive le mode plein écran.

```javascript
player.exitFullscreen();
```

---

### Lyrics (Mode Audio uniquement)

#### `toggleLyrics()`

Affiche/Masque le panneau de lyrics.

```javascript
player.toggleLyrics();
```

---

### Informations

#### `showInfo()`

Affiche une modale avec les informations du média.

```javascript
player.showInfo();
```

**Note :** Cette méthode crée une modale HTML simple avec les informations du média.

---

### Synchronisation (Mode Cinema uniquement)

#### `startSync()`

Démarre la synchronisation (pour l'hôte).

```javascript
player.startSync();
```

**Note :** Envoie les données de synchronisation toutes les secondes via Socket.IO.

---

#### `stopSync()`

Arrête la synchronisation.

```javascript
player.stopSync();
```

---

#### `handleSync(data)`

Gère un événement de synchronisation reçu.

**Paramètres :**
- `data` (Object) : Données de synchronisation
  - `currentTime` (number) : Temps actuel en secondes
  - `isPlaying` (boolean) : État de lecture
  - `volume` (number) : Volume (0-1)

**Exemple :**
```javascript
// Écouter les événements Socket.IO
socket.on('cinema-sync-received', (data) => {
    player.handleSync(data);
});
```

---

### Nettoyage

#### `destroy()`

Détruit le lecteur et nettoie toutes les ressources.

```javascript
player.destroy();
```

**Important :** Toujours appeler cette méthode avant de créer une nouvelle instance pour éviter les fuites mémoire.

---

### Méthodes statiques (Démo)

#### `EvoMediaPlayer.initDemoPage()`

Initialise une page de démonstration.

```javascript
EvoMediaPlayer.initDemoPage();
```

---

#### `EvoMediaPlayer.loadDemoAudio(client, socket, audioUrl)`

Charge un fichier audio de démonstration.

**Paramètres :**
- `client` (Object) : Instance client
- `socket` (Object) : Instance Socket.IO
- `audioUrl` (string) : URL du fichier audio (optionnel)

```javascript
EvoMediaPlayer.loadDemoAudio(client, socket, '/audio/demo.mp3');
```

---

#### `EvoMediaPlayer.loadDemoCinema(client, socket, videoUrl)`

Charge une vidéo de démonstration.

**Paramètres :**
- `client` (Object) : Instance client
- `socket` (Object) : Instance Socket.IO
- `videoUrl` (string) : URL de la vidéo (optionnel)

```javascript
EvoMediaPlayer.loadDemoCinema(client, socket, 'https://example.com/video.mp4');
```

---

## 📊 Structure des données

### fileData

L'objet `fileData` doit contenir :

```javascript
{
    id: string,              // ID unique du fichier (requis)
    name: string,            // Nom du fichier (requis)
    originalName?: string,   // Nom original (optionnel, utilisé pour parsing)
    size: number,            // Taille en octets (requis)
    type: string,            // MIME type (requis, ex: 'video/mp4', 'audio/mpeg')
    data?: ArrayBuffer | File | Blob,  // Données du fichier (optionnel)
    shareUrl?: string,       // URL de partage (optionnel)
    downloadUrl?: string,    // URL de téléchargement (optionnel)
    uploadDate?: Date        // Date d'upload (optionnel)
}
```

**Exemple :**
```javascript
const fileData = {
    id: 'file-123',
    name: 'song.mp3',
    originalName: 'Artist - Song Title.mp3',
    size: 5242880,
    type: 'audio/mpeg',
    downloadUrl: 'https://example.com/files/song.mp3'
};
```

---

### metadata

L'objet `metadata` peut contenir :

```javascript
{
    title?: string,          // Titre du média
    movieName?: string,      // Nom du film (mode cinema)
    videoName?: string,      // Nom de la vidéo (mode cinema)
    artist?: string,         // Artiste (mode audio)
    year?: string,           // Année de sortie
    subtitle?: string,       // Sous-titre
    // ... autres métadonnées personnalisées
}
```

**Exemple :**
```javascript
const metadata = {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    year: '1975'
};
```

---

### roomInfo (Mode Cinema uniquement)

L'objet `roomInfo` doit contenir :

```javascript
{
    id: string,              // ID unique de la salle
    name: string,            // Nom de la salle
    password: string,        // Mot de passe/code de la salle
    hostId: string,          // ID de l'hôte
    videoId: string,         // ID de la vidéo
    videoName: string        // Nom de la vidéo
}
```

---

## 🎨 Configuration

### Récupération des couvertures

Le lecteur récupère automatiquement les couvertures :

- **Vidéos** : Utilise l'API OMDB (Open Movie Database)
  - Clé API intégrée : `6166739b` (peut être modifiée dans le code)
  - Recherche par titre et année

- **Audio** : Utilise l'API MusicBrainz (Cover Art Archive)
  - Recherche par artiste et titre
  - Rate limiting : 1 requête par seconde

### Récupération des lyrics

Le lecteur recherche les paroles via :

- **MusicMatch API** : Utilise des proxies CORS
  - Clé API : `TA_CLE_API_MUSICMATCH` (à configurer)
  - Proxies utilisés : `corsproxy.io`, `api.codetabs.com`
  - Cache intégré pour éviter les requêtes répétées

**Configuration de la clé API :**
```javascript
// Dans EvoMediaPlayer.js, ligne 234
this.musicMatchAPIKey = 'VOTRE_CLE_API_MUSICMATCH';
```

---

## 📖 Exemples

### Exemple 1 : Lecteur audio simple

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Lecteur Audio</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <button onclick="playAudio()">Lire un fichier audio</button>
    
    <script src="/assets/js/EvoMediaPlayer.js"></script>
    <script>
        let player = null;
        
        const client = {
            getMediaType: (filename, mimeType) => {
                if (mimeType?.startsWith('video/')) return 'video';
                if (mimeType?.startsWith('audio/')) return 'audio';
                return null;
            },
            addMessage: (type, msg) => console.log(`[${type}] ${msg}`)
        };
        
        function playAudio() {
            // Créer le lecteur
            if (!player) {
                player = new EvoMediaPlayer(client, null);
            }
            
            // Charger un fichier audio
            fetch('/api/audio-file.mp3')
                .then(response => response.blob())
                .then(blob => {
                    const fileData = {
                        id: 'audio-1',
                        name: 'audio-file.mp3',
                        originalName: 'Ma Chanson.mp3',
                        size: blob.size,
                        type: 'audio/mpeg',
                        data: blob
                    };
                    
                    player.init('audio', {
                        fileId: 'audio-1',
                        fileData: fileData,
                        metadata: {
                            title: 'Ma Chanson',
                            artist: 'Mon Artiste',
                            year: '2024'
                        },
                        autoplay: true
                    });
                });
        }
    </script>
</body>
</html>
```

---

### Exemple 2 : Lecteur vidéo avec synchronisation

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Cinéma P2P</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <button onclick="createCinemaRoom()">Créer une salle</button>
    
    <script src="/socket.io/socket.io.js"></script>
    <script src="/assets/js/EvoMediaPlayer.js"></script>
    <script>
        const socket = io();
        let player = null;
        
        // Instance client minimal
        const client = {
            getMediaType: (filename, mimeType) => {
                if (mimeType?.startsWith('video/')) return 'video';
                if (mimeType?.startsWith('audio/')) return 'audio';
                return null;
            },
            addMessage: (type, msg) => console.log(`[${type}] ${msg}`),
            createCinemaChat: () => {
                // Créer l'élément chat
                const chat = document.createElement('div');
                chat.id = 'cinemaChat';
                // ... configuration du chat
                return chat;
            },
            closeCinemaRoom: () => {
                socket.emit('close-cinema-room', { roomCode: 'ABC123' });
            }
        };
        
        function createCinemaRoom() {
            if (!player) {
                player = new EvoMediaPlayer(client, socket);
            }
            
            // Charger une vidéo
            fetch('/api/video-file.mp4')
                .then(response => response.blob())
                .then(blob => {
                    const fileData = {
                        id: 'video-1',
                        name: 'video-file.mp4',
                        originalName: 'Mon Film.mp4',
                        size: blob.size,
                        type: 'video/mp4',
                        data: blob
                    };
                    
                    player.init('cinema', {
                        fileId: 'video-1',
                        fileData: fileData,
                        metadata: {
                            title: 'Mon Film',
                            movieName: 'Mon Film',
                            videoName: 'Mon Film.mp4',
                            year: '2024'
                        },
                        isHost: true,
                        roomInfo: {
                            id: 'room-1',
                            name: 'Ma Salle',
                            password: 'ABC123XYZ',
                            hostId: 'user-123',
                            videoId: 'video-1',
                            videoName: 'Mon Film.mp4'
                        },
                        autoplay: false
                    });
                    
                    // Démarrer la synchronisation
                    player.startSync();
                });
        }
        
        // Écouter les événements de synchronisation
        socket.on('cinema-sync-received', (data) => {
            if (player) {
                player.handleSync(data);
            }
        });
    </script>
</body>
</html>
```

---

### Exemple 3 : Utilisation avec fichiers locaux

```javascript
const fileInput = document.getElementById('fileInput');
const client = { /* ... */ };

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileData = {
        id: `file-${Date.now()}`,
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        data: file
    };
    
    const mode = file.type.startsWith('video/') ? 'cinema' : 'audio';
    const metadata = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        year: new Date().getFullYear().toString()
    };
    
    if (mode === 'audio') {
        metadata.artist = 'Artiste inconnu';
    }
    
    const player = new EvoMediaPlayer(client, socket);
    player.init(mode, {
        fileId: fileData.id,
        fileData: fileData,
        metadata: metadata,
        autoplay: true
    });
});
```

---

## 🏗️ Structure du code

### Architecture

Le fichier `EvoMediaPlayer.js` (2005 lignes) est organisé en plusieurs sections :

1. **Méthodes statiques** (lignes 10-204)
   - `initDemoPage()` : Initialisation de la page de démo
   - `setupDemoEvents()` : Configuration des événements de démo
   - `loadLocalFile()` : Chargement de fichiers locaux
   - `loadDemoAudio()` : Chargement audio de démo
   - `loadDemoCinema()` : Chargement vidéo de démo

2. **Constructeur et initialisation** (lignes 209-256)
   - `constructor()` : Initialisation de l'instance
   - `init()` : Configuration du mode et chargement initial

3. **Génération HTML/CSS** (lignes 258-887)
   - `_buildPlayerHTML()` : Génération du HTML du lecteur
   - `_getPlayerCSS()` : Génération du CSS inline

4. **Gestion du DOM** (lignes 889-1006)
   - `createContainer()` : Création du conteneur principal
   - `setupEventListeners()` : Configuration des événements

5. **Gestion des médias** (lignes 1008-1418)
   - `loadMedia()` : Chargement des fichiers média
   - `_setupMediaEvents()` : Configuration des événements média
   - `_cleanupMediaElement()` : Nettoyage des ressources

6. **Contrôles de lecture** (lignes 1420-1503)
   - `play()`, `pause()`, `stop()`, `seek()`, etc.
   - `updateProgress()`, `updateTimeDisplay()`, etc.

7. **Synchronisation** (lignes 1505-1531)
   - `startSync()`, `stopSync()`, `handleSync()`

8. **Interface utilisateur** (lignes 1533-1611)
   - `toggleChat()`, `toggleFullscreen()`, `showInfo()`, etc.

9. **Métadonnées et couvertures** (lignes 1238-1760)
   - `updateMediaInfo()` : Mise à jour des informations
   - `_parseFileName()` : Parsing intelligent des noms
   - `fetchCoverArt()` : Récupération des couvertures
   - `_fetchIMDBCover()` : Récupération via OMDB
   - `_fetchMusicBrainzCover()` : Récupération via MusicBrainz

10. **Lyrics** (lignes 1762-1949)
    - `toggleLyrics()` : Affichage/masquage
    - `fetchLyrics()` : Récupération via MusicMatch
    - `loadAndShowLyrics()` : Chargement et affichage

11. **Nettoyage** (lignes 1951-2000)
    - `destroy()` : Destruction complète de l'instance
    - `handleLeave()` : Gestion de la sortie

### État interne

L'objet `state` contient :

```javascript
{
    mode: string | null,              // 'cinema' ou 'audio'
    currentFileId: string | null,     // ID du fichier actuel
    currentFileData: Object | null,   // Données du fichier
    metadata: Object | null,          // Métadonnées
    isPlaying: boolean,               // État de lecture
    isHost: boolean,                  // Si hôte (cinema)
    isKaraokeActive: boolean,         // Mode karaoké (non utilisé)
    isFullscreenActive: boolean,      // État plein écran
    isChatPinned: boolean,            // Chat épinglé
    controlsVisible: boolean,         // Contrôles visibles
    isLyricsVisible: boolean          // Lyrics visibles
}
```

---

## 🔧 Personnalisation

### CSS

Le CSS est généré dynamiquement via `_getPlayerCSS()` et inclus directement dans le JavaScript. Pour personnaliser :

**Modifier directement dans le code** : Éditez la méthode `_getPlayerCSS()` (lignes 377-887) dans le fichier `EvoMediaPlayer.js`

### Parsing des noms de fichiers

Le lecteur parse automatiquement les noms de fichiers pour extraire :
- Artiste et titre (format : `Artiste - Titre`)
- Informations de qualité (720P, 1080P, WEBRIP, etc.)
- Année de sortie

**Formats supportés :**
- `Artiste - Titre.mp3`
- `Artiste – Titre (Année).mp3`
- `Film (2024) 1080P.mp4`

---

## ⚠️ Notes importantes

1. **Mode Cinema** : Nécessite Socket.IO pour la synchronisation entre utilisateurs
2. **Mode Audio** : Fonctionne sans Socket.IO
3. **Couvertures** : La récupération automatique nécessite des clés API (OMDB pour vidéos, MusicBrainz pour audio)
4. **Lyrics** : Nécessite une clé API MusicMatch configurée
5. **Responsive** : Le lecteur est entièrement responsive et s'adapte aux mobiles
6. **Nettoyage** : Toujours appeler `destroy()` avant de créer une nouvelle instance
7. **Blob URLs** : Les URLs blob sont automatiquement nettoyées lors du `destroy()`
8. **Rate limiting** : MusicBrainz API limitée à 1 requête/seconde

---

## 🐛 Dépannage

### Le média ne se charge pas

- Vérifiez que le `fileData` contient `downloadUrl` ou `data`
- Vérifiez le type MIME du fichier
- Consultez la console pour les erreurs

### La synchronisation ne fonctionne pas

- Vérifiez que Socket.IO est correctement initialisé
- Vérifiez que `isHost` est correctement défini
- Vérifiez les événements Socket.IO (`cinema-sync`, `cinema-sync-received`)

### Les couvertures ne s'affichent pas

- Vérifiez votre connexion internet
- Vérifiez que les métadonnées (titre, artiste) sont correctes
- Consultez la console pour les erreurs API

### Les lyrics ne s'affichent pas

- Vérifiez que la clé API MusicMatch est configurée
- Vérifiez que les métadonnées (artiste, titre) sont correctes
- Les proxies CORS peuvent être temporairement indisponibles

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

## 📧 Support

Pour toute question ou problème, consultez le code source ou contactez le développeur principal.

---

<div align="center">

**Fait avec ❤️ pour une expérience média optimale**

[⬆ Retour en haut](#-evomediaplayerjs)

</div>
