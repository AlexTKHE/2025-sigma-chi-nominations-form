import { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SignatureCanvas from 'react-signature-canvas';
import sigmaChiLogo from './assets/sigmaChiLogo.png';
import { getApiUrl, validateConfig } from './config';
import './App.css';
import { Link } from 'react-router-dom';

// Sigma Chi color theme
const sigmaChiTheme = createTheme({
  palette: {
    primary: {
      main: '#0033A0', // Royal Blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFD100', // Old Gold
      contrastText: '#0033A0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
});

// 50-word mock description (exactly 50 words)
const FIFTY_WORD_REASON = 'Demonstrates reliable judgment, steady communication, and respect for brothers; plans thoughtfully, follows through on commitments, and supports teammates under pressure. Leads with humility, invites feedback, and builds consensus without losing momentum. Organized, ethical, and prepared, they prioritize chapter standards, safety, and inclusion while inspiring participation, accountability, and measurable results consistently.';

// Mock candidates with short reasons per position (fictional names only)
const mockCandidates = {
  'Consul': [
    { name: 'Jordan Rivers', reason: FIFTY_WORD_REASON },
    { name: 'Morgan Lee', reason: FIFTY_WORD_REASON },
    { name: 'Casey Bennett', reason: FIFTY_WORD_REASON }
  ],
  'Pro-Consul': [
    { name: 'Riley Thompson', reason: FIFTY_WORD_REASON },
    { name: 'Taylor Brooks', reason: FIFTY_WORD_REASON },
    { name: 'Avery Collins', reason: FIFTY_WORD_REASON }
  ],
  'Annotator': [
    { name: 'Quinn Parker', reason: FIFTY_WORD_REASON },
    { name: 'Skylar Hayes', reason: FIFTY_WORD_REASON },
    { name: 'Drew Morgan', reason: FIFTY_WORD_REASON }
  ],
  'Magister': [
    { name: 'Rowan Mitchell', reason: FIFTY_WORD_REASON },
    { name: 'Peyton Carter', reason: FIFTY_WORD_REASON },
    { name: 'Jamie West', reason: FIFTY_WORD_REASON }
  ],
  'Quaestor': [
    { name: 'Cameron Blake', reason: FIFTY_WORD_REASON },
    { name: 'Reese Sullivan', reason: FIFTY_WORD_REASON },
    { name: 'Dakota Price', reason: FIFTY_WORD_REASON }
  ],
  'Tribune': [
    { name: 'Kai Emerson', reason: FIFTY_WORD_REASON },
    { name: 'Sage Turner', reason: FIFTY_WORD_REASON },
    { name: 'Remy Lawson', reason: FIFTY_WORD_REASON }
  ],
  'Kustos': [
    { name: 'Alexis Monroe', reason: FIFTY_WORD_REASON },
    { name: 'Shawn Barrett', reason: FIFTY_WORD_REASON },
    { name: 'Emerson Quinn', reason: FIFTY_WORD_REASON }
  ],
  'Risk-Manager': [
    { name: 'Hayden Clarke', reason: FIFTY_WORD_REASON },
    { name: 'Phoenix Walker', reason: FIFTY_WORD_REASON },
    { name: 'River Dalton', reason: FIFTY_WORD_REASON }
  ],
  'Philanthropy Chair': [
    { name: 'Sydney Harper', reason: FIFTY_WORD_REASON },
    { name: 'Marley Grant', reason: FIFTY_WORD_REASON },
    { name: 'Taylor Reeves', reason: FIFTY_WORD_REASON }
  ]
};

// Officer positions derived from mock candidates
const officerPositions = Object.keys(mockCandidates);

function App() {
  const [votes, setVotes] = useState({});
  const signaturePad = useRef(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  // Removed single-accordion expansion tracking
  const [submitterName, setSubmitterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hasValidSignature, setHasValidSignature] = useState(false);

  const handleVoteChange = (position, selectedName) => {
    setVotes(prev => ({
      ...prev,
      [position]: selectedName
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const signatureData = signaturePad.current ? signaturePad.current.toDataURL() : null;
      const nominationsFromVotes = Object.keys(votes).reduce((acc, position) => {
        const selectedName = (votes[position] || '').trim();
        if (selectedName) {
          const candidate = (mockCandidates[position] || []).find(c => c.name === selectedName);
          acc[position] = [{ name: selectedName, reason: candidate?.reason || '' }];
        }
        return acc;
      }, {});

      const formData = {
        submitterName,
        nominations: nominationsFromVotes,
        signature: signatureData,
        submittedAt: new Date().toISOString()
      };

      // Validate configuration
      if (!validateConfig()) {
        throw new Error('Google Apps Script URL not configured');
      }

      // Send data to our backend API
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/submit-nominations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit form data');
      }

      setSubmittedData(formData);
      setShowThankYou(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to submit nominations. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSignature = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      setHasValidSignature(false);
    }
  };

  const getTotalNominations = () => {
    return Object.values(votes).filter(v => (v || '').trim() !== '').length;
  };

  // Helper to check if signature is present
  const hasSignature = () => {
    return hasValidSignature;
  };

  // Function to check signature validity
  const checkSignature = () => {
    if (!signaturePad.current) {
      setHasValidSignature(false);
      return;
    }
    
    try {
      const dataURL = signaturePad.current.toDataURL();
      const isValid = dataURL.length > 100; // Threshold for detecting actual signature data
      setHasValidSignature(isValid);
    } catch (error) {
      console.error('Error checking signature:', error);
      setHasValidSignature(false);
    }
  };

  // Check signature periodically to update state
  useEffect(() => {
    const interval = setInterval(() => {
      checkSignature();
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={sigmaChiTheme}>
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh', background: showThankYou ? 'linear-gradient(135deg, #0033A0 0%, #FFD100 100%)' : undefined }}>
        {showThankYou ? (
          <Paper elevation={3} sx={{ p: 6, textAlign: 'center', background: 'transparent', color: '#0033A0', minHeight: 400, boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <img src={sigmaChiLogo} alt="Sigma Chi Logo" style={{ width: 120, marginBottom: 24 }} />
            </Box>
            <Typography variant="h3" sx={{ color: '#FFD100', fontWeight: 700, textShadow: '2px 2px 0 #0033A0, 4px 4px 8px #0033A055', mb: 2 }}>
              Thank You!
            </Typography>
            <Typography variant="h5" sx={{ color: '#0033A0', fontWeight: 600, mb: 2 }}>
              Your votes have been submitted.
            </Typography>
            <Typography variant="body1" sx={{ color: '#0033A0', mb: 4 }}>
              In Hoc Signo Vinces<br/>
              <span style={{ color: '#FFD100', fontWeight: 700 }}>Sigma Chi</span>
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #0033A0 0%, #FFD100 100%)', color: '#0033A0' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <img src={sigmaChiLogo} alt="Sigma Chi Logo" style={{ width: 100, marginBottom: 16 }} />
            </Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#FFD100', fontWeight: 700, textShadow: '2px 2px 0 #0033A0, 4px 4px 8px #0033A055' }}>
              Sigma Chi Officer Voting
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#FFD100', fontWeight: 500, textShadow: '1px 1px 0 #0033A0' }}>
              Please vote for one candidate for each officer position
            </Typography>
            <Button component={Link} to="/results" variant="outlined" sx={{ mb: 2 }}>View Results</Button>

            {/* Officer Position Sections */}
            <Box sx={{ mb: 4 }}>
              {officerPositions.map((position) => (
                <Accordion
                  key={position}
                  sx={{ mb: 2 }}
                  defaultExpanded
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'left', color: '#0033A0', textShadow: '1px 1px 0 #FFD100' }}>
                      {position}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      Selected: {votes[position] ? votes[position] : 'None'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ textAlign: 'left' }}>
                      <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <RadioGroup
                          value={votes[position] || ''}
                          onChange={(e) => handleVoteChange(position, e.target.value)}
                        >
                          {(mockCandidates[position] || []).map((candidate) => (
                            <Box key={candidate.name} sx={{ mb: 2, p: 2, border: '1px solid #FFD100', borderRadius: 1, backgroundColor: '#fff' }}>
                              <FormControlLabel
                                value={candidate.name}
                                control={<Radio />}
                                label={
                                  <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0033A0' }}>
                                      {candidate.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#0033A0' }}>
                                      {candidate.reason}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Box>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            <Divider sx={{ my: 3, bgcolor: '#0033A0' }} />

            {/* Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#0033A0', textShadow: 'none' }}>
                Summary
              </Typography>
              <Typography variant="body2" sx={{ color: '#0033A0', textShadow: 'none' }}>
                Total Votes: {getTotalNominations()}
              </Typography>
            </Box>

            {/* Submitter Name Field */}
            <Box sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              <TextField
                label="Your Name (required)"
                value={submitterName}
                onChange={e => setSubmitterName(e.target.value)}
                required
                fullWidth
                variant="outlined"
                color="primary"
                inputProps={{ maxLength: 60 }}
                sx={{ backgroundColor: '#fff' }}
              />
            </Box>

            {/* Signature Box */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#0033A0', textShadow: 'none' }}>
                Please sign to confirm your votes
              </Typography>
              <Box sx={{ 
                border: '2px solid #FFD100', 
                borderRadius: 1, 
                p: 2, 
                mb: 2,
                backgroundColor: '#fff'
              }}>
                <SignatureCanvas
                  ref={signaturePad}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas'
                  }}
                  onEnd={checkSignature}
                  onBegin={checkSignature}
                />
              </Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClearSignature}
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  borderColor: '#0033A0',
                  color: '#0033A0',
                  backgroundColor: '#fff',
                  '&:hover': {
                    backgroundColor: '#0033A0',
                    color: '#fff',
                    borderColor: '#0033A0',
                  },
                }}
              >
                Clear Signature
              </Button>
            </Box>

            {/* Submit Requirements Note */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#0033A0', fontWeight: 500 }}>
                <strong>To submit:</strong> Enter your name, at least one vote for any officer position,<br />
                <strong>and</strong> provide your signature below.
              </Typography>
            </Box>


            {/* Submit Button */}
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={handleSubmit}
              disabled={getTotalNominations() === 0 || !hasSignature() || !submitterName.trim() || isSubmitting}
              sx={{
                mb: 3,
                fontWeight: 700,
                backgroundColor: '#0033A0',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#002070',
                  color: '#FFD100',
                },
                opacity: getTotalNominations() === 0 || !hasSignature() || !submitterName.trim() || isSubmitting ? 0.5 : 1,
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Votes'}
            </Button>

            {/* Submitted Data Display */}
            {submittedData && (
              <Card sx={{ mt: 4, textAlign: 'left', border: '2px solid #FFD100' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#FFD100', textShadow: '1px 1px 0 #0033A0' }}>
                    Submitted Data:
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2, bgcolor: '#FFD100', color: '#0033A0', fontWeight: 600 }}>
                    Form submitted successfully!
                  </Alert>
                  <Box sx={{ 
                    backgroundColor: '#f5f5f5', 
                    p: 2, 
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: '400px'
                  }}>
                    <pre style={{ margin: 0, fontSize: '12px', color: '#0033A0', fontWeight: 600 }}>
                      {JSON.stringify(submittedData, null, 2)}
                    </pre>
                  </Box>
                </CardContent>
              </Card>
            )}
            {submitError && (
              <Alert severity="error" sx={{ mt: 2, bgcolor: '#FFD100', color: '#0033A0', fontWeight: 600 }}>
                {submitError}
              </Alert>
            )}
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
