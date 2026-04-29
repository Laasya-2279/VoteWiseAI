/**
 * VoiceAssistant Tests
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/lib/analytics', () => ({
  trackQueryMade: jest.fn(),
  trackVoiceInputUsed: jest.fn(),
}));

import AssistantPage from '../src/app/assistant/page';

describe('VoiceAssistant', () => {
  it('renders welcome message', () => {
    render(<AssistantPage />);
    expect(screen.getByText(/Namaste! 🙏 I am VoteWise AI/i)).toBeInTheDocument();
  });

  it('has mic button with correct aria-label', () => {
    render(<AssistantPage />);
    const mic = screen.getByLabelText(/Start voice input/i);
    expect(mic).toBeInTheDocument();
    expect(mic).toHaveAttribute('aria-pressed', 'false');
  });

  it('chat area has aria-live polite', () => {
    render(<AssistantPage />);
    const chat = screen.getByLabelText(/Chat conversation/i);
    expect(chat).toHaveAttribute('aria-live', 'polite');
  });

  it('has accessible input with label', async () => {
    render(<AssistantPage />);
    const input = await screen.findByPlaceholderText(/Ask about Indian elections/i);
    expect(input).toBeInTheDocument();
  });
});
