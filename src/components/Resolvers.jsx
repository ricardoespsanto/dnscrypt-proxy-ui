import { useState, useEffect } from 'react';
import { resolversApi } from '../services/api';
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
  Chip,
  OutlinedInput,
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchQuery, setSearchQuery] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('any');
  const [noLogsFilter, setNoLogsFilter] = useState(false);
  const [resolvers, setResolvers] = useState([]);
  const [lbStrategy, setLbStrategy] = useState('p2');
  const [lbEstimator, setLbEstimator] = useState(true);
  const [lbEstimatorInterval, setLbEstimatorInterval] = useState(300);
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
  const [selectedResolvers, setSelectedResolvers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadResolvers();
  }, []);

  const loadResolvers = async () => {
    try {
      setLoading(true);
      const response = await resolversApi.fetch();
      setResolvers(response.resolvers || []);
      setLbStrategy(
        typeof response.lb_strategy === 'string'
          ? response.lb_strategy.replace(/^"+|"+$/g, '')
          : 'p2'
      );
      setLbEstimator(response.lb_estimator !== undefined ? response.lb_estimator : true);
      setLbEstimatorInterval(response.lb_estimator_interval || 300);
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
      await resolversApi.save({
        resolvers,
        lb_strategy: lbStrategy,
        lb_estimator: lbEstimator,
        lb_estimator_interval: lbEstimatorInterval
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

  const handleToggleEnabled = (index) => {
    const newResolvers = [...resolvers];
    newResolvers[index].enabled = !newResolvers[index].enabled;
    setResolvers(newResolvers);
  };

  const handleToggleFavorite = (index) => {
    const newResolvers = [...resolvers];
    newResolvers[index].isFavorite = !newResolvers[index].isFavorite;
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
      features: resolver.features,
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
      const sources = [
        {
          name: 'Public Resolvers',
          url: 'https://download.dnscrypt.info/dnscrypt-resolvers/v3/public-resolvers.md',
          minisignKey: 'RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3'
        },
        {
          name: 'OpenNIC',
          url: 'https://download.dnscrypt.info/dnscrypt-resolvers/v3/opennic.md',
          minisignKey: 'RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3'
        },
        {
          name: 'Parental Control',
          url: 'https://download.dnscrypt.info/dnscrypt-resolvers/v3/parental-control.md',
          minisignKey: 'RWQf6LRCGA9i53mlYecO4IzT51TGPpvWucNSCh1CBM0QTaLn73Y7GFO3'
        }
      ];

      const importedResolvers = [];
      
      for (const source of sources) {
        try {
          const response = await fetch(source.url);
          const text = await response.text();
          
          // Parse the markdown content to extract resolver information
          const lines = text.split('\n');
          let currentResolver = null;
          
          for (const line of lines) {
            if (line.startsWith('## ')) {
              // New resolver entry
              if (currentResolver) {
                importedResolvers.push(currentResolver);
              }
              const name = line.substring(3).trim();
              currentResolver = {
                name,
                provider: name.split('-')[0].charAt(0).toUpperCase() + name.split('-')[0].slice(1),
                protocol: name.includes('doh') ? 'DoH' : 'DNSCrypt',
                location: name.includes('ipv6') ? 'IPv6' : 'IPv4',
                features: {
                  dnssec: !name.includes('nofilter'),
                  noLogs: !name.includes('nolog'),
                  noFilter: name.includes('nofilter'),
                  family: name.includes('family'),
                  adblock: name.includes('adblock'),
                  ipv6: name.includes('ipv6')
                },
                latency: '0 ms',
                isFavorite: false,
                enabled: true
              };
            } else if (currentResolver && line.startsWith('sdns://')) {
              currentResolver.server = line.trim();
            } else if (currentResolver && line.startsWith('Public key:')) {
              currentResolver.publicKey = line.split(':')[1].trim();
            }
          }
          
          // Add the last resolver
          if (currentResolver) {
            importedResolvers.push(currentResolver);
          }
        } catch (err) {
          console.error(`Error importing from ${source.name}:`, err);
        }
      }

      // Merge with existing resolvers, avoiding duplicates
      const existingNames = new Set(resolvers.map(r => r.name));
      const newResolvers = [
        ...resolvers,
        ...importedResolvers.filter(r => !existingNames.has(r.name))
      ];

      setResolvers(newResolvers);
      setSuccess(`Successfully imported ${importedResolvers.length} resolvers`);
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
    const matchesNoLogs = !noLogsFilter || resolver.features.noLogs;
    return matchesSearch && matchesProtocol && matchesLocation && matchesNoLogs;
  });

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Card>
        <CardContent>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 3,
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 2 : 0,
            }}
          >
            <Typography 
              variant={isMobile ? 'h6' : 'h5'} 
              component="h2"
              sx={{ fontWeight: 500 }}
            >
              Resolvers
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadResolvers}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Snackbar>

          <Snackbar 
            open={!!success} 
            autoHideDuration={6000} 
            onClose={() => setSuccess('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Snackbar>

          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Resolvers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="dnscrypt">DNSCrypt</MenuItem>
                  <MenuItem value="doh">DoH</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Selected Resolvers</InputLabel>
              <Select
                multiple
                value={selectedResolvers}
                onChange={handleResolverChange}
                input={<OutlinedInput label="Selected Resolvers" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size={isMobile ? 'small' : 'medium'}
                      />
                    ))}
                  </Box>
                )}
              >
                {filteredResolvers.map((resolver) => (
                  <MenuItem key={resolver} value={resolver}>
                    {resolver}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

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