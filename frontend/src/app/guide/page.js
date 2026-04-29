'use client';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';

const GUIDE_SLIDES = [
  { title: 'Welcome to Indian Democracy', content: 'India is the world\'s largest democracy with over 96 crore eligible voters. Elections are conducted by the Election Commission of India, an autonomous constitutional body established under Article 324.', icon: '🇮🇳' },
  { title: 'Election Announcement', content: 'The process begins when the ECI announces the election schedule. This triggers the Model Code of Conduct, which governs the behavior of political parties, candidates, and the government until results are declared.', icon: '📢' },
  { title: 'Voter Registration', content: 'Citizens aged 18+ must register in the electoral roll. You can register online at voters.eci.gov.in using Form 6. A Booth Level Officer (BLO) will verify your application before your name is added to the voter list.', icon: '📝' },
  { title: 'Candidate Nomination', content: 'Candidates file nomination papers with the Returning Officer. They must submit affidavits declaring criminal records, assets, and education. A security deposit of ₹25,000 is required (₹12,500 for SC/ST candidates).', icon: '🏛️' },
  { title: 'Campaigning Period', content: 'Parties and candidates campaign through rallies, media, and door-to-door outreach. Expenditure limits apply. All campaigning must stop 48 hours before polling — this is called the "silence period."', icon: '📣' },
  { title: 'Voting Day', content: 'Polls are open from 7 AM to 6 PM. Voters show photo ID, get their finger marked with indelible ink, and cast their vote on an EVM. The VVPAT machine shows a paper slip for 7 seconds to verify the vote.', icon: '🗳️' },
  { title: 'Vote Counting', content: 'Counting takes place at designated centers under CCTV surveillance. Postal ballots are counted first, then EVM counts proceed round by round. VVPAT slips from 5 random booths per constituency are cross-verified.', icon: '🔢' },
  { title: 'Results & Government Formation', content: 'Results are declared constituency by constituency. The party or coalition with 272+ seats forms the government. The leader is invited by the President to take oath as Prime Minister.', icon: '🏆' },
];

export default function GuidePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < GUIDE_SLIDES.length - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev >= GUIDE_SLIDES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 5000);
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); } };
  }, [isPlaying]);

  const slide = GUIDE_SLIDES[currentSlide];
  const progress = ((currentSlide + 1) / GUIDE_SLIDES.length) * 100;

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Guided <span className="text-gradient">Tour</span></h1>
          <p className="text-gray-400 text-lg">Walk through the complete election process</p>
        </motion.div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {currentSlide + 1} of {GUIDE_SLIDES.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={`Guide progress: step ${currentSlide + 1} of ${GUIDE_SLIDES.length}`}>
            <motion.div className="h-full gradient-saffron rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Slide */}
        <motion.div key={currentSlide} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
          <span className="text-6xl mb-6" aria-hidden="true">{slide.icon}</span>
          <h2 className="text-2xl font-bold text-white mb-4">{slide.title}</h2>
          <p className="text-gray-300 leading-relaxed max-w-xl" aria-live="assertive">{slide.content}</p>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={prevSlide} disabled={currentSlide === 0} className="btn-secondary !px-6 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Previous slide" id="guide-prev">← Previous</button>
          <button onClick={togglePlay} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white hover:bg-white/10'}`} aria-label={isPlaying ? 'Pause guided tour' : 'Play guided tour automatically'} aria-pressed={isPlaying} id="guide-play">
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button onClick={nextSlide} disabled={currentSlide === GUIDE_SLIDES.length - 1} className="btn-primary !px-6 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next slide" id="guide-next">Next →</button>
        </div>

        {/* Slide dots */}
        <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Guide slides">
          {GUIDE_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentSlide ? 'bg-saffron-500 w-6' : 'bg-white/20 hover:bg-white/40'}`} role="tab" aria-selected={i === currentSlide} aria-label={`Go to slide ${i + 1}: ${GUIDE_SLIDES[i].title}`} id={`guide-dot-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
