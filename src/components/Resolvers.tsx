/// <reference types="react" />
import { useState, useEffect } from 'react';
import { resolversApi } from '../services/api.ts';
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
  TablePagination,
  Checkbox,
  LinearProgress,
  SelectChangeEvent,
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



interface FeatureConfig {
  label: string;
  description: string;
  default: boolean;
}

interface Features {
  dnssec: boolean;
  noLogs: boolean;
  noFilter: boolean;
  ipv6: boolean;
  family: boolean;
  adblock: boolean;
}

interface Resolver {
  name: string;
  provider: string;
  protocol: 'DNSCrypt' | 'DoH';
  server: string;
  publicKey?: string;
  features: Features;
  latency: string;
  isFavorite: boolean;
  enabled: boolean;
  location: 'IPv4' | 'IPv6';
  error?: string;
}

interface SortConfig {
  key: keyof Resolver | 'latency';
  direction: 'asc' | 'desc';
}

interface NewResolverState {
  name: string;
  provider: string;
  protocol: 'DNSCrypt' | 'DoH';
  server: string;
  publicKey: string;
  features: Features;
}

// Define a single source of truth for features
const FEATURES: Record<string, FeatureConfig> = {
  dnssec: {
    label: 'DNSSEC',
    description: 'Supports DNSSEC validation',
    default: true
  },
  noLogs: {
    label: 'No Logs',
    description: 'Does not log queries',
    default: true
  },
  noFilter: {
    label: 'No Filter',
    description: 'Does not filter content',
    default: false
  },
  ipv6: {
    label: 'IPv6',
    description: 'Supports IPv6',
    default: false
  },
  family: {
    label: 'Family',
    description: 'Family-friendly filtering',
    default: false
  },
  adblock: {
    label: 'Ad Block',
    description: 'Blocks advertisements',
    default: false
  }
};

// Create default features object with default values
const DEFAULT_FEATURES: Features = Object.entries(FEATURES).reduce((acc, [key, { default: defaultValue }]) => {
  (acc as any)[key] = defaultValue;
  return acc;
}, {} as Features);

// Helper function to determine protocol from server address
const getProtocolFromServer = (server: string): 'DNSCrypt' | 'DoH' => {
  if (!server) return 'DNSCrypt';
  return server.startsWith('https://') ? 'DoH' : 'DNSCrypt';
};

// Helper function to determine features from resolver name
const getFeaturesFromName = (name: string): Features => {
  const features: Features = { ...DEFAULT_FEATURES };
  
  // Map name patterns to features
  const namePatterns: Record<string, keyof Features> = {
    nofilter: 'noFilter',
    nolog: 'noLogs',
    family: 'family',
    adblock: 'adblock',
    ipv6: 'ipv6'
  };

  Object.entries(namePatterns).forEach(([pattern, feature]) => {
    features[feature] = name.toLowerCase().includes(pattern);
  });

  // DNSSEC is enabled by default unless explicitly disabled
  features.dnssec = !name.toLowerCase().includes('nofilter');

  return features;
};

