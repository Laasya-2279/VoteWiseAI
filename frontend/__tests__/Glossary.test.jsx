import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlossaryPage from '../src/app/glossary/page';

jest.mock('@/lib/analytics', () => ({
  trackGlossaryTermViewed: jest.fn(),
}));

describe('GlossaryPage', () => {
  it('renders title and terms', () => {
    render(<GlossaryPage />);
    expect(screen.getByText(/Glossary/i)).toBeInTheDocument();
    expect(screen.getByText('EVM')).toBeInTheDocument();
    expect(screen.getByText('VVPAT')).toBeInTheDocument();
  });

  it('filters terms based on search', () => {
    render(<GlossaryPage />);
    const searchInput = screen.getByLabelText(/Search terms/i);
    fireEvent.change(searchInput, { target: { value: 'NOTA' } });
    expect(screen.getByText('NOTA')).toBeInTheDocument();
    expect(screen.queryByText('EVM')).not.toBeInTheDocument();
  });
});
