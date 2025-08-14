class GeoGuessrGame {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.currentRound = 1;
        this.totalRounds = 5;
        this.currentScore = 0;
        this.gameRounds = [];
        this.streetViewService = null;
        this.streetView = null;
        this.guessMap = null;
        this.currentLocation = null;
        this.userGuess = null;
        this.gameLocations = [];
        this.isLoginMode = true; // Track current auth mode
        
        this.initializeApp();
    }

    initializeApp() {
        if (this.token) {
            this.showGameInterface();
        } else {
            this.showWelcomeScreen();
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Welcome screen
        document.getElementById('showLoginBtn').addEventListener('click', () => this.showAuthModal());
        document.getElementById('showDemoBtn').addEventListener('click', () => this.showDemo());
        
        // Auth form
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
        document.getElementById('switchMode').addEventListener('click', () => this.switchAuthMode());
        
        // Game controls
        document.getElementById('guessBtn').addEventListener('click', () => this.makeGuess());
        document.getElementById('nextRoundBtn').addEventListener('click', () => this.nextRound());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startNewGame());
        
        // Map controls
        document.getElementById('expandMapBtn').addEventListener('click', (e) => this.toggleMapExpansion(e));
        document.getElementById('mapContainer').addEventListener('click', (e) => this.handleMapContainerClick(e));
        
        // Navigation
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('viewHistoryBtn').addEventListener('click', () => this.showHistory());
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        
        // Modal controls
        document.getElementById('closeHistory').addEventListener('click', () => this.hideModal('historyModal'));
        document.getElementById('closeLeaderboard').addEventListener('click', () => this.hideModal('leaderboardModal'));
    }

    async handleAuth(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Use the reliable flag to detect login vs register
        const isLogin = this.isLoginMode;
        
        // Auth attempt in progress
        
        // Show loading state
        const submitBtn = document.getElementById('authSubmit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Please wait...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`/api/${isLogin ? 'login' : 'register'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.showGameInterface();
                this.showSuccessMessage(isLogin ? 'Welcome back!' : 'Account created successfully!');
            } else {
                this.showErrorMessage(data.error);
                
                // If registration failed due to existing email, suggest switching to login
                if (!isLogin && data.error.includes('already exists')) {
                    setTimeout(() => {
                        if (confirm('Would you like to switch to login instead?')) {
                            this.switchAuthMode();
                        }
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showErrorMessage('Connection failed. Please check your internet connection and try again.');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showErrorMessage(message) {
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        
        const authForm = document.getElementById('authForm');
        authForm.parentNode.insertBefore(errorDiv, authForm);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-text">${message}</span>
            </div>
        `;
        
        const authForm = document.getElementById('authForm');
        authForm.parentNode.insertBefore(successDiv, authForm);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    switchAuthMode() {
        const title = document.getElementById('authTitle');
        const subtitle = document.getElementById('authSubtitle');
        const submit = document.getElementById('authSubmit');
        const switchText = document.getElementById('switchMode');
        
        this.isLoginMode = !this.isLoginMode;
        
        if (this.isLoginMode) {
            title.textContent = 'Welcome Back';
            subtitle.textContent = 'Sign in to start your geography adventure';
            submit.textContent = 'Sign In';
            switchText.textContent = 'Create one';
            document.getElementById('authSwitch').innerHTML = 'Don\'t have an account? <span id="switchMode">Create one</span>';
        } else {
            title.textContent = 'Join the Adventure';
            subtitle.textContent = 'Create your account to start exploring';
            submit.textContent = 'Create Account';
            switchText.textContent = 'Sign in instead';
            document.getElementById('authSwitch').innerHTML = 'Already have an account? <span id="switchMode">Sign in instead</span>';
        }
        
        document.getElementById('switchMode').addEventListener('click', () => this.switchAuthMode());
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
    }

    showDemo() {
        alert('🎮 Demo: This would show a quick gameplay preview!\n\n• Street View locations from around the world\n• Click on the map to make your guess\n• Earn points based on accuracy\n• Compete with players globally');
    }

    toggleMapExpansion(e) {
        e.stopPropagation();
        const mapContainer = document.getElementById('mapContainer');
        const expandBtn = document.getElementById('expandMapBtn');
        
        mapContainer.classList.toggle('expanded');
        expandBtn.textContent = mapContainer.classList.contains('expanded') ? '⛶' : '⛶';
        
        // Trigger map resize after expansion
        setTimeout(() => {
            if (this.guessMap) {
                google.maps.event.trigger(this.guessMap, 'resize');
            }
        }, 300);
    }

    handleMapContainerClick(e) {
        // Only expand if clicking on the container itself, not the map or button
        if (e.target.classList.contains('map-container') || e.target.classList.contains('map-header') || e.target.classList.contains('map-title')) {
            const mapContainer = document.getElementById('mapContainer');
            if (!mapContainer.classList.contains('expanded')) {
                this.toggleMapExpansion(e);
            }
        }
    }

    showAuthModal() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
    }

    showGameInterface() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        
        if (this.currentUser) {
            document.getElementById('userEmail').textContent = this.currentUser.email;
        }
        
        // Start a new game automatically when showing the game interface
        setTimeout(() => {
            console.log('Starting new game after login');
            this.startNewGame();
        }, 500);
    }

    logout() {
        localStorage.removeItem('token');
        this.token = null;
        this.currentUser = null;
        this.showWelcomeScreen();
    }

    // Generate random locations for the game
    generateGameLocations() {
        const locations = [
            { lat: 40.7128, lng: -74.0060, country: 'USA', description: 'New York City' },
            { lat: 51.5074, lng: -0.1278, country: 'UK', description: 'London' },
            { lat: 35.6762, lng: 139.6503, country: 'Japan', description: 'Tokyo' },
            { lat: -33.8688, lng: 151.2093, country: 'Australia', description: 'Sydney' },
            { lat: 55.7558, lng: 37.6176, country: 'Russia', description: 'Moscow' },
            { lat: -22.9068, lng: -43.1729, country: 'Brazil', description: 'Rio de Janeiro' },
            { lat: 19.4326, lng: -99.1332, country: 'Mexico', description: 'Mexico City' },
            { lat: 41.9028, lng: 12.4964, country: 'Italy', description: 'Rome' },
            { lat: 59.3293, lng: 18.0686, country: 'Sweden', description: 'Stockholm' },
            { lat: -26.2041, lng: 28.0473, country: 'South Africa', description: 'Johannesburg' }
        ];
        
        // Shuffle and take 5 random locations
        const shuffled = locations.sort(() => 0.5 - Math.random());
        this.gameLocations = shuffled.slice(0, this.totalRounds);
    }

    startNewGame() {
        console.log('Starting new game...');
        this.currentRound = 1;
        this.currentScore = 0;
        this.gameRounds = [];
        this.generateGameLocations();
        this.hideModal('finalResults');
        this.updateUI();
        this.loadRound();
    }

    loadRound() {
        if (this.currentRound <= this.totalRounds) {
            this.currentLocation = this.gameLocations[this.currentRound - 1];
            this.userGuess = null;
            
            // Add some randomness to the exact location
            const randomOffset = 0.01; // About 1km
            this.currentLocation.lat += (Math.random() - 0.5) * randomOffset;
            this.currentLocation.lng += (Math.random() - 0.5) * randomOffset;
            
            this.loadStreetView();
            this.resetGuessMap();
            document.getElementById('guessBtn').disabled = true;
            this.hideModal('resultsPanel');
        }
    }

    loadStreetView() {
        // Check if Google Maps is available
        if (typeof google === 'undefined') {
            console.error('Google Maps API not loaded');
            this.showStreetViewPlaceholder();
            return;
        }
        
        const location = new google.maps.LatLng(this.currentLocation.lat, this.currentLocation.lng);
        
        // Check if Street View is available at this location
        const streetViewService = new google.maps.StreetViewService();
        streetViewService.getPanorama({
            location: location,
            radius: 50000, // 50km radius to find nearby Street View
            source: google.maps.StreetViewSource.OUTDOOR
        }, (data, status) => {
            if (status === 'OK') {
                this.streetView = new google.maps.StreetViewPanorama(
                    document.getElementById('streetView'),
                    {
                        position: data.location.latLng,
                        pov: { heading: Math.random() * 360, pitch: 0 },
                        zoom: 1,
                        addressControl: false,
                        linksControl: true,
                        panControl: true,
                        enableCloseButton: false,
                        showRoadLabels: false
                    }
                );
            } else {
                console.error('Street View not available:', status);
                this.showStreetViewPlaceholder();
            }
        });
    }

    showStreetViewPlaceholder() {
        const streetViewDiv = document.getElementById('streetView');
        streetViewDiv.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                font-family: Arial, sans-serif;
            ">
                <h2>🗺️ Street View Placeholder</h2>
                <p>Location: ${this.currentLocation.description}</p>
                <p>Coordinates: ${this.currentLocation.lat.toFixed(4)}, ${this.currentLocation.lng.toFixed(4)}</p>
                <p style="margin-top: 20px; opacity: 0.8;">
                    Add your Google Maps API key to see actual Street View
                </p>
            </div>
        `;
    }

    resetGuessMap() {
        if (this.guessMap) {
            this.guessMap = null;
        }
        
        this.guessMap = new google.maps.Map(document.getElementById('guessMap'), {
            zoom: 2,
            center: { lat: 20, lng: 0 },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });
        
        this.guessMap.addListener('click', (e) => {
            this.placeGuess(e.latLng);
        });
    }

    placeGuess(latLng) {
        this.userGuess = { lat: latLng.lat(), lng: latLng.lng() };
        
        // Clear existing markers
        if (this.guessMarker) {
            this.guessMarker.setMap(null);
        }
        
        // Place new marker
        this.guessMarker = new google.maps.Marker({
            position: latLng,
            map: this.guessMap,
            title: 'Your Guess'
        });
        
        document.getElementById('guessBtn').disabled = false;
    }

    makeGuess() {
        if (!this.userGuess) return;
        
        const distance = this.calculateDistance(
            this.currentLocation.lat,
            this.currentLocation.lng,
            this.userGuess.lat,
            this.userGuess.lng
        );
        
        const score = this.calculateScore(distance);
        this.currentScore += score;
        
        const roundData = {
            location: { ...this.currentLocation },
            guess: { ...this.userGuess },
            distance: Math.round(distance),
            score: score
        };
        
        this.gameRounds.push(roundData);
        this.showRoundResults(distance, score);
        this.showResultsOnMap();
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(deg) {
        return deg * (Math.PI / 180);
    }

    calculateScore(distance) {
        // Score calculation: max 5000 points, decreasing with distance
        const maxScore = 5000;
        const maxDistance = 20000; // 20,000 km for minimum score
        
        if (distance >= maxDistance) return 0;
        
        const score = Math.round(maxScore * (1 - distance / maxDistance));
        return Math.max(0, score);
    }

    showRoundResults(distance, score) {
        document.getElementById('distance').textContent = Math.round(distance);
        document.getElementById('roundScore').textContent = score;
        document.getElementById('resultsPanel').classList.remove('hidden');
    }

    showResultsOnMap() {
        // Show actual location on guess map
        const actualMarker = new google.maps.Marker({
            position: { lat: this.currentLocation.lat, lng: this.currentLocation.lng },
            map: this.guessMap,
            title: 'Actual Location',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" fill="#4CAF50" stroke="white" stroke-width="2"/>
                    </svg>
                `)
            }
        });
        
        // Draw line between guess and actual location
        const line = new google.maps.Polyline({
            path: [
                { lat: this.userGuess.lat, lng: this.userGuess.lng },
                { lat: this.currentLocation.lat, lng: this.currentLocation.lng }
            ],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: this.guessMap
        });
        
        // Fit map to show both points
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: this.userGuess.lat, lng: this.userGuess.lng });
        bounds.extend({ lat: this.currentLocation.lat, lng: this.currentLocation.lng });
        this.guessMap.fitBounds(bounds);
    }

    nextRound() {
        this.currentRound++;
        this.updateUI();
        
        if (this.currentRound <= this.totalRounds) {
            this.loadRound();
        } else {
            this.endGame();
        }
    }

    async endGame() {
        document.getElementById('finalScore').textContent = this.currentScore;
        document.getElementById('finalResults').classList.remove('hidden');
        
        // Save game to database
        try {
            await fetch('/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    rounds: this.gameRounds,
                    totalScore: this.currentScore
                })
            });
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    updateUI() {
        document.getElementById('currentRound').textContent = this.currentRound;
        document.getElementById('currentScore').textContent = this.currentScore;
    }

    async showHistory() {
        try {
            const response = await fetch('/api/games', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const games = await response.json();
            
            const content = document.getElementById('historyContent');
            content.innerHTML = '';
            
            games.forEach(game => {
                const gameDiv = document.createElement('div');
                gameDiv.className = 'game-history-item';
                
                const date = new Date(game.completedAt).toLocaleDateString();
                gameDiv.innerHTML = `
                    <div class="game-date">${date}</div>
                    <div class="game-score">Total Score: ${game.totalScore}</div>
                    <div class="round-details">
                        ${game.rounds.map((round, index) => `
                            <div class="round-item">
                                <span>Round ${index + 1}: ${round.location.description}</span>
                                <span>${round.distance}km - ${round.score} pts</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                content.appendChild(gameDiv);
            });
            
            document.getElementById('historyModal').classList.remove('hidden');
        } catch (error) {
            alert('Failed to load game history');
        }
    }

    async showLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            const users = await response.json();
            
            const content = document.getElementById('leaderboardContent');
            content.innerHTML = '';
            
            users.forEach((user, index) => {
                const userDiv = document.createElement('div');
                userDiv.className = 'leaderboard-item';
                userDiv.innerHTML = `
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span class="leaderboard-email">${user.email}</span>
                    <span class="leaderboard-score">${user.bestScore}</span>
                `;
                content.appendChild(userDiv);
            });
            
            document.getElementById('leaderboardModal').classList.remove('hidden');
        } catch (error) {
            alert('Failed to load leaderboard');
        }
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
}

// Initialize Google Maps
function initMaps() {
    console.log('Google Maps API loaded successfully');
    window.game = new GeoGuessrGame();
    
    // Start the first game automatically
    setTimeout(() => {
        if (window.game.token) {
            console.log('Auto-starting game for authenticated user');
            window.game.startNewGame();
        }
    }, 1000);
}

// Handle Google Maps API load errors
window.gm_authFailure = function() {
    console.error('Google Maps API authentication failed');
    alert('Google Maps API authentication failed. Please check your API key.');
};

// Check if Google Maps loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof google === 'undefined') {
            console.error('Google Maps API failed to load');
            alert('Google Maps API failed to load. Please check your internet connection and API key.');
        }
    }, 5000);
});