import { useState, useEffect } from 'react';
import { fetchResolvers, saveResolvers } from '../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Resolvers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('any');
  const [noLogsFilter, setNoLogsFilter] = useState(false);
  const [resolvers, setResolvers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadResolvers();
  }, []);

  const loadResolvers = async () => {
    try {
      setLoading(true);
      const data = await fetchResolvers();
      const resolverList = data.server_names.map(name => {
        const isDoH = name.includes('doh');
        const isIPv6 = name.includes('ipv6');
        const isFamily = name.includes('family');
        const isAdblock = name.includes('adblock');
        
        let provider = 'Unknown';
        if (name.includes('cloudflare')) provider = 'Cloudflare';
        else if (name.includes('google')) provider = 'Google';
        else if (name.includes('quad9')) provider = 'Quad9';
        else if (name.includes('adguard')) provider = 'AdGuard';
        else if (name.includes('mullvad')) provider = 'Mullvad';
        else if (name.includes('nextdns')) provider = 'NextDNS';

        return {
          name,
          provider,
          protocol: isDoH ? 'DoH' : 'DNSCrypt',
          location: isIPv6 ? 'IPv6' : 'IPv4',
          noLogs: !name.includes('nofilter'),
          dnssec: true,
          family: isFamily,
          adblock: isAdblock,
          latency: '0 ms',
          isFavorite: false,
        };
      });
      setResolvers(resolverList);
      setError('');
    } catch (err) {
      setError('Failed to load resolvers');
      console.error('Error loading resolvers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await saveResolvers({
        server_names: resolvers.map(r => r.name),
        disabled_server_names: [],
        lb_strategy: 'p2',
        lb_estimator: true,
        lb_estimator_interval: 300
      });
      setSuccess('Resolvers saved successfully');
      setError('');
    } catch (err) {
      setError('Failed to save resolvers');
      console.error('Error saving resolvers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (index) => {
    const newResolvers = [...resolvers];
    newResolvers[index].isFavorite = !newResolvers[index].isFavorite;
    setResolvers(newResolvers);
  };

  const filteredResolvers = resolvers.filter(resolver => {
    const matchesSearch = resolver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resolver.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProtocol = protocolFilter === 'all' || resolver.protocol === protocolFilter;
    const matchesLocation = locationFilter === 'any' || resolver.location === locationFilter;
    const matchesNoLogs = !noLogsFilter || resolver.noLogs;
    return matchesSearch && matchesProtocol && matchesLocation && matchesNoLogs;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Manage Resolvers
            </Typography>
            <Box>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadResolvers}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Snackbar>

          <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Snackbar>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search resolvers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or provider..."
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Protocol</InputLabel>
                  <Select
                    value={protocolFilter}
                    onChange={(e) => setProtocolFilter(e.target.value)}
                    label="Protocol"
                  >
                    <MenuItem value="all">All Protocols</MenuItem>
                    <MenuItem value="DNSCrypt">DNSCrypt</MenuItem>
                    <MenuItem value="DoH">DoH</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    label="Location"
                  >
                    <MenuItem value="any">Any Location</MenuItem>
                    <MenuItem value="IPv4">IPv4</MenuItem>
                    <MenuItem value="IPv6">IPv6</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={noLogsFilter}
                      onChange={(e) => setNoLogsFilter(e.target.checked)}
                    />
                  }
                  label="No Logs Only"
                />
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Protocol</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Features</TableCell>
                    <TableCell>Latency</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResolvers.map((resolver, index) => (
                    <TableRow key={index}>
                      <TableCell>{resolver.provider}</TableCell>
                      <TableCell>{resolver.name}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            display: 'inline-block',
                          }}
                        >
                          {resolver.protocol}
                        </Box>
                      </TableCell>
                      <TableCell>{resolver.location}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {resolver.noLogs && (
                            <Box
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'success.light',
                                color: 'success.contrastText',
                                fontSize: '0.75rem',
                              }}
                            >
                              No Logs
                            </Box>
                          )}
                          {resolver.family && (
                            <Box
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'info.light',
                                color: 'info.contrastText',
                                fontSize: '0.75rem',
                              }}
                            >
                              Family
                            </Box>
                          )}
                          {resolver.adblock && (
                            <Box
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'warning.light',
                                color: 'warning.contrastText',
                                fontSize: '0.75rem',
                              }}
                            >
                              Adblock
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{resolver.latency}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleToggleFavorite(index)}
                          color={resolver.isFavorite ? 'warning' : 'default'}
                        >
                          {resolver.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <IconButton color="primary">
                          <LinkIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Resolvers; 