import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ArrowRight } from 'lucide-react';

type Props = {
  onCta: () => void;
};

// Erklärfilm – selbst gehostet (keine YouTube-Cookies, keine Einwilligung nötig).
export default function ExplainerVideo({ onCta }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    setEnded(false);
    setStarted(true);
    if (v.ended) v.currentTime = 0;
    v.play().catch(() => {});
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-emerald-700 shadow-2xl ring-1 ring-zinc-900/10">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/kivaro-erklaerfilm-v8.mp4"
        poster="/video/kivaro-erklaerfilm-poster-v2.webp"
        preload="metadata"
        playsInline
        controls={started && !ended}
        onPlay={() => { setStarted(true); setEnded(false); }}
        onEnded={() => setEnded(true)}
      >
        Dein Browser kann dieses Video leider nicht abspielen.
      </video>

      {/* Start-Overlay: Vorschaubild mit Text als echte Schrift (bleibt auf jeder Größe scharf) */}
      {!started && (
        <button
          type="button"
          onClick={play}
          className="group absolute inset-0 text-left"
          aria-label="Erklärvideo abspielen (90 Sekunden)"
        >
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,#062a4f_0%,#0a3c6e_36%,rgba(10,60,110,0.6)_56%,rgba(10,60,110,0)_74%)]" />
          <span className="absolute inset-y-0 left-0 flex w-[56%] flex-col justify-center pl-5 pr-2 sm:pl-10 lg:pl-14">
            <img src="/white-transparent.svg" alt="" aria-hidden="true" className="hidden sm:block h-20 lg:h-28 w-auto self-start -ml-3 -my-5 lg:-my-7 mb-0 lg:mb-1" />
            <span className="hidden sm:inline-flex self-start items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-semibold uppercase tracking-wider text-white mb-3 lg:mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Erklärvideo · 90 Sekunden
            </span>
            <span className="block text-[1.05rem] leading-[1.15] sm:text-3xl lg:text-[2.6rem] font-bold tracking-tight text-white">
              Vermögen aufbauen mit Immobilien.
              <span className="block text-emerald-300">So geht’s.</span>
            </span>
          </span>
          <span className="absolute left-[67%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 sm:h-20 sm:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-white text-emerald-700 shadow-2xl ring-4 ring-white/30 transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 translate-x-0.5 fill-current" />
          </span>
        </button>
      )}

      {/* End-Overlay mit CTA */}
      <AnimatePresence>
        {ended && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-emerald-950/85 backdrop-blur-sm p-6 text-center"
          >
            <p className="text-xl sm:text-3xl font-bold text-white">Und du? Finde es heraus.</p>
            <button
              type="button"
              onClick={onCta}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 sm:px-8 sm:py-4 text-base font-semibold text-white shadow-xl hover:bg-emerald-400 transition-colors"
            >
              Investment-Check starten <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={play}
              className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Nochmal ansehen
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
