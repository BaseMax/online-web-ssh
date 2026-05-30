# Online Web SSH

A powerful web-based SSH client that runs directly in your browser, providing a modern terminal interface for secure remote connections.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status: Active](https://img.shields.io/badge/Status-Active-green.svg)

## Features

- **Browser-based SSH Client** - No installation required, works in any modern web browser
- **Secure WebSocket Connections** - Encrypted communication with backend SSH server
- **Full Terminal Emulation** - XTerm.js provides authentic terminal experience
- **Authentication Methods**:
  - Password authentication
  - Public key (SSH) authentication
  - Passphrase-protected keys
  - TOTP / Two-factor authentication
- **Terminal Customization**:
  - Adjustable font size
  - Custom color schemes (foreground/background)
  - Multiple terminal types (xterm-256color, linux, vt100, vt220)
  - Window title customization
- **Connection Management**:
  - Connection history (stored in localStorage)
  - Quick reconnection with saved credentials
  - Auto-execute commands on connection
  - Multiple SSH key format support (PEM, OpenSSH)
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Advanced Features**:
  - Terminal resizing
  - Clipboard integration
  - Session persistence
  - Error handling and reconnection
  - Dark mode support

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend SSH server or WebSocket-to-SSH bridge

## Installation

### Option 0: Docker (Easiest - Recommended for Deployment)

The fastest way to get started with Online Web SSH using Docker:

#### Development Setup (All-in-One)

```bash
# Clone the repository
git clone https://github.com/BaseMax/online-web-ssh.git
cd online-web-ssh

# Start with Docker Compose
docker-compose up

# Access the application
# Frontend: http://localhost:8080
# Backend: ws://localhost:8000
```

Stop with `Ctrl+C`

#### Production Setup (with HTTPS)

```bash
# Generate SSL certificate (or use existing)
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Access: https://localhost
```

View logs:
```bash
docker-compose logs -f
docker-compose logs backend
```

Stop:
```bash
docker-compose down
```

**See [DOCKER.md](DOCKER.md) for detailed Docker documentation and advanced configurations.**

### Option 1: Using npm (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/BaseMax/online-web-ssh.git
cd online-web-ssh

# Install dependencies
npm install

# Download libraries to static directory
npm run download-libs

# Start development server
npm start
```

### Option 2: Manual Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/BaseMax/online-web-ssh.git
   cd online-web-ssh
   ```

2. **Download Required Libraries**

   Download the following files and place them in their respective directories:

   **JavaScript Libraries** (`static/js/`):
   - jQuery: https://code.jquery.com/jquery-3.6.0.min.js
   - Bootstrap Bundle: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js
   - XTerm.js: https://cdnjs.cloudflare.com/ajax/libs/xterm/5.2.1/xterm.min.js
   - XTerm Fit Addon: https://cdnjs.cloudflare.com/ajax/libs/xterm/5.2.1/addons/fit/xterm-addon-fit.min.js

   **CSS Libraries** (`static/css/`):
   - Bootstrap CSS: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css
   - XTerm CSS: https://cdnjs.cloudflare.com/ajax/libs/xterm/5.2.1/xterm.min.css

3. **Open in Browser**
   
   For testing, you can open `index.html` directly in a browser, but you'll need a WebSocket SSH server running. See the [Server Setup](#server-setup) section.

## Usage

### Basic Connection

1. Open the application in your browser
2. Enter the following connection details:
   - **Hostname/IP Address**: SSH server address
   - **Port**: SSH port (default: 22)
   - **Username**: Your SSH username
   - **Password**: Your password (optional)
   - **Private Key**: Upload your SSH key file (optional)
   - **Passphrase**: Key passphrase if encrypted (optional)

3. Click **Connect** to establish the connection

### Advanced Options

Expand the "Advanced Options" section to customize:
- **Font Size**: Adjust terminal text size
- **Font Color**: Change terminal text color
- **Background Color**: Change terminal background
- **Terminal Type**: Select appropriate terminal emulation
- **Window Title**: Custom title for the session
- **Auto-execute Command**: Run a command automatically after connection

### Connection History

The application automatically saves your connection details (except passwords and keys) to browser localStorage. Previously used connections can be restored using the "Reset" button or browser history.

### Using SSH Keys

1. Click on the "Private Key" file input
2. Select your SSH private key file (`.pem`, `.key` formats)
3. If your key is passphrase-protected, enter the passphrase in the "Passphrase" field
4. Click Connect

## Backend Server Setup

This is a **client-side application** (frontend). It requires a **WebSocket-to-SSH bridge server** (backend) to function.

### Quick Backend Setup

**Included in this repository**: We provide a complete Python/asyncio WebSocket SSH bridge.

#### Option 1: Docker (Recommended)

```bash
# Automatically started with docker-compose
docker-compose up

# Backend runs on ws://localhost:8000
```

#### Option 2: Manual Setup

```bash
cd server
pip install -r requirements.txt
python webssh-server.py

# Backend runs on ws://localhost:8000
```

### Alternative Backends

If you prefer different technologies:

- **WebSSH** (Python/Tornado): https://github.com/huashengyu/webssh
- **GateOne** (Python): Advanced terminal emulator and SSH client
- **Guacamole** (Java): Remote desktop gateway
- **CloudShell**: Various cloud providers offer built-in terminals

### Backend Architecture

```
┌──────────────────────────────────────────────┐
│         Web Browser (Frontend)               │
│         - HTML/CSS/JavaScript                │
│         - XTerm.js Terminal                  │
│         - WebSocket Client                   │
└─────────────────┬──────────────────────────┘
                  │
          WebSocket Connection
          (Encrypted, ws:// or wss://)
                  │
┌─────────────────▼──────────────────────────┐
│    Backend Server (Required)                │
│    - WebSocket Handler                      │
│    - SSH Client Library (paramiko)          │
│    - PTY Management                         │
│    - Session Lifecycle                      │
└─────────────────┬──────────────────────────┘
                  │
          SSH Protocol (Port 22)
                  │
┌─────────────────▼──────────────────────────┐
│      Remote SSH Server                      │
│      - Linux/Unix/Windows System            │
│      - User Authentication                  │
│      - Shell Environment                    │
└──────────────────────────────────────────────┘
```

### Backend Documentation

See [server/README.md](server/README.md) for:
- Detailed setup instructions
- Configuration options
- Security considerations
- API documentation
- Troubleshooting guide

## Project Structure

```
online-web-ssh/
├── index.html                      # Main HTML file
├── Dockerfile                      # Frontend Docker image
├── docker-compose.yml              # Development Docker setup
├── docker-compose.prod.yml         # Production Docker setup
├── nginx.conf                      # Nginx reverse proxy config
├── package.json                    # NPM configuration
├── README.md                       # Main documentation
├── QUICKSTART.md                   # Quick start guide
├── CONTRIBUTING.md                # Contribution guidelines
├── DOCKER.md                       # Docker documentation
├── LICENSE                         # MIT License
├── .gitignore                      # Git ignore file
├── scripts/
│   └── download-libs.js            # Library downloader script
├── static/
│   ├── css/
│   │   ├── style.css              # Custom styles
│   │   ├── bootstrap.min.css      # Bootstrap framework
│   │   └── xterm.min.css          # Terminal emulator CSS
│   ├── js/
│   │   ├── script.js              # Main application logic
│   │   ├── jquery.min.js          # jQuery library
│   │   ├── bootstrap.bundle.min.js # Bootstrap JS
│   │   ├── xterm.min.js           # Terminal emulator
│   │   └── xterm-addon-fit.min.js # Terminal fit addon
│   ├── fonts/                      # Custom fonts directory
│   └── img/                        # Images and icons directory
└── server/
    ├── webssh-server.py           # Backend WebSocket SSH bridge
    ├── Dockerfile                 # Backend Docker image
    ├── requirements.txt           # Python dependencies
    └── README.md                  # Server documentation
```

## Configuration

### Environment Variables

If using with a backend server, configure the following:

```javascript
// In script.js, modify the WebSocket URL construction:
var wsUrl = window.location.href.split(/\?|#/, 1)[0].replace('http', 'ws');
```

### Customization

#### Theme Colors

Edit `static/css/style.css` to customize:

```css
:root {
  --primary-color: #0d6efd;      /* Main color */
  --danger-color: #dc3545;       /* Error color */
  --success-color: #198754;      /* Success color */
  --warning-color: #ffc107;      /* Warning color */
}
```

#### Terminal Settings

Modify terminal options in `static/js/script.js`:

```javascript
var termOptions = {
  cursorBlink: true,
  cols: 80,
  rows: 24,
  fontFamily: "'Courier New', monospace",
  fontSize: 14,
  theme: {
    background: '#000000',
    foreground: '#ffffff'
  }
};
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Password Handling**: Never type passwords on untrusted networks. Use SSH keys instead.

2. **Key Files**: Your SSH keys are processed entirely in the browser. Never upload keys to untrusted services.

3. **Browser Storage**: Connection history (without passwords) is stored in browser localStorage. Clear if using public computers.

4. **HTTPS**: Always use HTTPS/WSS (secure WebSocket) in production.

5. **Backend Security**: The backend server handling SSH connections should:
   - Implement proper authentication
   - Use TLS/SSL encryption
   - Validate all user inputs
   - Log connection attempts
   - Implement rate limiting

6. **Key Permissions**: SSH keys should have proper file permissions:
   ```bash
   chmod 600 ~/.ssh/id_rsa
   ```

## Browser Support

- **Chrome/Edge**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Mobile (with limitations)

## Limitations

- Terminal sizes are limited by browser window dimensions
- Some advanced SSH features may not be available
- Audio/video redirection not supported
- X11 forwarding not available
- File transfer requires custom implementation

## Troubleshooting

### Connection Fails

1. Check hostname/IP address is correct
2. Verify SSH port is accessible (not blocked by firewall)
3. Ensure username and credentials are correct
4. Check browser console for error messages (F12)

### Terminal Not Displaying

1. Verify browser supports WebSocket (all modern browsers do)
2. Clear browser cache and reload
3. Check if JavaScript is enabled
4. Try a different browser

### Slow Performance

1. Reduce font size
2. Decrease terminal size/resolution
3. Check network latency to SSH server
4. Verify backend server performance

### Keyboard Input Not Working

1. Click on terminal area to focus it
2. Check for browser keyboard shortcuts conflicting
3. Verify SSH key permissions if using key auth
4. Check if SSH server accepts the key algorithm

## API Reference

The `wssh` global object provides the following methods:

```javascript
// Connect with parameters
wssh.connect(hostname, port, username, password, privatekey, passphrase, totp);

// Get current terminal geometry
wssh.geometry();

// Send raw command
wssh.send('ls -la\r');

// Resize terminal
wssh.resize(cols, rows);

// Set terminal colors
wssh.setBgcolor('#000000');
wssh.setFontcolor('#ffffff');

// Set encoding
wssh.setEncoding('utf-8');
```

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Download libraries
npm run download-libs

# Development server
npm run dev

# Build for production
npm run build
```

### Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Submit a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Seyyed Ali Mohammadiyeh (MAX BASE)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Related Projects

- **WebSSH** (Python): Comprehensive SSH client web server
- **GateOne** (Python): Web-based terminal and SSH client
- **XTerm.js**: Excellent terminal emulator library
- **ParamikoSSH** (Python): Pure Python SSH implementation

## Resources

- [XTerm.js Documentation](https://xtermjs.org/)
- [SSH.NET Documentation](https://sshnet.codeplex.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)
- [OpenSSH Manual](https://man.openbsd.org/ssh)

## Authors

**Seyyed Ali Mohammadiyeh (MAX BASE)**
- GitHub: [@BaseMax](https://github.com/BaseMax)
- Email: maxbasecode@gmail.com

## Support

For issues, questions, or suggestions, please:

1. Check existing [GitHub Issues](https://github.com/BaseMax/online-web-ssh/issues)
2. Create a new issue with detailed information
3. Contact the maintainers

## Changelog

### Version 1.0.0 (2024)
- Initial public release
- Full SSH client functionality
- XTerm.js integration
- Bootstrap 5 responsive UI
- SSH key and password authentication
- Color and font customization
- Mobile-responsive design
- Dark mode support

## Roadmap

- [ ] File transfer support (SFTP)
- [ ] Session recording and playback
- [ ] User authentication for web interface
- [ ] Multi-tab support
- [ ] Copy/paste history
- [ ] Terminal themes library
- [ ] Connection profiles/saved sessions
- [ ] Docker support
- [ ] Terminal sharing capability
- [ ] Performance optimization

---

**Made with ❤️ for the open source community**

*This is a community-driven project. Contributions are welcome and appreciated!*