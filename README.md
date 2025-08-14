# GeoGuessr Clone

A full-featured GeoGuessr clone with user authentication, game history, and global leaderboards.

## Features

### Core Game Features
- Random Google Street View locations
- Interactive world map for guessing
- Distance calculation and scoring system
- 5-round games with progressive scoring
- Clean, modern UI similar to the original GeoGuessr

### User Features
- Email/password authentication
- User registration and login
- Secure JWT-based sessions

### Data & Analytics
- Game history storage
- Global leaderboard
- Individual round tracking
- Score and distance analytics

### UI/UX
- Responsive design for mobile and desktop
- Street View takes up most of the screen
- Compact map interface for guessing
- Modal-based navigation
- Real-time score updates

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google Maps API key with Street View and Maps JavaScript API enabled

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Edit the `.env` file and add your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/geoguessr
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
   ```

3. **Update Google Maps API key in HTML:**
   Edit `public/index.html` and replace `YOUR_API_KEY` with your actual Google Maps API key:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=geometry&callback=initMaps"></script>
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Run the application:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Access the game:**
   Open your browser and go to `http://localhost:3000`

## Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Street View Static API
4. Create credentials (API key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env` file and `index.html`

## Game Mechanics

### Scoring System
- Maximum score per round: 5,000 points
- Score decreases based on distance from actual location
- Perfect guess (0km): 5,000 points
- Maximum distance (20,000km): 0 points
- Formula: `score = 5000 * (1 - distance/20000)`

### Game Flow
1. User logs in or registers
2. Game starts with 5 random locations
3. Each round shows a Street View location
4. User clicks on world map to make guess
5. Distance and score are calculated and displayed
6. After 5 rounds, final score is shown and saved
7. Users can view history and leaderboard

## Database Schema

### Users Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  bestScore: Number,
  totalGames: Number,
  createdAt: Date
}
```

### Games Collection
```javascript
{
  userId: ObjectId,
  rounds: [{
    location: { lat, lng, country, description },
    guess: { lat, lng },
    distance: Number,
    score: Number
  }],
  totalScore: Number,
  completedAt: Date
}
```

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/games` - Save completed game
- `GET /api/games` - Get user's game history
- `GET /api/leaderboard` - Get global leaderboard

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation
- Secure API endpoints

## Customization

### Adding More Locations
Edit the `generateGameLocations()` method in `app.js` to add more diverse locations:

```javascript
const locations = [
  { lat: 40.7128, lng: -74.0060, country: 'USA', description: 'New York City' },
  // Add more locations here
];
```

### Adjusting Scoring
Modify the `calculateScore()` method to change the scoring algorithm:

```javascript
calculateScore(distance) {
  const maxScore = 5000;
  const maxDistance = 20000;
  // Customize scoring logic here
}
```

### Styling
Edit `public/styles.css` to customize the appearance and layout.

## Deployment

For production deployment:

1. Set strong JWT secret in environment variables
2. Use a cloud MongoDB instance (MongoDB Atlas)
3. Restrict Google Maps API key to your domain
4. Enable HTTPS
5. Set up proper error logging
6. Configure CORS for your domain

## Troubleshooting

### Common Issues

1. **Google Maps not loading:**
   - Check API key is correct
   - Ensure APIs are enabled in Google Cloud Console
   - Check browser console for errors

2. **Database connection issues:**
   - Verify MongoDB is running
   - Check connection string in `.env`

3. **Authentication problems:**
   - Clear browser localStorage
   - Check JWT secret configuration

4. **Street View not showing:**
   - Some locations may not have Street View coverage
   - The game will attempt to find nearby coverage automatically

## License

This project is for educational purposes. Please respect Google's Terms of Service when using their APIs.