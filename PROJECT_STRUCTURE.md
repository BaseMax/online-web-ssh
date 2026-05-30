# Project Structure - Online Web SSH

Complete overview of the Online Web SSH project structure, components, and organization.

## Directory Tree

```
online-web-ssh/
│
├── 📄 index.html                    # Main web interface
├── 📄 package.json                  # NPM dependencies and scripts
├── 📄 LICENSE                       # MIT License (2024)
├── 📄 .gitignore                    # Git ignore patterns
│
├── 📦 Containerization (Docker)
│   ├── Dockerfile                   # Frontend Docker image
│   ├── docker-compose.yml           # Development (2 containers)
│   ├── docker-compose.prod.yml      # Production (3 containers + nginx)
│   └── nginx.conf                   # Nginx reverse proxy config
│
├── 📚 Documentation
│   ├── README.md                    # Main documentation (800+ lines)
│   ├── QUICKSTART.md                # Quick start guide
│   ├── DOCKER.md                    # Docker setup guide (600+ lines)
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   └── PROJECT_STRUCTURE.md         # This file
│
├── 🎨 Frontend (Client-side)
│   └── static/
│       ├── css/
│       │   ├── style.css            # Custom styles (1000+ lines)
│       │   ├── bootstrap.min.css    # Bootstrap 5 framework
│       │   └── xterm.min.css        # Terminal emulator styles
│       ├── js/
│       │   ├── script.js            # Main app logic (650+ lines)
│       │   ├── jquery.min.js        # jQuery library
│       │   ├── bootstrap.bundle.min.js
│       │   ├── xterm.min.js         # Terminal emulator
│       │   └── xterm-addon-fit.min.js # Terminal resizing
│       ├── fonts/                   # Custom fonts (directory)
│       └── img/                     # Images and icons (directory)
│
├── 🖥️ Backend (Server-side)
│   └── server/
│       ├── webssh-server.py         # WebSocket SSH bridge (270+ lines)
│       ├── Dockerfile               # Backend Docker image
│       ├── requirements.txt         # Python dependencies
│       └── README.md                # Backend documentation
│
└── 🔧 Scripts
    └── scripts/
        └── download-libs.js         # Library downloader script
```

## Component Breakdown

### 1. Frontend (Client-Side)

**Location**: Root directory + `static/` folder

**Files**:
- `index.html` - Modern, responsive UI with SSH connection form
- `static/css/style.css` - Professional styling with dark mode
- `static/js/script.js` - Full SSH client implementation
- Library files (jQuery, Bootstrap, XTerm.js)

**Technologies**:
- HTML5 for semantic markup
- CSS3 with custom properties and animations
- Vanilla JavaScript (no frameworks)
- XTerm.js for terminal emulation
- Bootstrap 5 for responsive design

**Features**:
- SSH connection form with validation
- Password and key-based authentication
- TOTP/2FA support
- Terminal customization (fonts, colors)
- Connection history via localStorage
- Responsive design (mobile-first)

### 2. Backend (Server-Side)

**Location**: `server/` directory

**Files**:
- `webssh-server.py` - WebSocket SSH bridge (Python/asyncio)
- `Dockerfile` - Backend containerization
- `requirements.txt` - Python dependencies
- `README.md` - Backend documentation

**Technologies**:
- Python 3.8+
- asyncio for async I/O
- websockets library
- paramiko for SSH

**Features**:
- WebSocket server for client connections
- SSH client with paramiko
- Terminal I/O management
- PTY allocation and resizing
- Error handling and logging
- Docker containerization

### 3. Docker & Deployment

**Development Setup** (`docker-compose.yml`):
```
Frontend (Node HTTP) ←→ Backend (Python/asyncio)
       :8080                   :8000
```

**Production Setup** (`docker-compose.prod.yml`):
```
                    ↓
                 Nginx
              (Reverse Proxy)
              SSL/TLS, Rate Limiting
              :80, :443
                    ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
Frontend (Node HTTP)        Backend (Python)
      :8080                      :8000
```

### 4. Documentation

| File | Purpose | Content |
|------|---------|---------|
| `README.md` | Main guide | Features, installation, usage, API reference |
| `QUICKSTART.md` | Fast setup | Quick instructions for first-time users |
| `DOCKER.md` | Container guide | Docker, docker-compose, deployment |
| `CONTRIBUTING.md` | Dev guide | Contributing, code style, PR process |
| `server/README.md` | Backend docs | Server setup, API, security, troubleshooting |
| `PROJECT_STRUCTURE.md` | This file | Architecture and organization |

## File Statistics

### Code Files
- `index.html`: ~250 lines
- `static/js/script.js`: ~650 lines
- `static/css/style.css`: ~1000 lines
- `server/webssh-server.py`: ~270 lines

### Configuration Files
- `package.json`: Dependencies and scripts
- `docker-compose.yml`: Development containers
- `docker-compose.prod.yml`: Production setup
- `nginx.conf`: Reverse proxy config
- `Dockerfile` (frontend): Frontend containerization
- `server/Dockerfile`: Backend containerization
- `server/requirements.txt`: Python dependencies

### Documentation
- `README.md`: ~800 lines
- `DOCKER.md`: ~600 lines
- `CONTRIBUTING.md`: ~400 lines
- `QUICKSTART.md`: ~200 lines
- `server/README.md`: ~300 lines

