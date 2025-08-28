# Quiz Application Deployment Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB database (local or cloud)
- npm or yarn package manager

## Environment Variables

### Backend (.env)
Create a `.env` file in the `backend` directory with the following variables:
```
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_ORIGIN=http://localhost:3000
```

### Frontend (.env)
Create a `.env` file in the `frontend` directory with the following variables:
```
VITE_API_BASE_URL=http://localhost:5000
```

## Deployment Steps

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Build Frontend
```bash
cd frontend
npm run build
```

### 3. Start Backend Server
```bash
cd backend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Production Deployment

### Option A: Separate Deployment (Recommended)
- Deploy frontend to Vercel, Netlify, or similar
- Deploy backend to Heroku, Railway, or similar
- Update frontend environment variables to point to deployed backend

### Option B: Combined Deployment
Configure backend to serve frontend static files:

1. Build frontend: `cd frontend && npm run build`
2. Copy `frontend/dist` folder to `backend/public`
3. Add static file serving to backend server.js:
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

## Docker Deployment (Optional)

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t quiz-backend .
docker run -p 5000:5000 quiz-backend
```

## Troubleshooting

1. **CORS Issues**: Ensure CLIENT_ORIGIN in backend .env matches frontend URL
2. **Database Connection**: Verify MONGO_URI is correct and MongoDB is accessible
3. **Build Errors**: Check Node.js version compatibility
4. **Port Conflicts**: Change PORT in backend .env if 5000 is occupied

## Monitoring
- Check server logs for errors
- Monitor MongoDB connection
- Test API endpoints with tools like Postman
