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
const GIST_ID = 'b166db4409c0066cf9a3ae44402bbef4'; // Your Gist ID
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

    console.log('Attempting to save nominations to GitHub Gist...');
    
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Sigma-Chi-Nominations-App'
      },
      body: JSON.stringify({
        description: `Updated at ${new Date().toISOString()}`,
        files: {
          'nominations.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    const responseText = await response.text();
    console.log('GitHub API response status:', response.status);
    console.log('GitHub API response:', responseText);

    if (response.ok) {
      console.log('✅ Nominations saved to GitHub Gist successfully');
      return true;
    } else {
      console.error('❌ Failed to save to GitHub Gist:', response.status, responseText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving nominations:', error);
    return false;
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
    
    // Check if this submitter has already voted
    const submitterName = (formData.submitterName || '').trim();
    if (submitterName) {
      const existingSubmission = existingData.nominations.find(
        submission => submission.submitterName && 
        submission.submitterName.toLowerCase() === submitterName.toLowerCase()
      );
      
      if (existingSubmission) {
        console.log('❌ Duplicate submission attempt from:', submitterName);
        return res.status(409).json({ 
          success: false, 
          error: `${submitterName} has already submitted their vote. Each member can only vote once.`,
          existingSubmissionId: existingSubmission.id,
          existingSubmissionDate: existingSubmission.submittedAt
        });
      }
    }
    
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
    
    // Update summary with counts and reasons
    const summary = {};
    existingData.nominations.forEach(sub => {
      Object.keys(sub.nominations || {}).forEach(position => {
        if (!summary[position]) summary[position] = {};
        (sub.nominations[position] || []).forEach(nom => {
          if (nom && nom.name && nom.name.trim()) {
            const name = nom.name.trim();
            const reason = (nom.reason || '').trim();
            if (!summary[position][name]) {
              summary[position][name] = { count: 0, reason };
            }
            summary[position][name].count += 1;
            if (!summary[position][name].reason && reason) {
              summary[position][name].reason = reason;
            }
          }
        });
      });
    });
    
    existingData.summary = summary;
    
    // Save data
    const saveResult = await saveNominations(existingData);
    
    if (saveResult) {
      console.log('✅ Submission successful:', submission.id);
      res.json({ 
        success: true, 
        message: 'Nominations submitted successfully',
        submissionId: submission.id
      });
    } else {
      console.log('⚠️ Submission saved locally but failed to save to GitHub');
      res.json({ 
        success: true, 
        message: 'Nominations submitted successfully (local storage only)',
        submissionId: submission.id,
        warning: 'Data not saved to GitHub Gist'
      });
    }
    
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

// Delete a specific nomination submission
app.delete('/api/nominations/:id', async (req, res) => {
  try {
    const submissionId = req.params.id;
    console.log('Attempting to delete submission:', submissionId);
    
    // Load existing data
    const existingData = await loadNominations();
    
    // Find and remove the submission
    const initialLength = existingData.nominations.length;
    existingData.nominations = existingData.nominations.filter(
      submission => submission.id !== submissionId
    );
    
    if (existingData.nominations.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
        submissionId
      });
    }
    
    // Recalculate summary after deletion (counts and reasons)
    const summary = {};
    existingData.nominations.forEach(sub => {
      Object.keys(sub.nominations || {}).forEach(position => {
        if (!summary[position]) summary[position] = {};
        (sub.nominations[position] || []).forEach(nom => {
          if (nom && nom.name && nom.name.trim()) {
            const name = nom.name.trim();
            const reason = (nom.reason || '').trim();
            if (!summary[position][name]) {
              summary[position][name] = { count: 0, reason };
            }
            summary[position][name].count += 1;
            if (!summary[position][name].reason && reason) {
              summary[position][name].reason = reason;
            }
          }
        });
      });
    });
    
    existingData.summary = summary;
    
    // Save updated data
    const saveResult = await saveNominations(existingData);
    
    if (saveResult) {
      console.log('✅ Submission deleted successfully:', submissionId);
      res.json({
        success: true,
        message: 'Submission deleted successfully',
        deletedId: submissionId,
        remainingSubmissions: existingData.nominations.length
      });
    } else {
      console.log('⚠️ Deletion saved locally but failed to save to GitHub');
      res.json({
        success: true,
        message: 'Submission deleted successfully (local storage only)',
        deletedId: submissionId,
        warning: 'Data not saved to GitHub Gist'
      });
    }
    
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete submission',
      details: error.message
    });
  }
});

// Get detailed voting records (for admin)
app.get('/api/voting-records', async (req, res) => {
  try {
    const data = await loadNominations();
    
    // Format detailed records
    const records = data.nominations.map(submission => ({
      id: submission.id,
      submitterName: submission.submitterName,
      timestamp: submission.timestamp,
      submittedAt: submission.submittedAt,
      votes: Object.keys(submission.nominations || {}).reduce((acc, position) => {
        const nominations = submission.nominations[position] || [];
        if (nominations.length > 0 && nominations[0].name) {
          acc[position] = nominations[0].name;
        }
        return acc;
      }, {})
    }));
    
    res.json({ 
      success: true,
      records,
      totalSubmissions: records.length
    });
  } catch (error) {
    console.error('Error loading voting records:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load voting records' 
    });
  }
});

