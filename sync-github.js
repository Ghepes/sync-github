// sync-json.js
import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://raw.githubusercontent.com/Ghepes/sync-github/refs/heads/main/WebAppMarketDB.json';
const destPath = path.resolve('./sync/WebAppMarketDB.json'); // sau ./app/json daca serve?ti local

function downloadJSON() {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error(`Status ${res.statusCode}`));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, data);
        console.log(`? JSON salvat în ${destPath}`);
        resolve();
      });
    }).on('error', reject);
  });
}

downloadJSON().catch(err => console.error('? Eroare la descarcare:', err));
