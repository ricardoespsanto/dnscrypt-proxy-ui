# DNSCrypt-Proxy UI

A modern web interface for managing DNSCrypt-Proxy settings and monitoring logs.

## Features

- Real-time log monitoring with filtering and search
- Configuration management through a user-friendly interface
- Support for all major DNSCrypt-Proxy settings
- Dark mode support
- Responsive design

## Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- DNSCrypt-Proxy installed on your system

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dnscrypt-proxy-ui.git
cd dnscrypt-proxy-ui
```

2. Install dependencies:
```bash
npm install
```

3. Set up the configuration:
```bash
npm run setup
```
This will guide you through creating your initial configuration file. You can modify these settings later through the web interface.

## Usage

1. Start the application:
```bash
npm start
```
This will start both the backend server and frontend development server.

2. Access the web interface:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Configuration

The application uses a TOML configuration file located at `config/dnscrypt-proxy.toml`. You can:

1. Create a new configuration using the setup script:
```bash
npm run setup
```

2. Modify the configuration through the web interface:
- Navigate to the Settings tab
- Make your changes
- Click "Save Changes"

3. Manually edit the configuration file:
- The file is located at `config/dnscrypt-proxy.toml`
- A sample configuration is available at `config/dnscrypt-proxy.toml.example`

## Development

- Start the development server:
```bash
npm run dev
```

- Start the backend server:
```bash
npm run server
```

- Run tests:
```bash
npm test
```

- Format code:
```bash
npm run format
```

## Project Structure

```
dnscrypt-proxy-ui/
├── config/                 # Configuration files
├── logs/                   # Log files
├── public/                 # Static assets
├── scripts/               # Utility scripts
├── src/
│   ├── components/        # React components
│   ├── services/         # API and server code
│   ├── styles/           # CSS styles
│   └── App.jsx           # Main application component
├── .gitignore
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