const Resolvers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [protocolFilter, setProtocolFilter] = useState<'all' | 'DNSCrypt' | 'DoH'>('all');
  const [resolvers, setResolvers] = useState<Resolver[]>([]);
  const [lbStrategy, setLbStrategy] = useState<string>('p2');
  const [lbEstimator, setLbEstimator] = useState<boolean>(true);
  const [lbEstimatorInterval, setLbEstimatorInterval] = useState<number>(300);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingResolver, setEditingResolver] = useState<Resolver | null>(null);
  const [newResolver, setNewResolver] = useState<NewResolverState>({
    name: '',
    provider: '',
    protocol: 'DNSCrypt',
    server: '',
    publicKey: '',
    features: { ...DEFAULT_FEATURES },
  });
  const [selectedResolvers, setSelectedResolvers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [featureFilters, setFeatureFilters] = useState<Features>({ ...DEFAULT_FEATURES });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });
  const [testingLatency, setTestingLatency] = useState<boolean>(false);
  const [latencyErrors, setLatencyErrors] = useState<Record<string, string>>({});
  const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
  const [importingResolvers, setImportingResolvers] = useState<Resolver[]>([]);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importStatus, setImportStatus] = useState<string>('');

  useEffect(() => {
    loadResolvers();
  }, []);

  const loadResolvers = async (): Promise<void> => {
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
    } catch (err: unknown) {
      setError('Failed to load resolvers');
      console.error('Error loading resolvers:', (err as Error));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
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
    } catch (err: unknown) {
      setError('Failed to save resolvers');
      console.error('Error saving resolvers:', (err as Error));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = (index: number): void => {
    const newResolvers = [...resolvers];
    newResolvers[index].enabled = !newResolvers[index].enabled;
    setResolvers(newResolvers);
  };

  const handleToggleFavorite = (index: number): void => {
    const newResolvers = [...resolvers];
    newResolvers[index].isFavorite = !newResolvers[index].isFavorite;
    setResolvers(newResolvers);
  };

  const handleAddResolver = (): void => {
    setEditingResolver(null);
    setNewResolver({
      name: '',
      provider: '',
      protocol: 'DNSCrypt',
      server: '',
      publicKey: '',
      features: { ...DEFAULT_FEATURES },
    });
    setOpenDialog(true);
  };

  const handleEditResolver = (resolver: Resolver): void => {
    setEditingResolver(resolver);
    setNewResolver({
      name: resolver.name,
      provider: resolver.provider,
      protocol: resolver.protocol,
      server: resolver.server || '',
      publicKey: resolver.publicKey || '',
      features: { ...DEFAULT_FEATURES, ...resolver.features },
    });
    setOpenDialog(true);
  };

  const handleSaveResolver = (): void => {
    if (editingResolver) {
      // Update existing resolver
      const index = resolvers.findIndex(r => r.name === editingResolver.name);
      if (index !== -1) {
        const newResolvers = [...resolvers];
        newResolvers[index] = {
          ...newResolvers[index],
          ...newResolver,
          location: (newResolver.features.ipv6 ? 'IPv6' : 'IPv4') as 'IPv4' | 'IPv6',
        };
        setResolvers(newResolvers);
      }
    } else {
      // Add new resolver
      const newResolverEntry = {
        ...newResolver,
        location: (newResolver.features.ipv6 ? 'IPv6' : 'IPv4') as 'IPv4' | 'IPv6',
        latency: '0 ms',
        isFavorite: false,
        enabled: true,
      };
      setResolvers([...resolvers, newResolverEntry]);
    }
    setOpenDialog(false);
  };

  const handleDeleteResolver = (index: number): void => {
    const newResolvers = [...resolvers];
    newResolvers.splice(index, 1);
    setResolvers(newResolvers);
  };

  const testResolver = async (resolver: Resolver): Promise<Resolver> => {
    try {
      const response = await fetch(`http://localhost:3000/api/resolvers/test-latency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: resolver.server,
          protocol: resolver.protocol
        })
      });
      
      const data = await response.json();
      return {
        ...resolver,
        latency: data.latency ? `${data.latency} ms` : 'Error',
        error: data.error
      };
    } catch (err: unknown) {
      return {
        ...resolver,
        latency: 'Error',
        error: (err as Error).message
      };
    }
  };

  const handleImportResolvers = async (): Promise<void> => {
    try {
      setLoading(true);
      setImportDialogOpen(true);
      setImportStatus('Fetching resolver lists...');
      setImportProgress(0);

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
          setImportStatus(`Fetching ${source.name}...`);
          const response = await fetch(source.url);
          const text = await response.text();
          
          const lines = text.split('\n');
          let currentResolver = null;
          let currentServer = '';
          let currentPublicKey = '';
          let currentProvider = '';
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('## ')) {
              if (currentResolver) {
                if (currentServer) {
                  currentResolver.server = currentServer;
                  currentResolver.publicKey = currentPublicKey;
                  currentResolver.provider = currentProvider || currentResolver.provider;
                importedResolvers.push(currentResolver);
              }
              }
              
              const name = trimmedLine.substring(3).trim();
              const features = getFeaturesFromName(name);
              const protocol = getProtocolFromServer(currentServer);
              
              currentResolver = {
                name,
                provider: name.split('-')[0].charAt(0).toUpperCase() + name.split('-')[0].slice(1),
                protocol,
                features,
                latency: '0 ms',
                isFavorite: false,
                enabled: true,
                server: '',
                publicKey: ''
              };
              currentServer = '';
              currentPublicKey = '';
              currentProvider = '';
            } else if (currentResolver) {
              if (trimmedLine.startsWith('sdns://')) {
                currentServer = trimmedLine;
                const parts = trimmedLine.split('sdns://')[1].split('.');
                if (parts.length > 1) {
                  currentPublicKey = parts[0];
                }
              } else if (trimmedLine.startsWith('https://')) {
                currentServer = trimmedLine;
              } else if (trimmedLine.startsWith('Public key:')) {
                currentPublicKey = trimmedLine.split(':')[1].trim();
              } else if (trimmedLine.startsWith('Provider:')) {
                currentProvider = trimmedLine.split(':')[1].trim();
            }
          }
          }
          
          if (currentResolver && currentServer) {
            currentResolver.server = currentServer;
            currentResolver.publicKey = currentPublicKey;
            currentResolver.provider = currentProvider || currentResolver.provider;
            importedResolvers.push(currentResolver);
          }
        } catch (err: unknown) {
          console.error(`Error importing from ${source.name}:`, (err as Error));
        }
      }

      const validResolvers = importedResolvers.filter(r => r.server);

      setImportStatus('Testing resolvers...');
      setImportingResolvers(validResolvers);

      const testedResolvers = [];
      for (let i = 0; i < validResolvers.length; i++) {
        const resolver = validResolvers[i];
        const testedResolver = await testResolver(resolver);
        testedResolvers.push(testedResolver);
        setImportProgress(((i + 1) / validResolvers.length) * 100);
      }

      setImportingResolvers(testedResolvers);
      setImportStatus('Import complete');
    } catch (err: unknown) {
      setError('Failed to import resolvers');
      console.error('Error importing resolvers:', (err as Error));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = (): void => {
    const validResolvers = importingResolvers.filter(r => !r.error);

    const existingNames = new Set(resolvers.map(r => r.name));
    const newResolvers = [
      ...resolvers,
      ...validResolvers.filter(r => !existingNames.has(r.name))
    ];

    setResolvers(newResolvers);
    setSuccess(`Successfully imported ${validResolvers.length} resolvers`);
    setImportDialogOpen(false);
  };

  const handleTestLatency = async (index: number): Promise<void> => {
    try {
      setTestingLatency(true);
      const resolver = resolvers[index];
      
      const response = await fetch(`http://localhost:3000/api/resolvers/test-latency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: resolver.server,
          protocol: resolver.protocol
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to test latency');
      }
      
      const newResolvers = [...resolvers];
      const newLatencyErrors = { ...latencyErrors };
      
      if (data.error) {
        newResolvers[index] = {
          ...newResolvers[index],
          latency: 'Error'
        };
        newLatencyErrors[resolver.name] = data.error;
      } else {
        newResolvers[index] = {
          ...newResolvers[index],
          latency: `${data.latency} ms`
        };
        delete newLatencyErrors[resolver.name];
      }
      
      setResolvers(newResolvers);
      setLatencyErrors(newLatencyErrors);
    } catch (err: unknown) {
      setError('Failed to test latency');
      console.error('Error testing latency:', (err as Error));
    } finally {
      setTestingLatency(false);
    }
  };

  const handleTestAllLatencies = async (): Promise<void> => {
    try {
      setTestingLatency(true);
      const newResolvers = [...resolvers];
      const newLatencyErrors = { ...latencyErrors };
      
      for (let i = 0; i < newResolvers.length; i++) {
        if (newResolvers[i].enabled) {
          try {
            const response = await fetch(`http://localhost:3000/api/resolvers/test-latency`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                server: newResolvers[i].server,
                protocol: newResolvers[i].protocol
              })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              if (data.error) {
                newResolvers[i] = {
                  ...newResolvers[i],
                  latency: 'Error'
                };
                newLatencyErrors[newResolvers[i].name] = data.error;
              } else {
                newResolvers[i] = {
                  ...newResolvers[i],
                  latency: `${data.latency} ms`
                };
                delete newLatencyErrors[newResolvers[i].name];
              }
            }
          } catch (err: unknown) {
            console.error(`Error testing latency for ${newResolvers[i].name}:`, (err as Error));
            newResolvers[i] = {
              ...newResolvers[i],
              latency: 'Error'
            };
            newLatencyErrors[newResolvers[i].name] = (err as Error).message;
          }
        }
      }
      
      setResolvers(newResolvers);
      setLatencyErrors(newLatencyErrors);
    } catch (err: unknown) {
      setError('Failed to test latencies');
      console.error('Error testing latencies:', (err as Error));
    } finally {
      setTestingLatency(false);
    }
  };

  const handleResolverChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedResolvers(event.target.value as string[]);
  };

  const filteredResolvers = resolvers.filter((resolver: Resolver) => {
    const matchesSearch = resolver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resolver.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProtocol = protocolFilter === 'all' || resolver.protocol === protocolFilter;
    const matchesFeatures = Object.entries(featureFilters).every(([feature, enabled]) => 
      !enabled || resolver.features[feature]
    );
    return matchesSearch && matchesProtocol && matchesFeatures;
  });

  const sortedResolvers = [...filteredResolvers].sort((a: Resolver, b: Resolver) => {
    if (sortConfig.key === 'latency') {
      const aLatency = parseInt(a.latency) || 0;
      const bLatency = parseInt(b.latency) || 0;
      return sortConfig.direction === 'asc' ? aLatency - bLatency : bLatency - aLatency;
    }
    const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
    const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';
    return sortConfig.direction === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const paginatedResolvers = sortedResolvers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (key: keyof Resolver): void => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFeatureFilterChange = (feature: keyof Features) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFeatureFilters(prev => ({
      ...prev,
      [feature]: event.target.checked
    }));
    setPage(0);
  };

  const ImportDialog = (): JSX.Element => (
    <Dialog 
      open={importDialogOpen} 
      onClose={() => setImportDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Import Resolvers</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {importStatus}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={importProgress} 
            sx={{ mb: 2 }}
          />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Protocol</TableCell>
                  <TableCell>Latency</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importingResolvers.map((resolver, index) => (
                  <TableRow key={index}>
                    <TableCell>{resolver.name}</TableCell>
                    <TableCell>{resolver.provider}</TableCell>
                    <TableCell>{resolver.protocol}</TableCell>
                    <TableCell>{resolver.latency}</TableCell>
                    <TableCell>
                      {resolver.error ? (
                        <Tooltip title={resolver.error}>
                          <span style={{ color: 'error.main', cursor: 'help' }}>Error</span>
                        </Tooltip>
                      ) : (
                        <span style={{ color: 'success.main' }}>OK</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
        <Button 
          onClick={handleConfirmImport}
          variant="contained"
          disabled={importingResolvers.length === 0}
        >
          Import Selected
        </Button>
      </DialogActions>
    </Dialog>
  );

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
                startIcon={<CloudDownloadIcon />}
                onClick={handleImportResolvers}
                disabled={loading || testingLatency}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Import
              </Button>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddResolver}
                disabled={loading || testingLatency}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Add Resolver
              </Button>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadResolvers}
                disabled={loading || testingLatency}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Refresh
              </Button>
              <Button
                startIcon={<SpeedIcon />}
                onClick={handleTestAllLatencies}
                disabled={loading || testingLatency}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                Test All Latencies
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading || testingLatency}
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
            <Grid>
              <TextField
                fullWidth
                label="Search Resolvers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
            <Grid>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Protocol</InputLabel>
                <Select
                  value={protocolFilter}
                  onChange={(e) => setProtocolFilter(e.target.value)}
                  label="Protocol"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="DNSCrypt">DNSCrypt</MenuItem>
                  <MenuItem value="DoH">DoH</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortConfig.key}
                  onChange={(e) => handleSort(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="provider">Provider</MenuItem>
                  <MenuItem value="protocol">Protocol</MenuItem>
                  <MenuItem value="latency">Latency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Features Filter:</Typography>
            <Grid container spacing={1}>
              {Object.entries(FEATURES).map(([feature, { label }]) => (
                <Grid key={feature}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={featureFilters[feature]}
                        onChange={handleFeatureFilterChange(feature)}
                        size="small"
                      />
                    }
                    label={label}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ mt: 3 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                      Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('provider')} style={{ cursor: 'pointer' }}>
                      Provider {sortConfig.key === 'provider' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('protocol')} style={{ cursor: 'pointer' }}>
                      Protocol {sortConfig.key === 'protocol' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell onClick={() => handleSort('latency')} style={{ cursor: 'pointer' }}>
                      Latency {sortConfig.key === 'latency' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedResolvers.map((resolver, index) => (
                    <TableRow key={index}>
                      <TableCell>{resolver.name}</TableCell>
                      <TableCell>{resolver.provider}</TableCell>
                      <TableCell>{resolver.protocol}</TableCell>
                      <TableCell>{resolver.location}</TableCell>
                      <TableCell>
                        {testingLatency ? (
                          <CircularProgress size={20} />
                        ) : latencyErrors[resolver.name] ? (
                          <Tooltip title={latencyErrors[resolver.name]}>
                            <span style={{ color: 'error.main', cursor: 'help' }}>Error</span>
                          </Tooltip>
                        ) : (
                          resolver.latency
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleToggleEnabled(index)} size="small">
                          {resolver.enabled ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <IconButton onClick={() => handleToggleFavorite(index)} size="small">
                          {resolver.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <IconButton onClick={() => handleEditResolver(resolver)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteResolver(index)} size="small">
                          <DeleteIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleTestLatency(index)} 
                          size="small"
                          disabled={testingLatency}
                        >
                          <SpeedIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredResolvers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Box>

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
                  <MenuItem key={resolver.name} value={resolver.name}>
                    {resolver.name}
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
              {Object.entries(FEATURES).map(([feature, { label, description }]) => (
              <FormControlLabel
                  key={feature}
                control={
                  <Switch
                      checked={newResolver.features[feature]}
                    onChange={(e) => setNewResolver({
                      ...newResolver,
                        features: { ...newResolver.features, [feature]: e.target.checked }
                    })}
                  />
                }
                  label={
                    <Tooltip title={description}>
                      <span>{label}</span>
                    </Tooltip>
                  }
                  />
              ))}
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

      <ImportDialog />
    </Box>
  );
};

export default Resolvers; 