// Get comprehensive summary (all candidates, including 0 votes)
app.get('/api/admin-summary', async (req, res) => {
  try {
    const data = await loadNominations();
    
    // Define all possible candidates (real nominations)
    const allCandidates = {
      'Consul': ['Max Hahn', 'Connor Carpenter', 'Xander Harrison'],
      'Pro-Consul': ['Alex Thompson', 'Cooper Kyro'],
      'Annotator': ['Cooper Kyro', 'Alex Miller'],
      'Magister': ['Nic Corbo', 'Lev Tumaykin', 'Cole Beeman'],
      'Assistant Magister': ['Max Hahn', 'Alex Thompson', 'Cole Beeman', 'Lev Tumaykin', 'Oliver Andrews', 'Alex Miller'],
      'Quaestor': ['Lev Tumaykin', 'Nic Corbo', 'Cooper Kyro'],
      'Tribune': ['Cole Beeman', 'Ben Kurland', 'Connor Carpenter'],
      'Kustos': ['Xander Harrison', 'Lev Tumaykin'],
      'Risk-Manager': ['Evan Lara', 'Ben Kurland'],
      'Philanthropy Chair': ['Cole Beeman', 'Ethan Smothers', 'Alex Thompson', 'Cooper Kyro']
    };
    
    // Create comprehensive summary with all candidates
    const comprehensiveSummary = {};
    
    Object.keys(allCandidates).forEach(position => {
      comprehensiveSummary[position] = {};
      
      // Initialize all candidates with 0 votes
      allCandidates[position].forEach(candidateName => {
        comprehensiveSummary[position][candidateName] = {
          count: 0,
          reason: ''
        };
      });
      
      // Add actual votes from data
      if (data.summary && data.summary[position]) {
        Object.keys(data.summary[position]).forEach(candidateName => {
          if (comprehensiveSummary[position][candidateName]) {
            comprehensiveSummary[position][candidateName] = data.summary[position][candidateName];
          }
        });
      }
    });
    
    res.json({ 
      success: true,
      summary: comprehensiveSummary,
      totalSubmissions: data.nominations.length
    });
  } catch (error) {
    console.error('Error loading admin summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load admin summary' 
    });
  }
});

// Test endpoint to check GitHub token
app.get('/api/test-github', async (req, res) => {
  try {
    if (!GITHUB_TOKEN) {
      return res.json({ 
        success: false, 
        message: 'No GitHub token found',
        hasToken: false
      });
    }

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    const gist = await response.json();
    
    res.json({ 
      success: true, 
      message: 'GitHub token is working',
      hasToken: true,
      gistExists: !!gist.id,
      gistUrl: gist.html_url
    });
  } catch (error) {
    res.json({ 
      success: false, 
      message: 'GitHub token test failed',
      error: error.message,
      hasToken: !!GITHUB_TOKEN
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Submit nominations: http://localhost:${PORT}/api/submit-nominations`);
}); 