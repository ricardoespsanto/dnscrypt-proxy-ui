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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Speed as SpeedIcon,
  CloudDownload as CloudDownloadIcon,
  Save as SaveIcon,
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
  const [openDialog, setOpenDialog] = useState(false);
  const [editingResolver, setEditingResolver] = useState(null);
  const [newResolver, setNewResolver] = useState({
    name: '',
    provider: '',
    protocol: 'DNSCrypt',
    server: '',
    publicKey: '',
    features: {
      dnssec: true,
      noLogs: true,
      noFilter: false,
      ipv6: false,
    },
  });

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
          enabled: true,
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
        server_names: resolvers.filter(r => r.enabled).map(r => r.name),
        disabled_server_names: resolvers.filter(r => !r.enabled).map(r => r.name),
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

  const handleToggleEnabled = (index) => {
    const newResolvers = [...resolvers];
    newResolvers[index].enabled = !newResolvers[index].enabled;
    setResolvers(newResolvers);
  };

  const handleAddResolver = () => {
    setEditingResolver(null);
    setNewResolver({
      name: '',
      provider: '',
      protocol: 'DNSCrypt',
      server: '',
      publicKey: '',
      features: {
        dnssec: true,
        noLogs: true,
        noFilter: false,
        ipv6: false,
      },
    });
    setOpenDialog(true);
  };

  const handleEditResolver = (resolver) => {
    setEditingResolver(resolver);
    setNewResolver({
      name: resolver.name,
      provider: resolver.provider,
      protocol: resolver.protocol,
      server: resolver.server || '',
      publicKey: resolver.publicKey || '',
      features: {
        dnssec: resolver.dnssec,
        noLogs: resolver.noLogs,
        noFilter: !resolver.noLogs,
        ipv6: resolver.location === 'IPv6',
      },
    });
    setOpenDialog(true);
  };

  const handleSaveResolver = () => {
    if (editingResolver) {
      // Update existing resolver
      const index = resolvers.findIndex(r => r.name === editingResolver.name);
      if (index !== -1) {
        const newResolvers = [...resolvers];
        newResolvers[index] = {
          ...newResolvers[index],
          ...newResolver,
          location: newResolver.features.ipv6 ? 'IPv6' : 'IPv4',
        };
        setResolvers(newResolvers);
      }
    } else {
      // Add new resolver
      const newResolverEntry = {
        ...newResolver,
        location: newResolver.features.ipv6 ? 'IPv6' : 'IPv4',
        latency: '0 ms',
        isFavorite: false,
        enabled: true,
      };
      setResolvers([...resolvers, newResolverEntry]);
    }
    setOpenDialog(false);
  };

  const handleDeleteResolver = (index) => {
    const newResolvers = [...resolvers];
    newResolvers.splice(index, 1);
    setResolvers(newResolvers);
  };

  const handleImportResolvers = async () => {
    try {
      setLoading(true);
      // TODO: Implement resolver import from public sources
      setSuccess('Resolvers imported successfully');
    } catch (err) {
      setError('Failed to import resolvers');
      console.error('Error importing resolvers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLatency = async (index) => {
    try {
      setLoading(true);
      // TODO: Implement latency testing
      const newResolvers = [...resolvers];
      newResolvers[index].latency = '50 ms'; // Placeholder
      setResolvers(newResolvers);
    } catch (err) {
      setError('Failed to test latency');
      console.error('Error testing latency:', err);
    } finally {
      setLoading(false);
    }
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
                startIcon={<CloudDownloadIcon />}
                onClick={handleImportResolvers}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Import
              </Button>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddResolver}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Add Resolver
              </Button>
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
                startIcon={<SaveIcon />}
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
                    <TableCell>Status</TableCell>
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
                      <TableCell>
                        <Switch
                          checked={resolver.enabled}
                          onChange={() => handleToggleEnabled(index)}
                          color="primary"
                        />
                      </TableCell>
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
                          {resolver.dnssec && (
                            <Tooltip title="DNSSEC">
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
                                DNSSEC
                              </Box>
                            </Tooltip>
                          )}
                          {resolver.noLogs && (
                            <Tooltip title="No Logs">
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
                                No Logs
                              </Box>
                            </Tooltip>
                          )}
                          {resolver.family && (
                            <Tooltip title="Family Filter">
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
                                Family
                              </Box>
                            </Tooltip>
                          )}
                          {resolver.adblock && (
                            <Tooltip title="Ad Blocking">
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: 'error.light',
                                  color: 'error.contrastText',
                                  fontSize: '0.75rem',
                                }}
                              >
                                AdBlock
                              </Box>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {resolver.latency}
                          <Tooltip title="Test Latency">
                            <IconButton
                              size="small"
                              onClick={() => handleTestLatency(index)}
                              disabled={loading}
                            >
                              <SpeedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={resolver.isFavorite ? "Remove from favorites" : "Add to favorites"}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleFavorite(index)}
                            >
                              {resolver.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditResolver(resolver)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteResolver(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Resolver Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingResolver ? 'Edit Resolver' : 'Add New Resolver'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={newResolver.name}
              onChange={(e) => setNewResolver({ ...newResolver, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Provider"
              value={newResolver.provider}
              onChange={(e) => setNewResolver({ ...newResolver, provider: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Protocol</InputLabel>
              <Select
                value={newResolver.protocol}
                onChange={(e) => setNewResolver({ ...newResolver, protocol: e.target.value })}
                label="Protocol"
              >
                <MenuItem value="DNSCrypt">DNSCrypt</MenuItem>
                <MenuItem value="DoH">DoH</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Server Address"
              value={newResolver.server}
              onChange={(e) => setNewResolver({ ...newResolver, server: e.target.value })}
              fullWidth
              required
              placeholder={newResolver.protocol === 'DNSCrypt' ? 'sdns://...' : 'https://...'}
            />
            {newResolver.protocol === 'DNSCrypt' && (
              <TextField
                label="Public Key"
                value={newResolver.publicKey}
                onChange={(e) => setNewResolver({ ...newResolver, publicKey: e.target.value })}
                fullWidth
                required
              />
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newResolver.features.dnssec}
                    onChange={(e) => setNewResolver({
                      ...newResolver,
                      features: { ...newResolver.features, dnssec: e.target.checked }
                    })}
                  />
                }
                label="DNSSEC"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newResolver.features.noLogs}
                    onChange={(e) => setNewResolver({
                      ...newResolver,
                      features: { ...newResolver.features, noLogs: e.target.checked }
                    })}
                  />
                }
                label="No Logs"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newResolver.features.noFilter}
                    onChange={(e) => setNewResolver({
                      ...newResolver,
                      features: { ...newResolver.features, noFilter: e.target.checked }
                    })}
                  />
                }
                label="No Filter"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newResolver.features.ipv6}
                    onChange={(e) => setNewResolver({
                      ...newResolver,
                      features: { ...newResolver.features, ipv6: e.target.checked }
                    })}
                  />
                }
                label="IPv6"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveResolver} variant="contained">
            {editingResolver ? 'Save Changes' : 'Add Resolver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Resolvers; 