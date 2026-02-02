import { Outlet, Link } from 'react-router-dom';

/**
 * AuthLayout - Layout for authentication pages (login, register)
 * Provides a centered card design for auth forms
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <Link to="/" className="text-2xl font-bold text-primary">GreenLife Store</Link>
            <h2 className="mt-2 text-lg font-medium text-muted-foreground">Chào mừng quay trở lại</h2>
        </div>
        <div className="bg-background p-8 shadow-sm rounded-lg border">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
