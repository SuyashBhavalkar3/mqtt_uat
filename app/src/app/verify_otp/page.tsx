'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Load the phone number that was just entered
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.phone) {
          setPhone(parsed.phone);
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    // If we didn't find a phone number, kick them back to login
    router.push('/login');
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp || otp.length < 4) {
        setError('Please enter a valid OTP.');
        setLoading(false);
        return;
      }

      // Proxy rewrite makes this hit the Frappe backend
      const response = await fetch(`/api/method/smart_gbru.apis.registration.verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY || '',
          'X-API-SECRET': process.env.NEXT_PUBLIC_X_API_SECRET || '',
        },
        body: JSON.stringify({
          mobile_no: phone,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok && data.message?.status === true) {
        // Successfully verified! Now fetch user details
        const detailsResponse = await fetch(`/api/method/smart_gbru.apis.api_utils.get_user_details?mobile_no=${phone}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY || '',
            'X-API-SECRET': process.env.NEXT_PUBLIC_X_API_SECRET || '',
          },
          cache: 'no-store'
        });
        
        const detailsData = await detailsResponse.json();

        if (detailsResponse.ok && detailsData.message?.status === true) {
          const userData = detailsData.message.data;
          const apiKey = userData.key_details.api_key;
          const apiSecret = userData.key_details.api_secret;

          // Fetch user connected devices
          try {
            const devicesResponse = await fetch(`/api/method/smart_gbru.mqtt.get_devices`, {
              method: 'GET', // Or POST, trying GET this time or just standard fetch
              headers: {
                'Accept': 'application/json',
                'Authorization': `token ${apiKey}:${apiSecret}`
              }
            });
            const devicesData = await devicesResponse.json();
            if (devicesResponse.ok && Array.isArray(devicesData.message)) {
               const deviceIds = devicesData.message.map((d: any) => d.device_id.toLowerCase());
               localStorage.setItem('added_devices', JSON.stringify(deviceIds));
            }
          } catch (deviceErr) {
            console.error('Failed to fetch connected devices:', deviceErr);
          }
          
          // Store API credentials and user info in localStorage for the dashboard
          localStorage.setItem('api_key', apiKey);
          localStorage.setItem('api_secret', apiSecret);
          localStorage.setItem('user_info', JSON.stringify({
            full_name: userData.full_name,
            email: userData.email,
            user_id: userData.user_id,
            phone: userData.mobile_no,
            registration_id: userData.registration_id
          }));
          
          // Redirect to the dashboard
          router.push('/dashboard');
        } else {
          setError(detailsData.message?.message || 'OTP verified, but failed to fetch user details.');
        }
      } else {
        setError(data.message?.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please check your network connection.');
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
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">Verify OTP</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Enter the code sent to <br />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{phone}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">One-Time Password</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-0 text-zinc-900 dark:text-white transition-all outline-none tracking-[0.5em] text-center text-lg"
                placeholder="••••••"
                maxLength={6}
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
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/login')} 
              className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Change phone number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
