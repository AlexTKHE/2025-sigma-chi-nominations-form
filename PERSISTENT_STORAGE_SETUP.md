# 🗄️ Persistent Storage Setup Guide

This guide will help you set up persistent data storage for your Sigma Chi nominations using GitHub Gists.

## 🎯 **Why GitHub Gists?**

✅ **Free** - No cost for storage  
✅ **Reliable** - GitHub's infrastructure  
✅ **Simple** - Easy to set up and use  
✅ **Accessible** - Can view data anytime  
✅ **Versioned** - Automatic backup history  

## 🛠️ **Setup Steps**

### **Step 1: Create a GitHub Gist**

1. **Go to [GitHub Gist](https://gist.github.com/)**
2. **Create a new gist** with this content:
   ```json
   {
     "nominations": [],
     "summary": {}
   }
   ```
3. **Name the file** `nominations.json`
4. **Make it public** (so your backend can read it)
5. **Copy the Gist ID** from the URL (e.g., `abc123def456`)

### **Step 2: Create a GitHub Personal Access Token**

1. **Go to GitHub Settings** → **Developer settings** → **Personal access tokens**
2. **Click "Generate new token"**
3. **Select scopes:**
   - ✅ `gist` (to read/write gists)
4. **Copy the token** (you won't see it again!)

### **Step 3: Update Your Backend Code**

In `backend/server.js`, replace:
```javascript
const GIST_ID = 'your-gist-id-here';
```
With your actual Gist ID:
```javascript
const GIST_ID = 'abc123def456'; // Your actual Gist ID
```

### **Step 4: Set Environment Variable in Vercel**

1. **Go to your Vercel dashboard**
2. **Select your backend project**
3. **Go to "Settings"** → **"Environment Variables"**
4. **Add variable:**
   - **Name:** `GITHUB_TOKEN`
   - **Value:** Your GitHub personal access token
5. **Click "Save"**

### **Step 5: Deploy Your Backend**

1. **Commit and push** your changes
2. **Vercel will redeploy** automatically
3. **Test your form** - data should now persist!

## 🔍 **Testing Persistent Storage**

1. **Submit a nomination** through your form
2. **Check your GitHub Gist** - you should see the data
3. **Redeploy your backend** - data should still be there
4. **Visit `/api/nominations`** - should show your data

## 📊 **Viewing Your Data**

- **GitHub Gist:** Direct access to raw data
- **API Endpoint:** `https://your-backend.vercel.app/api/nominations`
- **Summary:** `https://your-backend.vercel.app/api/summary`

## 🚨 **Security Notes**

- **GitHub Token:** Keep it secure, don't share it
- **Gist is Public:** Anyone can view the data (but not modify without token)
- **Token Permissions:** Only has access to gists, not your repos

## 🎉 **Benefits**

- ✅ **Data never lost** - Even after redeploys
- ✅ **Easy backup** - GitHub handles it
- ✅ **Version history** - See all changes
- ✅ **Simple setup** - No database needed
- ✅ **Free forever** - No ongoing costs

Your nominations will now persist permanently! 🎯 