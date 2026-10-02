const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const rootDirectory = path.resolve(__dirname, '..');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const server = http.createServer((request, response) => {
  let requestPath;

  try {
    requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const requestedFile = path.resolve(rootDirectory, `.${requestPath}`);
  if (requestedFile !== rootDirectory && !requestedFile.startsWith(`${rootDirectory}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  const filePath = path.join(requestedFile, requestPath.endsWith('/') ? 'index.html' : '');
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

const port = Number(process.env.PORT) || 4173;
server.listen(port, '127.0.0.1', () => {
  console.log(`Local site: http://127.0.0.1:${port}`);
});
