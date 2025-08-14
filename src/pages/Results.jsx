import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Divider, CircularProgress, Alert, Button } from '@mui/material';
import { getApiUrl } from '../config';
import { Link } from 'react-router-dom';

export default function Results() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/summary`);
        if (!res.ok) throw new Error('Failed to load summary');
        const data = await res.json();
        setSummary(data.summary || {});
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Voting Results
          </Typography>
          <Button component={Link} to="/" variant="outlined">Back to Voting</Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {!loading && !error && (
          <Box>
            {Object.keys(summary || {}).length === 0 && (
              <Typography>No votes yet.</Typography>
            )}
            {Object.entries(summary || {}).map(([position, candidates]) => (
              <Box key={position} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>{position}</Typography>
                <Box sx={{ pl: 2 }}>
                  {Object.entries(candidates).sort((a, b) => (b[1].count || 0) - (a[1].count || 0)).map(([name, info]) => (
                    <Box key={name} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {name} — {info.count || 0} vote{(info.count || 0) === 1 ? '' : 's'}
                      </Typography>
                      {info.reason && (
                        <Typography variant="body2" color="text.secondary">{info.reason}</Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
} 