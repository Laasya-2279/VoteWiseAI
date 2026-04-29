/**
 * Google Analytics event tracking utility
 */

export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

export function trackQueryMade(intentType, responseTimeMs, chunksUsed) {
  trackEvent('query_made', { intent_type: intentType, response_time_ms: responseTimeMs, chunks_used: chunksUsed });
}

export function trackTimelineStageClicked(stageName, stageIndex) {
  trackEvent('timeline_stage_clicked', { stage_name: stageName, stage_index: stageIndex });
}

export function trackEligibilityChecked(result, state) {
  trackEvent('eligibility_checked', { result, state });
}

export function trackQuizCompleted(score, total, timeTakenSeconds) {
  trackEvent('quiz_completed', { score, total, time_taken_seconds: timeTakenSeconds });
}

export function trackPhaseMapStateClicked(stateName, phaseNumber) {
  trackEvent('phase_map_state_clicked', { state_name: stateName, phase_number: phaseNumber });
}

export function trackGlossaryTermViewed(term) {
  trackEvent('glossary_term_viewed', { term });
}

export function trackVoiceInputUsed(success) {
  trackEvent('voice_input_used', { success });
}
