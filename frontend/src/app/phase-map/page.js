'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { trackPhaseMapStateClicked } from '@/lib/analytics';
import GoogleMapComponent from '@/components/GoogleMapComponent';

const PHASE_COLORS = {
  1: { bg: 'bg-red-500', text: 'text-red-400', hex: '#EF4444', label: 'Phase 1 — Apr 19' },
  2: { bg: 'bg-orange-500', text: 'text-orange-400', hex: '#F97316', label: 'Phase 2 — Apr 26' },
  3: { bg: 'bg-yellow-500', text: 'text-yellow-400', hex: '#EAB308', label: 'Phase 3 — May 7' },
  4: { bg: 'bg-green-500', text: 'text-green-400', hex: '#22C55E', label: 'Phase 4 — May 13' },
  5: { bg: 'bg-teal-500', text: 'text-teal-400', hex: '#14B8A6', label: 'Phase 5 — May 20' },
  6: { bg: 'bg-blue-500', text: 'text-blue-400', hex: '#3B82F6', label: 'Phase 6 — May 25' },
  7: { bg: 'bg-purple-500', text: 'text-purple-400', hex: '#A855F7', label: 'Phase 7 — Jun 1' },
};

const STATE_DATA = [
  { name: 'Uttar Pradesh', phases: [1,2,3,4,5,6,7], seats: 80, constituencies: 80 },
  { name: 'Maharashtra', phases: [1,2,3,4,5], seats: 48, constituencies: 48 },
  { name: 'West Bengal', phases: [1,2,3,4,5,6,7], seats: 42, constituencies: 42 },
  { name: 'Bihar', phases: [1,2,3,4,5,6,7], seats: 40, constituencies: 40 },
  { name: 'Tamil Nadu', phases: [1], seats: 39, constituencies: 39 },
  { name: 'Madhya Pradesh', phases: [1,2,3,4,5,6], seats: 29, constituencies: 29 },
  { name: 'Karnataka', phases: [2,3], seats: 28, constituencies: 28 },
  { name: 'Gujarat', phases: [3], seats: 26, constituencies: 26 },
  { name: 'Rajasthan', phases: [1,2], seats: 25, constituencies: 25 },
  { name: 'Andhra Pradesh', phases: [4], seats: 25, constituencies: 25 },
  { name: 'Odisha', phases: [4,5,6,7], seats: 21, constituencies: 21 },
  { name: 'Kerala', phases: [2], seats: 20, constituencies: 20 },
  { name: 'Telangana', phases: [4], seats: 17, constituencies: 17 },
  { name: 'Jharkhand', phases: [4,5,6,7], seats: 14, constituencies: 14 },
  { name: 'Assam', phases: [1,2,3], seats: 14, constituencies: 14 },
  { name: 'Punjab', phases: [7], seats: 13, constituencies: 13 },
  { name: 'Chhattisgarh', phases: [1,2,3], seats: 11, constituencies: 11 },
  { name: 'Haryana', phases: [6], seats: 10, constituencies: 10 },
  { name: 'Delhi', phases: [6], seats: 7, constituencies: 7 },
  { name: 'Jammu and Kashmir', phases: [1,2,3,4], seats: 5, constituencies: 5 },
  { name: 'Uttarakhand', phases: [1], seats: 5, constituencies: 5 },
  { name: 'Himachal Pradesh', phases: [7], seats: 4, constituencies: 4 },
  { name: 'Goa', phases: [3], seats: 2, constituencies: 2 },
  { name: 'Tripura', phases: [1,2], seats: 2, constituencies: 2 },
  { name: 'Meghalaya', phases: [1], seats: 2, constituencies: 2 },
  { name: 'Manipur', phases: [1,2], seats: 2, constituencies: 2 },
  { name: 'Arunachal Pradesh', phases: [1], seats: 2, constituencies: 2 },
  { name: 'Nagaland', phases: [1], seats: 1, constituencies: 1 },
  { name: 'Mizoram', phases: [1], seats: 1, constituencies: 1 },
  { name: 'Sikkim', phases: [1], seats: 1, constituencies: 1 },
  { name: 'Ladakh', phases: [5], seats: 1, constituencies: 1 },
];

export default function PhaseMapPage() {
  const [selectedState, setSelectedState] = useState(null);
  const [phaseFilter, setPhaseFilter] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => { setIsLoaded(true); }, []);

  const filteredStates = phaseFilter
    ? STATE_DATA.filter((s) => s.phases.includes(phaseFilter))
    : STATE_DATA;

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }} className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            India <span className="text-gradient">Phase Map</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore voting phases across all states — color-coded by phase with seat and date information
          </p>
        </motion.div>

        {/* Phase Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" role="group" aria-label="Filter states by voting phase">
          <button
            onClick={() => setPhaseFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!phaseFilter ? 'btn-primary' : 'btn-secondary'}`}
            aria-label="Show all phases"
            aria-pressed={!phaseFilter}
            id="filter-all"
          >
            All Phases
          </button>
          {Object.entries(PHASE_COLORS).map(([num, phase]) => (
            <button
              key={num}
              onClick={() => setPhaseFilter(Number(num))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${phaseFilter === Number(num) ? 'ring-2 ring-white bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
              aria-label={`Filter by ${phase.label}`}
              aria-pressed={phaseFilter === Number(num)}
              id={`filter-phase-${num}`}
            >
              <span className={`w-3 h-3 rounded-full ${phase.bg}`} aria-hidden="true" />
              <span>Phase {num}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <GoogleMapComponent 
              selectedPhase={phaseFilter} 
              onStateClick={setSelectedState} 
              statesData={STATE_DATA} 
            />
            
            {/* Grid Fallback / List for Accessibility */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredStates.map((state, i) => {
              const primaryPhase = state.phases[0];
              const color = PHASE_COLORS[primaryPhase];
              return (
                <motion.button
                  key={state.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => { setSelectedState(state); trackPhaseMapStateClicked(state.name, primaryPhase); }}
                  className={`glass-card p-4 text-left hover:border-white/20 transition-all ${selectedState?.name === state.name ? 'ring-2 ring-saffron-500' : ''}`}
                  aria-label={`${state.name}: ${state.seats} seats, voting in phase ${state.phases.join(', ')}. Click for details.`}
                  id={`state-${state.name.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${color.bg}`} aria-hidden="true" />
                    <span className="text-sm font-semibold text-white truncate">{state.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{state.seats} seats · Phase {state.phases.join(', ')}</p>
                </motion.button>
              );
            })}
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            {selectedState ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedState.name}</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-400">Total Seats</span>
                    <span className="text-xl font-bold text-white">{selectedState.seats}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-400">Constituencies</span>
                    <span className="text-white font-medium">{selectedState.constituencies}</span>
                  </div>
                  <div className="py-3">
                    <span className="text-gray-400 block mb-2">Voting Phase(s)</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedState.phases.map((p) => (
                        <span key={p} className={`px-3 py-1 rounded-full text-xs font-medium ${PHASE_COLORS[p].bg} text-white`}>
                          Phase {p} — {PHASE_COLORS[p].label.split('—')[1]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-gray-400">👆 Click a state to see details</p>
              </div>
            )}

            {/* Phase Legend */}
            <div className="glass-card p-6 mt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Phase Legend</h3>
              <div className="space-y-2">
                {Object.entries(PHASE_COLORS).map(([num, phase]) => (
                  <div key={num} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${phase.bg}`} aria-hidden="true" />
                    <span className="text-xs text-gray-400">{phase.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
