'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import DeviceCard from './DeviceCard';

interface UserInfo {
  user_id?: string;
  full_name?: string;
  email?: string;
  [key: string]: unknown;
}

export default function StartStopButton() {
  // Session info
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  // ── Load session info ─────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user_info');
    const storedApiKey = localStorage.getItem('api_key') || '';
    
    // Legacy support: if there was a single target_device_id, migrate it to the array
    const legacyDevice = localStorage.getItem('target_device_id');
    const storedDevices = localStorage.getItem('added_devices');
    
    let devices: string[] = [];
    if (storedDevices) {
      try { devices = JSON.parse(storedDevices); } catch { /* ignore */ }
    } else if (legacyDevice) {
      devices = [legacyDevice];
      localStorage.setItem('added_devices', JSON.stringify(devices));
      localStorage.removeItem('target_device_id');
    }

    if (storedUser) {
      try { setUserInfo(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
    
    setDeviceIds(devices);
    setApiKey(storedApiKey);
  }, []);

  // ── Socket.io ──────────────────────────────────────────────────────────
  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uatsmart.gbru.in';

    const socket = io(baseURL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    setSocketInstance(socket);

    socket.on('connect', () => {
      console.log(`[Socket.io] ✅ Connected! Socket ID: ${socket.id}`);
      setSocketConnected(true);

      // Join Frappe site room (to receive general broadcasts)
      socket.emit('login', { user: 'Guest' });
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

  // Join rooms whenever deviceIds or socket changes
  useEffect(() => {
    if (socketConnected && socketRef.current) {
      deviceIds.forEach(id => {
        socketRef.current?.emit('join_doc', { doctype: 'IOT Device', docname: id });
        console.log(`[Socket.io] Joined doc room: IOT Device / ${id}`);
      });
    }
  }, [deviceIds, socketConnected]);


  const handleLogout = () => {
    localStorage.removeItem('api_key');
    localStorage.removeItem('api_secret');
    localStorage.removeItem('user_info');
    localStorage.removeItem('added_devices');
    localStorage.removeItem('target_device_id');
    router.push('/login');
  };

  // Add Device State
  const [showAddDevice, setShowAddDevice] = useState<boolean>(false);
  const [newDeviceId, setNewDeviceId] = useState<string>('');
  const [isAddingDevice, setIsAddingDevice] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsSuccess, setToastIsSuccess] = useState<boolean>(true);

  // Derived display values
  const displayName = userInfo?.full_name || userInfo?.user_id || userInfo?.email || 'User';
  const displayEmail = userInfo?.email || userInfo?.user_id || '—';

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = newDeviceId.trim().toLowerCase();
    if (!id) return;
    
    if (deviceIds.includes(id)) {
      setToastMessage('Device is already added!');
      setToastIsSuccess(false);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsAddingDevice(true);
    try {
      const currentApiKey = localStorage.getItem('api_key') || '';
      const currentApiSecret = localStorage.getItem('api_secret') || '';

      const res = await fetch(`/api/method/smart_gbru.mqtt.add_user_device_connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `token ${currentApiKey}:${currentApiSecret}`,
        },
        body: JSON.stringify({
          device_id: id
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.message?.status === 'Success') {
        const newDevices = [...deviceIds, id];
        setDeviceIds(newDevices);
        localStorage.setItem('added_devices', JSON.stringify(newDevices));
        
        setShowAddDevice(false);
        setNewDeviceId('');
        
        // Let the user know it was successful
        setToastMessage(data.message.message || 'Device added successfully!');
        setToastIsSuccess(true);
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        let errorMsg = 'Invalid Motor ID or permission denied.';
        if (data.message?.message) {
          errorMsg = data.message.message;
        } else if (data._server_messages) {
          try {
            const parsedMessages = JSON.parse(data._server_messages);
            if (parsedMessages.length > 0) {
              const msgObj = JSON.parse(parsedMessages[0]);
              if (msgObj.message) {
                // Strip HTML tags from frappe messages
                errorMsg = msgObj.message.replace(/<[^>]*>?/gm, '');
              }
            }
          } catch(e) {}
        }
        setToastMessage(errorMsg);
        setToastIsSuccess(false);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Add device error:', err);
      setToastMessage('Network error occurred.');
      setToastIsSuccess(false);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsAddingDevice(false);
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 relative">
      {/* Toast Overlay for Dashboard (Add Device) */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-2xl text-white transition-all duration-300 text-sm font-bold z-[100] flex items-center gap-2 ${
          toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
        } ${toastIsSuccess ? 'bg-green-600' : 'bg-red-600'}`}
      >
        <span className={`w-2 h-2 rounded-full animate-pulse ${toastIsSuccess ? 'bg-green-200' : 'bg-red-200'}`} />
        {toastMessage}
      </div>

      {/* ── Top Bar ── */}
      <div className="flex justify-between items-start mb-10">
        {/* Left side: Dashboard Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 animate-pulse'}`}></span>
            {socketConnected ? 'Connected to Real-time Network' : 'Connecting...'}
          </p>
        </div>

        {/* Right side: Profile & Add Device */}
        <div className="flex flex-col items-stretch gap-3 relative z-50">
          
          {/* Profile Card */}
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="text-right">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{displayName}</p>
              <p className="text-xs text-zinc-500">{displayEmail}</p>
            </div>
            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700"></div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Add Device Wrapper */}
          <div className="relative w-full">
            <button
              onClick={() => setShowAddDevice(!showAddDevice)}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Add Device
              <svg className={`w-4 h-4 transition-transform ${showAddDevice ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </button>

            {/* Slide Down Form */}
            {showAddDevice && (
              <form onSubmit={handleAddDevice} className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  placeholder="Enter Motor ID" 
                  className="w-full px-4 py-3 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 outline-none text-zinc-900 dark:text-white mb-2 transition-all font-mono"
                  required
                />
                <button 
                  type="submit" 
                  disabled={isAddingDevice}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isAddingDevice ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Adding...
                    </>
                  ) : (
                    'Add Motor'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content Area (Cards Grid) ── */}
      {deviceIds.length === 0 ? (
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl mt-10">
          <svg className="w-12 h-12 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <p className="text-zinc-500 font-medium">No devices added yet.</p>
          <p className="text-zinc-400 text-sm mt-1">Use the Add Device button to connect a motor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deviceIds.map((id) => (
            <DeviceCard key={id} deviceId={id} socket={socketInstance} />
          ))}
        </div>
      )}
    </div>
  );
}
