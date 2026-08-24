'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // NOTE: You can define NEXT_PUBLIC_API_BASE_URL in your .env.local file
      // e.g. NEXT_PUBLIC_API_BASE_URL=https://your-frappe-server.com
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; 
      
      const response = await fetch(`${baseURL}/api/method/warrior.login.api.login_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY || '',
          'X-API-SECRET': process.env.NEXT_PUBLIC_X_API_SECRET || '',
        },
        body: JSON.stringify({
          user_id: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.message?.status) {
        // Successfully authenticated! Extract key details.
        const keyDetails = data.message.data.key_details;
        if (keyDetails) {
          localStorage.setItem('api_key', keyDetails.api_key);
          localStorage.setItem('api_secret', keyDetails.api_secret);
        }
        
        // Store complete user data
        localStorage.setItem('user_info', JSON.stringify(data.message.data));

        // Redirect to the device selection page
        router.push('/device_add');
      } else {
        // Display any error messages that come back from the server
        setError(data.message?.message || 'Invalid credentials or server error.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please make sure your API server is running and reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 relative overflow-hidden">
        {/* Decorative background gradients for premium feel */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">Welcome back</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">User ID (Email)</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-0 text-zinc-900 dark:text-white transition-all outline-none"
                placeholder="name@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-0 text-zinc-900 dark:text-white transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
