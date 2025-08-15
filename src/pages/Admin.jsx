import { useEffect, useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  CircularProgress, 
  Alert, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getApiUrl } from '../config';
import { Link } from 'react-router-dom';

const ADMIN_PASSWORD = 'zetakappa';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Admin Access
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enter the admin password to access the dashboard
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            autoFocus
          />
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!password.trim()}
            >
              Access Dashboard
            </Button>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="large"
            >
              Back to Voting
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [votingRecords, setVotingRecords] = useState([]);
  const [adminSummary, setAdminSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const apiUrl = getApiUrl();
        
        // Fetch voting records
        const recordsRes = await fetch(`${apiUrl}/api/voting-records`);
        if (!recordsRes.ok) throw new Error('Failed to load voting records');
        const recordsData = await recordsRes.json();
        setVotingRecords(recordsData.records || []);
        
        // Fetch admin summary
        const summaryRes = await fetch(`${apiUrl}/api/admin-summary`);
        if (!summaryRes.ok) throw new Error('Failed to load admin summary');
        const summaryData = await summaryRes.json();
        setAdminSummary(summaryData.summary || {});
        setTotalSubmissions(summaryData.totalSubmissions || 0);
        
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setLoading(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setVotingRecords([]);
    setAdminSummary({});
    setError('');
    setTabValue(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getAllPositions = () => {
    return Object.keys(adminSummary);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Box>
            <Button onClick={handleLogout} variant="outlined" sx={{ mr: 1 }}>
              Logout
            </Button>
            <Button component={Link} to="/" variant="outlined">
              Back to Voting
            </Button>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Total Submissions: {totalSubmissions}
        </Alert>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Voting Records" />
          <Tab label="Complete Summary" />
        </Tabs>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}

        {!loading && !error && (
          <>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Individual Voting Records</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Submitter</strong></TableCell>
                      <TableCell><strong>Submitted At</strong></TableCell>
                      <TableCell><strong>Votes Cast</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {votingRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.submitterName}</TableCell>
                        <TableCell>{formatDate(record.submittedAt)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(record.votes).map(([position, candidate]) => (
                              <Chip 
                                key={position} 
                                label={`${position}: ${candidate}`} 
                                size="small" 
                                color="primary"
                              />
                            ))}
                            {Object.keys(record.votes).length === 0 && (
                              <Typography variant="body2" color="text.secondary">No votes cast</Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {votingRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography color="text.secondary">No voting records yet</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Complete Voting Summary</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Shows all candidates for each position, including those with 0 votes
              </Typography>
              
              <Grid container spacing={3}>
                {getAllPositions().map((position) => (
                  <Grid item xs={12} md={6} lg={4} key={position}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                        {position}
                      </Typography>
                      <Box>
                        {Object.entries(adminSummary[position] || {})
                          .sort((a, b) => (b[1].count || 0) - (a[1].count || 0))
                          .map(([candidateName, info]) => (
                            <Box key={candidateName} sx={{ 
                              mb: 1, 
                              p: 1, 
                              border: '1px solid #eee', 
                              borderRadius: 1,
                              backgroundColor: info.count > 0 ? '#f0f8ff' : '#f9f9f9'
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {candidateName}
                                </Typography>
                                <Chip 
                                  label={`${info.count || 0} votes`} 
                                  size="small" 
                                  color={info.count > 0 ? "primary" : "default"}
                                />
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </>
        )}
      </Paper>
    </Container>
  );
} 