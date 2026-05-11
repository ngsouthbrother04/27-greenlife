import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPage from '../../pages/auth/RegisterPage';
import { useAuthStore } from '@/stores';

// Mock dependencies
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
}));

const { mockRegister } = vi.hoisted(() => ({
  mockRegister: vi.fn(),
}));

vi.mock('@/api/authService', () => ({
  default: {
    register: mockRegister,
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

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('RegisterPage Component', () => {
  let queryClient;
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    useAuthStore.mockReturnValue({
      setUser: mockSetUser,
      isAuthenticated: () => false,
    });
  });

  const renderRegisterPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders register form correctly', () => {
    renderRegisterPage();
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0123456789')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ho Chi Minh')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123 Green Street, District 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', async () => {
    renderRegisterPage();
    
    const submitBtn = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number must be 10 digits')).toBeInTheDocument();
      expect(screen.getByText('City is required (min 2 chars)')).toBeInTheDocument();
      expect(screen.getByText('Address must be at least 5 characters')).toBeInTheDocument();
      expect(screen.getAllByText(/Password must be at least 6 characters/).length).toBeGreaterThan(0);
    });
  });

  it('shows password mismatch error', async () => {
    renderRegisterPage();
    
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password124' } });
    
    const submitBtn = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    const mockResponse = {
      data: {
        user: { id: 1, name: 'John', email: 'john@example.com' },
        accessToken: 'dummy_token'
      }
    };
    mockRegister.mockResolvedValueOnce(mockResponse);

    renderRegisterPage();
    
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } });
    fireEvent.change(screen.getByPlaceholderText('Ho Chi Minh'), { target: { value: 'HCMC' } });
    fireEvent.change(screen.getByPlaceholderText('123 Green Street, District 1'), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } });
    
    const submitBtn = screen.getByRole('button', { name: /Sign Up/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        fullName: 'John Doe',
        phone: '0123456789',
        city: 'HCMC',
        address: '123 Test Street',
        email: 'john@example.com',
        password: 'password123'
      }, expect.anything());
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user, mockResponse.data.accessToken);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
