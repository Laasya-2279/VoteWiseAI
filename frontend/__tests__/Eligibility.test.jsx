import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EligibilityPage from '../src/app/eligibility/page';

jest.mock('@/lib/analytics', () => ({
  trackEligibilityChecked: jest.fn(),
}));

describe('EligibilityPage', () => {
  it('renders title and initial form', () => {
    render(<EligibilityPage />);
    expect(screen.getByText(/Voter/i)).toBeInTheDocument();
    expect(screen.getByText(/Eligibility/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
  });

  it('shows error on invalid age', () => {
    render(<EligibilityPage />);
    const ageInput = screen.getByLabelText(/Age/i);
    fireEvent.change(ageInput, { target: { value: '0' } });
    fireEvent.click(screen.getByText(/Next: Verify Details/i));
    expect(screen.getByText(/Please enter a valid age/i)).toBeInTheDocument();
  });

  it('proceeds to step 2 on valid input', () => {
    render(<EligibilityPage />);
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/State of Residence/i), { target: { value: 'Maharashtra' } });
    fireEvent.click(screen.getByText(/Next: Verify Details/i));
    expect(screen.getByText(/Verify Your Information/i)).toBeInTheDocument();
  });
});
