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

interface DeviceLog {
  name?: string;
  timestamp: string;
  event_type: 'Command' | 'Status' | string;
  message: string;
  triggered_by?: string;
  payload?: string;
}

export default function StartStopButton() {
  const [status, setStatus] = useState<'stopped' | 'started'>('stopped');
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsSuccess, setToastIsSuccess] = useState<boolean>(true);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Session info
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  // Log panel
  const [logOpen, setLogOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  // ── Load session info ─────────────────────────────────────────────────
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

  // ── Fetch device logs from Frappe ──────────────────────────────────────
  const fetchLogs = async () => {
    const apiKeyVal = localStorage.getItem('api_key');
    const apiSecretVal = localStorage.getItem('api_secret');
    const currentDeviceId = localStorage.getItem('target_device_id') || 'test_motor_01';
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uaterp.gbru.in';

    setLogsLoading(true);
    try {
      // Fetch the full IOT Device doc — child table (logs) is included automatically
      const res = await fetch(
        `${baseURL}/api/resource/IOT Device/${encodeURIComponent(currentDeviceId)}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `token ${apiKeyVal}:${apiSecretVal}`,
          },
        }
      );
      const data = await res.json();
      const rawLogs: DeviceLog[] = data?.message?.logs || data?.data?.logs || [];
      // Sort newest first
      const sorted = [...rawLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setLogs(sorted.slice(0, 50)); // keep last 50
    } catch (err) {
      console.error('[Logs] Failed to fetch:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Stream logs in real-time: poll every 3s while panel is open
  useEffect(() => {
    if (logOpen) {
      fetchLogs(); // immediate fetch on open
      logPollRef.current = setInterval(fetchLogs, 3000);
    } else {
      if (logPollRef.current) {
        clearInterval(logPollRef.current);
        logPollRef.current = null;
      }
    }
    return () => {
      if (logPollRef.current) {
        clearInterval(logPollRef.current);
        logPollRef.current = null;
      }
    };
  }, [logOpen]);

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
      socket.emit('login', { user: 'Guest' });
    });

    socket.onAny((eventName, ...args) => {
      console.log(`[Socket.io] 📨 Event: "${eventName}"`, args);
    });

    socket.on('smartiot_device_status_update', (data: DeviceStatusEvent) => {
      if (data.device_id !== currentDeviceId) return;
      console.log(`[Socket.io] 🎯 Real-time update:`, data);
      applyStatusUpdate(data.status, data.status_last_updated, data.device_id, 'socket');
      // Refresh logs when a real-time status comes in
      fetchLogs();
    });

    socket.on('disconnect', (reason) => {
      console.warn(`[Socket.io] ❌ Disconnected: ${reason}`);
      setSocketConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error(`[Socket.io] 🔴 Error: ${err.message}`);
      setSocketConnected(false);
    });

    return () => { socket.disconnect(); };
  }, []);

  // ── Shared status update ───────────────────────────────────────────────
  const applyStatusUpdate = (
    rawStatus: string,
    lastUpdatedAt: string,
    updatedDeviceId: string,
    source: 'socket' | 'poll'
  ) => {
    const isOn = rawStatus === 'On';
    const formatted = new Date(lastUpdatedAt).toLocaleTimeString();
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
    }
  };

  const startPolling = (expectedAction: 'On' | 'Off', snapshotTime: string) => {
    stopPolling();
    const apiKeyVal = localStorage.getItem('api_key');
    const apiSecretVal = localStorage.getItem('api_secret');
    const currentDeviceId = localStorage.getItem('target_device_id') || 'test_motor_01';
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uaterp.gbru.in';
    let attempts = 0;
    const MAX = 30;

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
          fetchLogs(); // refresh logs after poll confirms
        }
      } catch (err) {
        console.error('[Poll]', err);
      }
      if (attempts >= MAX) {
        stopPolling();
        setToastIsSuccess(false);
        setToastMessage('No hardware response received. Please check device.');
      }
    }, 2000);
  };

  useEffect(() => () => stopPolling(), []);

  // ── MQTT command ───────────────────────────────────────────────────────
  const sendMqttRequest = async (action: 'start' | 'stop') => {
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
          body: JSON.stringify({ device_id: currentDeviceId, action: action === 'start' ? 'On' : 'Off' }),
        }
      );
      const data = await response.json();

      if (response.ok && data.message?.status === 'Success') {
        setToastIsSuccess(true);
        setToastMessage('Command sent — waiting for hardware response...');
        startPolling(action === 'start' ? 'On' : 'Off', commandSentAt);
        // Refresh logs shortly after command is sent
        setTimeout(fetchLogs, 1500);
      } else {
        setToastIsSuccess(false);
        setToastMessage(`Error: ${data.message?.message || 'Failed to send command'}`);
      }
    } catch (error) {
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

  // Log badge colours
  const logBadge = (type: string) => {
    if (type === 'Command') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    if (type === 'Status') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">

      {/* ── Info Card ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full blur-[80px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-10 pointer-events-none" />

        <div className="relative z-10">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">User</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-zinc-400 truncate">{displayEmail}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Device ID</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-white font-mono">{deviceId || '—'}</p>
              <p className="text-xs text-zinc-400">IoT Motor</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">API Key</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-white font-mono">{maskedKey}</p>
              <p className="text-xs text-zinc-400">ERP token auth</p>
            </div>
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
        <p className="text-center text-xs text-zinc-400 font-mono mb-8">{deviceId}</p>

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

      {/* ── Log Panel (fixed bottom-right) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        {/* Expanded log box */}
        {logOpen && (
          <div className="w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
            style={{ maxHeight: '420px' }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-bold text-zinc-800 dark:text-white">Device Logs</span>
                <span className="text-xs text-zinc-400 font-mono">{deviceId}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLogs}
                  title="Refresh logs"
                  className="p-1 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <svg className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setLogOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Log entries */}
            <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-800">
              {logsLoading && logs.length === 0 ? (
                <div className="flex items-center justify-center py-10 gap-2 text-zinc-400 text-sm">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Fetching logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-zinc-400 text-sm">
                  No logs found for this device.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${logBadge(log.event_type)}`}>
                        {log.event_type}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{log.message}</p>
                    {log.triggered_by && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">by {log.triggered_by}</p>
                    )}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>

            {/* Footer count */}
            <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
              <p className="text-[10px] text-zinc-400 text-center">
                {logs.length} log{logs.length !== 1 ? 's' : ''} · newest first · auto-refreshes on events
              </p>
            </div>
          </div>
        )}

        {/* Toggle FAB */}
        <button
          onClick={() => setLogOpen(prev => !prev)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
            logOpen
              ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
          }`}
          title="Toggle device logs"
        >
          {/* Terminal / log icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
