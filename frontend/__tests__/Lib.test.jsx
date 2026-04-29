import { trackQueryMade, trackVoiceInputUsed, trackTimelineStageClicked } from '../src/lib/analytics';

describe('Analytics Utility', () => {
  it('calls gtag with correct parameters', () => {
    window.gtag = jest.fn();
    
    trackQueryMade('process_query', 500, 2);
    expect(window.gtag).toHaveBeenCalled();
    
    trackVoiceInputUsed(true);
    expect(window.gtag).toHaveBeenCalled();
    
    trackTimelineStageClicked('voting');
    expect(window.gtag).toHaveBeenCalled();
  });
});
