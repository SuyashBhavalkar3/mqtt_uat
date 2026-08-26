'use client';
import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

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

interface DeviceLog {
  name?: string;
  timestamp: string;
  event_type: 'Command' | 'Status' | string;
  message: string;
  triggered_by?: string;
  payload?: string;
}

interface DeviceCardProps {
  deviceId: string;
  socket: Socket | null;
}

export default function DeviceCard({ deviceId, socket }: DeviceCardProps) {
  const [status, setStatus] = useState<'stopped' | 'started'>('stopped');
  const [loading, setLoading] = useState<boolean>(false); // false until a command is sent
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsSuccess, setToastIsSuccess] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Log panel
  const [logOpen, setLogOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = (msg: string, success: boolean = true) => {
    setToastMessage(msg);
    setToastIsSuccess(success);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Fetch Initial Status ───────────────────────────────────────────────
  const fetchInitialStatus = async () => {
    try {
      const apiKeyVal = localStorage.getItem('api_key') || '';
      const apiSecretVal = localStorage.getItem('api_secret') || '';
      const res = await fetch(`/api/method/smart_gbru.apis.MQTT.MQTT.get_device_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `token ${apiKeyVal}:${apiSecretVal}`,
        },
        body: JSON.stringify({ device_id: deviceId }),
      });
      const data: DeviceStatusResponse = await res.json();
      if (res.ok && data.message) {
        applyStatusUpdate(data.message.current_status, data.message.status_last_updated, 'init');
      }
    } catch (err) {
      console.error(`[Init] Failed to fetch status for ${deviceId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialStatus();
  }, [deviceId]);

  // ── Fetch device logs ─────────────────────────────────────────────────
  const fetchLogs = async () => {
    const apiKeyVal = localStorage.getItem('api_key');
    const apiSecretVal = localStorage.getItem('api_secret');

    setLogsLoading(true);
    try {
      const res = await fetch(
        `/api/method/smart_gbru.apis.MQTT.MQTT.get_device_logs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `token ${apiKeyVal}:${apiSecretVal}`,
          },
          body: JSON.stringify({ device_id: deviceId }),
        }
      );
      const data = await res.json();
      const rawLogs: DeviceLog[] = Array.isArray(data?.message) ? data.message : [];
      const sorted = [...rawLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setLogs(sorted.slice(0, 50));
    } catch (err) {
      console.error(`[Logs ${deviceId}] Failed to fetch:`, err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (logOpen) fetchLogs();
  }, [logOpen, deviceId]);

  // ── Socket.io Listeners ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // We don't join_doc here, the Dashboard joins the doc for all devices.
    
    const onStatusUpdate = (data: DeviceStatusEvent) => {
      if (data.device_id === deviceId) {
        console.log(`[Socket.io ${deviceId}] Real-time status:`, data);
        applyStatusUpdate(data.status, data.status_last_updated, 'socket');
      }
    };

    const onLogsUpdate = (data: { device_id: string; logs: DeviceLog[] }) => {
      if (data.device_id === deviceId) {
        console.log(`[Socket.io ${deviceId}] Logs update received`);
        const sorted = [...(data.logs || [])].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLogs(sorted.slice(0, 50));
      }
    };

    socket.on('smartiot_device_status_update', onStatusUpdate);
    socket.on('device_logs_update', onLogsUpdate);

    return () => {
      socket.off('smartiot_device_status_update', onStatusUpdate);
      socket.off('device_logs_update', onLogsUpdate);
    };
  }, [socket, deviceId]);

  // ── Shared status update ───────────────────────────────────────────────
  const applyStatusUpdate = (rawStatus: string, lastUpdatedAt: string, source: 'socket' | 'poll' | 'init') => {
    const isOn = rawStatus === 'On';
    const formatted = new Date(lastUpdatedAt).toLocaleTimeString();
    setStatus(isOn ? 'started' : 'stopped');
    setLastUpdated(new Date(lastUpdatedAt).toLocaleString());
    setLoading(false); // always clear loading — handles socket, poll, and init

    if (source !== 'init') {
      showToast(`${deviceId} → ${rawStatus}  •  ${formatted}`, isOn);
    }

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
    let attempts = 0;
    const MAX = 30;

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(
          `/api/method/smart_gbru.apis.MQTT.MQTT.get_device_status`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `token ${apiKeyVal}:${apiSecretVal}`,
            },
            body: JSON.stringify({ device_id: deviceId }),
          }
        );
        const data: DeviceStatusResponse = await res.json();
        const msg = data.message;
        // Only check status match — skip timestamp comparison to avoid
        // server/client clock skew causing the poll to never resolve
        if (msg.current_status === expectedAction) {
          applyStatusUpdate(msg.current_status, msg.status_last_updated, 'poll');
          fetchLogs();
        }
      } catch (err) {
        console.error(`[Poll ${deviceId}]`, err);
      }
      if (attempts >= MAX) {
        stopPolling();
        showToast('No hardware response received.', false);
        setLoading(false);
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
      const commandSentAt = new Date().toISOString();

      const response = await fetch(
        `/api/method/smart_gbru.apis.MQTT.MQTT.send_device_command`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `token ${apiKeyVal}:${apiSecretVal}`,
          },
          body: JSON.stringify({ device_id: deviceId, action: action === 'start' ? 'On' : 'Off' }),
        }
      );
      const data = await response.json();

      if (response.ok && data.message?.status === 'Success') {
        showToast('Command sent — waiting for hardware...', true);
        startPolling(action === 'start' ? 'On' : 'Off', commandSentAt);
        setTimeout(fetchLogs, 1500);
      } else {
        showToast(`Error: ${data.message?.message || 'Failed to send command'}`, false);
        setLoading(false);
      }
    } catch (error) {
      showToast('Network error occurred.', false);
      setLoading(false);
    }
  };

  const handleStart = () => { if (status !== 'started' && !loading) sendMqttRequest('start'); };
  const handleStop = () => { if (status !== 'stopped' && !loading) sendMqttRequest('stop'); };

  const logBadge = (type: string) => {
    if (type === 'Command') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    if (type === 'Status') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 relative overflow-hidden transition-all hover:shadow-2xl flex flex-col items-center justify-between h-full min-h-[340px]">
      {/* Decorative gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none transition-colors duration-500 ${status === 'started' ? 'bg-green-500' : 'bg-red-500'}`} />

      {/* Toast Overlay */}
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg shadow-lg text-white transition-all duration-300 text-xs font-semibold z-10 flex items-center gap-1.5 whitespace-nowrap ${
          toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        } ${toastIsSuccess ? 'bg-green-500' : 'bg-red-500'}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${toastIsSuccess ? 'bg-green-200' : 'bg-red-200'}`} />
        {toastMessage}
      </div>

      <div className="w-full flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-mono">{deviceId}</h3>
          <p className="text-xs text-zinc-400 mt-1">
            {lastUpdated ? `Updated ${lastUpdated}` : 'Waiting for status...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
          ) : (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status === 'started' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              {status === 'started' ? 'ON' : 'OFF'}
            </span>
          )}
        </div>
      </div>

      <div className="flex w-full gap-4 mt-auto">
        <button
          onClick={handleStart}
          disabled={loading || status === 'started'}
          className={`flex-1 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 ${
            status === 'started'
              ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105'
              : 'bg-zinc-100 text-zinc-600 hover:bg-green-100 hover:text-green-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          START
        </button>
        <button
          onClick={handleStop}
          disabled={loading || status === 'stopped'}
          className={`flex-1 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 ${
            status === 'stopped'
              ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105'
              : 'bg-zinc-100 text-zinc-600 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          STOP
        </button>
      </div>

      {/* Logs Toggle */}
      <button 
        onClick={() => setLogOpen(!logOpen)}
        className="w-full mt-6 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        {logOpen ? 'Hide Logs' : 'View Logs'}
      </button>

      {/* Inline Log Panel */}
      {logOpen && (
        <div className="w-full mt-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col h-56 animate-in fade-in zoom-in-95 duration-200 text-left">
          <div className="flex justify-between items-center px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Logs</span>
            <button onClick={fetchLogs} className="text-zinc-400 hover:text-blue-500 transition-colors">
              <svg className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1.5fr] gap-3 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/80">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Status</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-center">Time</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-right">Triggered By</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {logsLoading && logs.length === 0 ? (
               <div className="flex items-center justify-center h-full text-xs text-zinc-400">Loading logs...</div>
            ) : logs.length === 0 ? (
               <div className="flex items-center justify-center h-full text-xs text-zinc-400">No logs yet.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="grid grid-cols-[2fr_1fr_1.5fr] gap-3 px-3 py-2.5 hover:bg-white dark:hover:bg-zinc-700/30 transition-colors items-center">
                  {/* Status Column */}
                  <div className="flex flex-col items-start gap-1 overflow-hidden">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${logBadge(log.event_type)}`}>
                      {log.event_type}
                    </span>
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-snug truncate w-full" title={log.message}>
                      {log.message}
                    </span>
                  </div>
                  
                  {/* Time Column */}
                  <span className="text-[10px] text-zinc-500 font-mono text-center shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  
                  {/* Triggered By Column */}
                  <div className="text-[10px] text-zinc-500 text-right truncate" title={log.triggered_by || 'System'}>
                    {log.triggered_by ? (
                      <span className="flex items-center justify-end gap-1 text-zinc-600 dark:text-zinc-400">
                        <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="truncate">{log.triggered_by.split('@')[0]}</span>
                      </span>
                    ) : (
                      <span className="italic opacity-60">-</span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
