/**
 * Testing & Debugging Mastery — React Component Test Examples (2026)
 * ===================================================================
 * Complete examples using @testing-library/react + Vitest.
 * Tests behavior from the USER's perspective.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';


// ============================================
// 1. SIMPLE COMPONENT TESTS
// ============================================

// import { Button } from '@/components/Button';
const Button = ({ children, onClick, disabled, variant = 'primary', loading }) => (
  <button onClick={onClick} disabled={disabled || loading} className={variant}>
    {loading ? 'Loading...' : children}
  </button>
);

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Loading...');
    expect(screen.getByRole('button')).toBeDisabled();
  });
});


// ============================================
// 2. FORM COMPONENT TESTS
// ============================================

// import { LoginForm } from '@/components/LoginForm';
const LoginForm = ({ onSubmit, isLoading, error }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit({
      email: formData.get('email'),
      password: formData.get('password'),
    });
  };
  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      {error && <div role="alert">{error}</div>}
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

describe('LoginForm', () => {
  const mockSubmit = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockSubmit.mockReset();
  });

  it('renders all form fields', () => {
    render(<LoginForm onSubmit={mockSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits with valid data', async () => {
    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
  });

  it('shows loading state during submission', () => {
    render(<LoginForm onSubmit={mockSubmit} isLoading />);
    const button = screen.getByRole('button');

    expect(button).toHaveTextContent('Signing in...');
    expect(button).toBeDisabled();
  });

  it('displays error message', () => {
    render(<LoginForm onSubmit={mockSubmit} error="Invalid credentials" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('supports keyboard submission (Enter key)', async () => {
    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!{Enter}');

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('focuses email field on mount', () => {
    render(<LoginForm onSubmit={mockSubmit} />);
    // If auto-focus is implemented:
    // expect(screen.getByLabelText(/email/i)).toHaveFocus();
  });
});


// ============================================
// 3. LIST / DATA DISPLAY TESTS
// ============================================

const UserList = ({ users, onDelete, isLoading }) => {
  if (isLoading) return <div role="status">Loading users...</div>;
  if (users.length === 0) return <p>No users found.</p>;

  return (
    <ul role="list" aria-label="Users">
      {users.map(u => (
        <li key={u.id} data-testid={`user-${u.id}`}>
          <span>{u.name}</span>
          <span>{u.email}</span>
          <button onClick={() => onDelete(u.id)} aria-label={`Delete ${u.name}`}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

describe('UserList', () => {
  const users = [
    { id: '1', name: 'Alice', email: 'alice@test.com' },
    { id: '2', name: 'Bob', email: 'bob@test.com' },
    { id: '3', name: 'Charlie', email: 'charlie@test.com' },
  ];

  it('renders all users', () => {
    render(<UserList users={users} onDelete={vi.fn()} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<UserList users={[]} onDelete={vi.fn()} isLoading />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading users...');
  });

  it('shows empty state', () => {
    render(<UserList users={[]} onDelete={vi.fn()} />);

    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });

  it('calls onDelete with user ID', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<UserList users={users} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /delete alice/i }));

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('renders each user with correct data', () => {
    render(<UserList users={users} onDelete={vi.fn()} />);

    const firstItem = screen.getByTestId('user-1');
    expect(within(firstItem).getByText('Alice')).toBeInTheDocument();
    expect(within(firstItem).getByText('alice@test.com')).toBeInTheDocument();
  });
});


// ============================================
// 4. ASYNC DATA FETCHING TESTS
// ============================================

// Component that fetches data
const UserProfile = ({ userId }) => {
  const [user, setUser] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [userId]);

  if (loading) return <div role="status" aria-label="Loading">Loading...</div>;
  if (error) return <div role="alert">{error}</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

// Note: Use MSW (Mock Service Worker) for network mocking
// describe('UserProfile', () => {
//   it('shows loading then data', async () => {
//     render(<UserProfile userId="123" />);
//
//     expect(screen.getByRole('status')).toHaveTextContent('Loading...');
//
//     await waitForElementToBeRemoved(() => screen.queryByRole('status'));
//
//     expect(screen.getByText('John Doe')).toBeInTheDocument();
//     expect(screen.getByText('john@example.com')).toBeInTheDocument();
//   });
// });


// ============================================
// 5. MODAL / DIALOG TESTS
// ============================================

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div role="dialog" aria-label={title} aria-modal="true">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
};

describe('ConfirmDialog', () => {
  it('is hidden when not open', () => {
    render(
      <ConfirmDialog isOpen={false} title="Delete?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows when open', () => {
    render(
      <ConfirmDialog isOpen={true} title="Delete?" message="Are you sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByRole('dialog', { name: 'Delete?' })).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirmed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog isOpen={true} title="Delete?" onConfirm={onConfirm} onCancel={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancelled', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog isOpen={true} title="Delete?" onConfirm={vi.fn()} onCancel={onCancel} />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});


// ============================================
// 6. ACCESSIBILITY TESTING
// ============================================
describe('Accessibility', () => {
  it('form has proper labels', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    // Every input should have a label
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('form has proper role', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('form', { name: /login form/i })).toBeInTheDocument();
  });

  it('list has proper role and label', () => {
    const users = [{ id: '1', name: 'Test', email: 'test@test.com' }];
    render(<UserList users={users} onDelete={vi.fn()} />);

    expect(screen.getByRole('list', { name: /users/i })).toBeInTheDocument();
  });

  it('dialog has aria-modal attribute', () => {
    render(
      <ConfirmDialog isOpen={true} title="Test" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});


console.log('✅ React component test examples loaded');
