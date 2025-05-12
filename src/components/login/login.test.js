import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Login from './login';
import { BrowserRouter } from 'react-router-dom';

const mockStore = configureStore([]);
const store = mockStore({});

describe('Login Component', () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  });

  test('renders login form', () => {
    expect(screen.getByLabelText(/Email or Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('shows required validation errors when fields are empty', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  test('shows invalid email and short password errors', async () => {
    fireEvent.change(screen.getByLabelText(/Email or Phone Number/i), { target: { value: 'invalidemail' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  // Additional tests for successful submission can be added with mocking dispatch
});
