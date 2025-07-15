import React, { useState } from 'react';

const NominationSubmitter = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Your Google Apps Script URL
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz7Zodsg3QSJa7FJ8rSlrLoLoWVHyhpo1VtuVauhTJW3HCv7EUn5muTakBmrlMkl/exec';

  // Method 1: Using CORS Proxy (for development)
  const submitWithProxy = async (formData) => {
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${SCRIPT_URL}`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  // Method 2: Direct submission (will fail due to CORS, but shows the attempt)
  const submitDirect = async (formData) => {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  // Method 3: Using Google Apps Script as Web App (recommended for production)
  const submitAsWebApp = async (formData) => {
    // This method works if your script is deployed as a web app
    // and you have proper CORS headers set up
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  const handleSubmit = async (method = 'proxy') => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const testData = {
      submitterName: 'Test User',
      nominations: {
        'Risk-Manager': [{ name: 'Test Nominee' }],
        'Treasurer': [{ name: 'Another Nominee' }]
      },
      signature: 'data:image/png;base64,test',
      submittedAt: new Date().toISOString()
    };

    try {
      let response;
      
      switch (method) {
        case 'proxy':
          response = await submitWithProxy(testData);
          break;
        case 'direct':
          response = await submitDirect(testData);
          break;
        case 'webapp':
          response = await submitAsWebApp(testData);
          break;
        default:
          throw new Error('Invalid method');
      }

      setResult(response);
    } catch (err) {
      setError(err.message);
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Nomination Submission Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Different Submission Methods:</h3>
        <button 
          onClick={() => handleSubmit('proxy')}
          disabled={isSubmitting}
          style={{ margin: '5px', padding: '10px 15px' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit with CORS Proxy'}
        </button>
        
        <button 
          onClick={() => handleSubmit('direct')}
          disabled={isSubmitting}
          style={{ margin: '5px', padding: '10px 15px' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Direct (will fail)'}
        </button>
        
        <button 
          onClick={() => handleSubmit('webapp')}
          disabled={isSubmitting}
          style={{ margin: '5px', padding: '10px 15px' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit as Web App'}
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          <strong>Success!</strong>
          <pre style={{ marginTop: '10px', fontSize: '12px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        backgroundColor: '#d1ecf1', 
        color: '#0c5460', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h4>Instructions:</h4>
        <ul>
          <li><strong>CORS Proxy:</strong> Uses a proxy service to bypass CORS restrictions. Works for development.</li>
          <li><strong>Direct:</strong> Attempts direct submission (will fail due to CORS).</li>
          <li><strong>Web App:</strong> Uses Google Apps Script as a web app (requires proper CORS setup).</li>
        </ul>
        
        <h4>For Production:</h4>
        <p>Set up a backend proxy server or use Google Apps Script with proper CORS headers. The CORS proxy is not suitable for production use.</p>
      </div>
    </div>
  );
};

export default NominationSubmitter; 