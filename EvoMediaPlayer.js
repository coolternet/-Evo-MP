/**
 * Evo-MediaPlayer - Lecteur média unifié optimisé
 * Version complète avec toutes les fonctionnalités
 */
class EvoMediaPlayer {

    /**
     * Méthodes statiques pour l'initialisation
     */
    static initDemoPage() {
        const mockClient = {
            getMediaType: (filename, mimeType) => {
                if (mimeType) {
                    if (mimeType.startsWith('video/')) return 'video';
                    if (mimeType.startsWith('audio/')) return 'audio';
                }
                if (filename) {
                    if (/\.(mp4|webm|mkv|mov|avi|wmv|flv)$/i.test(filename)) return 'video';
                    if (/\.(mp3|wav|ogg|flac|m4a|aac|wma)$/i.test(filename)) return 'audio';
                }
                return null;
            },
            addMessage: (type, message) => {
                const alertType = type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info';
                const loadBtn = document.getElementById('loadMediaBtn');
                if (loadBtn) {
                    loadBtn.insertAdjacentHTML('afterend', `
                        <div class="alert alert-${alertType} alert-dismissible fade show mt-3" role="alert">
                            ${message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        </div>
                    `);
                }
            }
        };

        const socket = typeof io !== 'undefined' ? io() : { 
            on: () => {}, emit: () => {}, off: () => {}, connected: false 
        };

        window.evoPlayer = null;
        this.setupDemoEvents(mockClient, socket);
    }

    static setupDemoEvents(client, socket) {
        const loadMediaBtn = document.getElementById('loadMediaBtn');
        const fileInput = document.getElementById('mediaFileInput');
        
        if (!loadMediaBtn || !fileInput) {
            console.warn('Éléments de démo non trouvés');
            return;
        }

        loadMediaBtn.addEventListener('click', () => this.loadLocalFile(client, socket));
        fileInput.addEventListener('change', () => {
            loadMediaBtn.disabled = fileInput.files.length === 0;
        });
        loadMediaBtn.disabled = true;

        window.addEventListener('beforeunload', () => window.evoPlayer?.destroy());
    }

    static loadLocalFile(client, socket) {
        const fileInput = document.getElementById('mediaFileInput');
        if (!fileInput?.files.length) {
            alert('Veuillez sélectionner un fichier.');
            return;
        }
        
        const file = fileInput.files[0];
        const mode = document.getElementById('playerMode')?.value || 'audio';
        
        const fileData = {
            id: `file-${Date.now()}`,
            name: file.name,
            originalName: file.name,
            size: file.size,
            type: file.type,
            data: file
        };
        
        const metadata = {
            title: file.name.replace(/\.[^/.]+$/, ''),
            year: new Date().getFullYear().toString()
        };

        if (mode === 'audio') metadata.artist = 'Artiste inconnu';

        const options = {
            fileId: fileData.id,
            fileData: fileData,
            metadata: metadata,
            autoplay: true,
            isHost: mode === 'cinema',
            roomInfo: mode === 'cinema' ? {
                id: 'room-' + Date.now(),
                name: 'Salle ' + metadata.title,
                password: Math.random().toString(36).substring(2, 8).toUpperCase(),
                hostId: 'user-' + Date.now(),
                videoId: fileData.id,
                videoName: file.name
            } : null
        };

        if (mode === 'cinema' && socket.emit && socket.connected) {
            socket.emit('join-cinema-room', { roomCode: options.roomInfo.password });
        }

        window.evoPlayer?.destroy();
        window.evoPlayer = new EvoMediaPlayer(client, socket);
        window.evoPlayer.init(mode, options);
        
        this.showLoadFeedback();
    }

    static showLoadFeedback() {
        const loadBtn = document.getElementById('loadMediaBtn');
        if (!loadBtn) return;

        const originalText = loadBtn.innerHTML;
        const originalClass = loadBtn.className;
        
        loadBtn.innerHTML = '<i class="fas fa-check me-2"></i>Lecture en cours...';
        loadBtn.className = originalClass.replace('btn-success', 'btn-secondary');
        loadBtn.disabled = true;
        
        setTimeout(() => {
            loadBtn.innerHTML = originalText;
            loadBtn.className = originalClass;
            const fileInput = document.getElementById('mediaFileInput');
            loadBtn.disabled = !fileInput || fileInput.files.length === 0;
        }, 2000);
    }

