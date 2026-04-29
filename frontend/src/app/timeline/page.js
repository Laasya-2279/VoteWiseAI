'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { trackTimelineStageClicked } from '@/lib/analytics';

const STAGES = [
  { id: 'announcement', name: 'Announcement', icon: '📢', description: 'The Election Commission of India announces the election schedule, including dates for nomination, scrutiny, withdrawal, and polling for each phase. The announcement triggers the Model Code of Conduct.', duration: '1 day' },
  { id: 'mcc', name: 'Model Code of Conduct', icon: '📋', description: 'The MCC comes into immediate effect. Political parties and candidates must follow strict guidelines on campaigning, government decisions, media usage, and public statements. Ministers cannot announce new projects or schemes.', duration: 'Until results' },
  { id: 'nomination', name: 'Nomination', icon: '📝', description: 'Candidates file nomination papers with the Returning Officer. They must submit affidavits declaring criminal cases, assets, liabilities, and educational qualifications. Security deposits of ₹25,000 (₹12,500 for SC/ST) are required.', duration: '7-10 days' },
  { id: 'scrutiny', name: 'Scrutiny', icon: '🔍', description: 'Returning Officers examine all nomination papers for validity. They verify candidate eligibility, document completeness, and compliance with requirements. Invalid nominations are rejected with reasons.', duration: '1-2 days' },
  { id: 'campaigning', name: 'Campaigning', icon: '📣', description: 'Candidates and parties campaign across constituencies through rallies, door-to-door visits, media ads, and social media. All campaigning must stop 48 hours before polling day (silence period). Expenditure limits apply.', duration: '2-3 weeks' },
  { id: 'voting', name: 'Voting Day', icon: '🗳️', description: 'Voters cast ballots using EVMs at designated polling stations from 7 AM to 6 PM. Identity verification, indelible ink marking, and VVPAT paper trail ensure transparency. Special provisions exist for differently-abled and senior voters.', duration: '1 day/phase' },
  { id: 'counting', name: 'Counting', icon: '🔢', description: 'Votes are counted at designated centers under CCTV surveillance. Postal ballots are counted first, followed by round-by-round EVM counts. VVPAT slips of 5 random booths per constituency are cross-verified.', duration: '1 day' },
  { id: 'results', name: 'Results', icon: '🏆', description: 'Results are declared constituency by constituency by the respective Returning Officers. Winning candidates receive certificates of election. Government formation process begins with the party/coalition securing majority (272+ seats).', duration: '1 day' },
];

export default function TimelinePage() {
  const [activeStage, setActiveStage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  const handleStageClick = useCallback((stage, index) => {
    setActiveStage(activeStage?.id === stage.id ? null : stage);
    trackTimelineStageClicked(stage.name, index);
  }, [activeStage]);

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Election <span className="text-gradient">Timeline</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Follow the complete journey of an Indian election — from announcement to results declaration
          </p>
        </motion.div>

        {/* Horizontal Timeline */}
        <div className="relative mb-12 overflow-x-auto pb-4" role="tablist" aria-label="Election timeline stages">
          <div className="flex items-start gap-0 min-w-max px-4">
            {STAGES.map((stage, i) => {
              const isActive = activeStage?.id === stage.id;
              const isCurrent = i === 5; // Voting as current phase example
              return (
                <div key={stage.id} className="flex items-start">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
                    transition={{ delay: i * 0.1 }}
                    role="tab"
                    id={`tab-${stage.id}`}
                    aria-selected={isActive}
                    aria-expanded={isActive}
                    aria-controls={`panel-${stage.id}`}
                    aria-label={`Stage ${i + 1}: ${stage.name}. ${isCurrent ? 'Current phase.' : ''} Click to ${isActive ? 'collapse' : 'expand'} details`}
                    onClick={() => handleStageClick(stage, i)}
                    className={`flex flex-col items-center w-28 md:w-36 cursor-pointer group transition-all duration-300 ${isActive ? 'scale-105' : ''}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-all duration-300 ${isActive ? 'gradient-saffron shadow-lg shadow-saffron-500/30' : isCurrent ? 'bg-saffron-500/20 ring-2 ring-saffron-500 animate-pulse-slow' : 'bg-white/5 group-hover:bg-white/10'}`} aria-hidden="true">
                      {stage.icon}
                    </div>
                    <span className={`text-xs md:text-sm font-medium text-center transition-colors ${isActive ? 'text-saffron-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
                      {stage.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">{stage.duration}</span>
                  </motion.button>
                  {i < STAGES.length - 1 && (
                    <div className="flex items-center h-14 mx-1" aria-hidden="true">
                      <div className={`w-8 md:w-12 h-0.5 ${i < 5 ? 'bg-saffron-500/50' : 'bg-white/10'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Expanded Panel */}
        <AnimatePresence mode="wait">
          {activeStage && (
            <motion.div
              key={activeStage.id}
              id={`panel-${activeStage.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeStage.id}`}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 max-w-3xl mx-auto"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl" aria-hidden="true">{activeStage.icon}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{activeStage.name}</h2>
                  <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 mb-4">
                    Duration: {activeStage.duration}
                  </span>
                  <p className="text-gray-300 leading-relaxed">{activeStage.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage Cards Grid (always visible) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {STAGES.map((stage, i) => (
            <motion.div
              key={`card-${stage.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="glass-card p-5 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl" aria-hidden="true">{stage.icon}</span>
                <div>
                  <p className="text-xs text-gray-500">Stage {i + 1}</p>
                  <h3 className="text-sm font-semibold text-white">{stage.name}</h3>
                </div>
              </div>
              <p className="text-xs text-gray-400 line-clamp-3">{stage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
