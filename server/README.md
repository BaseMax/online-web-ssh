# WebSSH Backend Server

This directory contains the backend WebSocket-to-SSH bridge server that the Online Web SSH frontend communicates with.

## Overview

The `webssh-server.py` is a Python asyncio-based WebSocket server that:
- Accepts WebSocket connections from the web frontend
- Bridges WebSocket communication to SSH servers
- Handles terminal I/O and PTY resizing
- Manages authentication and session lifecycle

## Requirements

- Python 3.8+
- websockets library
- paramiko library (SSH client)

## Installation

### Option 1: Using pip

```bash
cd server
pip install -r requirements.txt
```

### Option 2: Using Docker

```bash
docker-compose up
```

## Running the Server

### Standalone Mode

```bash
python webssh-server.py
```

The server will listen on `ws://localhost:8000`

### With Docker

```bash
docker build -t webssh-backend .
docker run -p 8000:8000 webssh-backend
```

### With Docker Compose

```bash
docker-compose up
```

This starts:
- Frontend on `http://localhost:8080`
- Backend on `ws://localhost:8000`

## Configuration

Edit `webssh-server.py` to customize:

```python
# Change host and port
server = SSHWebSocketServer(host='0.0.0.0', port=8000)
```

## Architecture

```
┌─────────────────────────────────────┐
│   Web Browser (Online Web SSH)      │
│   - HTML Form                       │
│   - XTerm.js Terminal               │
│   - WebSocket Client                │
└──────────────────┬──────────────────┘
                   │
         WebSocket (encrypted)
                   │
┌──────────────────▼──────────────────┐
│  WebSSH Server (Python/asyncio)     │
│  - WebSocket Handler                │
│  - SSH Client (paramiko)            │
│  - PTY Management                   │
│  - Session Lifecycle                │
└──────────────────┬──────────────────┘
                   │
            SSH Protocol (22)
                   │
┌──────────────────▼──────────────────┐
│   Remote SSH Server                 │
│   - Linux/Unix System               │
│   - Authentication                  │
│   - Terminal Emulation              │
└─────────────────────────────────────┘
```

## API Protocol

### Connection Message

```json
{
  "connect": {
    "hostname": "example.com",
    "port": 22,
    "username": "user",
    "password": "pass",
    "cols": 80,
    "rows": 24
  }
}
```

### Terminal Data

```json
{
  "data": "ls -la\r"
}
```

### Resize Terminal

```json
{
  "resize": [120, 40]
}
```

## Features

- ✅ Password authentication
- ✅ SSH key authentication (with passphrase support)
- ✅ Interactive shell (PTY allocation)
- ✅ Terminal resizing
- ✅ Proper connection lifecycle management
- ✅ Error handling and logging
- ✅ UTF-8 encoding support

## Security Considerations

### Important

1. **Use HTTPS/WSS in Production**:
   ```bash
   # Generate SSL certificate
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
   
   # Use with WebSocket Secure (wss://)
   ```

2. **Firewall**: Restrict WebSocket connections to trusted networks
3. **Authentication**: Implement proper user authentication before allowing SSH
4. **Logging**: Monitor connection attempts and failures
5. **Rate Limiting**: Implement rate limiting to prevent brute force attacks
6. **SSH Keys**: Don't store SSH credentials on the server, accept them from frontend

### Example with SSL

```python
import ssl

# Create SSL context
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain('cert.pem', 'key.pem')

# Create server with SSL
async with websockets.serve(
    handle_client, 
    '0.0.0.0', 
    8000,
    ssl=ssl_context
):
    await asyncio.Future()
```

## Troubleshooting

### Server won't start

```bash
# Check if port is in use
lsof -i :8000

# Use different port
# Edit webssh-server.py: SSHWebSocketServer(port=9000)
```

### Connection refused

- Ensure SSH server is running and accessible
- Check firewall rules
- Verify hostname/IP and port

### Authentication fails

- Verify credentials
- Check SSH server logs
- Ensure user account exists

### Terminal output is garbled

- Check encoding (should be UTF-8)
- Verify SSH server terminal settings
- Try different terminal type

## Performance Tips

1. **Optimize PTY Size**: Larger terminals use more bandwidth
2. **Rate Limit Output**: Implement flow control for large outputs
3. **Connection Pooling**: Reuse SSH connections when possible
4. **Async Processing**: The server is fully async - scales well

## Deployment

### Docker Production Setup

```yaml
version: '3.8'
services:
  webssh-backend:
    build: ./server
    ports:
      - "8000:8000"
    environment:
      - WEBSSH_HOST=0.0.0.0
      - WEBSSH_PORT=8000
    restart: unless-stopped
    networks:
      - webssh-network
    healthcheck:
      test: ["CMD", "python", "-c", "import websockets; print('ok')"]
      interval: 30s
      timeout: 10s
      retries: 3

  webssh-frontend:
    build: .
    ports:
      - "8080:80"
    depends_on:
      - webssh-backend
    restart: unless-stopped
    networks:
      - webssh-network

networks:
  webssh-network:
    driver: bridge
```

### Nginx Reverse Proxy

```nginx
upstream webssh_backend {
    server localhost:8000;
}

server {
    listen 443 ssl http2;
    server_name webssh.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
    }

    location /ws {
        proxy_pass http://webssh_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

## Development

### Adding Features

1. **New Authentication Method**:
   ```python
   def connect_with_key_file(self, key_path, passphrase=None):
       # Implementation
   ```

2. **SSH Protocol Features**:
   - SCP file transfer
   - Port forwarding
   - Agent forwarding

3. **WebSocket Features**:
   - Message compression
   - Binary data support
   - Custom protocols

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/BaseMax/online-web-ssh/issues
- Discussions: https://github.com/BaseMax/online-web-ssh/discussions

## Related Documentation

- [XTerm.js Docs](https://xtermjs.org/)
- [Paramiko Docs](https://www.paramiko.org/)
- [asyncio Tutorial](https://docs.python.org/3/library/asyncio.html)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
