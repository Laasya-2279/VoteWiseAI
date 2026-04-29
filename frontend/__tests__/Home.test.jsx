import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../src/app/page';

describe('HomePage', () => {
  it('renders hero section and slogans', () => {
    render(<HomePage />);
    expect(screen.getByText(/Your Vote/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Voice/i)).toBeInTheDocument();
    expect(screen.getByText(/Empowering Indian Citizens/i)).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<HomePage />);
    expect(screen.getByText(/Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/Timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase Map/i)).toBeInTheDocument();
  });
});
