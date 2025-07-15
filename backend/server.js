const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://2025-sigma-chi-nominations-form.vercel.app',
    'https://2025-sigma-chi-nominations-form-kg1.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // For signature data

// Data storage - use GitHub Gist for persistent storage
const GIST_ID = '7179092327efd238122283947da274ea'; // Your Gist ID
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Set this in Vercel environment variables

// Load nominations from GitHub Gist
async function loadNominations() {
  try {
    if (!GITHUB_TOKEN) {
      console.log('No GitHub token, using in-memory storage');
      return { nominations: [], summary: {} };
    }

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    const gist = await response.json();
    
    if (gist.files && gist.files['nominations.json']) {
      const content = gist.files['nominations.json'].content;
      return JSON.parse(content);
    }
    
    return { nominations: [], summary: {} };
  } catch (error) {
    console.error('Error loading nominations:', error);
    return { nominations: [], summary: {} };
  }
}

// Save nominations to GitHub Gist
async function saveNominations(data) {
  try {
    if (!GITHUB_TOKEN) {
      console.log('No GitHub token, using in-memory storage');
      return;
    }

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          'nominations.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (response.ok) {
      console.log('Nominations saved to GitHub Gist');
    } else {
      console.error('Failed to save to GitHub Gist:', response.status);
    }
  } catch (error) {
    console.error('Error saving nominations:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sigma Chi Nominations Backend API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      submit: '/api/submit-nominations',
      nominations: '/api/nominations',
      summary: '/api/summary'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API is running',
    message: 'Sigma Chi Nomination Form API is active',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/submit-nominations', async (req, res) => {
  try {
    const formData = req.body;
    const timestamp = new Date().toISOString();
    
    console.log('Received form data:', formData);
    
    // Load existing data
    const existingData = await loadNominations();
    
    // Add new submission
    const submission = {
      id: Date.now().toString(),
      timestamp,
      submitterName: formData.submitterName || 'Anonymous',
      nominations: formData.nominations || {},
      signature: formData.signature || '',
      submittedAt: formData.submittedAt || timestamp
    };
    
    existingData.nominations.push(submission);
    
    // Update summary
    const summary = {};
    existingData.nominations.forEach(sub => {
      Object.keys(sub.nominations).forEach(position => {
        if (!summary[position]) summary[position] = {};
        
        sub.nominations[position].forEach(nom => {
          if (nom.name && nom.name.trim()) {
            const name = nom.name.trim();
            summary[position][name] = (summary[position][name] || 0) + 1;
          }
        });
      });
    });
    
    existingData.summary = summary;
    
    // Save data
    await saveNominations(existingData);
    
    console.log('Submission successful:', submission.id);
    
    res.json({ 
      success: true, 
      message: 'Nominations submitted successfully',
      submissionId: submission.id
    });
    
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process submission',
      details: error.message
    });
  }
});

app.get('/api/nominations', async (req, res) => {
  try {
    const data = await loadNominations();
    res.json(data);
  } catch (error) {
    console.error('Error loading nominations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load nominations' 
    });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const data = await loadNominations();
    res.json({ summary: data.summary });
  } catch (error) {
    console.error('Error loading summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load summary' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Submit nominations: http://localhost:${PORT}/api/submit-nominations`);
}); 