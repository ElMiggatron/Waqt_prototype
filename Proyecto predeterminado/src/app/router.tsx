import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { AcademicPanel } from '../features/academic/AcademicPanel';
import { IntellectualPanel } from '../features/intellectual/IntellectualPanel';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // ... other routes
      {
        path: '/academic',
        element: <AcademicPanel />,
      },
      {
        path: '/academic/:subjectId',
        element: <AcademicPanel />,
      },
      // ...
    ],
  },
]);