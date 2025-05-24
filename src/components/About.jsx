import { Box, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  FilterList as FilterIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

const About = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            About DNSCrypt-Proxy UI
          </Typography>
          
          <Typography variant="body1" paragraph>
            DNSCrypt-Proxy UI is a modern web interface for managing DNSCrypt-Proxy, a flexible DNS proxy with support for encrypted DNS protocols including DNSCrypt v2, DNS-over-HTTPS, and Anonymized DNSCrypt.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Key Features
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Enhanced Security"
                secondary="Support for DNSCrypt v2, DNS-over-HTTPS, and Anonymized DNSCrypt protocols"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <SpeedIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Performance Optimization"
                secondary="Load balancing, caching, and automatic server selection based on latency"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <FilterIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Content Filtering"
                secondary="Built-in support for ad-blocking, malware protection, and parental controls"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <StorageIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Logging & Monitoring"
                secondary="Real-time log viewing and system status monitoring"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <SettingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Easy Configuration"
                secondary="User-friendly interface for managing all DNSCrypt-Proxy settings"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Supported Resolvers
          </Typography>
          
          <Typography variant="body2" paragraph>
            The application supports a wide range of DNS resolvers including:
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon>
                <CodeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Cloudflare" secondary="Fast and secure DNS with optional family filtering" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CodeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Google" secondary="Reliable DNS with global coverage" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CodeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Quad9" secondary="Security-focused DNS with threat blocking" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CodeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="AdGuard" secondary="Privacy-focused DNS with ad blocking" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CodeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Mullvad" secondary="Privacy-focused DNS with no logging" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CodeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="NextDNS" secondary="Customizable DNS with advanced filtering" />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            DNSCrypt-Proxy UI is built with React and Material-UI, providing a modern and responsive interface for managing your DNS settings. The application runs locally and communicates with DNSCrypt-Proxy through a secure API.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default About; 