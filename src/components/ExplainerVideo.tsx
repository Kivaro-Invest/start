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
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-zinc-900/10">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/kivaro-erklaerfilm.mp4"
        poster="/video/kivaro-erklaerfilm-poster.jpg"
        preload="metadata"
        playsInline
        controls={started && !ended}
        onPlay={() => { setStarted(true); setEnded(false); }}
        onEnded={() => setEnded(true)}
      >
        Dein Browser kann dieses Video leider nicht abspielen.
      </video>

      {/* Start-Overlay */}
      {!started && (
        <button
          type="button"
          onClick={play}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/25 hover:bg-zinc-900/35 transition-colors"
          aria-label="Erklärvideo abspielen"
        >
          <span className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white text-zinc-900 shadow-2xl transition-transform group-hover:scale-105">
            <Play className="h-8 w-8 sm:h-10 sm:w-10 translate-x-0.5 fill-current" />
          </span>
          <span className="rounded-full bg-zinc-900/80 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
            Kivaro in 60 Sekunden erklärt
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/80 backdrop-blur-sm p-6 text-center"
          >
            <p className="text-xl sm:text-3xl font-bold text-white">Und du? Finde es heraus.</p>
            <button
              type="button"
              onClick={onCta}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 sm:px-8 sm:py-4 text-base font-semibold text-zinc-900 shadow-xl hover:bg-zinc-100 transition-colors"
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
