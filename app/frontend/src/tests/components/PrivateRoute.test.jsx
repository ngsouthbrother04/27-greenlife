import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../components/PrivateRoute';
import { useAuthStore } from '@/stores';

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn()
}));

const MockComponent = () => <div>Protected Content</div>;
const MockLogin = () => <div>Login Page</div>;

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRoute = (allowedRoles) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/auth/login" element={<MockLogin />} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route element={<PrivateRoute allowedRoles={allowedRoles} />}>
            <Route path="/protected" element={<MockComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('shows loader when loading', () => {
    useAuthStore.mockReturnValue({ isLoading: true });
    const { container } = renderRoute();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    useAuthStore.mockReturnValue({ 
      isLoading: false, 
      isAuthenticated: () => false 
    });
    renderRoute();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders outlet when authenticated and no roles specified', () => {
    useAuthStore.mockReturnValue({ 
      isLoading: false, 
      isAuthenticated: () => true 
    });
    renderRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to home when role is not allowed', () => {
    // lowercase roles according to code
    useAuthStore.mockReturnValue({ 
      isLoading: false, 
      isAuthenticated: () => true,
      user: { role: 'customer' }
    });
    renderRoute(['admin']);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders outlet when role is allowed', () => {
    useAuthStore.mockReturnValue({ 
      isLoading: false, 
      isAuthenticated: () => true,
      user: { role: 'admin' }
    });
    renderRoute(['admin']);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
