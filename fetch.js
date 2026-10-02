import https from 'https';
import fs from 'fs';

https.get('https://kivaro-invest.de/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('kivaro.html', data);
    console.log('Saved to kivaro.html');
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
