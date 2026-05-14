import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Login from './components/Login';
import LiveStream from './components/LiveStream';
import AlertsLogs from './components/AlertsLogs';
import SettingsView from './components/Settings';
import { AmenLogo } from './components/Logo';
import { Settings, Users, LayoutDashboard, LogOut, Search, Bell, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('livestream'); // 'livestream', 'alerts', 'settings'
  
  // Notification states
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Audio Alarm Ref
  const audioAlarmRef = React.useRef(null);

  const startAlarm = () => {
      if (audioAlarmRef.current) return;
      try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
          
          // LFO for siren effect
          const lfo = audioCtx.createOscillator();
          lfo.frequency.value = 2; // 2Hz siren
          const lfoGain = audioCtx.createGain();
          lfoGain.gain.value = 400; // Pitch variation
          lfo.connect(lfoGain);
          lfoGain.connect(oscillator.frequency);
          lfo.start();
          
          gainNode.gain.value = 0.1; // Volume
          oscillator.start();
          
          audioAlarmRef.current = { oscillator, lfo, audioCtx };
      } catch(e) {
          console.log("Audio playback requires user interaction first.");
      }
  };

  const stopAlarm = () => {
      if (audioAlarmRef.current) {
          try {
              audioAlarmRef.current.oscillator.stop();
              audioAlarmRef.current.lfo.stop();
              audioAlarmRef.current.audioCtx.close();
          } catch(e) {}
          audioAlarmRef.current = null;
      }
  };

  // Global Real-time Notifications
  useEffect(() => {
    if (!session) return;

    const subscription = supabase
      .channel('global-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
          const newAlert = payload.new;
          
          // Add toast
          const toastId = Date.now();
          setToasts(current => [...current, { id: toastId, ...newAlert }]);
          
          // Increment counter
          setUnreadCount(prev => prev + 1);
          
          const isCritical = newAlert.status?.toLowerCase().includes('critical') || newAlert.status?.toLowerCase().includes('danger') || newAlert.status?.toLowerCase().includes('attente');
          
          if (isCritical) {
              startAlarm();
              // Don't auto-remove critical toasts, wait for user click to stop alarm
          } else {
              // Auto remove non-critical toast after 5s
              setTimeout(() => {
                  setToasts(current => current.filter(t => t.id !== toastId));
              }, 5000);
          }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      stopAlarm();
    };
  }, [session]);

  // Clear unread count when visiting alerts page
  useEffect(() => {
    if (activeView === 'alerts') {
      setUnreadCount(0);
    }
  }, [activeView]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const removeToast = (id) => {
    setToasts(current => current.filter(t => t.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans">
        <AmenLogo className="w-20 h-20 mb-8 animate-pulse drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
        <Loader2 className="text-cyan-400 w-8 h-8 animate-spin" />
        <p className="text-cyan-400 font-mono mt-4 text-sm tracking-widest">INITIALISATION DU SYSTÈME...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const userEmail = session.user.email;
  const username = userEmail.split('@')[0];

  return (
    <div className="h-screen bg-[#020617] flex flex-col md:flex-row font-sans text-slate-50 selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Global Toasts Container */}
      <div className="absolute top-20 md:top-28 right-4 md:right-10 z-50 flex flex-col gap-3 pointer-events-none">
          {toasts.map(toast => {
              const isCritical = toast.status?.toLowerCase().includes('critical') || toast.status?.toLowerCase().includes('danger');
              return (
              <div 
                key={toast.id} 
                className={`pointer-events-auto w-72 md:w-80 bg-[#0B1221]/95 backdrop-blur-xl border p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 relative overflow-hidden group
                    ${isCritical ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'}
                `}
                onClick={() => {
                    setActiveView('alerts');
                    removeToast(toast.id);
                    stopAlarm();
                }}
              >
                  {/* Glowing left border line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'}`}></div>
                  
                  <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${isCritical ? 'bg-red-950/50 border-red-800/50 text-red-500' : 'bg-amber-950/50 border-amber-800/50 text-amber-500'}`}>
                          {isCritical ? <ShieldAlert size={20} className="animate-pulse" /> : <AlertTriangle size={20} />}
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer">
                          <h4 className={`font-bold text-[11px] uppercase tracking-wider ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                              {isCritical ? 'Alerte Critique' : 'Avertissement'}
                          </h4>
                          <p className="text-slate-300 text-xs mt-1 font-medium truncate">{toast.status || "Événement suspect détecté"}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-1.5">{new Date(toast.created_at).toLocaleTimeString()}</p>
                      </div>
                  </div>
              </div>
          )})}
      </div>

      {/* Sidebar / Bottom Nav on mobile */}
      <aside className="w-full md:w-20 lg:w-72 h-16 md:h-auto border-t md:border-t-0 md:border-r border-slate-800/80 bg-[#020617] flex flex-row md:flex-col items-center justify-around md:justify-start transition-all duration-300 z-20 order-last md:order-first shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.4)] relative">
        
        {/* Header (Logo) */}
        <div className="hidden md:flex h-24 items-center justify-center lg:justify-start lg:px-8 w-full border-b border-slate-800/80 shrink-0 bg-gradient-to-b from-slate-900/30 to-transparent relative">
          <AmenLogo className="w-10 h-10 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
          <span className="hidden lg:block ml-4 font-black text-2xl tracking-tighter text-white drop-shadow-md">
            AMEN_<span className="text-cyan-400">IA</span>
          </span>
        </div>
        
        {/* Nav Items */}
        <nav className="flex-1 w-full md:py-8 flex flex-row md:flex-col items-center justify-around md:justify-start gap-1 md:gap-4 px-2 lg:px-6 relative z-10">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Vue Générale" 
            active={activeView === 'livestream'} 
            onClick={() => setActiveView('livestream')}
          />
          <NavItem 
            icon={<AlertTriangle size={20} />} 
            label="Registre Alertes" 
            active={activeView === 'alerts'} 
            onClick={() => setActiveView('alerts')}
            badgeCount={unreadCount}
          />
          <div className="hidden md:block h-[1px] w-full bg-slate-800/60 my-2"></div>
          <NavItem 
            icon={<Users size={20} />} 
            label="Gestion Opérateurs" 
            className="hidden md:flex" 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Configuration" 
            active={activeView === 'settings'} 
            onClick={() => setActiveView('settings')}
          />
          
          {/* Mobile Logout Button (in nav) */}
          <button 
            onClick={handleLogout}
            className="md:hidden flex flex-col items-center justify-center p-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[9px] mt-1 font-medium">Quitter</span>
          </button>
        </nav>

        {/* Desktop Bottom Section: Profile & Logout */}
        <div className="hidden md:flex flex-col w-full p-4 lg:p-6 border-t border-slate-800/80 mt-auto shrink-0 bg-slate-950/30 relative z-10">
          
          {/* Profile Card (LG only) */}
          <div className="hidden lg:flex items-center gap-3 mb-6 bg-[#0B1221] p-3.5 rounded-xl border border-slate-800 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-cyan-900/50">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=0f172a`} alt="Avatar" className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate capitalize">{username}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <p className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase">En Service</p>
                  </div>
              </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 text-slate-400 hover:text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] rounded-xl transition-all duration-300 group border border-transparent hover:border-red-400/50"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden lg:block font-bold text-sm tracking-wide">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 md:h-24 border-b border-slate-800/60 bg-transparent flex items-center justify-between px-4 md:px-10 shrink-0">
          <div className="flex items-center gap-3">
            <AmenLogo className="md:hidden w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <div>
              <h1 className="text-lg md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  <span className="md:hidden">AMEN_IA</span>
                  <span className="hidden md:block">Poste de Commandement</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                <p className="text-[10px] md:text-xs text-cyan-400 font-semibold tracking-widest uppercase truncate max-w-[120px] md:max-w-none">Surveillance IA Globale</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button className="hidden sm:block text-slate-400 hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <button className="relative text-slate-400 hover:text-white transition-colors" onClick={() => setActiveView('alerts')}>
              <Bell size={20} className={unreadCount > 0 ? "animate-pulse text-cyan-400" : ""} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#020617] flex items-center justify-center">
                  </span>
                </span>
              )}
            </button>

            <div className="hidden md:block h-8 w-[1px] bg-slate-800"></div>

            <div className="flex items-center gap-2 md:gap-3 md:pl-2 lg:hidden">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-200 capitalize">{username}</p>
                <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">ACCÈS VALIDE</p>
              </div>
              <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-cyan-500/50 transition-all cursor-pointer shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=0f172a`} alt="Avatar" className="w-full h-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic View */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-10 custom-scrollbar">
          
          <div className="max-w-[1800px] mx-auto w-full h-full min-h-0 flex flex-col">
            
            {activeView === 'livestream' && (
              <div className="flex-1 flex flex-col min-h-0 pb-20 md:pb-0">
                <LiveStream />
              </div>
            )}

            {activeView === 'alerts' && (
              <div className="flex-1 flex flex-col min-h-0 pb-20 md:pb-0">
                <AlertsLogs />
              </div>
            )}

            {activeView === 'settings' && (
              <div className="flex-1 flex flex-col min-h-0 pb-20 md:pb-0">
                <SettingsView />
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}

const NavItem = ({ icon, label, active, onClick, className = '', badgeCount = 0 }) => (
  <button 
    onClick={onClick}
    className={`w-auto md:w-full flex flex-col md:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 p-2 md:p-3 lg:px-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${className}
      ${active 
        ? 'text-white bg-gradient-to-r from-cyan-950/40 to-transparent border border-cyan-800/30 shadow-[inset_4px_0_0_#06b6d4]' 
        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
      }
    `}
  >
    {/* Ambient Glow for Active State */}
    {active && <div className="hidden md:block absolute left-0 w-16 h-full bg-cyan-500/10 blur-xl rounded-full"></div>}
    
    <div className="relative z-10 flex items-center justify-center">
        <div className={`${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] text-cyan-400' : 'group-hover:scale-110 group-hover:text-slate-300'} transition-all duration-300`}>
          {icon}
        </div>
        {badgeCount > 0 && !active && (
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#020617] shadow-lg">
                {badgeCount > 99 ? '99+' : badgeCount}
            </span>
        )}
    </div>

    <span className={`relative z-10 text-[9px] md:hidden lg:block lg:text-sm font-medium lg:font-bold tracking-wide transition-colors ${active ? 'text-white drop-shadow-sm' : 'text-slate-500 group-hover:text-slate-300'}`}>
      {label}
    </span>
  </button>
);

export default App;
