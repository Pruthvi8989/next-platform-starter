# Apexture Deployment Guide

This guide covers deployment options for Apexture across different platforms.

## Web Deployment

### 1. Production Build
```bash
# Build the React frontend
cd client
npm run build

# The build files will be in client/build/
```

### 2. Server Configuration
```bash
# Install production dependencies
cd server
npm install --production

# Set environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb://your-production-db
export JWT_SECRET=your-production-secret
```

### 3. Serve Static Files
The Express server is configured to serve the React build files:
```javascript
// In server/index.js
app.use(express.static(path.join(__dirname, '../client/build')));
```

## Mobile App Deployment

### React Native (iOS & Android)

1. **Initialize React Native Project**
```bash
npx react-native init ApextureMobile
cd ApextureMobile
```

2. **Install Dependencies**
```bash
npm install axios react-navigation @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

3. **Configure API Base URL**
```javascript
// config/api.js
export const API_BASE_URL = 'https://your-api-domain.com/api';
```

4. **Build for iOS**
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

5. **Build for Android**
```bash
npx react-native run-android
```

### Progressive Web App (PWA)

1. **Add PWA Configuration**
```json
// client/public/manifest.json
{
  "short_name": "Apexture",
  "name": "Apexture Accounting",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#e3b448",
  "background_color": "#ffffff"
}
```

2. **Add Service Worker**
```javascript
// client/src/index.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

## Desktop App Deployment

### Electron (Windows, Mac, Linux)

1. **Install Electron**
```bash
npm install --save-dev electron electron-builder
```

2. **Create Main Process**
```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the React app
  mainWindow.loadURL('http://localhost:3000');
  
  // For production, load from build
  // mainWindow.loadFile('client/build/index.html');
}

app.whenReady().then(createWindow);
```

3. **Build Scripts**
```json
// package.json
{
  "scripts": {
    "electron": "electron .",
    "electron-dev": "concurrently \"npm start\" \"wait-on http://localhost:3000 && electron .\"",
    "build-electron": "electron-builder"
  }
}
```

4. **Build for Different Platforms**
```bash
# Build for current platform
npm run build-electron

# Build for Windows (from Mac/Linux)
npm run build-electron -- --win

# Build for Mac (from Windows/Linux)
npm run build-electron -- --mac

# Build for Linux
npm run build-electron -- --linux
```

## Cloud Deployment

### AWS Deployment

1. **EC2 Instance Setup**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org

# Clone and setup application
git clone <your-repo>
cd apexture-accounting
npm run install-all
```

2. **Environment Configuration**
```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb://localhost:27017/apexture
export JWT_SECRET=your-production-secret
export TWILIO_ACCOUNT_SID=your-twilio-sid
export TWILIO_AUTH_TOKEN=your-twilio-token
```

3. **PM2 Process Management**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/index.js --name apexture-api

# Setup auto-restart
pm2 startup
pm2 save
```

4. **Nginx Configuration**
```nginx
# /etc/nginx/sites-available/apexture
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

1. **Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm run install-all

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Expose ports
EXPOSE 5000 3000

# Start application
CMD ["npm", "run", "dev"]
```

2. **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/apexture
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

3. **Deploy with Docker**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/apexture-dev
JWT_SECRET=dev-secret-key
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Staging
```env
NODE_ENV=staging
MONGODB_URI=mongodb://staging-db:27017/apexture-staging
JWT_SECRET=staging-secret-key
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://production-db:27017/apexture
JWT_SECRET=production-secret-key
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Security Considerations

1. **HTTPS Configuration**
   - Use SSL certificates for production
   - Configure secure headers
   - Enable CORS for specific domains

2. **Database Security**
   - Use authentication for MongoDB
   - Enable SSL for database connections
   - Regular backups

3. **API Security**
   - Rate limiting
   - Input validation
   - JWT token expiration
   - Secure file uploads

## Monitoring and Logging

1. **Application Monitoring**
```bash
# Install monitoring tools
npm install --save morgan winston

# PM2 monitoring
pm2 monit
```

2. **Log Management**
```javascript
// server/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Performance Optimization

1. **Frontend Optimization**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Service worker caching

2. **Backend Optimization**
   - Database indexing
   - Query optimization
   - Caching strategies
   - CDN for static assets

## Backup and Recovery

1. **Database Backup**
```bash
# MongoDB backup
mongodump --db apexture --out /backup/apexture-$(date +%Y%m%d)

# Restore
mongorestore --db apexture /backup/apexture-20231201/apexture
```

2. **File Backup**
```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz server/uploads/
```

This deployment guide provides comprehensive instructions for deploying Apexture across all major platforms and environments.