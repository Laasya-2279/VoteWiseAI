import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuidePage from '../src/app/guide/page';

describe('GuidePage', () => {
  it('renders initial slide', () => {
    render(<GuidePage />);
    expect(screen.getByText(/Welcome to Indian Democracy/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 8/i)).toBeInTheDocument();
  });

  it('navigates to next slide', () => {
    render(<GuidePage />);
    fireEvent.click(screen.getByText(/Next →/i));
    expect(screen.getByText(/Step 2 of 8/i)).toBeInTheDocument();
    expect(screen.getByText(/Election Announcement/i)).toBeInTheDocument();
  });

  it('toggles auto-play', () => {
    render(<GuidePage />);
    const playBtn = screen.getByLabelText(/Play guided tour/i);
    fireEvent.click(playBtn);
    expect(playBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
