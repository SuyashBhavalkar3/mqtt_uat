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

export default function StartStopButton() {
  const [status, setStatus] = useState<'stopped' | 'started'>('stopped');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsSuccess, setToastIsSuccess] = useState<boolean>(true);
  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  // ── Socket.io (bonus — works when backend uses room="all") ──────────────
  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uaterp.gbru.in';
    const deviceId = localStorage.getItem('target_device_id') || 'test_motor_02';

    console.log(`[Socket.io] Attempting connection to: ${baseURL}`);

    const socket = io(baseURL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket.io] ✅ Connected! Socket ID: ${socket.id}`);
    });

    // Catch-all — will show any event name coming from server
    socket.onAny((eventName, ...args) => {
      console.log(`[Socket.io] 📨 Event received: "${eventName}"`, args);
    });

    socket.on('smartiot_device_status_update', (data: DeviceStatusEvent) => {
      if (data.device_id !== deviceId) return;
      console.log(`[Socket.io] 🎯 Real-time update:`, data);
      applyStatusUpdate(data.status, data.status_last_updated, data.device_id, 'socket');
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Socket.io] ❌ Disconnected. Reason: ${reason}`);
    });

    socket.on('connect_error', (err) => {
      console.error(`[Socket.io] 🔴 Connection error: ${err.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Shared helper to update UI from either socket or poll ───────────────
  const applyStatusUpdate = (
    rawStatus: string,
    lastUpdated: string,
    deviceId: string,
    source: 'socket' | 'poll'
  ) => {
    const isOn = rawStatus === 'On';
    const formattedTime = new Date(lastUpdated).toLocaleTimeString();

    console.log(`[Status] Update from ${source}: ${rawStatus} at ${formattedTime}`);

    setStatus(isOn ? 'started' : 'stopped');
    setToastIsSuccess(isOn);
    setToastMessage(
      `${deviceId} → ${rawStatus}  •  ${formattedTime}  [via ${source}]`
    );

    // Stop polling once we get a confirmed status update
    if (source === 'poll') stopPolling();
  };

  // ── Polling fallback via get_device_status API ──────────────────────────
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      console.log('[Poll] Stopped polling.');
    }
  };

  const startPolling = (expectedAction: 'On' | 'Off', snapshotTime: string) => {
    stopPolling(); // clear any existing poll
    console.log(`[Poll] Starting — waiting for status: ${expectedAction}`);

    const apiKey = localStorage.getItem('api_key');
    const apiSecret = localStorage.getItem('api_secret');
    const deviceId = localStorage.getItem('target_device_id') || 'test_motor_02';
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uaterp.gbru.in';

    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 30 × 2s = 60s max wait

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      console.log(`[Poll] Attempt ${attempts}/${MAX_ATTEMPTS}...`);

      try {
        const res = await fetch(
          `${baseURL}/api/method/shoption_chatbot.mqtt.get_device_status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `token ${apiKey}:${apiSecret}`,
            },
            body: JSON.stringify({ device_id: deviceId }),
          }
        );

        const data: DeviceStatusResponse = await res.json();
        const msg = data.message;
        console.log(`[Poll] Got status: ${msg.current_status} (last updated: ${msg.status_last_updated})`);

        // Accept update only if it happened AFTER we sent the command
        const updatedAt = new Date(msg.status_last_updated).getTime();
        const sentAt = new Date(snapshotTime).getTime();

        if (msg.current_status === expectedAction && updatedAt >= sentAt) {
          console.log(`[Poll] ✅ Status confirmed: ${msg.current_status}`);
          applyStatusUpdate(msg.current_status, msg.status_last_updated, msg.device_id, 'poll');
        }
      } catch (err) {
        console.error('[Poll] Error fetching device status:', err);
      }

      if (attempts >= MAX_ATTEMPTS) {
        console.warn('[Poll] Max attempts reached. Stopping.');
        stopPolling();
        setToastIsSuccess(false);
        setToastMessage('No hardware response received. Please check device.');
      }
    }, 2000); // poll every 2 seconds
  };

  // Cleanup polling on unmount
  useEffect(() => () => stopPolling(), []);

  // ── Send MQTT command ───────────────────────────────────────────────────
  const sendMqttRequest = async (action: 'start' | 'stop') => {
    console.log(`[MQTT] Button clicked: ${action}`);
    setLoading(true);
    setToastMessage(null);
    stopPolling();

    try {
      const apiKey = localStorage.getItem('api_key');
      const apiSecret = localStorage.getItem('api_secret');
      const deviceId = localStorage.getItem('target_device_id') || 'test_motor_02';
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uaterp.gbru.in';
      const endpoint = `${baseURL}/api/method/shoption_chatbot.mqtt.send_device_command`;

      console.log(`[MQTT] Payload:`, { device_id: deviceId, action: action === 'start' ? 'On' : 'Off' });

      const commandSentAt = new Date().toISOString();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `token ${apiKey}:${apiSecret}`,
        },
        body: JSON.stringify({
          device_id: deviceId,
          action: action === 'start' ? 'On' : 'Off',
        }),
      });

      const data = await response.json();

      if (response.ok && data.message?.status === 'Success') {
        const expectedStatus = action === 'start' ? 'On' : 'Off';
        setToastIsSuccess(true);
        setToastMessage('Command sent — waiting for hardware response...');
        // Start polling — will update UI when hardware confirms
        startPolling(expectedStatus, commandSentAt);
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

  const handleStart = () => {
    if (status !== 'started' && !loading) sendMqttRequest('start');
  };

  const handleStop = () => {
    if (status !== 'stopped' && !loading) sendMqttRequest('stop');
  };

  const handleLogout = () => {
    localStorage.removeItem('api_key');
    localStorage.removeItem('api_secret');
    localStorage.removeItem('user_info');
    localStorage.removeItem('target_device_id');
    router.push('/login');
  };

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
        className={`absolute top-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-white transition-all duration-300 transform min-w-[max-content] z-10 flex items-center gap-2 ${toastMessage
          ? 'translate-y-0 opacity-100'
          : '-translate-y-8 opacity-0 pointer-events-none'
          } ${toastIsSuccess ? 'bg-green-500' : 'bg-red-500'}`}
      >
        <span className={`w-2 h-2 rounded-full animate-pulse ${toastIsSuccess ? 'bg-green-200' : 'bg-red-200'}`} />
        <span className="font-semibold text-sm tracking-wide">{toastMessage}</span>
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
          className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${status === 'started'
            ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.7)] scale-105'
            : 'bg-zinc-100 text-zinc-600 hover:bg-green-100 hover:text-green-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-100 dark:disabled:hover:bg-zinc-800'
            }`}
        >
          START
        </button>
        <button
          onClick={handleStop}
          disabled={loading || status === 'stopped'}
          className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${status === 'stopped'
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
