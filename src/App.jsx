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
  FormControl,
  Autocomplete,
  Checkbox,
  FormGroup
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

// Real candidates with their campaign statements
const mockCandidates = {
  'Consul': [
    { name: 'Max Hahn', reason: 'Bridge gap between Exec and Chapter through open/public Exec meetings including personal feedback from every member Calendar posted BEFORE every month Make bare minimums Mandatory Real rewards/punishments for contribution level Chap funded trips/formals Quarterly Brotherhood End Politics - Support Each other' },
    { name: 'Connor Carpenter', reason: 'I have been in this fraternity since Fall of 23. I have seen it rise and it fall during my time. I have seen what works and what doesn\'t. I want to bring Sigma Chi back to where it was during its peak. I would do this by using the position of Consul to open up exec and the other officer positions and make it and its decisions open to the rest of the fraternity. I want the return of Sigma Chi to be made through the voices of each of its members. I believe that we aren\'t cooked just yet and I\'ll do everything I can to bring us back.' },
    { name: 'Xander Harrison', reason: 'My hope for us as a chapter is that we recruit the right people willing to live into the values of our fraternity. Serving as a lifeguard for over 4 years, it has taught me how to efficiently lead and communicate, skills that can be carried into the Consul role.' }
  ],
  'Pro-Consul': [
    { name: 'Alex Thompson', reason: 'I embody strong core values and strive to understand every brother\'s vision, helping them grow and bring their passions to not only this fraternity but to life. I will foster chapter-wide collaboration. Favoring this over hierarchy, creating inclusive involvement through shared goals and incentives that unite our fraternity and amplify every member\'s potential.' },
    { name: 'Cooper Kyro', reason: 'Since rushing fall \'24 i\'ve always tried to do as much as I can to contribute. I\'ve made some of my closest friends here and learned a lot about positions and leadership along the way. I\'m running for Pro Consul because I want to give back and leave the fraternity in a better place, which i\'m willing to work my ass off for. I\'d focus on keeping things organized, eventful, and making sure EVERYONE feels like they have a voice in what we do. I\'ve seen some highs and lows, and I know some things i\'d like to work on. I\'d like to make committees more organized, the j board more laid out, and get people wanting to be involved, meaning ALL opinions heard and considered. I\'m committed and am ready to put in the work. Let\'s bring Sig Chi back and keep it strong.' }
  ],
  'Annotator': [
    { name: 'Cooper Kyro', reason: '' },
    { name: 'Alex Miller', reason: 'I\'m grateful for the fraternity\'s impact on my life and aim to give back through leadership as annotator or assistant magister. I bring detail, dedication, and openness to feedback. I believe in fostering brotherhood by fighting hazing and strengthening the pledge process grounded in Sigma Chi values for lasting unity.' }
  ],
  'Magister': [
    { name: 'Nic Corbo', reason: 'I\'m the right man to be Magister this fall simply because I have our core values at heart. After going to KLTW, it really changed my outlook on how important teaching our pledges the true meaning of our core values and teaching them P4B correctly. Please vote for me! Thanks' },
    { name: 'Lev Tumaykin', reason: 'This year is pivotal for Zeta Kappa. As Magister, I\'ll ensure full transparency, foster trust and open dialogue, and create experiential activities that embody Sigma Chi\'s values. The pledge process will be collaborative, with guidance from all willing brothers, uniting the chapter from bid day onward.' },
    { name: 'Cole Beeman', reason: 'After discussions with Mark and Harry, I\'m running for Magister alongside Assmag. As a fourth-year at Chap, I\'ll be able to bring an older voice to the new PC, stay highly accessible to pledges by living at Chap, and enforce our zero-hazing policy among actives. I want to make this process fun yet challenging for the pledges and get them acclimated to the house and vice versa.' }
  ],
  'Assistant Magister': [
    { name: 'Max Hahn', reason: 'I love telling people to do P4B' },
    { name: 'Alex Thompson', reason: '' },
    { name: 'Cole Beeman', reason: 'After discussions with Mark and Harry, I\'m running for Magister alongside Assmag. As a fourth-year at Chap, I\'ll be able to bring an older voice to the new PC, stay highly accessible to pledges by living at Chap, and enforce our zero-hazing policy among actives. I want to make this process fun yet challenging for the pledges and get them acclimated to the house and vice versa.' },
    { name: 'Lev Tumaykin', reason: 'This year is pivotal for Zeta Kappa. As Magister, I\'ll ensure full transparency, foster trust and open dialogue, and create experiential activities that embody Sigma Chi\'s values. The pledge process will be collaborative, with guidance from all willing brothers, uniting the chapter from bid day onward.' },
    { name: 'Oliver Andrews', reason: '' },
    { name: 'Alex Miller', reason: 'I\'m grateful for the fraternity\'s impact on my life and aim to give back through leadership as annotator or assistant magister. I bring detail, dedication, and openness to feedback. I believe in fostering brotherhood by fighting hazing and strengthening the pledge process grounded in Sigma Chi values for lasting unity.' } 
  ],
  'Quaestor': [
    { name: 'Lev Tumaykin', reason: 'As Quaestor, I\'ll ensure full financial transparency, weekly reports, and accountability for delinquency. Funds will be used wisely, prioritizing brotherhood trips like camping or sporting events. Misuse of chapter resources will have repercussions, protecting our values and members\' contributions.' },
    { name: 'Nic Corbo', reason: '' },
    { name: 'Cooper Kyro', reason: 'Though I am running for Pro Consul, I would also like to run for Quaestor. My goal is to keep our finances organized, create a solid budget given our new situation, and make spending completely transparent for everyone. I also want to change the culture around dues, making sure brothers understand exactly where their money goes and who\'s paid by using a spreadsheet. When everyone sees the value in what they\'re paying for, my hopes are that collecting dues will no longer be such a pain. I wanna track expenses closely, communicate clearly, and listen to everyone when it comes to large expenses and ideas.' }
  ],
  'Tribune': [
    { name: 'Cole Beeman', reason: '' },
    { name: 'Ben Kurland', reason: 'I believe I\'d make an excellent Tribune, having served in the role before with success. I plan to create a comprehensive Sigma Chi alumni email database for our chapter, enabling us to send targeted outreach and reconnect with more alumni. This will streamline event planning, improve communication, and strengthen alumni engagement.' },
    { name: 'Connor Carpenter', reason: '' }
  ],
  'Kustos': [
    { name: 'Xander Harrison', reason: 'After overseeing the ritual in more detail at KRACH, I gained a greater respect and ambition to perform it to the highest standard. If elected Kustos, I will do my best to ensure a smooth and well rehearsed ritual between our brotherhood.' },
    { name: 'Lev Tumaykin', reason: 'Vote lev for treasurer.' }
  ],
  'Risk-Manager': [
    { name: 'Evan Lara', reason: '' },
    { name: 'Ben Kurland', reason: 'I\'m applying for Risk Chair because I combine a strong GPA, prior leadership roles in Alumni Relations and the Judicial Board, and full-time presence in the chapter house. I\'m proactive, disciplined, and committed to keeping our house safe, upholding standards, and protecting the brotherhood we\'ve built.' }
  ],
  'Philanthropy Chair': [
    { name: 'Cole Beeman', reason: 'This role would align well with my experience in sponsorships making it easier to tie in sponsored events that raise meaningful funds. My goal would be to make philanthropy a consistent presence throughout the year, rather than limiting our efforts to just a few days each quarter, ensuring ongoing impact and engagement.' },
    { name: 'Ethan Smothers', reason: 'What\'s up, it\'s Ethan Smothers and I am running for philanthropy chair. The reason I chose to only run for the philanthropy chair is due to my passion for the role and how I plan to expand the idea of philanthropy to existing outside of derby days. Starting with derby days, I found it to be one of the most enjoyable things we did over the 2024-2025 school year, yet was disappointed with the participation from older guys as well as my own pc. Beginning with events I want it to be voted on by the chapter rather than the committee itself. I will implement forms and polls weekly during the spring in order for everyone to feel involved. With that I want to give more opportunities to people within the chapter to participate. Last year there was no form for coaching and I think that it was a bad exec decision as many people were unfairly unable to coach a team. Outside of derby days, Alex and I have already discussed an auction during parents weekend in order to raise extra funding with an alumni golf tournament to get donations as well . We will also be implementing a pickleball tournament similar to past ones with many more courts and opportunities to sign up. I think our goal should be to raise upwards of 35K. This begins with actually signing up for the huntsman page and sending the link out. I was very disappointed with the amount of huntsman accounts and donations we got. I think improving philanthropy will be a very good look to nationals and am planning a lot of events to create excitement and donations for our cause' },
    { name: 'Alex Thompson', reason: '' },
    { name: 'Cooper Kyro', reason: '' }
  ]
};

