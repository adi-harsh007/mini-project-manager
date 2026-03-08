import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Failed to create an account. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md shadow-xl bg-white/50">
        <h2 className="text-2xl font-bold text-center text-primary-600 mb-6">Sign Up</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Name</label>
            <input type="text" required className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
            <input type="email" required className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Password</label>
            <input type="password" minLength={6} required className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer">
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-surface-600">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
}
