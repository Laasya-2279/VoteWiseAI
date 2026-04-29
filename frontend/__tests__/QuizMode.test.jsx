/**
 * QuizMode Tests
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/lib/analytics', () => ({
  trackQuizCompleted: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ questions: [] }),
  })
);

import QuizPage from '../src/app/quiz/page';

describe('QuizMode', () => {
  it('renders title', async () => {
    render(<QuizPage />);
    expect((await screen.findAllByText(/Election/i)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/Quiz/i)).length).toBeGreaterThan(0);
  });

  it('has progress bar with aria attributes', () => {
    render(<QuizPage />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders options with radio role', () => {
    render(<QuizPage />);
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThan(0);
  });
});
