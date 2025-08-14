# 🚀 Deployment Guide for GeoGuessr Clone

## Option 1: Heroku (Recommended - Free Tier)

### Prerequisites
- Heroku account (free)
- Git installed
- MongoDB Atlas account (free)

### Step 1: Prepare for Heroku
```bash
# Install Heroku CLI
# macOS: brew install heroku/brew/heroku
# Windows: Download from heroku.com

# Login to Heroku
heroku login
```

### Step 2: Set up MongoDB Atlas (Cloud Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Get connection string (replace `<password>` with your password)
4. Whitelist all IPs (0.0.0.0/0) for Heroku

### Step 3: Deploy to Heroku
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create your-geoguessr-clone

# Set environment variables
heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"
heroku config:set JWT_SECRET="your-super-secret-jwt-key"
heroku config:set GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Deploy
git push heroku main
```

### Step 4: Update Google Maps API Key Restrictions
1. Go to Google Cloud Console
2. Edit your API key restrictions
3. Add your Heroku domain: `https://your-app-name.herokuapp.com/*`

---

## Option 2: Railway (Modern Alternative)

### Step 1: Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Step 2: Set Environment Variables
In Railway dashboard:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your secret key
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

---

## Option 3: Render (Free Tier)

### Step 1: Connect GitHub
1. Push code to GitHub repository
2. Go to [Render.com](https://render.com)
3. Connect your GitHub repo

### Step 2: Configure Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `GOOGLE_MAPS_API_KEY`

---

## Option 4: DigitalOcean App Platform

### Step 1: Create App
1. Go to DigitalOcean App Platform
2. Connect GitHub repository
3. Configure build settings

### Step 2: Environment Variables
Add the same environment variables as above.

---

## Option 5: Vercel (Serverless)

**Note**: Requires converting to serverless functions. More complex setup.

---

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] `MONGODB_URI` (use MongoDB Atlas)
- [ ] `JWT_SECRET` (generate strong secret)
- [ ] `GOOGLE_MAPS_API_KEY` (with proper restrictions)

### 2. Google Maps API Setup
- [ ] Enable required APIs (Maps JavaScript, Street View Static)
- [ ] Set up billing (required for production use)
- [ ] Add domain restrictions for security

### 3. MongoDB Atlas Setup
- [ ] Create cluster
- [ ] Create database user
- [ ] Whitelist IP addresses (0.0.0.0/0 for cloud deployment)
- [ ] Get connection string

### 4. Security
- [ ] Strong JWT secret
- [ ] API key restrictions
- [ ] CORS configuration
- [ ] HTTPS enabled (automatic on most platforms)

---

## 🌟 Recommended: Heroku Deployment

**Why Heroku?**
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Good documentation
- ✅ Git-based deployment

**Quick Heroku Deploy:**
```bash
# 1. Create Heroku app
heroku create your-geoguessr-clone

# 2. Set environment variables
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/geoguessr"
heroku config:set JWT_SECRET="your-super-secret-key-here"
heroku config:set GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# 3. Deploy
git push heroku main

# 4. Open your app
heroku open
```

Your app will be live at: `https://your-geoguessr-clone.herokuapp.com`

---

## 💡 Tips for Production

### Performance
- Use MongoDB Atlas for better performance
- Enable gzip compression
- Add caching headers
- Optimize images and assets

### Security
- Use strong JWT secrets
- Restrict API keys to your domain
- Enable CORS only for your domain
- Use HTTPS (automatic on most platforms)

### Monitoring
- Set up error logging
- Monitor API usage
- Track user analytics
- Set up uptime monitoring

---

## 🆘 Troubleshooting

### Common Issues
1. **MongoDB connection fails**: Check connection string and IP whitelist
2. **Google Maps not loading**: Verify API key and domain restrictions
3. **App crashes**: Check logs with `heroku logs --tail`
4. **Environment variables**: Verify all required vars are set

### Useful Commands
```bash
# Check Heroku logs
heroku logs --tail

# Check environment variables
heroku config

# Restart app
heroku restart

# Open app
heroku open
```