import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import { environment } from './environments/environment';
import cors from 'cors';
import fs from 'fs';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const jsonFilePath = resolve(resolve(dirname(fileURLToPath(import.meta.url)), '../../'), 'reposync__dev__session.json');

if(!fs.existsSync(jsonFilePath)){
  fs.writeFileSync(jsonFilePath, JSON.stringify({}), 'utf-8');
}

app.use(cors());

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

app.use(express.json());
// Endpoint for token exchange
app.post('/api/exchange-token', async (req, res) => {

  const { code } = req.body;

  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: environment.CLIENT_ID,
      client_secret: environment.CLIENT_SECRET,
      code: code,
    }, {
      headers: { Accept: 'application/json' },
    });

    res.json(response.data); // Send token data back to the client
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).send('Failed to exchange token');
  }
});

app.get('/api/session', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    res.json(data); // Return the entire JSON file content
  } catch (error) {
    console.error('Error reading JSON file: ', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.get('/api/session/:key', (req, res) => {
  try {
    const { key } = req.params; // Extract the key from the URL
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    let value = data[key]; // Get the value by key
    if (value === undefined) {
      value = {};
      data[key] = value;
      fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`New key "${key}" added with default value`);
    } 
    res.json( value );
  } catch (error) {
    console.error('Error reading JSON file: ', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

app.post('/api/session', (req, res) => {
  try {
    const { key, value } = req.body; // Expecting key-value pair in the request body
    const currentData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    // Mimic setItem by adding/updating the key-value pair
    currentData[key] = value;
    fs.writeFileSync(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf-8');

    res.json({ success: true, message: `Key "${key}" updated`, data: { key, value } });
  } catch (error) {
    console.error('Error writing data: ', error);
    res.status(500).json({ success: false, message: 'Failed to write data' });
  }
});

app.delete('/api/session/:key', (req, res) => {
  try {
    const { key } = req.params; // Extract the key from the URL
    const currentData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    // Mimic removeItem by deleting the key
    if (currentData[key] !== undefined) {
      delete currentData[key];
      fs.writeFileSync(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf-8');
      res.json({ success: true, message: `Key "${key}" deleted` });
    } else {
      res.status(404).json({ error: `Key "${key}" not found` });
    }
  } catch (error) {
    console.error('Error deleting data: ', error);
    res.status(500).json({ success: false, message: 'Failed to delete data' });
  }
});