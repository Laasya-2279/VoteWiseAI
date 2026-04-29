/**
 * Eligibility Checker Tests
 */
const { checkEligibility } = require('../src/utils/eligibilityChecker');

describe('Eligibility Checker', () => {
  it('returns eligible for 18+ Indian citizen', () => {
    const result = checkEligibility({ age: 18, citizenship: 'Indian', state: 'Delhi' });
    expect(result.eligible).toBe(true);
    expect(result.registrationSteps.length).toBeGreaterThan(0);
  });

  it('returns eligible for older citizens', () => {
    const result = checkEligibility({ age: 65, citizenship: 'Indian', state: 'Kerala' });
    expect(result.eligible).toBe(true);
  });

  it('returns not eligible for age 17', () => {
    const result = checkEligibility({ age: 17, citizenship: 'Indian', state: 'Delhi' });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('18');
  });

  it('returns not eligible for age 10', () => {
    const result = checkEligibility({ age: 10, citizenship: 'Indian', state: 'Bihar' });
    expect(result.eligible).toBe(false);
  });

  it('returns not eligible for non-citizen', () => {
    const result = checkEligibility({ age: 25, citizenship: 'American', state: 'Delhi' });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Indian citizens');
  });

  it('handles missing age', () => {
    const result = checkEligibility({ citizenship: 'Indian', state: 'Delhi' });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Age');
  });

  it('handles missing citizenship', () => {
    const result = checkEligibility({ age: 20, state: 'Delhi' });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Citizenship');
  });

  it('handles missing state', () => {
    const result = checkEligibility({ age: 20, citizenship: 'Indian' });
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('State');
  });

  it('accepts "India" as citizenship', () => {
    const result = checkEligibility({ age: 20, citizenship: 'India', state: 'Mumbai' });
    expect(result.eligible).toBe(true);
  });

  it('includes form6Link in result', () => {
    const result = checkEligibility({ age: 20, citizenship: 'Indian', state: 'Delhi' });
    expect(result.form6Link).toContain('voters.eci.gov.in');
  });

  it('includes state portal when available', () => {
    const result = checkEligibility({ age: 20, citizenship: 'Indian', state: 'Delhi' });
    expect(result.statePortal).toBeDefined();
  });
});
