import https from 'https';
import fs from 'fs';

const urls = [
  { url: 'https://kivaro-invest.de/kontakt/', file: 'kontakt.html' },
  { url: 'https://kivaro-invest.de/impressum/', file: 'impressum.html' },
  { url: 'https://kivaro-invest.de/privacy-policy/', file: 'privacy.html' },
  { url: 'https://kivaro-invest.de/downloads/', file: 'downloads.html' }
];

urls.forEach(({ url, file }) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      fs.writeFileSync(file, data);
      console.log('Saved to ' + file);
    });
  }).on('error', (err) => {
    console.log('Error fetching ' + url + ': ' + err.message);
  });
});
