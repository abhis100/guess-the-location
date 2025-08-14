# 🚀 Vercel Deployment Guide

## Why Vercel?
- ✅ **Excellent performance** with global CDN
- ✅ **Automatic HTTPS** and custom domains
- ✅ **Git-based deployment** (auto-deploy on push)
- ✅ **Generous free tier**
- ✅ **Great developer experience**
- ✅ **Serverless architecture** (scales automatically)

## 📋 Prerequisites

1. **Vercel account** (free at vercel.com)
2. **MongoDB Atlas** (free cloud database)
3. **Google Maps API key**
4. **GitHub repository** (recommended)

## 🚀 Quick Deploy (5 minutes!)

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/geoguessr-clone.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the settings!

3. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/geoguessr
   JWT_SECRET = your-super-secret-jwt-key-here
   GOOGLE_MAPS_API_KEY = your-google-maps-api-key
   ```

4. **Deploy!**
   - Click "Deploy"
   - Your app will be live in ~2 minutes! 🎉

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add GOOGLE_MAPS_API_KEY
   ```

4. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## 🔧 Project Structure for Vercel

Your project now has this structure:
```
├── api/
│   ├── auth.js          # Authentication endpoints
│   ├── games.js         # Game data endpoints
│   └── leaderboard.js   # Leaderboard endpoint
├── public/              # Static files (HTML, CSS, JS)
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

## 🌍 MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free account and cluster

2. **Configure Database Access**
   - Create database user
   - Whitelist all IPs: `0.0.0.0/0`

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password

## 🗺️ Google Maps API Setup

1. **Enable APIs**
   - Maps JavaScript API
   - Street View Static API

2. **Create API Key**
   - Go to Google Cloud Console
   - Create credentials → API Key

3. **Set Restrictions**
   - Add your Vercel domain: `https://your-app.vercel.app/*`
   - Restrict to required APIs only

## ⚙️ Vercel Configuration

The `vercel.json` file configures:
- **Serverless functions** for API routes
- **Static file serving** for frontend
- **Environment variables** mapping
- **Route handling** between API and static files

## 🚀 Deployment Features

### Automatic Deployments
- **Every git push** triggers a new deployment
- **Preview deployments** for pull requests
- **Production deployments** from main branch

### Performance
- **Global CDN** for fast loading worldwide
- **Automatic optimization** of images and assets
- **Edge functions** for low latency

### Monitoring
- **Real-time analytics** in Vercel dashboard
- **Function logs** for debugging
- **Performance metrics**

## 🔍 Troubleshooting

### Common Issues

1. **API Routes Not Working**
   ```bash
   # Check function logs
   vercel logs
   ```

2. **Environment Variables**
   ```bash
   # List all environment variables
   vercel env ls
   
   # Add missing variable
   vercel env add VARIABLE_NAME
   ```

3. **MongoDB Connection Issues**
   - Verify connection string
   - Check IP whitelist (use 0.0.0.0/0)
   - Ensure database user has correct permissions

4. **Google Maps Not Loading**
   - Check API key in environment variables
   - Verify domain restrictions
   - Ensure APIs are enabled

### Useful Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View function logs
vercel logs

# Remove deployment
vercel rm your-deployment-url
```

## 🎯 Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set in Vercel
- [ ] Google Maps API key configured
- [ ] Domain restrictions updated
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled

## 🌟 Advantages of Vercel Deployment

1. **Performance**: Global CDN and edge functions
2. **Scalability**: Automatic scaling with serverless
3. **Developer Experience**: Great dashboard and tools
4. **Cost**: Generous free tier
5. **Security**: Automatic HTTPS and security headers
6. **Reliability**: 99.99% uptime SLA

## 🔗 Your Live App

After deployment, your GeoGuessr clone will be available at:
`https://your-project-name.vercel.app`

You can also add a custom domain in the Vercel dashboard!

## 💡 Pro Tips

1. **Use Preview Deployments**: Test changes before going live
2. **Monitor Function Usage**: Keep an eye on serverless function limits
3. **Optimize Images**: Use Vercel's automatic image optimization
4. **Set Up Analytics**: Enable Vercel Analytics for insights
5. **Custom Domain**: Add your own domain for a professional look

---

**🎉 That's it! Your GeoGuessr clone is now live on Vercel with:**
- ✅ Global performance
- ✅ Automatic scaling
- ✅ Continuous deployment
- ✅ Professional hosting

Enjoy your deployed game! 🌍🎮