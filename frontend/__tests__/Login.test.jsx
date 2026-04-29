import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../src/app/login/page';

describe('LoginPage', () => {
  it('renders login form by default', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('toggles to signup mode', () => {
    render(<LoginPage />);
    const toggleBtn = screen.getByText(/Sign Up/i);
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });
});