    static async loadDemoAudio(client, socket, audioUrl = '/audio/audio1.mp3') {
        try {
            const response = await fetch(audioUrl, { method: 'HEAD' });
            if (!response.ok) throw new Error('Impossible de charger le fichier audio');
            
            const fileData = {
                id: 'audio-demo',
                name: 'audio-demo.mp3',
                originalName: 'audio-demo.mp3',
                size: parseInt(response.headers.get('content-length') || '0'),
                type: 'audio/mpeg',
                downloadUrl: audioUrl
            };
            
            const metadata = { title: 'Démo Audio', artist: 'Artiste Démo', year: '2024' };

            window.evoPlayer?.destroy();
            window.evoPlayer = new EvoMediaPlayer(client, socket);
            window.evoPlayer.init('audio', { fileId: fileData.id, fileData, metadata, autoplay: true });
            
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    }

    static async loadDemoCinema(client, socket, videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4') {
        try {
            const fileData = {
                id: 'video-demo',
                name: 'demo-video.mp4',
                originalName: 'Big Buck Bunny',
                type: 'video/mp4',
                size: 0,
                downloadUrl: videoUrl
            };
            
            const metadata = { 
                title: 'Big Buck Bunny', 
                movieName: 'Big Buck Bunny', 
                videoName: 'Big Buck Bunny.mp4', 
                year: '2008' 
            };
            
            const roomInfo = {
                id: 'room-demo-' + Date.now(),
                name: 'Salle de Démonstration',
                password: 'DEMO123',
                hostId: 'host-demo',
                videoId: fileData.id,
                videoName: fileData.originalName
            };

            window.evoPlayer?.destroy();
            window.evoPlayer = new EvoMediaPlayer(client, socket);
            window.evoPlayer.init('cinema', { 
                fileId: fileData.id, 
                fileData, 
                metadata, 
                isHost: true, 
                roomInfo, 
                autoplay: true 
            });
                        
            if (socket.emit && socket.connected) {
                socket.emit('join-cinema-room', { roomCode: roomInfo.password });
            }
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    }
    
    /**
     * Constructeur et méthodes d'instance
     */
    constructor(clientInstance, socketInstance) {
        this.client = clientInstance;
        this.socket = socketInstance;
        this.container = null;
        this.mediaElement = null;
        this.elements = {};
        this.state = {
            mode: null,
            currentFileId: null,
            currentFileData: null,
            metadata: null,
            isPlaying: false,
            isHost: false,
            isKaraokeActive: false,
            isFullscreenActive: false,
            isChatPinned: false,
            controlsVisible: true,
            isLyricsVisible: false
        };
        
        this.syncInterval = null;
        this.hideControlsTimeout = null;
        this.coverArtCache = new Map();
        this.lyricsCache = new Map();
        this.lastAPICall = 0;
        this.musicMatchAPIKey = 'TA_CLE_API_MUSICMATCH';
        this.isSeekbarDragging = false;
        this.roomInfo = null;
        this.currentBlobUrl = null;
    }

    init(mode, options = {}) {
        this.state = { ...this.state, mode, ...options };
        
        const elementsToToggle = document.querySelectorAll('section, nav');
        const isCinema = mode === 'cinema';
        
        elementsToToggle.forEach(el => el.classList.toggle('d-none', isCinema));
        document.body.style.overflow = isCinema ? 'hidden' : '';
        
        this.roomInfo = options.roomInfo;
        this.createContainer();
        this.setupEventListeners();
        
        if (options.fileId && options.fileData) {
            this.loadMedia(options.fileId, options.fileData, options.metadata, options.autoplay);
        }
    }
    
    _buildPlayerHTML() {
        const { mode, isHost, metadata, currentFileData } = this.state;
        const isCinema = mode === 'cinema';
        const mediaIsVideo = this.client.getMediaType(
            currentFileData?.originalName || currentFileData?.name, 
            currentFileData?.type
        ) === 'video';
        
        // CORRECTION : Le bouton fullscreen ne doit apparaître qu'en mode cinema OU si c'est une vidéo en mode audio
        const showFullscreenBtn = isCinema || mediaIsVideo;
        
        const defaultCoverUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%23666'%3ECover%3C/text%3E%3C/svg%3E";
        
        const fileName = currentFileData?.originalName || currentFileData?.name || 'nom-du-fichier.mp3';
        const movieTitle = metadata?.title ?? metadata?.movieName ?? 'Titre';
        const artistName = metadata?.artist ?? 'Artiste';
        const subtitle = metadata?.subtitle ?? metadata?.videoName ?? fileName;
        
        const titleDisplay = movieTitle;
        const fileDisplay = isCinema ? subtitle : artistName;
        
        return `
            <style>${this._getPlayerCSS(isCinema)}</style>
            
            ${isCinema ? `
            <div class="evo-header" id="evo-header">
                <div class="header-left">
                    <div class="cover" id="header-evo-cover">
                        <img id="header-evo-cover-img" src="${defaultCoverUrl}" alt="Cover">
                    </div>
                    <div class="header-title-group">
                        <div class="movie-title" id="header-evo-movie-title">${movieTitle}</div>
                        <div class="file-name" id="header-evo-file-name">${subtitle}</div>
                    </div>
                </div>
                <div class="header-right">
                    <button class="btn btn-sm" id="evo-leave-btn" title="${isHost ? 'Fermer la salle' : 'Quitter la salle'}">
                        <i class="fas ${isHost ? 'fa-times-circle' : 'fa-sign-out-alt'}"></i>
                    </button>
                </div>
            </div>
            ` : ''}
            
            ${isCinema ? `
            <div class="evo-tchat" id="evo-tchat">
                <div class="evo-tchat-header">
                    <span class="evo-tchat-title">Clavardage</span>
                    <i class="fas fa-thumbtack evo-tchat-pin" id="evo-tchat-pin" title="Épingler le chat"></i>
                </div>
            </div>
            ` : ''}
            
            <div class="evo-footer row m-0" id="evo-footer">
                <div class="col-12" id="evo-seekbar-container"></div>
                
                <div class="col-md-4 footer-left">
                    <div class="media-info-container">
                        <div class="cover" id="footer-evo-cover">
                            <img id="footer-evo-cover-img" src="${defaultCoverUrl}" alt="Cover">
                        </div>
                        <div class="media-info">
                            <div class="movie-title" id="footer-evo-movie-title">${titleDisplay}</div>
                            <div class="file-name" id="footer-evo-file-name">${fileDisplay}</div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4 footer-center">
                    <div class="controller" id="evo-controller">
                        <div class="btn-ctrl" id="evo-btn-ctrl">
                            <span id="evo-current-time" class="time-display">00:00</span>
                            <button class="btn btn-sm" id="evo-rewind" title="Reculer 10s">
                                <i class="fas fa-backward"></i>
                            </button>
                            <button class="btn btn-sm" id="evo-play-pause" title="Play/Pause">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <button class="btn btn-sm" id="evo-forward" title="Avancer 10s">
                                <i class="fas fa-forward"></i>
                            </button>
                            <span id="evo-total-time" class="time-display">00:00</span>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4 footer-right">
                    <div class="options" id="evo-options">
                        ${!isCinema ? `
                            <button class="btn btn-sm" id="evo-lyrics" title="Afficher les paroles">
                                <i class="fas fa-scroll"></i>
                            </button>
                        ` : ''}
                        
                        <div class="volume-control" id="evo-volume-control">
                            <i class="fas fa-volume-up" id="evo-volume-icon"></i>
                            <input type="range" class="form-range" id="evo-volume" min="0" max="100" value="100" title="Volume">
                        </div>
                        
                        ${isCinema ? `
                            <button class="btn btn-sm" id="evo-chat-toggle" title="Chat">
                                <i class="fas fa-comments"></i>
                            </button>
                        ` : ''}
                        
                        ${showFullscreenBtn ? `
                            <button class="btn btn-sm" id="evo-fullscreen" title="Plein écran">
                                <i class="fas fa-expand"></i>
                            </button>
                        ` : ''}
                        
                        <button class="btn btn-sm" id="evo-info" title="Informations">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    _getPlayerCSS(isCinema) {
        return `
            #Evo-MediaPlayer {
                position: ${isCinema ? 'fixed' : 'fixed'};
                ${isCinema ? 'top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh;' : 'bottom: 0; left: 0; right: 0; width: 100%; height: auto;'}
                z-index: 1000;
                background: ${isCinema ? '#000' : 'rgba(0,0,0,0.85)'};
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            .evo-header, .evo-footer {
                position: ${isCinema ? 'fixed' : 'relative'};
                left: 0;
                right: 0;
                width: 100%;
                background: rgba(0,0,0,0.85);
                color: white;
                margin: 0;
                z-index: 1001;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .evo-header { 
                ${isCinema ? 'display: flex; top: 0;' : 'display: none;'}
                justify-content: space-between;
                align-items: center;
                border-top: none;
                padding: 15px 20px;
                height: 70px;
                box-sizing: border-box;
            }
            
            .evo-footer { 
                display: flex;
                align-items: center;
                ${isCinema ? 'position: fixed; bottom: 0;' : 'position: relative;'}
                background: rgba(0,0,0,0.85);
                transition: all 0.3s ease;
                padding: 5px;
                height: 90px;
                box-sizing: border-box;
            }
            
            #evo-seekbar-container {
                position: absolute;
                top: -5px;
                left: 0;
                width: 100%;
                height: 5px;
                cursor: pointer;
                z-index: 1005;
                background: linear-gradient(90deg, #007bff 0%, #007bff 0%, #495057 0%);
                transition: all 0.3s ease;
            }
            
            #evo-seekbar-container:hover {
                height: 8px;
                top: -8px;
                background: linear-gradient(90deg, #0056b3 0%, #0056b3 var(--progress-percent, 0%), #6c757d var(--progress-percent, 0%) 100%);
            }
            
            #evo-seekbar-container::after {
                content: '';
                position: absolute;
                top: 50%;
                left: var(--progress-percent, 0%);
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background: #007bff;
                border-radius: 50%;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            #evo-seekbar-container:hover::after {
                opacity: 1;
            }
            
            .evo-footer .row {
                width: 100%;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
            }
            
            .footer-left {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                flex: 1;
            }
            
            .footer-center {
                display: flex;
                justify-content: center;
                align-items: center;
                flex: 1;
            }
            
            .footer-right {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                flex: 1;
            }
            
            .media-info-container {
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 100%;
            }
            
            .cover { 
                flex-shrink: 0; 
                width: 50px; 
                height: 50px; 
                background: #333; 
                border-radius: 8px; 
                overflow: hidden; 
                position: relative;
            }
            
            .cover img { 
                width: 100%; 
                height: 100%; 
                object-fit: cover; 
            }
            
            .media-info {
                flex: 1;
                min-width: 0;
            }
            
            .movie-title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 2px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .file-name {
                font-size: 12px;
                color: #666;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .controller {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                width: 100%;
            }
            
            .btn-ctrl {
                display: flex;
                align-items: center;
                gap: 15px;
                justify-content: center;
            }
            
            .btn-ctrl button { 
                width: 32px !important; 
                height: 32px !important; 
                min-width: 32px !important; 
                padding: 0 !important; 
                display: flex !important; 
                align-items: center !important; 
                justify-content: center !important; 
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: white;
                transition: background 0.2s ease;
            }
            
            .btn-ctrl button:hover { 
                background: rgba(255, 255, 255, 0.2);
            }
            
            .btn-ctrl button i { 
                margin: 0 !important; 
                padding: 0 !important; 
                font-size: 0.8rem;
            }
            
            .time-display { 
                font-size: 0.75rem; 
                min-width: 40px; 
                text-align: center;
                color: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
            }
            
            .options { 
                display: flex; 
                align-items: center; 
                gap: 10px; 
                flex-shrink: 0; 
            }
            
            .options button {
                width: 32px !important;
                height: 32px !important;
                min-width: 32px !important;
                padding: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: white;
                transition: background 0.2s ease;
            }
            
            .options button:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .options button i {
                font-size: 0.8rem;
            }
            
            .volume-control { 
                display: flex; 
                align-items: center; 
                gap: 8px; 
                flex-shrink: 0; 
            }
            
            .volume-control input[type="range"] { 
                width: 80px; 
                cursor: pointer; 
            }
            
            .volume-control i { 
                font-size: 0.9rem; 
                color: rgba(255,255,255,0.8); 
            }
            
            :root {
                --header-height: 70px;
                --footer-height: 90px;
            }
            
            #Evo-MediaPlayer.controls-hidden .evo-header,
            #Evo-MediaPlayer.controls-hidden .evo-footer {
                opacity: 0;
                pointer-events: none;
            }
            
            #Evo-MediaPlayer.controls-hidden .evo-header {
                transform: translateY(-100%);
            }
            
            #Evo-MediaPlayer.controls-hidden .evo-footer {
                transform: translateY(100%);
            }
            
