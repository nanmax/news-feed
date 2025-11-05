import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Feed from '../pages/Feed';
import Users from '../pages/Users';
import { AuthProvider } from '../contexts/AuthContext';

// Mock fetch globally
global.fetch = jest.fn();

const MockedApp = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Register Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders register form', () => {
    render(
      <MockedApp>
        <Register />
      </MockedApp>
    );

    expect(screen.getByText('News Feed')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  test('handles successful registration', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, username: 'testuser' }),
    });

    render(
      <MockedApp>
        <Register />
      </MockedApp>
    );

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/register'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
      })
    );
  });

  test('handles registration error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Username already exists' }),
    });

    render(
      <MockedApp>
        <Register />
      </MockedApp>
    );

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByRole('button', { name: 'Register' });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  test('validates form inputs', () => {
    render(
      <MockedApp>
        <Register />
      </MockedApp>
    );

    const registerButton = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(registerButton);

    expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
  });
});

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test('renders login form', () => {
    render(
      <MockedApp>
        <Login />
      </MockedApp>
    );

    expect(screen.getByText('News Feed')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
        expiresIn: 900
      }),
    });

    render(
      <MockedApp>
        <Login />
      </MockedApp>
    );

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/login'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
      })
    );
  });

  test('handles login error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(
      <MockedApp>
        <Login />
      </MockedApp>
    );

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: 'Sign In' });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

describe('Feed Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('token', 'fake-jwt-token');
  });

  test('renders feed page', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    render(
      <MockedApp>
        <Feed />
      </MockedApp>
    );

    expect(screen.getByText('News Feed')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();
  });

  test('handles post creation', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          content: 'Test post',
          username: 'testuser',
          createdAt: new Date().toISOString()
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [] }),
      });

    render(
      <MockedApp>
        <Feed />
      </MockedApp>
    );

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const postButton = screen.getByRole('button', { name: 'Post' });

    fireEvent.change(textarea, { target: { value: 'Test post' } });
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-jwt-token'
          },
          body: JSON.stringify({ content: 'Test post' }),
        })
      );
    });
  });

  test('displays posts', async () => {
    const mockPosts = [
      {
        id: 1,
        content: 'First test post',
        username: 'user1',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        content: 'Second test post',
        username: 'user2',
        createdAt: new Date().toISOString()
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: mockPosts }),
    });

    render(
      <MockedApp>
        <Feed />
      </MockedApp>
    );

    await waitFor(() => {
      expect(screen.getByText('First test post')).toBeInTheDocument();
      expect(screen.getByText('Second test post')).toBeInTheDocument();
      expect(screen.getByText('@user1')).toBeInTheDocument();
      expect(screen.getByText('@user2')).toBeInTheDocument();
    });
  });
});

describe('Users Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('token', 'fake-jwt-token');
  });

  test('renders users page', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });

    render(
      <MockedApp>
        <Users />
      </MockedApp>
    );

    expect(screen.getByText('Discover Users')).toBeInTheDocument();
  });

  test('displays users list', async () => {
    const mockUsers = [
      {
        id: 1,
        username: 'user1',
        isFollowing: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'user2',
        isFollowing: true,
        createdAt: new Date().toISOString()
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(
      <MockedApp>
        <Users />
      </MockedApp>
    );

    await waitFor(() => {
      expect(screen.getByText('@user1')).toBeInTheDocument();
      expect(screen.getByText('@user2')).toBeInTheDocument();
      expect(screen.getByText('Follow')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
    });
  });

  test('handles follow action', async () => {
    const mockUsers = [
      {
        id: 1,
        username: 'user1',
        isFollowing: false,
        createdAt: new Date().toISOString()
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'you followed user 1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [{ ...mockUsers[0], isFollowing: true }]
        }),
      });

    render(
      <MockedApp>
        <Users />
      </MockedApp>
    );

    await waitFor(() => {
      const followButton = screen.getByText('Follow');
      fireEvent.click(followButton);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/follow/1'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer fake-jwt-token'
        }
      })
    );
  });

  test('handles unfollow action', async () => {
    const mockUsers = [
      {
        id: 1,
        username: 'user1',
        isFollowing: true,
        createdAt: new Date().toISOString()
      }
    ];

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'you unfollowed user 1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [{ ...mockUsers[0], isFollowing: false }]
        }),
      });

    render(
      <MockedApp>
        <Users />
      </MockedApp>
    );

    await waitFor(() => {
      const unfollowButton = screen.getByText('Following');
      fireEvent.click(unfollowButton);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/follow/1'),
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer fake-jwt-token'
        }
      })
    );
  });
});