// Officer positions derived from mock candidates
const officerPositions = Object.keys(mockCandidates);

// Chapter members who can vote (real names)
const chapterMembers = [
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
].sort();

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
  const [existingVoters, setExistingVoters] = useState([]);
  const [nameWarning, setNameWarning] = useState('');

  const allMemberNames = chapterMembers;

  // Fetch existing voters on component mount
  useEffect(() => {
    fetchExistingVoters();
  }, []);

  const handleVoteChange = (position, selectedName) => {
    setVotes(prev => ({
      ...prev,
      [position]: selectedName
    }));
  };

  // Special handler for Assistant Magister (multiple selection)
  const handleAssistantMagisterChange = (candidateName, isChecked) => {
    setVotes(prev => {
      const currentSelections = prev['Assistant Magister'] || [];
      let newSelections;
      
      if (isChecked) {
        // Add if not already selected and under limit
        if (!currentSelections.includes(candidateName) && currentSelections.length < 3) {
          newSelections = [...currentSelections, candidateName];
        } else {
          newSelections = currentSelections;
        }
      } else {
        // Remove if selected
        newSelections = currentSelections.filter(name => name !== candidateName);
      }
      
      return {
        ...prev,
        'Assistant Magister': newSelections
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const signatureData = signaturePad.current ? signaturePad.current.toDataURL() : null;
      const nominationsFromVotes = Object.keys(votes).reduce((acc, position) => {
        if (position === 'Assistant Magister') {
          // Handle multiple selections for Assistant Magister
          const selectedNames = votes[position] || [];
          if (selectedNames.length > 0) {
            acc[position] = selectedNames.map(selectedName => {
              const candidate = (mockCandidates[position] || []).find(c => c.name === selectedName);
              return { name: selectedName, reason: candidate?.reason || '' };
            });
          }
        } else {
          // Handle single selections for other positions
          const selectedName = (votes[position] || '').trim();
          if (selectedName) {
            const candidate = (mockCandidates[position] || []).find(c => c.name === selectedName);
            acc[position] = [{ name: selectedName, reason: candidate?.reason || '' }];
          }
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

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(result.error || 'You have already submitted your vote.');
        }
        throw new Error(result.error || 'Failed to submit form data');
      }

      setSubmittedData(formData);
      setShowThankYou(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.message);
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
    return Object.keys(votes).filter(position => {
      if (position === 'Assistant Magister') {
        return votes[position] && votes[position].length > 0;
      }
      return votes[position] && votes[position].trim() !== '';
    }).length;
  };

  // Check if all positions have votes
  const areAllPositionsFilled = () => {
    const allPositions = Object.keys(mockCandidates);
    return allPositions.every(position => {
      if (position === 'Assistant Magister') {
        return votes[position] && votes[position].length === 3;
      }
      return votes[position] && votes[position].trim() !== '';
    });
  };

  // Get Assistant Magister validation message
  const getAssistantMagisterMessage = () => {
    const selections = votes['Assistant Magister'] || [];
    if (selections.length === 0) {
      return 'Please select exactly 3 candidates for Assistant Magister';
    } else if (selections.length < 3) {
      return `Please select ${3 - selections.length} more candidate${3 - selections.length > 1 ? 's' : ''} for Assistant Magister`;
    } else if (selections.length === 3) {
      return 'Assistant Magister selections complete ✓';
    }
    return '';
  };

  // Fetch existing voters to check for duplicates
  const fetchExistingVoters = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/voting-records`);
      if (response.ok) {
        const data = await response.json();
        const voterNames = data.records ? data.records.map(record => record.submitterName.toLowerCase()) : [];
        setExistingVoters(voterNames);
      }
    } catch (error) {
      console.error('Error fetching existing voters:', error);
    }
  };

  // Check if name has already voted
  const checkNameDuplicate = (name) => {
    const trimmedName = name.trim().toLowerCase();
    if (trimmedName && existingVoters.includes(trimmedName)) {
      setNameWarning(`${name} has already submitted their vote. Each member can only vote once.`);
      return true;
    } else {
      setNameWarning('');
      return false;
    }
  };

  // Handle name change with duplicate check
  const handleNameChange = (event, newValue) => {
    const selectedName = newValue || '';
    setSubmitterName(selectedName);
    if (selectedName) {
      checkNameDuplicate(selectedName);
    } else {
      setNameWarning('');
    }
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
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button component={Link} to="/admin" variant="outlined">Admin Dashboard</Button>
            </Box>

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
                      Selected: {
                        position === 'Assistant Magister' 
                          ? (votes[position] && votes[position].length > 0 
                              ? `${votes[position].length}/3: ${votes[position].join(', ')}` 
                              : 'None (Need 3)')
                          : (votes[position] ? votes[position] : 'None')
                      }
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ textAlign: 'left' }}>
                      {position === 'Assistant Magister' ? (
                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                          <Typography variant="body1" sx={{ mb: 2, color: '#0033A0', fontWeight: 600 }}>
                            {getAssistantMagisterMessage()}
                          </Typography>
                          <FormGroup>
                            {(mockCandidates[position] || []).map((candidate) => {
                              const isSelected = votes[position] && votes[position].includes(candidate.name);
                              const isDisabled = !isSelected && votes[position] && votes[position].length >= 3;
                              
                              return (
                                <Box key={candidate.name} sx={{ 
                                  mb: 2, 
                                  p: 2, 
                                  border: '1px solid #FFD100', 
                                  borderRadius: 1, 
                                  backgroundColor: isSelected ? '#E3F2FD' : '#fff',
                                  opacity: isDisabled ? 0.6 : 1
                                }}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={isSelected}
                                        onChange={(e) => handleAssistantMagisterChange(candidate.name, e.target.checked)}
                                        disabled={isDisabled}
                                        sx={{ color: '#0033A0' }}
                                      />
                                    }
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
                              );
                            })}
                          </FormGroup>
                        </FormControl>
                      ) : (
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
                      )}
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
              <Autocomplete
                options={allMemberNames}
                value={submitterName}
                onChange={handleNameChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Your Name (required)"
                    required
                    fullWidth
                    variant="outlined"
                    color="primary"
                    sx={{ 
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: nameWarning ? '#d32f2f' : undefined,
                        },
                      },
                    }}
                    placeholder="Search for your name..."
                    error={!!nameWarning}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <span style={{ color: '#0033A0', fontWeight: 500 }}>{option}</span>
                  </li>
                )}
              />
              {nameWarning && (
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500, mt: 1, textAlign: 'center' }}>
                  {nameWarning}
                </Typography>
              )}
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
                <strong>To submit:</strong> Enter your name, vote for ALL officer positions,<br />
                select exactly 3 candidates for Assistant Magister, <strong>and</strong> provide your signature below.
              </Typography>
              {!areAllPositionsFilled() && (
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500, mt: 1 }}>
                  All positions must be filled before submission
                </Typography>
              )}
              {nameWarning && (
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 500, mt: 1 }}>
                  {nameWarning}
                </Typography>
              )}
            </Box>


            {/* Submit Button */}
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={handleSubmit}
              disabled={!areAllPositionsFilled() || !hasSignature() || !submitterName.trim() || !!nameWarning || isSubmitting}
              sx={{
                mb: 3,
                fontWeight: 700,
                backgroundColor: '#0033A0',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#002070',
                  color: '#FFD100',
                },
                opacity: !areAllPositionsFilled() || !hasSignature() || !submitterName.trim() || !!nameWarning || isSubmitting ? 0.5 : 1,
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
