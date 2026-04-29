'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { trackEligibilityChecked } from '@/lib/analytics';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Jammu and Kashmir','Ladakh',
];

export default function EligibilityPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ age: '', state: '', citizenship: 'Indian' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 150) {
      errs.age = 'Please enter a valid age between 1 and 150';
    }
    if (!form.state) { errs.state = 'Please select your state'; }
    if (!form.citizenship) { errs.citizenship = 'Please select citizenship status'; }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validate()) { setStep(2); }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const res = await fetch(`${API_BASE}/eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
      setStep(3);
      trackEligibilityChecked(data.eligible ? 'eligible' : 'not_eligible', form.state);
    } catch {
      setResult({ eligible: false, reason: 'Unable to check eligibility. Please try again.', registrationSteps: [] });
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Voter <span className="text-gradient">Eligibility</span> Check
          </h1>
          <p className="text-gray-400 text-lg">Find out if you are eligible to vote and how to register</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-10" role="group" aria-label="Form progress">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'gradient-saffron text-white' : 'bg-white/5 text-gray-500'}`}
                aria-current={step === s ? 'step' : undefined}
                aria-label={`Step ${s}${step === s ? ' (current)' : step > s ? ' (completed)' : ''}: ${s === 1 ? 'Your Details' : s === 2 ? 'Verify' : 'Result'}`}
              >
                {step > s ? '✓' : s}
              </div>
              <span className={`text-sm hidden sm:inline ${step >= s ? 'text-white' : 'text-gray-500'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Verify' : 'Result'}
              </span>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-saffron-500' : 'bg-white/10'}`} aria-hidden="true" />}
            </div>
          ))}
        </div>

        {/* Step 1: Form */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
            <h2 className="text-xl font-semibold mb-6">Enter Your Details</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="input-age" className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input id="input-age" type="number" min="1" max="150" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Enter your age" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500" aria-label="Enter your age" aria-describedby={errors.age ? 'age-error' : undefined} aria-invalid={!!errors.age} />
                {errors.age && <p id="age-error" role="alert" className="text-red-400 text-xs mt-1">{errors.age}</p>}
              </div>
              <div>
                <label htmlFor="input-state" className="block text-sm font-medium text-gray-300 mb-2">State of Residence</label>
                <select id="input-state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500" aria-label="Select your state of residence" aria-describedby={errors.state ? 'state-error' : undefined} aria-invalid={!!errors.state}>
                  <option value="" className="bg-gray-900">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                </select>
                {errors.state && <p id="state-error" role="alert" className="text-red-400 text-xs mt-1">{errors.state}</p>}
              </div>
              <div>
                <label htmlFor="input-citizenship" className="block text-sm font-medium text-gray-300 mb-2">Citizenship</label>
                <select id="input-citizenship" value={form.citizenship} onChange={(e) => setForm({ ...form, citizenship: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500" aria-label="Select your citizenship status" aria-describedby={errors.citizenship ? 'cit-error' : undefined} aria-invalid={!!errors.citizenship}>
                  <option value="Indian" className="bg-gray-900">Indian Citizen</option>
                  <option value="NRI" className="bg-gray-900">NRI (Indian Passport)</option>
                  <option value="Foreign" className="bg-gray-900">Foreign National</option>
                </select>
                {errors.citizenship && <p id="cit-error" role="alert" className="text-red-400 text-xs mt-1">{errors.citizenship}</p>}
              </div>
              <button onClick={handleNext} className="btn-primary w-full !py-4 text-lg" aria-label="Proceed to verification step" id="btn-next">Next: Verify Details →</button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Verification */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
            <h2 className="text-xl font-semibold mb-6">Verify Your Information</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-gray-400">Age</span><span className="text-white font-medium">{form.age} years</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-gray-400">State</span><span className="text-white font-medium">{form.state}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-gray-400">Citizenship</span><span className="text-white font-medium">{form.citizenship}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 !py-4" aria-label="Go back to edit details" id="btn-back">← Edit</button>
              <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1 !py-4 disabled:opacity-50" aria-label="Check eligibility" aria-busy={isLoading} id="btn-check">{isLoading ? 'Checking...' : 'Check Eligibility ✓'}</button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Result */}
        {step === 3 && result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8">
            <div className="text-center mb-6">
              <span className="text-6xl" aria-hidden="true">{result.eligible ? '✅' : '❌'}</span>
              <h2 className={`text-2xl font-bold mt-4 ${result.eligible ? 'text-green-400' : 'text-red-400'}`}>
                {result.eligible ? 'You Are Eligible to Vote!' : 'Not Yet Eligible'}
              </h2>
              <p className="text-gray-300 mt-2">{result.reason}</p>
            </div>
            {result.eligible && result.registrationSteps?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">How to Register (Form 6)</h3>
                <ol className="space-y-3">
                  {result.registrationSteps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                      <span className="w-6 h-6 rounded-full gradient-saffron flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
                <div className="mt-6 p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">Register online:</p>
                  <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-saffron-400 hover:text-saffron-300 underline text-sm" aria-label="Visit National Voters Service Portal to register">voters.eci.gov.in →</a>
                </div>
              </div>
            )}
            <button onClick={() => { setStep(1); setResult(null); setForm({ age: '', state: '', citizenship: 'Indian' }); }} className="btn-secondary w-full !py-4 mt-6" aria-label="Check eligibility again" id="btn-restart">Check Again</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
