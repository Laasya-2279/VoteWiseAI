/**
 * @fileoverview Voter Eligibility Check Page.
 * Uses a multi-step form to guide users through the eligibility criteria.
 * @module EligibilityPage
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEligibility } from '@/hooks/useEligibility';
import { INDIAN_STATES } from '@/utils/constants';

/**
 * Renders the eligibility check form and results.
 * @returns {JSX.Element}
 */
export default function EligibilityPage() {
  const {
    step,
    formData,
    errors,
    result,
    isLoading,
    updateField,
    handleNext,
    handleBack,
    handleSubmit,
    resetForm
  } = useEligibility();

  if (result) {
    return <EligibilityResult result={result} onReset={resetForm} />;
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Eligibility <span className="text-gradient">Check</span></h1>
          <p className="text-gray-400">Find out if you are eligible to vote in 3 simple steps</p>
        </motion.div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-3 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= s ? 'bg-saffron-500 scale-125' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="glass-card p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-saffron-500/20" />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">How old are you?</h2>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="Enter your age"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 outline-none transition-all"
                  autoFocus
                  id="input-age"
                />
                {errors.age && <p className="text-red-400 text-sm mt-2">{errors.age}</p>}
                <button onClick={handleNext} className="btn-primary w-full mt-10 !py-4" id="btn-next-1">Continue</button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Are you an Indian citizen?</h2>
                <div className="grid grid-cols-1 gap-4">
                  {['Indian Citizen', 'Non-Resident Indian (NRI)', 'Other'].map((c) => (
                    <button
                      key={c}
                      onClick={() => updateField('citizenship', c)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${formData.citizenship === c ? 'bg-saffron-500/10 border-saffron-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      id={`btn-citizenship-${c.replace(/\s/g, '-')}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {errors.citizenship && <p className="text-red-400 text-sm mt-2">{errors.citizenship}</p>}
                <div className="flex gap-4 mt-10">
                  <button onClick={handleBack} className="btn-secondary flex-1" id="btn-back-2">Back</button>
                  <button onClick={handleNext} className="btn-primary flex-1" id="btn-next-2">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Which state do you live in?</h2>
                <select
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full bg-[#1A1F2E] border border-white/10 rounded-xl px-5 py-4 text-white focus:border-saffron-500 outline-none appearance-none"
                  id="select-state"
                >
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-red-400 text-sm mt-2">{errors.state}</p>}
                <div className="flex gap-4 mt-10">
                  <button onClick={handleBack} className="btn-secondary flex-1" id="btn-back-3">Back</button>
                  <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1" id="btn-submit">
                    {isLoading ? 'Checking...' : 'Check Status'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Result sub-component to keep EligibilityPage clean.
 * @param {Object} props - Component props
 * @returns {JSX.Element}
 */
function EligibilityResult({ result, onReset }) {
  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto glass-card p-10">
        <div className="text-center mb-8">
          <span className="text-6xl" aria-hidden="true">{result.eligible ? '✅' : '❌'}</span>
          <h2 className={`text-3xl font-bold mt-4 ${result.eligible ? 'text-green-400' : 'text-red-400'}`}>
            {result.eligible ? 'You are Eligible!' : 'Not Eligible Yet'}
          </h2>
          <p className="text-gray-300 mt-4 text-lg">{result.reason}</p>
        </div>

        {result.eligible && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-saffron-500">📋</span> Registration Steps
            </h3>
            <div className="space-y-4">
              {result.registrationSteps.map((s, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-saffron-500/20 text-saffron-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <p className="text-sm text-gray-300">{s}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a href={result.form6Link} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 text-center">Register Now (Form 6)</a>
              {result.statePortal && (
                <a href={result.statePortal} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 text-center">State Election Portal</a>
              )}
            </div>
          </div>
        )}

        <button onClick={onReset} className="w-full mt-8 text-gray-500 hover:text-white transition-colors text-sm font-medium" id="btn-restart">Check for someone else</button>
      </motion.div>
    </div>
  );
}