            .header-left { 
                flex-grow: 1; 
                min-width: 0; 
                display: flex; 
                align-items: center; 
                gap: 15px; 
            }
            
            .header-left .cover { 
                flex-shrink: 0; 
                width: 60px; 
                height: 60px; 
                background: #333; 
                border-radius: 8px; 
                overflow: hidden; 
            }
            
            .header-left .cover img { 
                width: 100%; 
                height: 100%; 
                object-fit: cover; 
                display: block; 
            }
            
            .header-title-group { 
                flex-grow: 1; 
                min-width: 0; 
                display: flex; 
                flex-direction: column; 
            }
            
            .header-title-group .movie-title, 
            .header-title-group .file-name { 
                overflow: hidden; 
                text-overflow: ellipsis; 
                white-space: nowrap; 
            }
            
            .header-title-group .movie-title { 
                font-weight: 600; 
                font-size: 1rem; 
            }
            
            .header-title-group .file-name { 
                font-size: 0.875rem; 
                color: rgba(255,255,255,0.7); 
                margin-top: 4px; 
            }
            
            .evo-tchat {
                position: fixed; 
                right: 0; 
                width: 200px;
                background: rgba(0,0,0,0.85); 
                color: white;
                display: ${isCinema ? 'flex' : 'none'}; 
                flex-direction: column;
                z-index: 1001; 
                opacity: 0;
                transform: translateX(100%); 
                pointer-events: none;
                transition: opacity 0.3s ease, transform 0.3s ease, top 0.3s ease, bottom 0.3s ease;
                top: var(--header-height, 70px);
                bottom: var(--footer-height, 90px);
                box-sizing: border-box;
                will-change: top, bottom;
            }
            
            .evo-tchat.active { 
                opacity: 1; 
                transform: translateX(0); 
                pointer-events: auto; 
            }
            
