/**
 * ElectionTimeline Tests
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the analytics module
jest.mock('@/lib/analytics', () => ({
  trackTimelineStageClicked: jest.fn(),
}));

import TimelinePage from '../src/app/timeline/page';

describe('ElectionTimeline', () => {
  it('renders all stages', async () => {
    render(<TimelinePage />);
    expect((await screen.findAllByText('Announcement')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Voting Day')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Results')).length).toBeGreaterThan(0);
  });

  it('clicking stage expands panel', () => {
    render(<TimelinePage />);
    const btn = screen.getByLabelText(/Stage 1: Announcement/i);
    fireEvent.click(btn);
    // Use getAllByText because description might appear in mobile list and active panel
    const matches = screen.getAllByText(/The Election Commission of India announces/i);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]).toBeInTheDocument();
  });

  it('aria-expanded toggles on click', async () => {
    render(<TimelinePage />);
    const btn1 = screen.getByLabelText(/Stage 1: Announcement/i);
    expect(btn1).toHaveAttribute('aria-expanded', 'false');
    await act(async () => {
      fireEvent.click(btn1);
    });
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    
    const btn2 = screen.getByLabelText(/Stage 2: Model Code of Conduct/i);
    expect(btn2).toHaveAttribute('aria-expanded', 'false');
    await act(async () => {
      fireEvent.click(btn2);
    });
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
    expect(btn1).toHaveAttribute('aria-expanded', 'false');
  });
});
