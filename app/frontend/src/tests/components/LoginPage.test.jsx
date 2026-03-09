import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../../pages/auth/LoginPage';
import { useAuthStore } from '@/stores';
import authService from '@/api/authService';

// Mock dependencies
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
}));

const { mockLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
}));

vi.mock('@/api/authService', () => ({
  default: {
    login: mockLogin,
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  let queryClient;
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();

    useAuthStore.mockReturnValue({
      setUser: mockSetUser,
      isAuthenticated: () => false,
    });
  });

  const renderLoginPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders login form correctly', () => {
    renderLoginPage();
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderLoginPage();
    
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  /*
  it('handles successful login and navigation', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, role: 'USER' },
        accessToken: 'dummy_token'
      }
    };
    mockLogin.mockResolvedValueOnce(mockResponse);

    renderLoginPage();
    
    // Switch to simpler logic testing
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: '123456' } });
    
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123456'
      });
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user, mockResponse.data.accessToken);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
  */
});