            #Evo-MediaPlayer.controls-hidden .evo-tchat.active:not(.pinned) {
                opacity: 0 !important;
                pointer-events: none !important;
            }
            
            .evo-tchat.pinned { 
                opacity: 1 !important; 
                pointer-events: auto !important; 
            }
            
            .evo-tchat-header { 
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                padding: 8px 12px; 
                border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
            }
            
            .evo-tchat-pin { 
                font-size: 0.75rem; 
                color: rgba(255, 255, 255, 0.6); 
                cursor: pointer; 
                transition: color 0.2s ease, transform 0.2s ease; 
            }
            
            .evo-tchat-pin:hover { 
                color: rgba(255, 255, 255, 0.9); 
                transform: scale(1.1);
            }
            
            .evo-tchat-pin.pinned { 
                color: rgba(255, 255, 255, 1); 
                transform: rotate(45deg) scale(1.1);
            }
            
            .evo-tchat-title { 
                font-size: 0.875rem; 
                font-weight: 600; 
                color: rgba(255, 255, 255, 0.9); 
            }
            
            .evo-tchat.active.pinned ~ #Evo-MediaPlayer > video,
            #Evo-MediaPlayer:has(.evo-tchat.active.pinned) > video {
                width: calc(100% - 200px) !important;
            }
            
            .d-none { 
                display: none !important; 
            }
            
            .evo-footer { 
                z-index: 1002 !important; 
            }
            
            .evo-footer * { 
                position: relative; 
                z-index: 1003 !important; 
                pointer-events: auto !important; 
            }
            
            .evo-footer button { 
                cursor: pointer !important; 
            }
            
            .evo-footer input[type="range"] { 
                cursor: pointer !important; 
            }
            
            #Evo-MediaPlayer > video { 
                z-index: 999 !important; 
                pointer-events: none !important;
                ${isCinema ? 'position: absolute; top:0; left: 0; width: 100%; height: 100%; object-fit: contain;' : 'display: none;'}
            }
            
            #Evo-MediaPlayer > audio { 
                z-index: 999 !important;
                ${isCinema ? 'position: absolute; top:0; left: 0; width: 100%; height: 100%;' : 'width: 100%; height: 60px;'}
            }

            .evo-lyrics-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 600px;
                max-height: 70vh;
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #333;
                border-radius: 12px;
                color: white;
                z-index: 1005;
                display: none;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            }
            
            .lyrics-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #333;
                background: rgba(255, 255, 255, 0.05);
            }
            
            .lyrics-header h3 {
                margin: 0;
                color: #fff;
                font-size: 1.2rem;
            }
            
            .lyrics-content {
                padding: 20px;
                max-height: calc(70vh - 80px);
                overflow-y: auto;
                text-align: center;
                line-height: 1.6;
                font-size: 1.1rem;
                white-space: pre-line;
            }
            
            .lyrics-loading {
                color: #888;
                font-style: italic;
            }
            
            .lyrics-error {
                color: #ff6b6b;
                text-align: center;
            }
            
            .lyrics-source {
                text-align: center;
                font-size: 0.8rem;
                color: #4fc3f7;
                margin-bottom: 15px;
                font-style: italic;
                border-bottom: 1px solid #333;
                padding-bottom: 10px;
            }
            
            .lyrics-text {
                line-height: 1.8;
                font-size: 1.1rem;
                text-align: left;
                white-space: pre-line;
                max-height: 50vh;
                overflow-y: auto;
            }
            
            #evo-lyrics.loading {
                color: #ffa726;
            }
            
            #evo-lyrics.success {
                color: #66bb6a;
            }
            
            #evo-lyrics.error {
                color: #ef5350;
            }
        `;
    }
    
    createContainer() {
        document.getElementById('Evo-MediaPlayer')?.remove();
        this.container = document.createElement('div');
        this.container.id = 'Evo-MediaPlayer';
        this.container.innerHTML = this._buildPlayerHTML();
        document.body.appendChild(this.container);
        
        // CORRECTION : Sélection conditionnelle selon le mode
        const isCinema = this.state.mode === 'cinema';
        
        const baseSelectors = {
            tchat: '#evo-tchat',
            footer: '#evo-footer',
            rewind: '#evo-rewind',
            playPause: '#evo-play-pause',
            forward: '#evo-forward',
            currentTime: '#evo-current-time',
            totalTime: '#evo-total-time',
            volume: '#evo-volume',
            volumeIcon: '#evo-volume-icon',
            info: '#evo-info',
            lyrics: '#evo-lyrics',
            seekbarContainer: '#evo-seekbar-container',
            footerCoverImg: '#footer-evo-cover-img',
            footerCover: '#footer-evo-cover',
            movieTitle: '#footer-evo-movie-title',
            fileName: '#footer-evo-file-name'
        };
        
        const cinemaOnlySelectors = isCinema ? {
            header: '#evo-header',
            fullscreen: '#evo-fullscreen',
            chatToggle: '#evo-chat-toggle',
            leaveBtn: '#evo-leave-btn',
            tchatPin: '#evo-tchat-pin',
            headerCoverImg: '#header-evo-cover-img',
            headerCover: '#header-evo-cover'
        } : {};
        
        const audioOnlySelectors = !isCinema ? {
            tchatPin: '#evo-tchat-pin'
        } : {};
        
        // Fusionner tous les sélecteurs
        const elementSelectors = { ...baseSelectors, ...cinemaOnlySelectors, ...audioOnlySelectors };
        
        Object.entries(elementSelectors).forEach(([key, selector]) => {
            const element = this.container.querySelector(selector);
            if (element) {
                this.elements[key] = element;
            }
            // Ne pas logger les warnings pour les éléments optionnels selon le mode
        });
        
        this.elements.container = this.container;
        
        console.log('Éléments initialisés pour le mode', this.state.mode + ':', Object.keys(this.elements));
    }
    
    setupEventListeners() {
        const eventMap = [
            [this.elements.rewind, 'click', () => this.rewind(10)],
            [this.elements.playPause, 'click', () => this.togglePlayPause()],
            [this.elements.forward, 'click', () => this.forward(10)],
            [this.elements.volume, 'input', (e) => this._handleVolumeInput(e)],
            [this.elements.volumeIcon, 'click', () => this._toggleMute()],
            [this.elements.info, 'click', () => this.showInfo()],
            [this.elements.lyrics, 'click', () => this.toggleLyrics()]
        ];
        
        // CORRECTION : Ajouter les événements conditionnels
        if (this.state.mode === 'cinema') {
            eventMap.push(
                [this.elements.fullscreen, 'click', () => this.toggleFullscreen()],
                [this.elements.chatToggle, 'click', () => this.toggleChat()],
                [this.elements.leaveBtn, 'click', () => this.handleLeave()],
                [this.elements.tchatPin, 'click', () => this.toggleChatPin()]
            );
        } else {
            // Mode audio - fullscreen si c'est une vidéo
            const mediaIsVideo = this.client.getMediaType(
                this.state.currentFileData?.originalName || this.state.currentFileData?.name, 
                this.state.currentFileData?.type
            ) === 'video';
            
            if (mediaIsVideo && this.elements.fullscreen) {
                eventMap.push([this.elements.fullscreen, 'click', () => this.toggleFullscreen()]);
            }
            
            if (this.elements.tchatPin) {
                eventMap.push([this.elements.tchatPin, 'click', () => this.toggleChatPin()]);
            }
        }
        
        eventMap.forEach(([element, event, handler]) => {
            element?.addEventListener(event, (e) => {
                e.preventDefault();
                e.stopPropagation();
                handler(e);
            });
        });
        
        if (this.elements.seekbarContainer) {
            this.elements.seekbarContainer.addEventListener('click', (e) => this._handleSeekbarClick(e));
            this.elements.seekbarContainer.addEventListener('mousemove', (e) => this._handleSeekbarHover(e));
            this.elements.seekbarContainer.addEventListener('mousedown', (e) => this._startSeekbarDrag(e));
            document.addEventListener('mousemove', (e) => this._handleSeekbarDrag(e));
            document.addEventListener('mouseup', () => this._endSeekbarDrag());
        }
        
        if (this.state.mode === 'cinema') {
            this.socket?.on('cinema-sync-received', (data) => this.handleSync(data));
            this.setupControlsVisibility();
        }
        
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
            .forEach(event => document.addEventListener(event, () => this.updateFullscreenButton()));
    }
    
    _handleSeekbarClick(e) {
        if (!this.mediaElement?.duration) return;
        
        const rect = this.elements.seekbarContainer.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        const time = (percent / 100) * this.mediaElement.duration;
        
        this.seek(time);
        e.stopPropagation();
    }
    
    _handleSeekbarHover(e) {
        if (!this.mediaElement?.duration) return;
        
        const rect = this.elements.seekbarContainer.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        this.elements.seekbarContainer.style.setProperty('--progress-percent', percent + '%');
    }
    
    _startSeekbarDrag(e) {
        if (!this.mediaElement?.duration) return;
        this.isSeekbarDragging = true;
        this._handleSeekbarClick(e);
    }
    
    _handleSeekbarDrag(e) {
        if (!this.isSeekbarDragging || !this.mediaElement?.duration) return;
        this._handleSeekbarClick(e);
    }
    
    _endSeekbarDrag() {
        this.isSeekbarDragging = false;
    }
    
    _handleVolumeInput(e) {
        if (this.mediaElement) {
            const volumeValue = parseFloat(e.target.value) / 100;
            this.mediaElement.volume = volumeValue;
            this._updateVolumeIcon(volumeValue);
        }
    }
    
    _toggleMute() {
        if (this.mediaElement && this.elements.volume) {
            const volume = this.elements.volume;
            if (this.mediaElement.volume > 0) {
                this.mediaElement.volume = 0;
                volume.value = 0;
            } else {
                this.mediaElement.volume = 1.0;
                volume.value = 100;
            }
            this._updateVolumeIcon(this.mediaElement.volume);
        }
    }
    
    _updateVolumeIcon(volume) {
        const icon = this.elements.volumeIcon;
        if (!icon) return;
        icon.className = volume === 0 ? 'fas fa-volume-mute' :
                        volume < 0.5 ? 'fas fa-volume-down' : 'fas fa-volume-up';
    }

    setupControlsVisibility() {
        if (this.state.mode !== 'cinema') return;
        
        const updateChatPosition = () => {
            const { header, footer, tchat } = this.elements;
            if (!header || !footer || !tchat) return;
            
            const controlsHidden = this.container?.classList.contains('controls-hidden');
            const headerHeight = header.offsetHeight;
            const footerHeight = footer.offsetHeight;
            
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
            
            if (this.state.isChatPinned) {
                tchat.style.top = controlsHidden ? '0px' : `${headerHeight}px`;
                tchat.style.bottom = controlsHidden ? '0px' : `${footerHeight}px`;
                tchat.style.height = controlsHidden ? '100%' : 'auto';
            } else if (controlsHidden) {
                tchat.style.top = '0px';
                tchat.style.bottom = '0px';
                tchat.style.height = 'auto';
            } else {
                tchat.style.top = `${headerHeight}px`;
                tchat.style.bottom = `${footerHeight}px`;
                tchat.style.height = 'auto';
            }
        };
        
        const showControls = () => {
            this.container?.classList.remove('controls-hidden');
            this.state.controlsVisible = true;
            updateChatPosition();
            this._resetHideControlsTimer();
        };
        
        const hideControls = () => {
            if (this.container && this.state.controlsVisible) {
                this.container.classList.add('controls-hidden');
                this.state.controlsVisible = false;
            }
            updateChatPosition();
            this.updateVideoSize();
        };
        
        this._resetHideControlsTimer = () => {
            clearTimeout(this.hideControlsTimeout);
            this.hideControlsTimeout = setTimeout(hideControls, 2000);
        };
        
        const resizeObserver = new ResizeObserver(updateChatPosition);
        if (this.elements.header) resizeObserver.observe(this.elements.header);
        if (this.elements.footer) resizeObserver.observe(this.elements.footer);
        
        this.container?.addEventListener('mousemove', showControls);
        this.container?.addEventListener('mouseenter', showControls);
        
        setTimeout(updateChatPosition, 100);
        this._resetHideControlsTimer();
    }
    
    async loadMedia(fileId, fileData, metadata = {}, autoplay = false) {
        this._cleanupBlobUrl();
        
        this.state.currentFileId = fileId;
        this.state.currentFileData = fileData;
        this.state.metadata = { ...this.state.metadata, ...metadata };
        this.updateMediaInfo();
        
        const mediaType = this.client.getMediaType(fileData.originalName || fileData.name, fileData.type);
        if (!mediaType) {
            this.client.addMessage?.('error', 'Type de fichier non supporté');
            return;
        }

        try {
            this._cleanupMediaElement();
            this.mediaElement = document.createElement(mediaType);
            this.mediaElement.controls = false;
            this.mediaElement.preload = 'auto';
            this.mediaElement.volume = 1.0;

            if (mediaType === 'video') {
                this.mediaElement.style.cssText = this.state.mode === 'cinema' 
                    ? 'position: absolute; top:0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 999; pointer-events: none;'
                    : 'display: none;';
                this.container.insertBefore(this.mediaElement, this.elements.header);
            } else {
                this.mediaElement.style.cssText = 'width: 100%; height: 60px; z-index: 999;';
                this.container.appendChild(this.mediaElement);
            }

            let mediaUrl = fileData.downloadUrl;
            if (!mediaUrl && (fileData.data instanceof File || fileData.data instanceof Blob)) {
                this.currentBlobUrl = URL.createObjectURL(fileData.data);
                mediaUrl = this.currentBlobUrl;
            }

            if (!mediaUrl) throw new Error('Format de fichier non supporté');
            this.mediaElement.src = mediaUrl;
            
            await new Promise((resolve, reject) => {
                if (!this.mediaElement) {
                    reject(new Error('Élément média non créé'));
                    return;
                }
                
                const cleanup = () => {
                    this.mediaElement?.removeEventListener('loadedmetadata', onLoaded);
                    this.mediaElement?.removeEventListener('error', onError);
                    clearTimeout(timeoutId);
                };
                
                const onLoaded = () => { cleanup(); resolve(); };
                const onError = (e) => { cleanup(); reject(new Error(`Impossible de charger le média: ${fileData.name}`)); };
                
                this.mediaElement.addEventListener('loadedmetadata', onLoaded, { once: true });
                this.mediaElement.addEventListener('error', onError, { once: true });
                
                const timeoutId = setTimeout(() => {
                    if (this.mediaElement?.readyState < 1) {
                        cleanup();
                        reject(new Error('Timeout de chargement du média'));
                    }
                }, 15000);
            });

            this.client.addMessage?.('success', `Média chargé: ${fileData.name}`);
            this._setupMediaEvents();
            
            if (autoplay) {
                try {
                    await this.play();
                } catch (error) {
                    this.client.addMessage?.('warning', 'Cliquez sur play pour démarrer la lecture');
                }
            }

            this.fetchCoverArt(this.state.metadata, mediaType);
            
            if (this.state.mode === 'cinema' && this.state.isHost) {
                this.startSync();
            }
            
        } catch (error) {
            this.client.addMessage?.('error', `Erreur: ${error.message}`);
            this._cleanupMediaElement();
        }
    }

    _cleanupBlobUrl() {
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }
    }

    _cleanupMediaElement() {
        if (this.mediaElement) {
            this.mediaElement.pause();
            this.mediaElement.src = '';
            this.mediaElement.remove();
            this.mediaElement = null;
        }
        this._cleanupBlobUrl();
    }

    updateMediaInfo() {
        const { metadata, currentFileData, mode } = this.state;
        
        const fileName = currentFileData?.originalName || currentFileData?.name || 'nom-du-fichier.mp3';
        let movieTitle = metadata?.title ?? metadata?.movieName ?? 'Titre du film';
        let artistName = metadata?.artist ?? 'Artiste inconnu';
        let subtitle = metadata?.subtitle ?? metadata?.videoName ?? fileName;
        
        if (fileName) {
            const parsedInfo = this._parseFileName(fileName, mode);
            
            if (parsedInfo.title && parsedInfo.title !== 'WEBRIP' && parsedInfo.title !== 'Karaoke') {
                movieTitle = parsedInfo.title;
            }
            if (parsedInfo.artist && parsedInfo.artist !== 'Artiste inconnu' && 
                parsedInfo.artist !== 'Karaoke' && !parsedInfo.artist.includes('720P')) {
                artistName = parsedInfo.artist;
            }
            
            this.state.metadata.title = movieTitle;
            this.state.metadata.artist = artistName;
        }
        
        const titleDisplay = movieTitle;
        const fileDisplay = mode === 'audio' ? artistName : subtitle;
        
        const titleElements = [
            this.elements.movieTitle,
            this.container?.querySelector('#footer-evo-movie-title'),
            this.container?.querySelector('#header-evo-movie-title')
        ].filter(Boolean);
        
        const fileElements = [
            this.elements.fileName,
            this.container?.querySelector('#footer-evo-file-name'),
            this.container?.querySelector('#header-evo-file-name')
        ].filter(Boolean);
        
        titleElements.forEach(element => element.textContent = titleDisplay);
        fileElements.forEach(element => element.textContent = fileDisplay);
    }

    _parseFileName(filename, mode) {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        const patterns = [
            /^(?!.*karaoke)(.+?)\s*[-–—]\s*(.+)$/i,
            /^(.+?)\s*[-–—]\s*(.+?)(?:\s*[-–—]|$)/
        ];
        
        for (const pattern of patterns) {
            const match = nameWithoutExt.match(pattern);
            if (match && match.length >= 3) {
                let artist = match[1]?.trim();
                let title = match[2]?.trim();
                
                artist = this._cleanArtistName(artist);
                title = this._cleanTrackTitle(title);
                
                if (artist && title && artist !== title && 
                    !artist.toLowerCase().includes('karaoke') &&
                    !title.toLowerCase().includes('karaoke')) {
                    return { artist, title };
                }
            }
        }
        
        const fallbackResult = this._parseFileNameFallback(nameWithoutExt, mode);
        if (fallbackResult) return fallbackResult;
        
        return { artist: 'Artiste inconnu', title: this._cleanTrackTitle(nameWithoutExt) };
    }

    _parseFileNameFallback(nameWithoutExt, mode) {
        if (mode === 'cinema') {
            const cleanName = nameWithoutExt
                .replace(/(\d{4})\./g, '$1 ')
                .replace(/(720P|1080P|WEBRIP|BLURAY)/gi, '')
                .replace(/\./g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            const words = cleanName.split(' ');
            if (words.length > 1) {
                const potentialTitle = words.slice(0, 3).join(' ');
                if (potentialTitle.length > 3) return { artist: 'Inconnu', title: potentialTitle };
            }
        }
        
        if (nameWithoutExt.toLowerCase().includes('karaoke')) {
            const parts = nameWithoutExt.split(/\s*[-–—]\s*/);
            if (parts.length >= 3) {
                const artist = this._cleanArtistName(parts[1]);
                const title = this._cleanTrackTitle(parts[2]);
                if (artist && title && artist !== 'Karaoke') return { artist, title };
            }
        }
        
        return null;
    }

    _cleanArtistName(artist) {
        return artist?.replace(/^\d+\s*/, '')
            .replace(/(720P|1080P|WEBRIP|BLURAY)/gi, '')
            .replace(/\./g, ' ')
            .trim() || '';
    }

    _cleanTrackTitle(title) {
        return title?.replace(/\s*[\(\[].*?[\)\]]/g, '')
            .replace(/\s*[-–—].*$/, '')
            .replace(/\s*(v\d+|version\s*\d+|remastered?|radio\s*edit|extended|acoustic|live|instrumental|with\s*vocal|karaoke)\s*$/gi, '')
            .replace(/\s*(official\s*video?|lyrics?|audio)\s*$/gi, '')
            .trim()
            .replace(/\s+/g, ' ') || '';
    }

    _setupMediaEvents() {
        if (!this.mediaElement) return;
        
        const updateUI = () => {
            if (!this.mediaElement) return;
            this.state.isPlaying = !this.mediaElement.paused;
            this.updatePlayPauseButton();
            this.updateProgress();
            this.updateTimeDisplay();
        };
        
        const events = ['play', 'pause', 'ended', 'loadedmetadata', 'canplay', 'waiting', 'canplaythrough', 'timeupdate'];
        events.forEach(event => {
            this.mediaElement.addEventListener(event, updateUI);
        });
        
        this.mediaElement.addEventListener('error', (e) => {
            console.error('Erreur média détectée:', e, this.mediaElement?.error);
            
            if (!this.mediaElement) return;
            
            let message = 'Erreur lors de la lecture du média';
            const error = this.mediaElement.error;
            
            if (error) {
                switch(error.code) {
                    case error.MEDIA_ERR_ABORTED:
                        message = 'Lecture annulée';
                        break;
                    case error.MEDIA_ERR_NETWORK:
                        message = 'Erreur réseau lors du chargement';
                        break;
                    case error.MEDIA_ERR_DECODE:
                        message = 'Erreur de décodage - format non supporté par le navigateur';
                        break;
                    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        message = 'Format non supporté par le navigateur';
                        break;
                    default:
                        message = `Erreur inconnue (code: ${error.code})`;
                }
                console.error('Détails erreur média:', {
                    code: error.code,
                    message: error.message
                });
            } else {
                message = 'Impossible de lire le fichier média - format peut-être incompatible';
            }
            
            this.client.addMessage?.('error', message);
        });
        
        // Événements de chargement pour debug
        this.mediaElement.addEventListener('loadstart', () => {
            console.log('Début du chargement média');
        });
        
        this.mediaElement.addEventListener('progress', () => {
            console.log('Progression du chargement');
        });
        
        this.mediaElement.addEventListener('canplay', () => {
            console.log('Média peut être joué');
        });
    }

    async play() { 
        if (!this.mediaElement) return;
        try {
            await this.mediaElement.play();
        } catch (error) {
            if (error.name !== 'AbortError') {
                this.client.addMessage?.('warning', 'Lecture automatique bloquée. Cliquez sur le bouton play.');
            }
        }
    }
    
    pause() { this.mediaElement?.pause(); }
    
    togglePlayPause() { 
        if (this.mediaElement) {
            this.mediaElement.paused ? this.play() : this.pause();
        }
    }
    
    stop() { 
        this.mediaElement?.pause(); 
        if (this.mediaElement) {
            this.mediaElement.currentTime = 0;
        }
    }
    
    seek(time) {
        if (this.mediaElement && !isNaN(time)) {
            const newTime = Math.max(0, Math.min(time, this.mediaElement.duration));
            this.mediaElement.currentTime = newTime;
            if (this.state.mode === 'cinema' && this.state.isHost && this.socket) {
                this.socket.emit('cinema-sync', { 
                    roomCode: this.roomInfo?.password, 
                    currentTime: newTime, 
                    isPlaying: this.state.isPlaying 
                });
            }
        }
    }
    
    rewind(seconds = 10) { 
        if (this.mediaElement) {
            this.seek(this.mediaElement.currentTime - seconds);
        }
    }
    
    forward(seconds = 10) { 
        if (this.mediaElement) {
            this.seek(this.mediaElement.currentTime + seconds);
        }
    }
    
    updateProgress() {
        if (this.mediaElement?.duration && this.elements.seekbarContainer) {
            const percent = (this.mediaElement.currentTime / this.mediaElement.duration) * 100;
            this.elements.seekbarContainer.style.background = 
                `linear-gradient(90deg, #007bff 0%, #007bff ${percent}%, #495057 ${percent}% 100%)`;
            this.elements.seekbarContainer.style.setProperty('--progress-percent', percent + '%');
        }
    }
    
    formatTime(seconds) {
        return isNaN(seconds) ? '00:00' : new Date(seconds * 1000).toISOString().substr(14, 5);
    }
    
    updateTimeDisplay() {
        if (!this.mediaElement) return;
        if (this.elements.currentTime) {
            this.elements.currentTime.textContent = this.formatTime(this.mediaElement.currentTime);
        }
        if (this.elements.totalTime) {
            this.elements.totalTime.textContent = this.formatTime(this.mediaElement.duration);
        }
    }
    
    updatePlayPauseButton() {
        const playPauseBtn = this.elements.playPause;
        const icon = playPauseBtn?.querySelector('i');
        if (!playPauseBtn || !icon) return;
        
        const isPlayingState = this.mediaElement ? !this.mediaElement.paused : false;
        this.state.isPlaying = isPlayingState;
        icon.className = isPlayingState ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    startSync() {
        clearInterval(this.syncInterval);
        this.syncInterval = setInterval(() => {
            if (this.mediaElement && this.state.isHost && this.socket && this.roomInfo) {
                this.socket.emit('cinema-sync', { 
                    roomCode: this.roomInfo.password, 
                    currentTime: this.mediaElement.currentTime, 
                    isPlaying: !this.mediaElement.paused 
                });
            }
        }, 1000);
    }
    
    stopSync() {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
    }
    
    handleSync(data) {
        if (this.state.isHost || !this.mediaElement) return;
        if (Math.abs(this.mediaElement.currentTime - data.currentTime) > 1.5) {
            this.mediaElement.currentTime = data.currentTime;
        }
        if (data.isPlaying !== !this.mediaElement.paused) {
            data.isPlaying ? this.play() : this.pause();
        }
    }

    toggleChat() {
        const isActive = !this.elements.chatToggle?.classList.contains('active');
        this.elements.chatToggle?.classList.toggle('active', isActive);
        
        if (isActive) {
            this.elements.tchat?.classList.add('active');
            if (!document.getElementById('cinemaChat')) {
                this.client.createCinemaChat?.();
                setTimeout(() => {
                    const newChat = document.getElementById('cinemaChat');
                    if (newChat && this.elements.tchat) this.elements.tchat.appendChild(newChat);
                }, 100);
            }
        } else if (!this.state.isChatPinned) {
            this.elements.tchat?.classList.remove('active');
        }
        
        this.updateChatVisibility();
        this.updateVideoSize();
    }
    
    updateChatVisibility() {
        if (!this.elements.tchat) return;
        const chatButtonActive = this.elements.chatToggle?.classList.contains('active');
        
        if (this.state.isChatPinned) {
            this.elements.tchat.classList.add('pinned', 'active');
        } else {
            this.elements.tchat.classList.remove('pinned');
            this.elements.tchat.classList.toggle('active', chatButtonActive);
        }
    }
    
    toggleChatPin() {
        this.state.isChatPinned = !this.state.isChatPinned;
        const pinIcon = this.elements.tchatPin;
        if (!pinIcon) return;
        
        pinIcon.classList.toggle('pinned', this.state.isChatPinned);
        pinIcon.className = `fas fa-thumbtack evo-tchat-pin ${this.state.isChatPinned ? 'pinned' : ''}`;
        pinIcon.title = this.state.isChatPinned ? 'Désépingler le chat' : 'Épingler le chat';
        
        this.updateChatVisibility();
        this.setupControlsVisibility();
        this.updateVideoSize();
    }
    
    updateVideoSize() {
        if (!this.mediaElement) return;
        const isVideo = this.client.getMediaType(
            this.state.currentFileData?.originalName || this.state.currentFileData?.name, 
            this.state.currentFileData?.type) === 'video';
        if (isVideo) {
            this.mediaElement.style.width = this.state.isChatPinned ? 'calc(100% - 200px)' : '100%';
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container?.requestFullscreen().catch((error) => {
                console.warn('Erreur fullscreen:', error);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    updateFullscreenButton() {
        const isFullscreen = !!document.fullscreenElement;
        this.state.isFullscreenActive = isFullscreen;
        const fullscreenBtn = this.elements.fullscreen;
        if (fullscreenBtn) {
            const icon = fullscreenBtn.querySelector('i');
            if (icon) {
                icon.className = isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
            }
            fullscreenBtn.classList.toggle('active', isFullscreen);
        }
    }
    
    showInfo() {
        let infoModal = document.getElementById('evo-info-modal');
        if (!infoModal) {
            infoModal = document.createElement('div');
            infoModal.id = 'evo-info-modal';
            infoModal.className = 'modal fade';
            infoModal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content bg-dark text-white">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title">Informations du média</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="evo-info-modal-body"></div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(infoModal);
        }
        infoModal.querySelector('#evo-info-modal-body').innerHTML = this._buildInfoContent();
        
        if (typeof bootstrap !== 'undefined') {
            new bootstrap.Modal(infoModal).show();
        } else {
            infoModal.style.display = 'block';
            infoModal.style.background = 'rgba(0,0,0,0.5)';
        }
    }
    
    _buildInfoContent() {
        const { currentFileData, metadata } = this.state;
        const fileInfo = {
            "Nom": currentFileData?.originalName || currentFileData?.name,
            "Taille": this._formatFileSize(currentFileData?.size),
            "Type MIME": currentFileData?.type,
            "Date d'upload": currentFileData?.uploadDate ? new Date(currentFileData.uploadDate).toLocaleDateString('fr-FR') : null
        };
        
        const techInfo = {
            "Durée": this.mediaElement ? this.formatTime(this.mediaElement.duration) : null,
            "Résolution": this.mediaElement?.videoWidth ? `${this.mediaElement.videoWidth}x${this.mediaElement.videoHeight}` : null,
            "Codec": this.mediaElement?.videoCodec || 'Inconnu'
        };
        
        const toHtmlList = (title, data) => {
            const entries = Object.entries(data)
                .filter(([, value]) => value != null && value !== '')
                .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
                .join('');
            return entries ? `<h6 class="text-primary mt-3">${title}</h6>${entries}` : '';
        };
        
        return toHtmlList('Fichier', fileInfo) + toHtmlList('Technique', techInfo) + toHtmlList('Métadonnées', metadata || {});
    }
    
    _formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${['B', 'KB', 'MB', 'GB'][i]}`;
    }

    async fetchCoverArt(metadata, mediaType) {
        if (!metadata) return;
        const cacheKey = `${mediaType}-${metadata.title ?? metadata.name}`;
        if (this.coverArtCache.has(cacheKey)) {
            return this.updateCoverArt(this.coverArtCache.get(cacheKey));
        }
        
        let coverUrl = null;
        try {
            coverUrl = mediaType === 'video' 
                ? await this._fetchIMDBCover(metadata.title, metadata.year)
                : await this._fetchMusicBrainzCover(metadata.artist, metadata.title);
        } catch (error) {
            console.warn('Erreur lors de la récupération de la cover:', error);
        }
        
        this.coverArtCache.set(cacheKey, coverUrl);
        this.updateCoverArt(coverUrl);
    }
    
    async _fetchIMDBCover(title, year) {
        if (!title) return null;
        const apiKey = '6166739b';
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}&y=${year || ''}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.Response === 'True' && data.Poster !== 'N/A' ? data.Poster : null;
        } catch (error) {
            console.warn('Erreur OMDB API:', error);
            return null;
        }
    }
    
    async _fetchMusicBrainzCover(artist, title) {
        if (!artist || !title) return null;
        
        const now = Date.now();
        if (now - this.lastAPICall < 1000) await new Promise(r => setTimeout(r, 1000 - (now - this.lastAPICall)));
        this.lastAPICall = now;
        
        const query = `artist:"${artist}" AND recording:"${title}"`;
        const searchUrl = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json&limit=1`;
        try {
            const response = await fetch(searchUrl, { headers: { 'User-Agent': 'Evo-MediaPlayer/1.0' } });
            if (!response.ok) return null;
            
            const data = await response.json();
            const mbid = data.recordings?.[0]?.['release-groups']?.[0]?.id;
            if (!mbid) return null;
            
            const coverUrl = `https://coverartarchive.org/release-group/${mbid}/front-250`;
            const coverCheck = await fetch(coverUrl, { method: 'HEAD' });
            return coverCheck.ok ? coverUrl : null;
        } catch (error) {
            console.warn('Erreur MusicBrainz:', error);
            return null;
        }
    }
    
    updateCoverArt(url) {
        const updateCover = (coverImg, coverElement) => {
            if (url) {
                coverImg.src = url;
                coverImg.style.display = 'block';
                const existingIcon = coverElement.querySelector('i');
                if (existingIcon) existingIcon.remove();
            } else {
                coverImg.style.display = 'none';
                if (!coverElement.querySelector('i')) {
                    coverElement.insertAdjacentHTML('beforeend', 
                        '<i class="fas fa-music" style="font-size: 20px; color: #666; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"></i>');
                }
            }
        };

        if (this.elements.headerCoverImg && this.elements.headerCover) {
            updateCover(this.elements.headerCoverImg, this.elements.headerCover);
        }
        
        if (this.elements.footerCoverImg && this.elements.footerCover) {
            updateCover(this.elements.footerCoverImg, this.elements.footerCover);
        }
    }

    toggleLyrics() {
        if (this.state.isLyricsVisible) {
            this.hideLyricsPanel();
        } else {
            this.loadAndShowLyrics();
        }
    }

    async loadAndShowLyrics() {
        const { artist, title } = this.state.metadata;
        
        if (!artist || !title) {
            this.showLyricsError('Artiste ou titre non disponible');
            return;
        }
        
        this.showLyricsPanel();
        this.elements.lyricsContent.innerHTML = '<p class="lyrics-loading">Recherche des lyrics...</p>';
        this.updateLyricsButtonStatus('loading');
        
        try {
            const result = await this.fetchLyricsWithFallback(artist, title);
            
            if (result) {
                this.elements.lyricsContent.innerHTML = `
                    <div class="lyrics-source">Source: ${result.source}</div>
                    <div class="lyrics-text">${result.lyrics}</div>
                `;
                
                this.elements.lyrics.classList.add('active');
                this.updateLyricsButtonStatus('success');
            } else {
                this.showLyricsError('Lyrics non trouvés');
                this.updateLyricsButtonStatus('error');
            }
        } catch (error) {
            this.showLyricsError('Erreur lors du chargement des lyrics');
            this.updateLyricsButtonStatus('error');
        }
    }

    async fetchLyricsWithFallback(artist, title) {
        if (!artist || !title) return null;
        
        const cacheKey = `lyrics-${artist}-${title}`.toLowerCase();
        
        if (this.lyricsCache.has(cacheKey)) {
            const cached = this.lyricsCache.get(cacheKey);
            return { lyrics: cached, source: 'Cache' };
        }
        
        try {
            const musicMatchLyrics = await this.fetchLyrics(artist, title);
            if (musicMatchLyrics && this._isValidLyrics(musicMatchLyrics)) {
                this.lyricsCache.set(cacheKey, musicMatchLyrics);
                return { lyrics: musicMatchLyrics, source: 'MusicMatch' };
            }
        } catch (error) {
            console.warn('MusicMatch API failed:', error);
        }
        
        return null;
    }

    async fetchLyrics(artist, title) {
        if (!artist || !title) return null;
        
        const cacheKey = `musixmatch-${artist}-${title}`.toLowerCase();
        
        if (this.lyricsCache.has(cacheKey)) {
            return this.lyricsCache.get(cacheKey);
        }
        
        const proxies = [
            {
                name: 'corsproxy.io',
                construct: (target) => `https://corsproxy.io/?${encodeURIComponent(target)}`
            },
            {
                name: 'api.codetabs.com',
                construct: (target) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`
            }
        ];
        
        const targetUrl = `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${encodeURIComponent(title)}&q_artist=${encodeURIComponent(artist)}&apikey=${this.musicMatchAPIKey}`;
        
        for (const proxy of proxies) {
            try {
                const fullUrl = proxy.construct(targetUrl);
                const response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    mode: 'cors'
                });
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const data = await response.json();
                
                if (data.message.header.status_code === 200 && 
                    data.message.body.lyrics && 
                    data.message.body.lyrics.lyrics_body) {
                    
                    const lyrics = data.message.body.lyrics.lyrics_body;
                    
                    if (this._isValidLyrics(lyrics)) {
                        this.lyricsCache.set(cacheKey, lyrics);
                        return lyrics;
                    }
                }
                
            } catch (error) {
                console.warn(`Proxy ${proxy.name} a échoué:`, error.message);
            }
        }
        
        return null;
    }

    _isValidLyrics(lyrics) {
        if (!lyrics || typeof lyrics !== 'string') return false;
        
        const invalidPatterns = [
            '*******',
            'Not available',
            'Instrumental',
            'Lyrics not found'
        ];
        
        return lyrics.length > 20 && 
               !invalidPatterns.some(pattern => lyrics.includes(pattern));
    }

    showLyricsPanel() {
        if (!this.elements.lyricsPanel) {
            this.createLyricsPanel();
        }
        this.elements.lyricsPanel.style.display = 'block';
        this.state.isLyricsVisible = true;
    }

    createLyricsPanel() {
        const lyricsPanel = document.createElement('div');
        lyricsPanel.id = 'evo-lyrics-panel';
        lyricsPanel.className = 'evo-lyrics-panel';
        lyricsPanel.innerHTML = `
            <div class="lyrics-header">
                <h3>🎤 Lyrics</h3>
                <button class="btn btn-sm" id="evo-lyrics-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="lyrics-content" id="evo-lyrics-content">
                <p class="lyrics-loading">Chargement des lyrics...</p>
            </div>
        `;
        
        this.container.appendChild(lyricsPanel);
        this.elements.lyricsPanel = lyricsPanel;
        this.elements.lyricsContent = lyricsPanel.querySelector('#evo-lyrics-content');
        this.elements.lyricsClose = lyricsPanel.querySelector('#evo-lyrics-close');
        
        this.elements.lyricsClose.addEventListener('click', () => this.hideLyricsPanel());
    }

    hideLyricsPanel() {
        if (this.elements.lyricsPanel) {
            this.elements.lyricsPanel.style.display = 'none';
        }
        this.state.isLyricsVisible = false;
        this.updateLyricsButtonStatus(null);
    }

    showLyricsError(message) {
        if (this.elements.lyricsContent) {
            this.elements.lyricsContent.innerHTML = `<p class="lyrics-error">${message}</p>`;
        }
    }

    updateLyricsButtonStatus(status) {
        const btn = this.elements.lyrics;
        if (!btn) return;
        
        btn.classList.remove('loading', 'success', 'error');
        if (status) {
            btn.classList.add(status);
        }
    }

    handleLeave() {
        if (this.state.mode === 'cinema') {
            this.state.isHost ? this.client.closeCinemaRoom?.() : this.client.leaveCinemaRoom?.();
        }
        this.destroy();
    }
    
    destroy() {
        this.stopSync();
        clearTimeout(this.hideControlsTimeout);
        
        this._cleanupMediaElement();
        this._cleanupBlobUrl();
        
        this.container?.remove();
        this.socket?.off('cinema-sync-received');
        
        document.querySelectorAll('section, nav').forEach(element => {
            element.classList.remove('d-none');
        });
        document.body.style.overflow = '';
        
        this.container = null;
        this.elements = {};
        this.mediaElement = null;
        this.currentBlobUrl = null;
        this.state = {
            mode: null,
            currentFileId: null,
            currentFileData: null,
            metadata: null,
            isPlaying: false,
            isHost: false,
            isKaraokeActive: false,
            isFullscreenActive: false,
            isChatPinned: false,
            controlsVisible: true,
            isLyricsVisible: false
        };
        
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.hideControlsTimeout) {
            clearTimeout(this.hideControlsTimeout);
            this.hideControlsTimeout = null;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EvoMediaPlayer;
}