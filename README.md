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

## Data Flow

1. User fills out nomination form
2. Form data is sent to json file github gist
3. User sees confirmation message

