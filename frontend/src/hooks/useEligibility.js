/**
 * @fileoverview Custom hook for managing voter eligibility check logic.
 * @module useEligibility
 */

import { useState, useCallback } from 'react';
import { postEligibility } from '@/lib/api';
import { trackEligibilityChecked } from '@/lib/analytics';

/**
 * Hook to manage multi-step eligibility form.
 * @returns {Object} Eligibility state and handlers
 */
export function useEligibility() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ age: '', citizenship: '', state: '' });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Updates form field.
   * @param {string} field - Field name
   * @param {any} value - Field value
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  }, [errors]);

  /**
   * Validates current step.
   * @returns {boolean} True if valid
   */
  const validate = useCallback(() => {
    const newErrors = {};
    if (step === 1 && (!formData.age || formData.age < 1 || formData.age > 150)) {
      newErrors.age = 'Please enter a valid age (1-150)';
    }
    if (step === 2 && !formData.citizenship) {
      newErrors.citizenship = 'Please select your citizenship status';
    }
    if (step === 3 && !formData.state) {
      newErrors.state = 'Please select your state';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, formData]);

  /**
   * Handles "Next" button click.
   */
  const handleNext = useCallback(() => {
    if (validate()) setStep(prev => prev + 1);
  }, [validate]);

  /**
   * Handles "Back" button click.
   */
  const handleBack = useCallback(() => {
    setStep(prev => prev - 1);
  }, []);

  /**
   * Submits the eligibility check.
   */
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const data = await postEligibility(formData);
      setResult(data);
      trackEligibilityChecked(data.eligible ? 'eligible' : 'ineligible', formData.state);
    } catch (err) {
      setErrors({ submit: 'Failed to check eligibility. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validate]);

  /**
   * Resets the form.
   */
  const resetForm = useCallback(() => {
    setStep(1);
    setFormData({ age: '', citizenship: '', state: '' });
    setResult(null);
    setErrors({});
  }, []);

  return {
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
  };
}
