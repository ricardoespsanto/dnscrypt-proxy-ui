import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Block as BlockIcon,
  Dns as DnsIcon,
} from '@mui/icons-material';

const About = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Card>
        <CardContent>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            component="h2" 
            gutterBottom
            sx={{ fontWeight: 500 }}
          >
            About DNSCrypt-Proxy UI
          </Typography>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ mb: 4 }}
          >
            A modern web interface for managing DNSCrypt-Proxy, providing an easy way to configure and monitor your DNS encryption settings.
          </Typography>

          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ fontWeight: 500, mb: 2 }}
          >
            Key Features
          </Typography>

          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <SecurityIcon 
                  color="primary" 
                  sx={{ 
                    fontSize: isMobile ? 40 : 48,
                    mb: 1,
                  }} 
                />
                <Typography 
                  variant={isMobile ? 'subtitle2' : 'subtitle1'}
                  sx={{ fontWeight: 500, mb: 1 }}
                >
                  DNS Encryption
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  Secure your DNS queries with DNSCrypt and DoH protocols
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <SpeedIcon 
                  color="info" 
                  sx={{ 
                    fontSize: isMobile ? 40 : 48,
                    mb: 1,
                  }} 
                />
                <Typography 
                  variant={isMobile ? 'subtitle2' : 'subtitle1'}
                  sx={{ fontWeight: 500, mb: 1 }}
                >
                  Performance
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  Monitor query latency and optimize resolver selection
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <BlockIcon 
                  color="error" 
                  sx={{ 
                    fontSize: isMobile ? 40 : 48,
                    mb: 1,
                  }} 
                />
                <Typography 
                  variant={isMobile ? 'subtitle2' : 'subtitle1'}
                  sx={{ fontWeight: 500, mb: 1 }}
                >
                  Blocking
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  Manage blocklists and filter unwanted content
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <DnsIcon 
                  color="secondary" 
                  sx={{ 
                    fontSize: isMobile ? 40 : 48,
                    mb: 1,
                  }} 
                />
                <Typography 
                  variant={isMobile ? 'subtitle2' : 'subtitle1'}
                  sx={{ fontWeight: 500, mb: 1 }}
                >
                  Resolvers
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  Choose from a wide range of trusted DNS resolvers
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            gutterBottom
            sx={{ 
              fontWeight: 500, 
              mt: 4, 
              mb: 2 
            }}
          >
            Supported Resolvers
          </Typography>

          <Grid container spacing={isMobile ? 1 : 2}>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant={isMobile ? 'subtitle2' : 'subtitle1'}
                sx={{ fontWeight: 500 }}
              >
                DNSCrypt
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                paragraph
              >
                • Cloudflare
                • Quad9
                • AdGuard
                • CleanBrowsing
                • OpenDNS
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography 
                variant={isMobile ? 'subtitle2' : 'subtitle1'}
                sx={{ fontWeight: 500 }}
              >
                DNS-over-HTTPS (DoH)
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                paragraph
              >
                • Google
                • Cloudflare
                • Quad9
                • AdGuard
                • CleanBrowsing
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default About; 