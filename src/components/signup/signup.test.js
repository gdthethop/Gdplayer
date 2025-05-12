import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Signup from './signup';
import { BrowserRouter } from 'react-router-dom';

const mockStore = configureStore([]);
const store = mockStore({});

describe('Signup Component', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </Provider>
    );
  });

  test('renders signup form', () => {
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    const passwordInputs = screen.getAllByLabelText(/Password/i);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  test('shows required validation errors when fields are empty', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Password is required/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Confirm Password is required/i)).toBeInTheDocument();
    });
  });

  test('shows invalid email, short password and password mismatch errors', async () => {
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalidemail' } });
    const passwordInputs = screen.getAllByLabelText(/Password/i);
    fireEvent.change(passwordInputs[0], { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  // Additional tests for successful submission can be added with mocking dispatch
});
