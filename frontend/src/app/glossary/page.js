'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { trackGlossaryTermViewed } from '@/lib/analytics';

const GLOSSARY_TERMS = [
  { id: 'evm', term: 'EVM', fullForm: 'Electronic Voting Machine', definition: 'A standalone electronic device used to record votes, consisting of a Control Unit and Ballot Unit.' },
  { id: 'vvpat', term: 'VVPAT', fullForm: 'Voter Verifiable Paper Audit Trail', definition: 'Machine attached to EVM that prints a paper slip showing the candidate voted for, visible for 7 seconds.' },
  { id: 'mcc', term: 'MCC', fullForm: 'Model Code of Conduct', definition: 'Guidelines for political parties and candidates to ensure fair elections during the election period.' },
  { id: 'adr', term: 'ADR', fullForm: 'Association for Democratic Reforms', definition: 'Non-partisan organization analyzing candidate backgrounds for transparency in elections.' },
  { id: 'nota', term: 'NOTA', fullForm: 'None Of The Above', definition: 'Option on EVM allowing voters to reject all candidates. Introduced by Supreme Court in 2013.' },
  { id: 'ro', term: 'RO', fullForm: 'Returning Officer', definition: 'Officer responsible for proper conduct of election in a constituency and declaration of results.' },
  { id: 'deo', term: 'DEO', fullForm: 'District Election Officer', definition: 'Officer overseeing election processes at district level, coordinating between ECI and local officials.' },
  { id: 'eci', term: 'ECI', fullForm: 'Election Commission of India', definition: 'Autonomous constitutional body administering elections under Article 324 of the Constitution.' },
  { id: 'blo', term: 'BLO', fullForm: 'Booth Level Officer', definition: 'Local official assigned to each polling booth area for voter list maintenance and verification.' },
  { id: 'epic', term: 'EPIC', fullForm: 'Electors Photo Identity Card', definition: 'Official Voter ID card issued by ECI, serving as proof of identity for voting.' },
  { id: 'fptp', term: 'FPTP', fullForm: 'First Past The Post', definition: 'Electoral system where the candidate with the most votes wins, used across India.' },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [flipped, setFlipped] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  const filtered = GLOSSARY_TERMS.filter((t) =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.fullForm.toLowerCase().includes(search.toLowerCase()) ||
    t.definition.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
    trackGlossaryTermViewed(id);
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }} className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Election <span className="text-gradient">Glossary</span></h1>
          <p className="text-gray-400 text-lg">Click any card to reveal the definition</p>
        </motion.div>

        <div className="max-w-md mx-auto mb-10">
          <label htmlFor="glossary-search" className="block text-sm text-gray-400 mb-2">Search terms</label>
          <input id="glossary-search" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search glossary..." className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500" aria-label="Search glossary terms" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((term, i) => (
            <motion.div key={term.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }} transition={{ delay: i * 0.03 }}>
              <div className={`flip-card h-48 ${flipped[term.id] ? 'flipped' : ''}`} onClick={() => toggleFlip(term.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFlip(term.id); } }} role="button" tabIndex={0} aria-label={`${term.term}: ${term.fullForm}. ${flipped[term.id] ? 'Showing definition. Click to hide.' : 'Click to reveal definition.'}`} id={`glossary-${term.id}`}>
                <div className="flip-card-inner relative w-full h-full">
                  <div className="flip-card-front absolute inset-0 glass-card p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-gradient mb-2">{term.term}</span>
                    <span className="text-sm text-gray-400">{term.fullForm}</span>
                    <span className="text-xs text-gray-500 mt-3">Click to reveal →</span>
                  </div>
                  <div className="flip-card-back absolute inset-0 glass-card p-6 flex flex-col items-center justify-center text-center border-saffron-500/30">
                    <span className="text-lg font-bold text-saffron-400 mb-2">{term.term}</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{term.definition}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-500 mt-8">No matching terms found.</p>}
      </div>
    </div>
  );
}
