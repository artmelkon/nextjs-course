import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/store/auth-context';

type FormState = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Invalid credentials.');
        return;
      }

      login();
      router.push('/');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-base-50)] px-4">
      <div className="w-full max-w-md bg-white rounded-l shadow-md p-8">
        <h1 className="text-2xl font-bold text-[var(--color-base-900)] mb-6 text-center">
          Welcome back
        </h1>

        {error && (
          <p className="mb-4 text-sm text-[var(--color-error-600)] bg-[var(--color-error-50)] border border-[var(--color-error-200)] rounded-s px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-base-700)] mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="jane@example.com"
              className="w-full border border-[var(--color-base-200)] rounded-m px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-base-500)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-base-700)] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Your password"
              className="w-full border border-[var(--color-base-200)] rounded-m px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-base-500)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-base-500)] hover:bg-[var(--color-base-600)] text-white font-semibold py-2 rounded-m transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-[var(--color-base-600)]">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[var(--color-base-500)] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
