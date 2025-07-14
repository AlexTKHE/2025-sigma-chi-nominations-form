# Sigma Chi Officer Nomination Form

A React-based web application for collecting officer nominations from Sigma Chi fraternity members. The form automatically saves responses to a Google Sheet using Google Apps Script.

## Features

- **Interactive Nomination Form**: Nominate members for various officer positions
- **Autocomplete Search**: Search through a predefined list of members
- **Digital Signature**: Capture signatures using a canvas-based signature pad
- **Google Sheets Integration**: Automatically save responses to a Google Sheet
- **Responsive Design**: Works on desktop and mobile devices
- **Sigma Chi Branding**: Uses official Sigma Chi colors and styling

## Tech Stack

- **Frontend**: React + Vite + Material-UI
- **Backend**: Google Apps Script (serverless)
- **Database**: Google Sheets
- **Deployment**: Vercel (frontend hosting)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nomination-form
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google Sheets integration**
   - Follow the detailed instructions in [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
   - Create a Google Sheet and Google Apps Script
   - Update the URL in `src/config.js`

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   - Push to GitHub
   - Connect to Vercel
   - Deploy automatically

## Project Structure

```
nomination-form/
├── src/
│   ├── App.jsx              # Main application component
│   ├── config.js            # Configuration settings
│   ├── App.css              # Custom styles
│   └── assets/
│       └── sigmaChiLogo.png # Sigma Chi logo
├── google-apps-script.js    # Google Apps Script code
├── test-integration.html    # Integration testing tool
├── SETUP_INSTRUCTIONS.md    # Detailed setup guide
└── README.md               # This file
```

## Configuration

Update `src/config.js` with your settings:

```javascript
export const config = {
  googleAppsScriptUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
  // ... other settings
};
```

## Testing

Use the included test tool to verify your Google Apps Script setup:

1. Open `test-integration.html` in a browser
2. Enter your Google Apps Script URL
3. Test the connection and submission

## Data Flow

1. User fills out nomination form
2. Form data is sent to Google Apps Script
3. Google Apps Script saves data to Google Sheet
4. User sees confirmation message

## Cost

This solution is completely free:
- Google Apps Script: 20,000 requests/day (free tier)
- Google Sheets: 10 million cells (free tier)
- Vercel: Unlimited deployments (free tier)

## Support

For setup help, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md).

For technical issues:
1. Check browser console for errors
2. Verify Google Apps Script URL is correct
3. Test with the integration test tool
4. Check Google Apps Script logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for Sigma Chi fraternity use only.
