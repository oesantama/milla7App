import { render, screen } from '@testing-library/react';

// Mock the auth context used by Layout
jest.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'tester', profile: { role: 'tester' } },
    isAuthenticated: true,
    logout: jest.fn(),
    loading: false,
    initialLoadComplete: true,
    logoutLoading: false,
    permissions: [
      {
        id: 1,
        name: 'Maestras',
        slug: 'maestras',
        order: 1,
        pages: [
          {
            id: 1,
            name: 'Gestión de Operaciones',
            slug: 'gestion-operaciones',
            url_path: '/gestion',
            order: 1,
            tabs: [],
          },
        ],
      },
    ],
    operations: [{ id: 1, name: 'Ajover', slug: 'ajover' }],
    selectedOperation: '',
    setSelectedOperation: jest.fn(),
  }),
}));

// Mock next/navigation used by Layout
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/dashboard',
}));

import Layout from '../app/components/Layout';

describe('Layout component', () => {
  it('renders menu items from permissions', () => {
    render(
      <Layout>
        <div>Contenido</div>
      </Layout>
    );
    // Expect the module name to be visible
    expect(screen.getByText('Maestras')).toBeInTheDocument();
    // Expect the page link to be visible
    expect(screen.getByText('Gestión de Operaciones')).toBeInTheDocument();
  });
});
