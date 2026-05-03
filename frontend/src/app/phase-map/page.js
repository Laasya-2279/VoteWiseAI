/**
 * @fileoverview India Phase Map Page.
 * Visualizes the election schedule across all Indian states.
 * @module PhaseMapPage
 */

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { trackPhaseMapStateClicked } from '@/lib/analytics';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { PHASE_COLORS, STATE_DATA } from '@/utils/constants';

/**
 * Renders the interactive map and phase details.
 * @returns {JSX.Element}
 */
export default function PhaseMapPage() {
  const [selectedState, setSelectedState] = useState(null);
  const [phaseFilter, setPhaseFilter] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredStates = phaseFilter
    ? STATE_DATA.filter((s) => s.phases.includes(phaseFilter))
    : STATE_DATA;

  /**
   * Handles state selection from map or list.
   * @param {Object} state - State data object
   */
  const handleStateSelect = (state) => {
    setSelectedState(state);
    trackPhaseMapStateClicked(state.name, state.phases[0]);
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }} 
          className="text-center mb-12"
        >
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
              onStateClick={handleStateSelect} 
              statesData={STATE_DATA} 
            />
            
            {/* Grid for Accessibility */}
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
                    onClick={() => handleStateSelect(state)}
                    className={`glass-card p-4 text-left hover:border-white/20 transition-all ${selectedState?.name === state.name ? 'ring-2 ring-saffron-500' : ''}`}
                    aria-label={`${state.name}: ${state.seats} seats, phase ${state.phases.join(', ')}`}
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

