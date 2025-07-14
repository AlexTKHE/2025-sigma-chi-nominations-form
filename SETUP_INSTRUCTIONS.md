# Sigma Chi Nomination Form - Google Sheets Integration Setup

This guide will help you set up the nomination form to automatically save responses to a Google Sheet without requiring a backend server.

## Overview

The solution uses:
- **Frontend**: Your existing React app (deployed to Vercel)
- **Backend**: Google Apps Script (free, serverless)
- **Database**: Google Sheets (free)

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet (the script will automatically create the required sheets)
3. Copy the Sheet ID from the URL:
   - The URL looks like: `https://docs.google.com/spreadsheets/d/1ABC123...XYZ/edit`
   - Copy the part between `/d/` and `/edit` (e.g., `1ABC123...XYZ`)

## Step 2: Set Up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the contents of `google-apps-script.js`
4. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Sheet ID
5. Save the project (Ctrl+S or Cmd+S)
6. Give it a name like "Sigma Chi Nomination Form API"

## Step 3: Deploy Google Apps Script

1. Click "Deploy" in the Apps Script editor
2. Click "New deployment"
3. Choose "Web app" as the type
4. Set "Execute as" to "Me"
5. Set "Who has access" to "Anyone"
6. Click "Deploy"
7. Authorize the app when prompted
8. Copy the Web app URL (it will look like: `https://script.google.com/macros/s/.../exec`)

## Step 4: Update Your React App

1. Open `src/App.jsx`
2. Find this line:
   ```javascript
   const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE', {
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your actual Google Apps Script URL

## Step 5: Test the Integration

1. Run your React app locally: `npm run dev`
2. Fill out the nomination form
3. Submit the form
4. Check your Google Sheet - you should see a new row with the form data

## Step 6: Deploy to Vercel

1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Deploy the app
4. Test the live version

## Troubleshooting

### CORS Issues
If you get CORS errors, the Google Apps Script is working but your frontend can't access it. This is normal for development. The deployed version on Vercel should work fine.

### Authorization Issues
- Make sure you authorized the Google Apps Script when deploying
- Check that the "Who has access" is set to "Anyone"

### Data Not Appearing in Sheet
- Verify the Sheet ID is correct
- Check that the sheet has the correct headers
- Look at the Apps Script logs for errors

### Form Submission Fails
- Check the browser console for errors
- Verify the Google Apps Script URL is correct
- Test the Apps Script URL directly in a browser

## Data Structure

The script automatically creates two sheets in your Google Sheet:

### 1. "Nominations Summary" Sheet
Shows each nominee with their total nomination count:
| Officer Position | Nominee | Total Nominations |
|------------------|---------|-------------------|
| Consul           | John Doe| 3                 |
| Consul           | Jane Smith| 2               |
| Pro-Consul       | Bob Johnson| 1              |

### 2. "Detailed Submissions" Sheet
Shows each individual submission:
| Timestamp | Submitter | Position | Nominee | Signature | Submitted At |
|-----------|-----------|----------|---------|-----------|--------------|
| ...       | John      | Consul   | Jane    | [base64]  | ...         |

**Features:**
- Automatically counts nominations for each person
- Organizes by officer position
- Maintains detailed submission history
- Updates counts in real-time
- Styled with Sigma Chi colors

## Security Notes

- The Google Apps Script URL is public, but it only accepts POST requests with proper JSON data
- Form validation happens on the frontend
- The signature is stored as base64 data in the sheet
- Consider adding rate limiting if needed

## Cost

This solution is completely free:
- Google Apps Script: Free tier includes 20,000 requests/day
- Google Sheets: Free tier includes 10 million cells
- Vercel: Free tier includes unlimited deployments
- No backend server costs

## Support

If you need help:
1. Check the browser console for errors
2. Check the Google Apps Script logs
3. Verify all URLs and IDs are correct
4. Test with a simple form submission first 