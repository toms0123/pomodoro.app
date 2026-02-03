#!/usr/bin/env node

/**
 * Standalone Production Server
 * 
 * This script allows you to run the production build without npm install.
 * Usage: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, '.next');
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
};

const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Try to serve from public directory first
  let filePath = path.join(PUBLIC_DIR, pathname);
  
  // If not in public, try .next/static
  if (!fs.existsSync(filePath)) {
    filePath = path.join(BUILD_DIR, 'static', pathname);
  }

  // If still not found, try .next/server/pages
  if (!fs.existsSync(filePath)) {
    filePath = path.join(BUILD_DIR, 'server', 'pages', pathname);
  }

  // Get file extension
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Read and serve file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found - serve index.html for SPA routing
        const indexPath = path.join(BUILD_DIR, 'server', 'pages', 'index.html');
        fs.readFile(indexPath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     Pomodoro App - Production Server      ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('');
  console.log('📝 Make sure you have set environment variables in .env.local');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
