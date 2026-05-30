# WebSSH Backend Server Dockerfile

FROM python:3.11-slim

LABEL maintainer="Seyyed Ali Mohammadiyeh (MAX BASE) <maxbasecode@gmail.com>"
LABEL description="WebSocket SSH Bridge Server"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssh-client \
    openssh-server \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY webssh-server.py .

# Create non-root user for security
RUN useradd -m -u 1000 webssh && \
    chown -R webssh:webssh /app

# Switch to non-root user
USER webssh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import socket; socket.create_connection(('localhost', 8000), timeout=2)"

# Run the server
CMD ["python", "webssh-server.py"]
