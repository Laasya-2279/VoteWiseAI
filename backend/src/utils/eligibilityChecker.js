/**
 * Eligibility Checker — evaluates voter eligibility based on
 * age, citizenship, and state, then returns status with registration steps.
 */

const REGISTRATION_STEPS = [
  'Visit the National Voters Service Portal (NVSP) at voters.eci.gov.in',
  'Click on "Apply online for Registration of New Voter / Due to Shifting" (Form 6)',
  'Fill in your personal details: name, date of birth, address, and constituency',
  'Upload a passport-sized photograph and age proof document',
  'Submit the form — you will receive a reference ID',
  'Your application will be verified by a Booth Level Officer (BLO)',
  'Once verified, your name will appear in the electoral roll',
  'You will receive your EPIC (Voter ID) card by post or you can download the e-EPIC',
];

const STATE_PORTALS = {
  'Andhra Pradesh': 'https://ceoandhra.nic.in',
  'Arunachal Pradesh': 'https://ceoarunachal.nic.in',
  'Assam': 'https://ceoassam.nic.in',
  'Bihar': 'https://ceobihar.nic.in',
  'Chhattisgarh': 'https://ceochhattisgarh.nic.in',
  'Delhi': 'https://ceodelhi.gov.in',
  'Goa': 'https://ceogoa.nic.in',
  'Gujarat': 'https://ceo.gujarat.gov.in',
  'Haryana': 'https://ceoharyana.gov.in',
  'Himachal Pradesh': 'https://ceoharyana.gov.in',
  'Jharkhand': 'https://ceo.jharkhand.gov.in',
  'Karnataka': 'https://ceo.karnataka.gov.in',
  'Kerala': 'https://ceo.kerala.gov.in',
  'Madhya Pradesh': 'https://ceomadhyapradesh.nic.in',
  'Maharashtra': 'https://ceo.maharashtra.gov.in',
  'Manipur': 'https://ceomanipur.nic.in',
  'Meghalaya': 'https://ceomeghalaya.nic.in',
  'Mizoram': 'https://ceomizoram.nic.in',
  'Nagaland': 'https://ceonagaland.nic.in',
  'Odisha': 'https://ceoodisha.nic.in',
  'Punjab': 'https://ceopunjab.nic.in',
  'Rajasthan': 'https://ceorajasthan.nic.in',
  'Sikkim': 'https://ceosikkim.nic.in',
  'Tamil Nadu': 'https://elections.tn.gov.in',
  'Telangana': 'https://ceotelangana.nic.in',
  'Tripura': 'https://ceotripura.nic.in',
  'Uttar Pradesh': 'https://ceouttarpradesh.nic.in',
  'Uttarakhand': 'https://ceo.uk.gov.in',
  'West Bengal': 'https://ceowestbengal.nic.in',
};

/**
 * Check voter eligibility
 * @param {{ age: number, citizenship: string, state: string }} params
 * @returns {{ eligible: boolean, reason: string, registrationSteps?: string[], statePortal?: string, form6Link: string }}
 */
function checkEligibility({ age, citizenship, state }) {
  const result = {
    eligible: false,
    reason: '',
    registrationSteps: [],
    statePortal: null,
    form6Link: 'https://voters.eci.gov.in/signup',
  };

  // Validate inputs
  if (age === undefined || age === null || isNaN(Number(age))) {
    result.reason = 'Age is required and must be a valid number.';
    return result;
  }

  if (!citizenship || typeof citizenship !== 'string') {
    result.reason = 'Citizenship status is required.';
    return result;
  }

  if (!state || typeof state !== 'string') {
    result.reason = 'State of residence is required.';
    return result;
  }

  const numAge = Number(age);

  if (citizenship.toLowerCase() !== 'indian' && citizenship.toLowerCase() !== 'india') {
    result.reason = 'Only Indian citizens are eligible to vote in Indian elections. NRIs holding Indian passports can register as overseas voters.';
    return result;
  }

  if (numAge < 18) {
    result.reason = `You must be at least 18 years old to vote. You will be eligible in ${18 - numAge} year(s).`;
    return result;
  }

  // Eligible
  result.eligible = true;
  result.reason = `You are eligible to vote in ${state}! Ensure you are registered in the electoral roll.`;
  result.registrationSteps = REGISTRATION_STEPS;
  result.statePortal = STATE_PORTALS[state] || null;

  return result;
}

module.exports = { checkEligibility, REGISTRATION_STEPS, STATE_PORTALS };
