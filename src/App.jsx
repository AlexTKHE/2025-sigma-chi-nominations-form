import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Autocomplete,
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
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SignatureCanvas from 'react-signature-canvas';
import sigmaChiLogo from './assets/sigmaChiLogo.png';
import { getGoogleAppsScriptUrl, validateConfig } from './config';
import './App.css';

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

// Sample list of names for the autocomplete
const sampleNames = [
  'Oliver Andrews',
  'Cole Beeman',
  'Connor Carpenter',
  'Nicholas (Nic) Corbo',
  'Adam Crowley',
  'Luke Dempsey',
  'CJ Eftekhari',
  'Tyler Evans',
  'Dashiell (Dash) Franklin',
  'Hershel Griffin',
  'Max Hahn',
  'Alexander (Xander) Harrison',
  'Eliot Kirschner',
  'Jace Kellet',
  'Ben Kurland',
  'Cooper Kyro',
  'Evan Lara',
  'Seamus Lubamerskey',
  'Adam Lorek',
  'Noah Malamut',
  'Alexander (Alex) Miller',
  'Jaiden Miranda',
  'Joey Murphy',
  'Colin Murphy',
  'John Nicholson',
  'James Peluso',
  'Taran Royyuru',
  'Logan Simpson',
  'Arlo Sirota',
  'Ethan Smothers',
  'Griffin Soelberg',
  'Deklan Shwartz',
  'Alexander (Alex) Thompson',
  'Nicholas (Nick) Tomlinson',
  'Lev Tumaykin',
  'Zachary (Zak) Vuncanon',
  'Grady Ward',
  'Joshua (Josh) Aruya',
  'Charlie (Charles) Lapetina',
  'Ashton Saint',
  'Ethan Saint'
];

// Officer positions
const officerPositions = [
  'Consul',
  'Pro-Consul', 
  'Annotator',
  'Magister',
  'Quaestor',
  'Tribune',
  'Kustos',
  'Risk-Manager',
  'Philanthropy Chair'
];

function App() {
  const [nominations, setNominations] = useState({});
  const [signaturePad, setSignaturePad] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [expanded, setExpanded] = useState(null); // Track which accordion is expanded
  const [submitterName, setSubmitterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleAddNomination = (position) => {
    setNominations(prev => ({
      ...prev,
      [position]: [...(prev[position] || []), { id: Date.now(), name: '' }]
    }));
  };

  const handleNominationChange = (position, id, value) => {
    setNominations(prev => ({
      ...prev,
      [position]: prev[position].map(nom => 
        nom.id === id ? { ...nom, name: value || '' } : nom
      )
    }));
  };

  const handleRemoveNomination = (position, id) => {
    setNominations(prev => ({
      ...prev,
      [position]: prev[position].filter(nom => nom.id !== id)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const signatureData = signaturePad ? signaturePad.toDataURL() : null;
      const formData = {
        submitterName,
        nominations: Object.keys(nominations).reduce((acc, position) => {
          const positionNominations = nominations[position]?.filter(nom => (nom.name || '').trim() !== '') || [];
          if (positionNominations.length > 0) {
            acc[position] = positionNominations;
          }
          return acc;
        }, {}),
        signature: signatureData,
        submittedAt: new Date().toISOString()
      };

      // Validate configuration
      if (!validateConfig()) {
        throw new Error('Google Apps Script URL not configured');
      }

      // Send data to Google Apps Script
      const response = await fetch(getGoogleAppsScriptUrl(), {
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
    if (signaturePad) {
      signaturePad.clear();
    }
  };

  const getTotalNominations = () => {
    return Object.values(nominations).reduce((total, positionNoms) => 
      total + (positionNoms?.filter(nom => (nom.name || '').trim() !== '').length || 0), 0
    );
  };

  // Helper to check if signature is present
  const hasSignature = () => {
    return signaturePad && !signaturePad.isEmpty();
  };

  // When a section is expanded, add a nomination if none exist
  const handleAccordionChange = (position) => (event, isExpanded) => {
    setExpanded(isExpanded ? position : null);
    if (isExpanded && (!nominations[position] || nominations[position].length === 0)) {
      setNominations(prev => ({
        ...prev,
        [position]: [{ id: Date.now(), name: '' }]
      }));
    }
  };

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
              Your nominations have been submitted.
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
              Sigma Chi Officer Nominations
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: '#FFD100', fontWeight: 500, textShadow: '1px 1px 0 #0033A0' }}>
              Please select individuals you would like to nominate for each officer position
            </Typography>

            {/* Officer Position Sections */}
            <Box sx={{ mb: 4 }}>
              {officerPositions.map((position) => (
                <Accordion
                  key={position}
                  sx={{ mb: 2 }}
                  expanded={expanded === position}
                  onChange={handleAccordionChange(position)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'left', color: '#0033A0', textShadow: '1px 1px 0 #FFD100' }}>
                      {position}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {nominations[position]?.filter(nom => (nom.name || '').trim() !== '').length || 0} nomination(s)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ textAlign: 'left' }}>
                      {(!nominations[position] || nominations[position].length === 0) && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Click "Add Nomination" to nominate someone for {position}
                        </Typography>
                      )}
                      
                      {nominations[position]?.map((nomination, index) => (
                        <Box key={nomination.id} sx={{ mb: 2 }}>
                          <Autocomplete
                            options={sampleNames}
                            value={nomination.name}
                            onChange={(event, newValue) => handleNominationChange(position, nomination.id, newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={`${position} Nomination ${index + 1}`}
                                placeholder="Search for a person to nominate..."
                                fullWidth
                                InputProps={{
                                  ...params.InputProps,
                                  className: (params.InputProps.className ? params.InputProps.className + ' ' : '') + 'gradient-text',
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <span style={{ color: '#0033A0', fontWeight: 500 }}>{option}</span>
                              </li>
                            )}
                          />
                          {nominations[position].length > 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleRemoveNomination(position, nomination.id)}
                              sx={{ mt: 1 }}
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      ))}
                      
                      <Button
                        variant="outlined"
                        onClick={() => handleAddNomination(position)}
                        sx={{ mt: 2 }}
                      >
                        {(!nominations[position] || nominations[position].length === 0) 
                          ? `Add ${position} Nomination` 
                          : `Add Another ${position} Nomination`}
                      </Button>
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
                Total Nominations: {getTotalNominations()}
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
                Please sign to confirm your nominations
              </Typography>
              <Box sx={{ 
                border: '2px solid #FFD100', 
                borderRadius: 1, 
                p: 2, 
                mb: 2,
                backgroundColor: '#fff'
              }}>
                <SignatureCanvas
                  ref={(ref) => setSignaturePad(ref)}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas'
                  }}
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
                <strong>To submit:</strong> Enter your name, at least one nomination for any officer position,<br />
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
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Nominations'}
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
