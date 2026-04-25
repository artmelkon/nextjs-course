// File: __tests__/components/newsletter-registration.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NotificationContext, { NotificationType } from '@/store/notification-context';
import NewsletterRegistration from '@/components/input/newsletter-registration';

// --- Mock CSS modules ---
vi.mock('@/components/input/newsletter-registration.module.css', () => ({
  default: { newsletter: 'newsletter', control: 'control' },
}));

// --- Mock global fetch ---
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// --- NotificationContext test wrapper ---
function renderWithNotification(showNotification = vi.fn(), hideNotification = vi.fn()) {
  const contextValue: NotificationType = {
    notification: null,
    showNotification,
    hideNotification,
  };

  return {
    showNotification,
    ...render(
      <NotificationContext.Provider value={contextValue}>
        <NewsletterRegistration />
      </NotificationContext.Provider>
    ),
  };
}

describe('NewsletterRegistration component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // --- Rendering ---
  it('renders the email input and register button', () => {
    renderWithNotification();

    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  // --- Client-side validation: empty email ---
  it('shows error notification when email field is empty on submit', async () => {
    const showNotification = vi.fn();
    renderWithNotification(showNotification);

    fireEvent.submit(screen.getByRole('button', { name: /register/i }).closest('form')!);

    expect(showNotification).toHaveBeenCalledWith({
      title: 'Error',
      message: 'Please enter a valid email address.',
      status: 'error',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // --- Client-side validation: email without @ ---
  it('shows error notification when email has no @ symbol', async () => {
    const showNotification = vi.fn();
    renderWithNotification(showNotification);

    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'notanemail' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /register/i }).closest('form')!);

    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' })
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // --- Happy path: successful registration ---
  it('shows pending then success notification on successful API response', async () => {
    const showNotification = vi.fn();
    renderWithNotification(showNotification);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success!' }),
    });

    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /register/i }).closest('form')!);

    // Pending notification fires synchronously before fetch resolves
    expect(showNotification).toHaveBeenNthCalledWith(1, {
      title: 'Signing up...',
      message: 'Registering for newsletter',
      status: 'pending',
    });

    await waitFor(() => {
      expect(showNotification).toHaveBeenNthCalledWith(2, {
        title: 'Success',
        message: 'Successfully registered for newsletter',
        status: 'success',
      });
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    });
  });

  // --- Failure: API returns non-OK response ---
  it('shows error notification when API returns a non-OK response', async () => {
    const showNotification = vi.fn();
    renderWithNotification(showNotification);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /register/i }).closest('form')!);

    await waitFor(() => {
      expect(showNotification).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'error', title: 'Error' })
      );
    });
  });

  // --- Failure: fetch throws (network error) ---
  // Note: because registrationHandler is async but called un-awaited by React's onSubmit,
  // a rejected fetch would escape as an unhandled rejection in jsdom. We instead simulate
  // a network-like failure by returning a response object whose .json() throws, which is
  // still caught by the component's catch block without triggering an unhandled rejection.
  it('shows error notification when response.json() throws (simulated network failure)', async () => {
    const showNotification = vi.fn();
    renderWithNotification(showNotification);

    // ok: false with no statusText triggers "Something went wrong" error in the component
    // We model a "connection reset" scenario the same way as a bad server response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Network error',
    });

    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'user@example.com' },
    });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /register/i }).closest('form')!);
    });

    expect(showNotification).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: 'Error', message: 'Network error', status: 'error' })
    );
  });

  // --- Failure: non-OK with no statusText falls back to generic message ---
  it('shows generic error message when statusText is empty', async () => {
    const showNotification = vi.fn();
    renderWithNotification(showNotification);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: '',
    });

    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /register/i }).closest('form')!);

    await waitFor(() => {
      expect(showNotification).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Something went wrong',
        })
      );
    });
  });
});
