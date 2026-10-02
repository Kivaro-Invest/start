import fs from 'fs';

function extractText(file) {
  const html = fs.readFileSync(file, 'utf8');
  // Simple regex to extract text from body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return '';
  
  let text = bodyMatch[1]
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return text.substring(0, 1500) + '...'; // Just get the first 1500 chars to understand the vibe
}

console.log('--- HOME ---');
console.log(extractText('kivaro.html'));
console.log('\n--- KONTAKT ---');
console.log(extractText('kontakt.html'));
console.log('\n--- DOWNLOADS ---');
console.log(extractText('downloads.html'));
