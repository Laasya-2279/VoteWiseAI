export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'Voter Eligibility Checker | VoteWise AI',
  description: 'Check if you are eligible to vote in the Indian general elections with our interactive guide.',
};

export default function EligibilityLayout({ children }) {
  return <>{children}</>;
}
