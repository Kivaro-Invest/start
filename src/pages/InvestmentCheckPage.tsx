import InvestmentCheck from '../components/InvestmentCheck';

export default function InvestmentCheckPage() {
  return (
    <div className="w-full bg-zinc-50 min-h-screen pt-12 pb-24 sm:pt-20 sm:pb-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-3">Investment-Check</h2>
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-900 tracking-tight mb-4">Passt eine Kapitalanlage-Immobilie zu dir?</h1>
          <p className="text-lg text-zinc-600">Ein paar kurze Fragen – danach rechnen wir mit deinen Zahlen durch, was für dich drin ist.</p>
        </div>
        <InvestmentCheck />
      </div>
    </div>
  );
}
