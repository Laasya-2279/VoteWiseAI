export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'AI Election Assistant | VoteWise AI',
  description: 'Ask our AI assistant anything about Indian elections, from the voting process to constitutional rights.',
};

export default function AssistantLayout({ children }) {
  return <>{children}</>;
}
