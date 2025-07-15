# 🚀 Sigma Chi Nominations Backend Setup

This backend solution eliminates CORS issues and provides a reliable API for your nomination form.

## 📋 **Why This is Better Than Google Apps Script**

✅ **No CORS issues** - Built-in CORS support  
✅ **Reliable** - No proxy dependencies  
✅ **Fast** - Direct API calls  
✅ **Scalable** - Easy to add features  
✅ **Debuggable** - Full control over the backend  

## 🛠️ **Setup Instructions**

### **1. Install Backend Dependencies**
```bash
cd backend
npm install
```

### **2. Start the Backend (Development)**
```bash
npm run dev
```
The server will run on `http://localhost:3001`

### **3. Test the Backend**
- Health check: `http://localhost:3001/api/health`
- Submit nominations: `POST http://localhost:3001/api/submit-nominations`
- View nominations: `GET http://localhost:3001/api/nominations`
- View summary: `GET http://localhost:3001/api/summary`

### **4. Update Frontend Configuration**
In `src/config.js`, update the production API URL:
```javascript
apiUrl: process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.vercel.app' // Replace with your actual backend URL
  : 'http://localhost:3001',
```

## 🌐 **Deployment Options**

### **Option A: Deploy to Vercel (Recommended)**
1. Create a new Vercel project for the backend
2. Upload the `backend/` folder
3. Set environment variables if needed
4. Update your frontend config with the new backend URL

### **Option B: Deploy to Railway**
1. Connect your GitHub repo to Railway
2. Set the root directory to `backend/`
3. Deploy automatically

### **Option C: Deploy to Heroku**
1. Create a new Heroku app
2. Set the buildpack to Node.js
3. Deploy the backend folder

## 📊 **Data Storage**

The backend stores data in `backend/data/nominations.json`:
- **Nominations**: All form submissions
- **Summary**: Aggregated nomination counts by position

## 🔧 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/submit-nominations` | POST | Submit new nominations |
| `/api/nominations` | GET | Get all nominations |
| `/api/summary` | GET | Get nomination summary |

## 🎯 **Benefits**

1. **No More CORS Issues** - Built-in CORS support
2. **Reliable Submissions** - Direct API calls, no proxies
3. **Easy Debugging** - Full control over the backend
4. **Scalable** - Easy to add features like authentication, validation, etc.
5. **Data Control** - Your data, your server

## 🚀 **Next Steps**

1. **Deploy the backend** to your preferred platform
2. **Update the frontend config** with your backend URL
3. **Deploy the frontend** to Vercel
4. **Test the complete flow** - form submission should work perfectly!

This solution is much more reliable and professional than dealing with Google Apps Script's limitations. 