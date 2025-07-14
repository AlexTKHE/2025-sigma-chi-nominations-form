// Configuration for Sigma Chi Nomination Form
// Replace these values with your actual URLs and settings

export const config = {
  // Google Apps Script Web App URL
  // Replace this with your actual Google Apps Script URL after deployment
  googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbz7Zodsg3QSJa7FJ8rSIrLoLoWVHyhpo1VtuVauhTJw3HCv7EUn5muTakBmrLMklsDbng/exec',
  
  // Form settings
  formSettings: {
    maxNominationsPerPosition: 5,
    maxSubmitterNameLength: 60,
    signatureCanvasWidth: 500,
    signatureCanvasHeight: 200,
  },
  
  // Validation messages
  validationMessages: {
    noNominations: 'Please add at least one nomination before submitting.',
    noSignature: 'Please provide your signature before submitting.',
    noSubmitterName: 'Please enter your name before submitting.',
    submissionError: 'Failed to submit nominations. Please try again.',
    submissionSuccess: 'Your nominations have been submitted successfully!',
  },
  
  // Styling
  colors: {
    primary: '#0033A0', // Royal Blue
    secondary: '#FFD100', // Old Gold
    background: '#f5f5f5',
    white: '#fff',
  },
};

// Helper function to get the Google Apps Script URL
export const getGoogleAppsScriptUrl = () => {
  // In production, you might want to use environment variables
  // For now, we'll use the config value
  return config.googleAppsScriptUrl;
};

// Helper function to validate the configuration
export const validateConfig = () => {
  if (config.googleAppsScriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.warn('⚠️  Please update the Google Apps Script URL in src/config.js');
    return false;
  }
  return true;
}; 