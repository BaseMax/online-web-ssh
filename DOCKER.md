# Docker Setup Guide

Deploy Online Web SSH using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- (Optional) SSL certificates for HTTPS

## Quick Start

### Development Setup

```bash
# Clone the repository
git clone https://github.com/BaseMax/online-web-ssh.git
cd online-web-ssh

# Start the application
docker-compose up

# Access the application
# Frontend: http://localhost:8080
# Backend: ws://localhost:8000
```

Press `Ctrl+C` to stop.

### Production Setup

```bash
# Generate SSL certificates (if not using Let's Encrypt)
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes

# Start with production compose file
docker-compose -f docker-compose.prod.yml up -d

# Access the application
# https://your-domain.com
# wss://your-domain.com/ws
```

## Docker Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network                        │
│                   (webssh-network)                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Nginx      │  │   Frontend   │  │   Backend    │  │
│  │ (Reverse     │──│  (Node.js/   │──│  (Python/    │  │
│  │  Proxy)      │  │  http-server)│  │  asyncio)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│      Port 80,443       Port 8080        Port 8000       │
│      (Production)                                        │
└─────────────────────────────────────────────────────────┘
```

## Compose Files

### docker-compose.yml (Development)

Simple 2-container setup:
- **frontend**: Web interface (Node.js HTTP server)
- **backend**: WebSocket SSH bridge (Python/asyncio)

Perfect for development and testing.

```bash
docker-compose up
```

### docker-compose.prod.yml (Production)

Production-ready setup with 3 containers:
- **nginx**: Reverse proxy with SSL/TLS
- **frontend**: Web interface
- **backend**: WebSocket SSH bridge

Includes:
- SSL/TLS encryption
- Rate limiting
- Security headers
- Load balancing
- Health checks

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Individual Container Usage

### Build Frontend

```bash
# Build the image
docker build -t webssh-frontend .

# Run the container
docker run -d \
  --name webssh-frontend \
  -p 8080:8080 \
  webssh-frontend

# View logs
docker logs -f webssh-frontend

# Stop and remove
docker stop webssh-frontend
docker rm webssh-frontend
```

### Build Backend

```bash
# Build the image
docker build -t webssh-backend ./server

# Run the container
docker run -d \
  --name webssh-backend \
  -p 8000:8000 \
  -e LOG_LEVEL=INFO \
  webssh-backend

# View logs
docker logs -f webssh-backend

# Stop and remove
docker stop webssh-backend
docker rm webssh-backend
```

### Run Both with Networking

```bash
# Create a network
docker network create webssh-net

# Run backend
docker run -d \
  --name webssh-backend \
  --network webssh-net \
  webssh-backend

# Run frontend
docker run -d \
  --name webssh-frontend \
  --network webssh-net \
  -p 8080:8080 \
  webssh-frontend
```

## Configuration

### Environment Variables

#### Frontend
```env
HOST=0.0.0.0          # Listen on all interfaces
PORT=8080             # HTTP port
BACKEND_URL=ws://...  # Backend WebSocket URL
```

#### Backend
```env
LOG_LEVEL=INFO        # Logging level
PYTHONUNBUFFERED=1    # Unbuffered output
```

### Passing Environment Variables

#### docker-compose.yml
```yaml
services:
  backend:
    environment:
      - LOG_LEVEL=DEBUG
      - PYTHONUNBUFFERED=1
```

#### Docker run
```bash
docker run -d \
  -e LOG_LEVEL=DEBUG \
  -e PYTHONUNBUFFERED=1 \
  webssh-backend
```

## Volume Mounting

### SSH Keys (Optional)

For production, mount SSH keys from host:

```yaml
services:
  backend:
    volumes:
      - ~/.ssh:/home/webssh/.ssh:ro
```

Or with docker run:

```bash
docker run -d \
  -v ~/.ssh:/root/.ssh:ro \
  webssh-backend
```

### Custom Configuration

```yaml
services:
  backend:
    volumes:
      - ./webssh-server.py:/app/webssh-server.py:ro
```

## SSL/TLS Certificates

### Option 1: Self-Signed Certificate

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:4096 \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -days 365 -nodes
```

### Option 2: Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com
```

Copy certificates to `certs/` directory:

```bash
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/key.pem
```

## Container Management

### View Running Containers

```bash
docker-compose ps
# or
docker ps
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend

# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Scale Services

```bash
# Run multiple backend instances
docker-compose up --scale backend=3

# Note: Requires load balancing configuration
```

### Execute Commands in Container

```bash
# Interactive shell
docker-compose exec backend bash

# Run specific command
docker-compose exec backend python -c "print('test')"
```

### Remove Resources

```bash
# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Networking

### Port Mapping

```yaml
services:
  frontend:
    ports:
      - "8080:8080"        # Host:Container
      - "127.0.0.1:8080:8080"  # Localhost only
```

### Custom Networks

```yaml
networks:
  webssh-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.25.0.0/16
```

Service to service communication:

```python
# In backend
websocket_url = "ws://frontend:8080"
```

## Health Checks

All services include health checks:

```bash
# View health status
docker-compose ps

# HEALTHCHECK instruction in Dockerfile
docker inspect webssh-backend
```

## Logging

### Docker Logging Driver

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### View Logs

```bash
docker logs webssh-backend
docker logs --since 1h webssh-backend
docker logs --follow webssh-backend
```

## Performance Optimization

### Resource Limits

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Restart Policies

```yaml
services:
  backend:
    restart: unless-stopped
    # Options: no, always, unless-stopped, on-failure
```

## Security Best Practices

1. **Use HTTPS/WSS**:
   - Enable SSL certificates
   - Use nginx reverse proxy
   - Security headers configured

2. **Run as Non-Root**:
   - Both containers run as user `webssh` (uid 1000)
   - No privilege escalation

3. **Network Isolation**:
   - Use internal Docker network
   - Only expose necessary ports

4. **Image Security**:
   - Use specific version tags
   - Minimal base images (alpine)
   - Regular updates

5. **Secrets Management**:
   - Use Docker secrets for production
   - Environment files for sensitive data

### Docker Secrets Example

```bash
# Create secret
echo "my-secret-password" | docker secret create ssh_password -

# Use in compose
services:
  backend:
    secrets:
      - ssh_password
    environment:
      - SSH_PASSWORD_FILE=/run/secrets/ssh_password
```

## Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker-compose logs

# Check image
docker images

# Rebuild
docker-compose build --no-cache
docker-compose up
```

### Can't Connect to Backend

```bash
# Check network
docker network inspect webssh-network

# Ping service
docker-compose exec frontend ping backend

# Check ports
docker-compose ps
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase limits
docker-compose down
# Edit docker-compose.yml
docker-compose up
```

### SSL Certificate Issues

```bash
# Verify certificate
openssl x509 -in certs/cert.pem -text -noout

# Check nginx
docker-compose logs nginx | grep ssl

# Regenerate
rm certs/*
openssl req -x509 -newkey rsa:4096 ...
docker-compose restart nginx
```

## Advanced Configuration

### Custom Dockerfile

Extend the base images:

```dockerfile
FROM webssh-frontend as custom

# Add custom dependencies
RUN npm install custom-package

COPY custom-script.js /app/
```

### Multi-Stage Builds

Reduce image size:

```dockerfile
FROM node:20 as builder
RUN npm install

FROM node:20-alpine
COPY --from=builder /app /app
```

## Kubernetes Deployment

Convert docker-compose to Kubernetes:

```bash
# Install kompose
sudo curl -L https://github.com/kubernetes/kompose/releases/download/v1.26.0/kompose-linux-amd64 -o /usr/local/bin/kompose
sudo chmod +x /usr/local/bin/kompose

# Convert
kompose convert

# Deploy
kubectl apply -f webssh-frontend-service.yaml
kubectl apply -f webssh-backend-service.yaml
```

## Monitoring

### Prometheus Metrics

Add to backend:

```python
from prometheus_client import Counter, Histogram

connections = Counter('webssh_connections', 'SSH connections')
latency = Histogram('webssh_latency', 'Connection latency')
```

### Log Aggregation

With ELK Stack:

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0

  backend:
    logging:
      driver: "splunk"
      options:
        splunk-token: "your-token"
        splunk-url: "https://splunk-server:8088"
```

## Support

For issues:
- GitHub Issues: https://github.com/BaseMax/online-web-ssh/issues
- Docker Hub: https://hub.docker.com/

## License

MIT License - See LICENSE file for details