### Total
- **Code**: ~2000 lines
- **Configuration**: 400+ lines
- **Documentation**: 2300+ lines
- **Libraries**: ~800 KB (external)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │              Frontend (index.html)                     ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  ││
│  │  │  HTML Form   │  │   XTerm.js   │  │  Bootstrap  │  ││
│  │  │   (SSH UI)   │  │  (Terminal)  │  │   Styling   │  ││
│  │  └──────────────┘  └──────────────┘  └─────────────┘  ││
│  └────────────┬───────────────────────────────────────────┘│
│               │                                             │
│      WebSocket Connection (ws:// or wss://)                │
│               │                                             │
└───────────────┼─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                  Backend Server                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │        WebSSH Server (webssh-server.py)               ││
│  │                                                        ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  ││
│  │  │  WebSocket   │  │  SSH Client  │  │   PTY      │  ││
│  │  │   Handler    │  │  (paramiko)  │  │ Management │  ││
│  │  └──────────────┘  └──────────────┘  └────────────┘  ││
│  └────────────┬───────────────────────────────────────────┘│
│               │                                             │
│          SSH Protocol (Port 22)                             │
│               │                                             │
└───────────────┼─────────────────────────────────────────────┘
                │
        ┌───────▼─────────┐
        │  Remote SSH     │
        │  Servers        │
        │  (Linux/Unix)   │
        └─────────────────┘
```

## Development Workflow

### 1. **Frontend Development**
   - Edit `index.html` for structure
   - Modify `static/css/style.css` for styling
   - Update `static/js/script.js` for functionality

### 2. **Backend Development**
   - Modify `server/webssh-server.py`
   - Update `server/requirements.txt` if adding dependencies
   - Update `server/README.md` with changes

### 3. **Testing Locally**
   ```bash
   # With Node
   npm install
   npm start
   
   # Backend separately
   cd server
   pip install -r requirements.txt
   python webssh-server.py
   ```

### 4. **Docker Testing**
   ```bash
   # Development containers
   docker-compose up
   
   # Production containers
   docker-compose -f docker-compose.prod.yml up
   ```

### 5. **Git Workflow**
   ```bash
   git checkout -b feature/name
   # Make changes
   git add .
   git commit -m "Description"
   git push origin feature/name
   # Create Pull Request
   ```

## Key Technologies

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript**: Vanilla JS (no frameworks)
- **XTerm.js**: Terminal emulation (5.2.1)
- **Bootstrap**: CSS framework (5.3.0)
- **jQuery**: DOM manipulation (3.6.0)

### Backend
- **Python 3.8+**: Server language
- **asyncio**: Async I/O framework
- **websockets**: WebSocket implementation
- **paramiko**: SSH client library

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Container orchestration
- **Nginx**: Reverse proxy (production)
- **Node.js**: HTTP server (frontend)

## Security Architecture

```
┌─────────────────────────────────────────┐
│      TLS/SSL Encryption Layer           │
│    (nginx in production setup)           │
└─────────┬───────────────────────────────┘
          │
    ┌─────▼──────────────┐
    │  WebSocket Layer   │
    │  (Secure Channel)  │
    └─────┬──────────────┘
          │
    ┌─────▼──────────────────┐
    │  Frontend (Browser)    │
    │  - No credential storage│
    │  - LocalStorage only   │
    └─────┬──────────────────┘
          │
    ┌─────▼──────────────────┐
    │  Backend Server        │
    │  - Non-root user       │
    │  - Rate limiting       │
    │  - Input validation    │
    │  - Error handling      │
    └─────┬──────────────────┘
          │
    ┌─────▼──────────────────┐
    │  SSH Connection        │
    │  - Standard SSH port   │
    │  - Key or password     │
    │  - Full SSH protocol   │
    └────────────────────────┘
```

## Environment Setup

### Development
- **Frontend**: `npm` with `http-server`
- **Backend**: Python with `pip`
- **Database**: None (stateless)
- **Cache**: Browser localStorage only

### Production (Docker)
- **Frontend Container**: Node.js HTTP server
- **Backend Container**: Python/asyncio
- **Reverse Proxy**: Nginx with SSL/TLS
- **Network**: Docker internal bridge network
- **Health Checks**: Built-in for all services

## Deployment Options

### 1. Local Development
```bash
npm start  # Frontend
python server/webssh-server.py  # Backend
```

### 2. Docker Development
```bash
docker-compose up
```

### 3. Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Cloud Platforms
- **AWS**: ECS, App Runner, Fargate
- **Azure**: Container Instances, App Service
- **GCP**: Cloud Run, Cloud Build
- **DigitalOcean**: App Platform, Droplets
- **Heroku**: Container Registry

### 5. Kubernetes
```bash
kompose convert  # From docker-compose
kubectl apply -f *.yaml
```

## Performance Metrics

- **Frontend Bundle**: ~1.5 MB (libraries included)
- **Backend Memory**: ~50 MB base
- **Average Connection**: 200-500 KB/s
- **Terminal Latency**: <100ms (local)
- **Concurrent Connections**: Limited by system resources

## Future Improvements

### Short Term
- [ ] SFTP file transfer
- [ ] Session recording
- [ ] Terminal themes library
- [ ] Connection profiles

### Medium Term
- [ ] Multi-tab support
- [ ] User authentication (backend)
- [ ] Session management
- [ ] Admin dashboard

### Long Term
- [ ] RDP/VNC support
- [ ] Terminal sharing
- [ ] Plugin system
- [ ] Advanced analytics

## Support & Resources

- **Documentation**: See all `.md` files
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: maxbasecode@gmail.com
- **Repository**: https://github.com/BaseMax/online-web-ssh

## License

MIT License - See [LICENSE](LICENSE) file for details

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintained By**: Seyyed Ali Mohammadiyeh (MAX BASE)
