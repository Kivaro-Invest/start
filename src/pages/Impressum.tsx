import { motion } from 'motion/react';

// Unternehmensangaben
const REGISTERNUMMER = 'HRB 311467';
const ERLAUBNIS_34C_BEHOERDE = 'IHK München und Oberbayern, Max-Joseph-Straße 2, 80333 München';
const TELEFON = ''; // optional, empfohlen
const UST_ID = 'DE462818701';

export default function Impressum() {
  return (
    <div className="w-full bg-white min-h-screen pt-20 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-zinc prose-base sm:prose-lg max-w-none break-words"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-8 sm:mb-12">Impressum</h1>
          
          <div className="space-y-8 sm:space-y-12 text-zinc-600">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-4">Angaben gemäß § 5 DDG:</h2>
              <p>
                Kivaro Invest UG (haftungsbeschränkt)<br />
                Tölzer Str. 1<br />
                82031 Grünwald
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-4">Vertreten durch die Geschäftsführer:</h2>
              <p>
                Kevin Lengle, Jonathan Kravchenko
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-4">Registereintrag:</h2>
              <p>
                Registergericht: Amtsgericht München<br />
                Registernummer: {REGISTERNUMMER || '[wird ergänzt]'}
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-4">Umsatzsteuer-ID:</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
                {UST_ID}
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-4">Erlaubnis und Aufsicht:</h2>
              <p>
                Erlaubnis nach § 34c Abs. 1 Satz 1 Nr. 1 GewO (Immobilienmakler)<br />
                Erteilt durch und zuständige Aufsichtsbehörde: {ERLAUBNIS_34C_BEHOERDE || '[wird ergänzt]'}
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-4">Kontakt:</h2>
              <p>
                E-Mail: kontakt (at) kivaro-invest.de
                {TELEFON && (<><br />Telefon: {TELEFON}</>)}
              </p>
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6 mt-10 sm:mt-12">Haftungsausschluss:</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-3 mt-6 sm:mt-8">Haftung für Inhalte</h3>
              <p>
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-3 mt-6 sm:mt-8">Haftung für Links</h3>
              <p>
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-3 mt-6 sm:mt-8">Datenschutz</h3>
              <p>
                Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.
              </p>
              <p className="mt-4">
                Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
              </p>
              <p className="mt-4">
                Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten durch Dritte zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit ausdrücklich widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen, etwa durch Spam-Mails, vor.
              </p>

            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
