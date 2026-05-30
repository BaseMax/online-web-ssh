#!/usr/bin/env python3
"""
Example WebSSH Server - WebSocket SSH Bridge

This is a simple example of how to create a WebSocket-to-SSH bridge
that can be used with the Online Web SSH client.

Requirements:
    pip install websockets paramiko

Usage:
    python webssh-server.py

The server will listen on http://localhost:8000
"""

import asyncio
import json
import logging
import os
import sys
import paramiko
import threading
from datetime import datetime

try:
    import websockets
    from websockets.server import WebSocketServerProtocol
except ImportError:
    print("Error: websockets library not installed")
    print("Install with: pip install websockets paramiko")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SSHClient:
    """Manages SSH connection and terminal I/O"""

    def __init__(self, hostname, port, username, password=None, key_file=None):
        self.hostname = hostname
        self.port = port
        self.username = username
        self.password = password
        self.key_file = key_file
        self.client = None
        self.transport = None
        self.channel = None

    def connect(self):
        """Establish SSH connection"""
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            if self.key_file:
                self.client.connect(
                    self.hostname,
                    port=self.port,
                    username=self.username,
                    key_filename=self.key_file,
                    look_for_keys=False
                )
            else:
                self.client.connect(
                    self.hostname,
                    port=self.port,
                    username=self.username,
                    password=self.password
                )

            logger.info(f"Connected to {self.username}@{self.hostname}:{self.port}")
            return True

        except paramiko.AuthenticationException:
            logger.error("Authentication failed")
            return False
        except paramiko.SSHException as e:
            logger.error(f"SSH error: {e}")
            return False
        except Exception as e:
            logger.error(f"Connection error: {e}")
            return False

    def invoke_shell(self, cols=80, rows=24):
        """Invoke an interactive shell"""
        try:
            self.transport = self.client.get_transport()
            self.channel = self.transport.open_session()
            self.channel.get_pty(term='xterm-256color', width=cols, height=rows)
            self.channel.invoke_shell()
            logger.info(f"Shell invoked with size {cols}x{rows}")
            return True
        except Exception as e:
            logger.error(f"Error invoking shell: {e}")
            return False

    def send_data(self, data):
        """Send data to SSH server"""
        if self.channel:
            try:
                self.channel.send(data.encode('utf-8'))
            except Exception as e:
                logger.error(f"Error sending data: {e}")

    def recv_data(self, size=1024):
        """Receive data from SSH server"""
        if self.channel:
            try:
                if self.channel.recv_ready():
                    return self.channel.recv(size).decode('utf-8', errors='ignore')
            except Exception as e:
                logger.error(f"Error receiving data: {e}")
        return None

    def resize_pty(self, cols, rows):
        """Resize terminal"""
        if self.channel:
            try:
                self.channel.resize_pty(width=cols, height=rows)
                logger.info(f"Terminal resized to {cols}x{rows}")
            except Exception as e:
                logger.error(f"Error resizing terminal: {e}")

    def close(self):
        """Close SSH connection"""
        try:
            if self.channel:
                self.channel.close()
            if self.client:
                self.client.close()
            logger.info("Connection closed")
        except Exception as e:
            logger.error(f"Error closing connection: {e}")


class SSHWebSocketServer:
    """WebSocket server for SSH connections"""

    def __init__(self, host='0.0.0.0', port=8000):
        self.host = host
        self.port = port
        self.connections = {}

    async def handle_client(self, websocket: WebSocketServerProtocol, path):
        """Handle WebSocket client connection"""
        client_id = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        logger.info(f"Client connected: {client_id}")

        ssh_client = None
        reader_task = None

        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({'error': 'Invalid JSON'}))
                    continue

                # Handle different message types
                if 'connect' in data:
                    # Establish SSH connection
                    conn_data = data['connect']
                    ssh_client = SSHClient(
                        hostname=conn_data.get('hostname'),
                        port=int(conn_data.get('port', 22)),
                        username=conn_data.get('username'),
                        password=conn_data.get('password')
                    )

                    if ssh_client.connect():
                        if ssh_client.invoke_shell(
                            cols=conn_data.get('cols', 80),
                            rows=conn_data.get('rows', 24)
                        ):
                            await websocket.send(json.dumps({
                                'id': client_id,
                                'status': 'Connected',
                                'encoding': 'utf-8'
                            }))

                            # Start reading from SSH server
                            reader_task = asyncio.create_task(
                                self.read_ssh_output(websocket, ssh_client)
                            )
                        else:
                            await websocket.send(json.dumps({
                                'error': 'Failed to invoke shell'
                            }))
                    else:
                        await websocket.send(json.dumps({
                            'error': 'SSH connection failed'
                        }))

                elif 'data' in data and ssh_client:
                    # Send data to SSH server
                    ssh_client.send_data(data['data'])

                elif 'resize' in data and ssh_client:
                    # Resize terminal
                    cols, rows = data['resize']
                    ssh_client.resize_pty(cols, rows)

        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client disconnected: {client_id}")
        except Exception as e:
            logger.error(f"Error handling client {client_id}: {e}")
        finally:
            if reader_task:
                reader_task.cancel()
            if ssh_client:
                ssh_client.close()

    async def read_ssh_output(self, websocket, ssh_client):
        """Continuously read output from SSH server and send to client"""
        try:
            while True:
                data = ssh_client.recv_data()
                if data:
                    await websocket.send(json.dumps({'data': data}))
                else:
                    await asyncio.sleep(0.05)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error reading SSH output: {e}")

    async def start(self):
        """Start the WebSocket server"""
        logger.info(f"Starting WebSocket server on ws://{self.host}:{self.port}")
        async with websockets.serve(self.handle_client, self.host, self.port):
            logger.info("Server is running. Press Ctrl+C to stop.")
            await asyncio.Future()  # Run forever


def main():
    server = SSHWebSocketServer(host='localhost', port=8000)

    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        sys.exit(0)


if __name__ == '__main__':
    main()
