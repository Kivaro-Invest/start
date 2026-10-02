import { motion } from 'motion/react';
import type { ReactNode } from 'react';

const STAND = 'Oktober 2026';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function Datenschutz() {
  return (
    <div className="w-full bg-white min-h-screen pt-20 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-none break-words"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-4">Datenschutzerklärung</h1>
          <p className="text-zinc-500 mb-10 sm:mb-14">Stand: {STAND}</p>

          <div className="space-y-10 sm:space-y-12 text-zinc-600 leading-relaxed">
            <Section title="1. Wer ist verantwortlich?">
              <p>
                Kivaro Invest UG (haftungsbeschränkt)<br />
                Tölzer Str. 1, 82031 Grünwald<br />
                Vertreten durch die Geschäftsführer Kevin Lengle und Jonathan Kravchenko<br />
                E-Mail: kontakt@kivaro-invest.de
              </p>
              <p>Einen Datenschutzbeauftragten haben wir nicht benannt, da wir dazu gesetzlich nicht verpflichtet sind.</p>
            </Section>

            <Section title="2. Das Wichtigste in Kürze">
              <ul className="list-disc pl-6 space-y-2">
                <li>Wir setzen <strong>keine Cookies</strong>, <strong>keine Analyse-Tools</strong> und <strong>keine Werbe-Pixel</strong> ein.</li>
                <li>Video und Schriftarten liegen auf unserem eigenen Server – es werden keine Daten an YouTube oder Google übertragen.</li>
                <li>Personenbezogene Daten verarbeiten wir nur, wenn du uns über den Investment-Check, das Kontaktformular oder per E-Mail schreibst.</li>
                <li>Anrufen dürfen wir dich nur mit deiner ausdrücklichen Einwilligung. Die kannst du jederzeit widerrufen.</li>
              </ul>
            </Section>

            <Section title="3. Hosting und Server-Logfiles">
              <p>
                Unsere Website wird bei Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, USA gehostet. Beim Aufruf der Website verarbeitet Netlify technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, übertragene Datenmenge, Browser und Betriebssystem sowie die zuvor besuchte Seite (Referrer). Das ist erforderlich, um die Website sicher und stabil auszuliefern.
              </p>
              <p>
                Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und funktionsfähigen Webauftritt (Art. 6 Abs. 1 lit. f DSGVO). Mit Netlify besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO). Netlify ist unter dem EU-US Data Privacy Framework zertifiziert; ergänzend gelten die EU-Standardvertragsklauseln.
              </p>
            </Section>

            <Section title="4. Erklärvideo und Schriftarten">
              <p>
                Unser Erklärvideo und die verwendeten Schriftarten werden direkt von unserem eigenen Webserver geladen. Es findet keine Verbindung zu Drittanbietern wie YouTube, Vimeo oder Google Fonts statt.
              </p>
            </Section>

            <Section title="5. Investment-Check">
              <p>Wenn du den Investment-Check ausfüllst, verarbeiten wir:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>deine Antworten (Ziel, berufliche Situation, Probezeit, Einkommensspanne, Ersparnisse, Immobilienbesitz, Altersgruppe, gewünschter Startzeitpunkt),</li>
                <li>deine Kontaktdaten (Vorname, Telefonnummer, E-Mail-Adresse),</li>
                <li>die Angaben zu deiner Einwilligung (Zeitpunkt, Wortlaut und Version des Einwilligungstextes, IP-Adresse, Browserkennung),</li>
                <li>die Herkunft deines Besuchs, falls du über einen Link mit Kampagnen-Kennzeichnung kommst (z. B. QR-Code auf einem Flyer). Diese Kennzeichnung wird nur im Arbeitsspeicher deines Browsers gehalten und nicht auf deinem Gerät gespeichert.</li>
              </ul>
              <p><strong>Zwecke und Rechtsgrundlagen:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Telefonische Kontaktaufnahme und Kontakt per E-Mail zu deinem Investment-Check und zu Immobilien als Kapitalanlage: auf Grundlage deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 7 Abs. 2 Nr. 1 UWG).
                </li>
                <li>
                  Vorbereitung einer möglichen Zusammenarbeit (Einschätzung deiner Ausgangslage, Auswahl passender Objekte): Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen auf deine Anfrage).
                </li>
                <li>
                  Nachweis deiner Einwilligung: Art. 6 Abs. 1 lit. c DSGVO in Verbindung mit § 7a UWG.
                </li>
              </ul>
              <p>
                Aus deinen Antworten ergibt sich eine interne Einstufung, mit der wir festlegen, in welcher Reihenfolge wir uns melden. Sie hat keine rechtliche Wirkung für dich und ersetzt nicht das persönliche Gespräch; eine automatisierte Entscheidung im Sinne von Art. 22 DSGVO findet nicht statt.
              </p>
              <p>
                Die Angaben sind freiwillig. Ohne Telefonnummer, E-Mail-Adresse und Einwilligung können wir dich allerdings nicht zu deinem Ergebnis kontaktieren.
              </p>
              <p><strong>Speicherdauer:</strong> Kommt keine Zusammenarbeit zustande, löschen wir deine Angaben spätestens 12 Monate nach unserem letzten Kontakt, bei Widerruf deiner Einwilligung unverzüglich. Den Nachweis über deine Einwilligung bewahren wir gemäß § 7a UWG fünf Jahre auf. Kommt eine Zusammenarbeit zustande, gelten die gesetzlichen Aufbewahrungsfristen.</p>
            </Section>

            <Section title="6. Kontaktformular und E-Mail">
              <p>
                Wenn du uns über das Kontaktformular oder per E-Mail schreibst, verarbeiten wir deine Angaben (Name, E-Mail-Adresse, ggf. Telefonnummer, deine Nachricht), um deine Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit deine Anfrage auf eine Zusammenarbeit abzielt, ansonsten unser berechtigtes Interesse an der Beantwortung von Anfragen (Art. 6 Abs. 1 lit. f DSGVO). Wir löschen die Daten, sobald die Anfrage erledigt ist und keine Aufbewahrungspflichten entgegenstehen.
              </p>
            </Section>

            <Section title="7. Wer bekommt deine Daten?">
              <p>Deine Daten verkaufen wir nicht. Wir nutzen folgende Dienstleister, die in unserem Auftrag und nach unseren Weisungen arbeiten (Art. 28 DSGVO):</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Netlify, Inc.</strong> (USA) – Hosting der Website und Verarbeitung der Formulare.</li>
                <li><strong>monday.com Ltd.</strong>, 6 Yitzhak Sadeh St., Tel Aviv, Israel – Verwaltung unserer Interessenten- und Kundenkontakte. Für Israel besteht ein Angemessenheitsbeschluss der EU-Kommission.</li>
                <li><strong>Unser E-Mail-Anbieter</strong> – Versand und Empfang von E-Mails.</li>
              </ul>
              <p>
                Wenn du im Gespräch eine Finanzierung wünschst, geben wir deine Daten nur mit deiner Zustimmung an unsere Finanzierungspartnerin weiter.
              </p>
            </Section>

            <Section title="8. Übermittlung in Drittländer">
              <p>
                Bei Netlify (USA) können Daten in die USA übertragen werden. Die Übermittlung stützt sich auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework (Art. 45 DSGVO) und ergänzend auf EU-Standardvertragsklauseln (Art. 46 DSGVO).
              </p>
            </Section>

            <Section title="9. Deine Rechte">
              <p>Du hast jederzeit das Recht auf:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Auskunft über deine bei uns gespeicherten Daten (Art. 15 DSGVO),</li>
                <li>Berichtigung (Art. 16 DSGVO) und Löschung (Art. 17 DSGVO),</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
                <li><strong>Widerspruch</strong> gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO),</li>
                <li><strong>Widerruf deiner Einwilligung</strong> mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO) – eine kurze E-Mail an kontakt@kivaro-invest.de genügt,</li>
                <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO). Für uns zuständig ist das Bayerische Landesamt für Datenschutzaufsicht, Promenade 18, 91522 Ansbach.</li>
              </ul>
            </Section>

            <Section title="10. Änderungen">
              <p>
                Wir passen diese Datenschutzerklärung an, wenn sich unsere Website oder die Rechtslage ändert. Es gilt die jeweils hier veröffentlichte Fassung.
              </p>
            </Section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
