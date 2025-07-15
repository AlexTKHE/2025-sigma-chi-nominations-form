const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

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

// Data storage - use in-memory storage for Vercel serverless
let nominationsData = { nominations: [], summary: {} };

// Load existing nominations (in-memory)
function loadNominations() {
  return nominationsData;
}

// Save nominations (in-memory)
function saveNominations(data) {
  nominationsData = data;
  console.log('Nominations saved:', data);
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
    const existingData = loadNominations();
    
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
    saveNominations(existingData);
    
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
    const data = loadNominations();
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
    const data = loadNominations();
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