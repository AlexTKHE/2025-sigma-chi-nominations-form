// Configuration for Sigma Chi Nomination Form
// Replace these values with your actual URLs and settings

export const config = {
  // Backend API URL
  // Use localhost for development, your deployed backend URL for production
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.vercel.app' // Replace with your actual backend URL
    : 'http://localhost:3001',
  
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

// Helper function to get the API URL
export const getApiUrl = () => {
  return config.apiUrl;
};

// Helper function to validate the configuration
export const validateConfig = () => {
  if (!config.apiUrl) {
    console.warn('⚠️  Please update the API URL in src/config.js');
    return false;
  }
  return true;
}; 