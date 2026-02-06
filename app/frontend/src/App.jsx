import { RouterProvider } from 'react-router-dom';
import router from '@/routes';
import { Toaster } from 'react-hot-toast';

/**
 * App Component - Root application component
 * Sets up routing using RouterProvider
 */
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  )
}

export default App
