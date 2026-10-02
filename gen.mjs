import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  try {
    console.log('Generating image 1 (Nürnberg)...');
    const res1 = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'Real estate photography of a modern, clean kitchen in a renovated apartment. Beige matte cabinets, warm wood countertops, a small breakfast bar with a black stool. White walls, light wood laminate floor. Bright daylight, realistic, standard apartment.',
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const part1 = res1.candidates[0].content.parts.find(p => p.inlineData);
    if (part1) {
      fs.writeFileSync('public/project-nuernberg.jpg', Buffer.from(part1.inlineData.data, 'base64'));
      console.log('Saved project-nuernberg.jpg');
    }

    console.log('Generating image 2 (Düsseldorf)...');
    const res2 = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: 'Real estate photography of a hallway looking into a bright bedroom in a renovated apartment. White walls, warm wood floor. A small kitchen counter is visible in the hallway. The bedroom has a bed, a desk, a large window with a balcony and green trees outside. Bright natural light, clean, realistic.',
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const part2 = res2.candidates[0].content.parts.find(p => p.inlineData);
    if (part2) {
      fs.writeFileSync('public/project-duesseldorf.jpg', Buffer.from(part2.inlineData.data, 'base64'));
      console.log('Saved project-duesseldorf.jpg');
    }
  } catch (e) {
    console.error('Error generating images:', e);
  }
}

generate();
