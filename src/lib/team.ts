// Team-Bereich auf der Startseite.
// Der Abschnitt erscheint erst, wenn mindestens eine Person ein Foto hat.
// Fotos nach /public/team/ legen (z. B. jonathan.jpg, quadratisch, mind. 800×800 px) und hier eintragen.

export type TeamMember = {
  name: string;
  role: string;
  photo?: string; // z. B. '/team/jonathan.jpg'
  quote?: string;
};

export const team: TeamMember[] = [
  { name: 'Jonathan Kravchenko', role: 'Geschäftsführer', photo: undefined },
  { name: 'Kevin Lengle', role: 'Geschäftsführer', photo: undefined },
];
