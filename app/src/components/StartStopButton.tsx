'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface DeviceStatusEvent {
  device_id: string;
  status: string;
  status_last_updated: string;
}

interface DeviceStatusResponse {
  message: {
    device_id: string;
    device_name: string;
    current_status: string;
    status_last_updated: string;
  };
}

interface UserInfo {
  user_id?: string;
  full_name?: string;
  email?: string;
  [key: string]: unknown;
}

export default function StartStopButton() {
  const [status, setStatus] = useState<'stopped' | 'started'>('stopped');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsSuccess, setToastIsSuccess] = useState<boolean>(true);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Session info from localStorage
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  // Load session info on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    const storedDeviceId = localStorage.getItem('target_device_id') || 'test_motor_01';
    const storedApiKey = localStorage.getItem('api_key') || '';

    if (storedUser) {
      try { setUserInfo(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
    setDeviceId(storedDeviceId);
    setApiKey(storedApiKey);
  }, []);

  // ── Socket.io ──────────────────────────────────────────────────────────
  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uaterp.gbru.in';
    const currentDeviceId = localStorage.getItem('target_device_id') || 'test_motor_01';

    const socket = io(baseURL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket.io] ✅ Connected! Socket ID: ${socket.id}`);
      setSocketConnected(true);
      // Join Frappe's site room to receive frappe.publish_realtime broadcasts
      socket.emit('login', { user: 'Guest' });
    });

    socket.onAny((eventName, ...args) => {
      console.log(`[Socket.io] 📨 Event: "${eventName}"`, args);
    });

    socket.on('smartiot_device_status_update', (data: DeviceStatusEvent) => {
      if (data.device_id !== currentDeviceId) return;
      console.log(`[Socket.io] 🎯 Real-time update:`, data);
      applyStatusUpdate(data.status, data.status_last_updated, data.device_id, 'socket');
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Socket.io] ❌ Disconnected. Reason: ${reason}`);
      setSocketConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error(`[Socket.io] 🔴 Connection error: ${err.message}`);
      setSocketConnected(false);
    });

    return () => { socket.disconnect(); };
  }, []);

  // ── Shared status update handler ───────────────────────────────────────
  const applyStatusUpdate = (
    rawStatus: string,
    lastUpdatedAt: string,
    updatedDeviceId: string,
    source: 'socket' | 'poll'
  ) => {
    const isOn = rawStatus === 'On';
    const formatted = new Date(lastUpdatedAt).toLocaleTimeString();
    console.log(`[Status] Update from ${source}: ${rawStatus} at ${formatted}`);

    setStatus(isOn ? 'started' : 'stopped');
    setToastIsSuccess(isOn);
    setLastUpdated(new Date(lastUpdatedAt).toLocaleString());
    setToastMessage(`${updatedDeviceId} → ${rawStatus}  •  ${formatted}  [${source}]`);

    if (source === 'poll') stopPolling();
  };

  // ── Polling fallback ───────────────────────────────────────────────────
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      console.log('[Poll] Stopped.');
    }
  };

  const startPolling = (expectedAction: 'On' | 'Off', snapshotTime: string) => {
    stopPolling();
    console.log(`[Poll] Waiting for status: ${expectedAction}`);

    const apiKeyVal = localStorage.getItem('api_key');
    const apiSecretVal = localStorage.getItem('api_secret');
    const currentDeviceId = localStorage.getItem('target_device_id') || 'test_motor_01';
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uaterp.gbru.in';

    let attempts = 0;
    const MAX_ATTEMPTS = 30;

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(
          `${baseURL}/api/method/shoption_chatbot.mqtt.get_device_status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `token ${apiKeyVal}:${apiSecretVal}`,
            },
            body: JSON.stringify({ device_id: currentDeviceId }),
          }
        );
        const data: DeviceStatusResponse = await res.json();
        const msg = data.message;
        const updatedAt = new Date(msg.status_last_updated).getTime();
        const sentAt = new Date(snapshotTime).getTime();

        if (msg.current_status === expectedAction && updatedAt >= sentAt) {
          applyStatusUpdate(msg.current_status, msg.status_last_updated, msg.device_id, 'poll');
        }
      } catch (err) {
        console.error('[Poll] Error:', err);
      }

      if (attempts >= MAX_ATTEMPTS) {
        stopPolling();
        setToastIsSuccess(false);
        setToastMessage('No hardware response received. Please check device.');
      }
    }, 2000);
  };

  useEffect(() => () => stopPolling(), []);

  // ── Send MQTT command ──────────────────────────────────────────────────
  const sendMqttRequest = async (action: 'start' | 'stop') => {
    console.log(`[MQTT] ${action}`);
    setLoading(true);
    setToastMessage(null);
    stopPolling();

    try {
      const apiKeyVal = localStorage.getItem('api_key');
      const apiSecretVal = localStorage.getItem('api_secret');
      const currentDeviceId = localStorage.getItem('target_device_id') || 'test_motor_01';
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uaterp.gbru.in';

      const commandSentAt = new Date().toISOString();

      const response = await fetch(
        `${baseURL}/api/method/shoption_chatbot.mqtt.send_device_command`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `token ${apiKeyVal}:${apiSecretVal}`,
          },
          body: JSON.stringify({
            device_id: currentDeviceId,
            action: action === 'start' ? 'On' : 'Off',
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.message?.status === 'Success') {
        setToastIsSuccess(true);
        setToastMessage('Command sent — waiting for hardware response...');
        startPolling(action === 'start' ? 'On' : 'Off', commandSentAt);
      } else {
        setToastIsSuccess(false);
        setToastMessage(`Error: ${data.message?.message || 'Failed to send command'}`);
      }
    } catch (error) {
      console.error(error);
      setToastIsSuccess(false);
      setToastMessage('Network error occurred while sending command');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => { if (status !== 'started' && !loading) sendMqttRequest('start'); };
  const handleStop = () => { if (status !== 'stopped' && !loading) sendMqttRequest('stop'); };

  const handleLogout = () => {
    localStorage.removeItem('api_key');
    localStorage.removeItem('api_secret');
    localStorage.removeItem('user_info');
    localStorage.removeItem('target_device_id');
    router.push('/login');
  };

  // Derived display values
  const displayName = userInfo?.full_name || userInfo?.user_id || userInfo?.email || 'User';
  const displayEmail = userInfo?.email || userInfo?.user_id || '—';
  const maskedKey = apiKey ? `${apiKey.slice(0, 6)}••••••` : '—';

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">

      {/* ── Info Card ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full blur-[80px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-10 pointer-events-none" />

        <div className="relative z-10">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">Dashboard</p>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">SmartIOT Control</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* User */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">User</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-zinc-400 truncate">{displayEmail}</p>
            </div>

            {/* Device */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Device ID</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-white font-mono">{deviceId || '—'}</p>
              <p className="text-xs text-zinc-400">IoT Motor</p>
            </div>

            {/* API Key */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">API Key</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-white font-mono">{maskedKey}</p>
              <p className="text-xs text-zinc-400">ERP token auth</p>
            </div>

            {/* Socket status */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Socket</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                <p className="text-sm font-bold text-zinc-800 dark:text-white">
                  {socketConnected ? 'Live' : 'Disconnected'}
                </p>
              </div>
              <p className="text-xs text-zinc-400">
                {lastUpdated ? `Updated ${lastUpdated}` : 'Waiting for events...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Control Card ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-10 relative">

        {/* Back button */}
        <button
          onClick={() => router.push('/device_add')}
          className="absolute top-5 left-6 px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>

        {/* Toast */}
        <div
          className={`absolute top-5 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-lg text-white transition-all duration-300 transform min-w-[max-content] z-10 flex items-center gap-2 ${
            toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
          } ${toastIsSuccess ? 'bg-green-500' : 'bg-red-500'}`}
        >
          <span className={`w-2 h-2 rounded-full animate-pulse ${toastIsSuccess ? 'bg-green-200' : 'bg-red-200'}`} />
          <span className="font-semibold text-sm tracking-wide">{toastMessage}</span>
        </div>

        {/* Status heading */}
        <h2 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100 mt-6 text-center flex items-center justify-center gap-3">
          Machine Status:
          {loading ? (
            <span className="text-zinc-500 flex items-center gap-2 text-base">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Waiting...
            </span>
          ) : (
            <span className={status === 'started' ? 'text-green-500' : 'text-red-500'}>
              {status === 'started' ? 'ON' : 'OFF'}
            </span>
          )}
        </h2>

        {/* Device label under status */}
        <p className="text-center text-xs text-zinc-400 font-mono mb-8">{deviceId}</p>

        {/* Buttons */}
        <div className="flex gap-6 justify-center">
          <button
            onClick={handleStart}
            disabled={loading || status === 'started'}
            className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${
              status === 'started'
                ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.7)] scale-105'
                : 'bg-zinc-100 text-zinc-600 hover:bg-green-100 hover:text-green-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed'
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
                : 'bg-zinc-100 text-zinc-600 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            STOP
          </button>
        </div>
      </div>
    </div>
  );
}
