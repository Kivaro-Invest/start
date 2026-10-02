import fs from 'fs';

const html = fs.readFileSync('kivaro.html', 'utf8');
const links = html.match(/href="([^"]+)"/g);
const uniqueLinks = [...new Set(links)].sort();
console.log(uniqueLinks.join('\n'));
