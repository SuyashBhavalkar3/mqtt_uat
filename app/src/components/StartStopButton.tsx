'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StartStopButton() {
  const [status, setStatus] = useState<'stopped' | 'started'>('stopped');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  // Send MQTT command to the ERP using the saved API keys
  const sendMqttRequest = async (action: 'start' | 'stop') => {
    console.log(`[MQTT] Button clicked. Initiating request for action: ${action}`);
    setLoading(true);
    setToastMessage(null); // Clear previous toast while waiting
    
    try {
      const apiKey = localStorage.getItem('api_key');
      const apiSecret = localStorage.getItem('api_secret');
      const deviceId = localStorage.getItem('target_device_id') || 'test_motor_01';
      
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uatsmart.gbru.in';
      const endpoint = `${baseURL}/api/method/shoption_chatbot.mqtt.send_device_command`;
      
      console.log(`[MQTT] API URL: ${endpoint}`);
      console.log(`[MQTT] Payload:`, { device_id: deviceId, action: action === 'start' ? 'On' : 'Off' });
      console.log(`[MQTT] Auth Header: token ${apiKey}:[HIDDEN]`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `token ${apiKey}:${apiSecret}`
        },
        body: JSON.stringify({
          device_id: deviceId,
          action: action === 'start' ? 'On' : 'Off'
        })
      });

      const data = await response.json();

      if (response.ok && data.message?.status === 'Success') {
        if (action === 'start') {
          setStatus('started');
          setToastMessage('Status ON: Machine is running');
        } else {
          setStatus('stopped');
          setToastMessage('Status OFF: Machine has stopped');
        }
      } else {
        // API returned an error
        setToastMessage(`Error: ${data.message?.message || 'Failed to send command'}`);
      }
    } catch (error) {
      console.error(error);
      setToastMessage('Network error occurred while sending command');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (status !== 'started' && !loading) sendMqttRequest('start');
  };

  const handleStop = () => {
    if (status !== 'stopped' && !loading) sendMqttRequest('stop');
  };

  const handleLogout = () => {
    // Clear all authenticated data
    localStorage.removeItem('api_key');
    localStorage.removeItem('api_secret');
    localStorage.removeItem('user_info');
    localStorage.removeItem('target_device_id');
    // Redirect to login page
    router.push('/login');
  };

  // Automatically clear the toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 relative w-full max-w-2xl">
      
      {/* Back Button */}
      <button 
        onClick={() => router.push('/device_add')}
        className="absolute top-6 left-8 px-4 py-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back
      </button>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-8 px-4 py-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
      >
        Logout
      </button>

      {/* Real-time Popup Notification */}
      <div 
        className={`absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg font-bold text-white transition-all duration-300 transform min-w-[max-content] z-10 ${
          toastMessage 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-8 opacity-0 pointer-events-none'
        } ${status === 'started' ? 'bg-green-500' : 'bg-red-500'}`}
      >
        {toastMessage}
      </div>

      <h2 className="text-3xl font-bold mb-10 text-zinc-800 dark:text-zinc-100 mt-8 flex items-center gap-3">
        Machine Status: 
        {loading ? (
          <span className="text-zinc-500 flex items-center gap-2">
            <svg className="animate-spin h-6 w-6 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Waiting for ERP...
          </span>
        ) : (
          <span className={status === 'started' ? 'text-green-500' : 'text-red-500'}>
            {status === 'started' ? 'ON' : 'OFF'}
          </span>
        )}
      </h2>
      <div className="flex gap-8">
        <button
          onClick={handleStart}
          disabled={loading || status === 'started'}
          className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${
            status === 'started'
              ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.7)] scale-105'
              : 'bg-zinc-100 text-zinc-600 hover:bg-green-100 hover:text-green-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-100 dark:disabled:hover:bg-zinc-800'
          }`}
        >
          START
        </button>
        <button
          onClick={handleStop}
          disabled={loading || status === 'stopped'}
          className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${
            status === 'stopped'
              ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.7)] scale-105'
              : 'bg-zinc-100 text-zinc-600 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-100 dark:disabled:hover:bg-zinc-800'
          }`}
        >
          STOP
        </button>
      </div>
    </div>
  );
}
