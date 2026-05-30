# Quick Start Guide

Get started with Online Web SSH in minutes!

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js and npm (for local development)
- A backend WebSocket-to-SSH server

## Installation

### Method 1: Quick Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/BaseMax/online-web-ssh.git
cd online-web-ssh

# Install dependencies
npm install

# Download required libraries
npm run download-libs

# Start development server
npm start
```

This will open the application in your default browser at `http://localhost:8080`

### Method 2: Manual Setup

1. **Download files**:
   ```bash
   git clone https://github.com/BaseMax/online-web-ssh.git
   cd online-web-ssh
   ```

2. **Download libraries manually**:
   - jQuery: https://code.jquery.com/jquery-3.6.0.min.js
   - Bootstrap: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js
   - XTerm: https://cdnjs.cloudflare.com/ajax/libs/xterm/5.2.1/xterm.min.js
   - XTerm Fit: https://cdnjs.cloudflare.com/ajax/libs/xterm/5.2.1/addons/fit/xterm-addon-fit.min.js
   - Bootstrap CSS: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css
   - XTerm CSS: https://cdnjs.cloudflare.com/ajax/libs/xterm/5.2.1/xterm.min.css

3. **Place files in** `static/js/` and `static/css/` directories

4. **Open** `index.html` in your browser

## First Connection

### Using Password Authentication

1. Open the application
2. Fill in the connection form:
   - **Hostname**: `example.com` or `192.168.1.1`
   - **Port**: `22` (default)
   - **Username**: Your SSH username
   - **Password**: Your SSH password
3. Click **Connect**

### Using SSH Keys

1. Open the application
2. Fill in the connection form:
   - **Hostname**: SSH server address
   - **Port**: `22`
   - **Username**: Your SSH username
   - **Private Key**: Upload your `.pem` or `.key` file
   - **Passphrase**: Key password (if encrypted)
3. Click **Connect**

## Using the Terminal

Once connected, you'll have a fully functional terminal:

```bash
# List files
ls -la

# Navigate directories
cd /path/to/directory

# Edit files
nano filename.txt
vim filename.txt

# Check system info
uname -a
df -h
```

## Backend Setup

The frontend application requires a WebSocket-to-SSH bridge. See examples:

- **Python**: `examples/webssh-server.py`
- **Node.js**: Configure with your favorite WebSocket library
- **Go**: Use existing WebSSH implementations

## Advanced Features

### Custom Colors

1. Expand "Advanced Options"
2. Click on color squares to change:
   - **Font Color**: Terminal text color
   - **Background Color**: Terminal background

### Terminal Settings

- **Font Size**: Adjust text size (8-48 pixels)
- **Terminal Type**: Choose xterm variant
- **Window Title**: Custom title for your session
- **Auto Command**: Run a command automatically on connect

### Connection History

Previously used connections are saved automatically. They'll appear in:
- Form fields (username, hostname, port)
- Browser's form autofill

## Troubleshooting

### Can't Connect

- Check hostname/IP is correct
- Verify port is accessible (not blocked by firewall)
- Ensure SSH server is running
- Check username and credentials

### Terminal Blank

- Verify WebSocket connection (check browser console)
- Enable JavaScript in browser
- Try a different browser
- Clear browser cache

### Slow Performance

- Check network latency
- Reduce font size
- Close other applications
- Check SSH server load

## Common Commands

```bash
# System information
uname -a
whoami
pwd

# File operations
ls -la              # List files
mkdir new_folder    # Create directory
cp file1 file2      # Copy file
mv file1 file2      # Move/rename
rm file             # Delete file
cat filename        # View file

# Text editing
nano file.txt       # Simple editor
vim file.txt        # Advanced editor

# Permissions
chmod 644 file      # Change permissions
chown user file     # Change owner

# Search
find . -name "*.txt"
grep "search term" file

# Compression
tar -czf archive.tar.gz folder/
unzip archive.zip

# Process management
ps aux              # List processes
kill -9 PID         # Kill process
top                 # System monitor
```

## Tips & Tricks

1. **Use SSH Keys**: More secure than passwords
2. **Save Connections**: Use browser's save password feature (or note them down)
3. **Keyboard Shortcuts**: Works like any terminal (Ctrl+C, Ctrl+D, etc.)
4. **Resize Terminal**: Works automatically on window resize
5. **Copy/Paste**: Use Ctrl+C/Ctrl+V (or Cmd on Mac)

## Need Help?

- Check [README.md](README.md) for detailed documentation
- Visit [GitHub Issues](https://github.com/BaseMax/online-web-ssh/issues)
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development info
- Review [examples/webssh-server.py](examples/webssh-server.py) for backend setup

## Next Steps

1. **Set up a backend server** using the examples provided
2. **Configure HTTPS/WSS** for production use
3. **Customize styling** in `static/css/style.css`
4. **Deploy** to your web server

Happy SSH'ing! 🚀
