import { motion } from 'motion/react';
import { Download, FileText, FileCheck } from 'lucide-react';

export default function Downloads() {
  const resources = [
    {
      title: "Selbstauskunft",
      type: "Vorlage",
      description: "Die Selbstauskunft dient dazu, eine erste Einschätzung der finanziellen Voraussetzungen vorzunehmen.",
      icon: <FileText className="w-6 h-6" />,
      link: "/Selbstauskunft.pdf"
    },
    {
      title: "Reservierungsbestätigung",
      type: "Vorlage",
      description: "Die Reservierungsvereinbarung ermöglicht es, ein Objekt für einen Zeitraum von 14 Tagen vorläufig zu sichern.",
      icon: <FileCheck className="w-6 h-6" />,
      link: "/Reservierungsbestaetigung.pdf"
    }
  ];

  return (
    <div className="w-full bg-zinc-50 min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-6"
          >
            Downloads & Ressourcen
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-600 leading-relaxed"
          >
            Auf dieser Seite finden Sie alle wichtigen Dokumente und Vorlagen für die Zusammenarbeit mit Kivaro Invest. Bei Fragen zu einzelnen Unterlagen können Sie sich jederzeit an Ihren persönlichen Ansprechpartner wenden.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {resources.map((resource, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-3xl p-8 lg:p-10 border border-zinc-200 shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {resource.icon}
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-6">
                {resource.type}
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-4 break-words hyphens-auto" lang="de">{resource.title}</h3>
              <p className="text-zinc-600 leading-relaxed mb-10">{resource.description}</p>
              
              <a 
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-md group-hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Kostenfrei herunterladen
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
