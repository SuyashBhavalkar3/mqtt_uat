'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeviceSelectionPage() {
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceId.trim() !== 'test_motor_01') {
      setError("Device not configured. Please use 'test_motor_01' for now.");
      return;
    }
    
    setError('');
    // Store the device ID so the button page can use it for MQTT interactions
    localStorage.setItem('target_device_id', deviceId);
    router.push('/button');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4 font-sans">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Connect Device</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Enter your IoT device ID to establish a connection.</p>
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          <form onSubmit={handleEnter} className="space-y-6">
            <div>
              <input 
                type="text" 
                required
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-4 py-3 text-center text-lg tracking-widest uppercase rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-0 text-zinc-900 dark:text-white transition-all outline-none placeholder:normal-case placeholder:tracking-normal"
                placeholder="e.g. DEV-8374"
              />
            </div>
            
            <button
              type="submit"
              disabled={!deviceId.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex justify-center items-center"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
