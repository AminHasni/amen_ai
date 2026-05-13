import React, { useState } from 'react';
import { Save, Shield, Cpu, Network, Bell, Camera, Loader2, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('system');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form states (Initialisation depuis le localStorage ou valeurs par défaut)
    const [piIp, setPiIp] = useState(localStorage.getItem('amen_pi_ip') || '192.168.0.18');
    const [piPort, setPiPort] = useState(localStorage.getItem('amen_pi_port') || '8000');
    const [aiSensitivity, setAiSensitivity] = useState(parseInt(localStorage.getItem('amen_ai_sensitivity')) || 75);
    const [alertSound, setAlertSound] = useState(localStorage.getItem('amen_alert_sound') !== 'false');
    const [emailAlerts, setEmailAlerts] = useState(localStorage.getItem('amen_email_alerts') !== 'false');

    const handleSave = () => {
        setIsSaving(true);
        
        // Sauvegarde réelle dans le localStorage
        localStorage.setItem('amen_pi_ip', piIp);
        localStorage.setItem('amen_pi_port', piPort);
        localStorage.setItem('amen_ai_sensitivity', aiSensitivity);
        localStorage.setItem('amen_alert_sound', alertSound);
        localStorage.setItem('amen_email_alerts', emailAlerts);

        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            // Déclencher un événement personnalisé pour que LiveStream se mette à jour sans recharger
            window.dispatchEvent(new Event('amen_settings_updated'));
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-[#050B14] backdrop-blur-2xl border border-slate-800/80 rounded-xl overflow-hidden shadow-inner m-4 mt-0 xl:m-0 xl:mt-0 relative">
            {/* Subtle glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300">
                        <SettingsIcon size={22} className="lucide-settings" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Configuration Système</h2>
                        <p className="text-xs text-slate-400 font-mono mt-1">Gérez les paramètres du Poste de Commandement</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : (saved ? <CheckCircle2 size={18} /> : <Save size={18} />)}
                    <span>{isSaving ? 'SAUVEGARDE...' : (saved ? 'SAUVEGARDÉ' : 'SAUVEGARDER')}</span>
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
                {/* Tabs Sidebar */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800/60 bg-[#020617]/30 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto custom-scrollbar">
                    <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Cpu size={18} />} label="Moteur IA" />
                    <TabButton active={activeTab === 'network'} onClick={() => setActiveTab('network')} icon={<Network size={18} />} label="Réseau & Flux" />
                    <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<Bell size={18} />} label="Notifications" />
                    <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={18} />} label="Sécurité" />
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                        
                        {activeTab === 'system' && (
                            <div className="space-y-8">
                                <SectionHeader title="Moteur d'Intelligence Artificielle" description="Paramétrez la sensibilité et les modèles YOLO utilisés." />
                                
                                <div className="bg-[#0B1221] border border-slate-800/80 rounded-2xl p-6 space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-sm font-semibold text-slate-200">Sensibilité de détection globale</label>
                                            <span className="text-cyan-400 font-mono font-bold bg-cyan-950/50 px-3 py-1 rounded-md border border-cyan-800/50">{aiSensitivity}%</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" max="100" 
                                            value={aiSensitivity} 
                                            onChange={(e) => setAiSensitivity(e.target.value)}
                                            className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-xs text-slate-500 mt-3">Une sensibilité plus élevée détectera plus d'objets mais risque d'augmenter les fausses alertes.</p>
                                    </div>

                                    <div className="h-px w-full bg-slate-800/60"></div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-200">Analyse temporelle avancée</h4>
                                            <p className="text-xs text-slate-500 mt-1">L'IA compare plusieurs frames pour déduire un mouvement suspect.</p>
                                        </div>
                                        <Toggle defaultChecked={true} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'network' && (
                            <div className="space-y-8">
                                <SectionHeader title="Configuration du Flux Vidéo" description="Connectez le dashboard à la source vidéo (Raspberry Pi / Caméra IP)." />
                                
                                <div className="bg-[#0B1221] border border-slate-800/80 rounded-2xl p-6 space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adresse IP de la source (Raspberry Pi)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Network size={16} className="text-slate-500" />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={piIp}
                                                onChange={(e) => setPiIp(e.target.value)}
                                                className="w-full bg-[#020617] border border-slate-700 text-white text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Port WebSocket</label>
                                        <input 
                                            type="text" 
                                            value={piPort}
                                            onChange={(e) => setPiPort(e.target.value)}
                                            className="w-full bg-[#020617] border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                                        />
                                    </div>
                                    
                                    <div className="mt-4 p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-xl flex items-start gap-3">
                                        <Camera className="text-cyan-500 mt-0.5 shrink-0" size={18} />
                                        <p className="text-xs text-cyan-300/80 leading-relaxed">
                                            Assurez-vous que l'adresse IP saisie est fixe ou atteignable. Si vous accédez au système depuis l'extérieur, utilisez l'adresse de votre DNS dynamique.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'alerts' && (
                            <div className="space-y-8">
                                <SectionHeader title="Préférences de Notification" description="Comment et quand le système doit-il vous alerter en cas de détection." />
                                
                                <div className="bg-[#0B1221] border border-slate-800/80 rounded-2xl p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-200">Alertes Sonores</h4>
                                            <p className="text-xs text-slate-500 mt-1">Jouer un son lors d'une détection critique.</p>
                                        </div>
                                        <Toggle checked={alertSound} onChange={() => setAlertSound(!alertSound)} />
                                    </div>
                                    
                                    <div className="h-px w-full bg-slate-800/60"></div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-200">Alertes Email (Supabase)</h4>
                                            <p className="text-xs text-slate-500 mt-1">Envoyer un rapport complet avec image par email.</p>
                                        </div>
                                        <Toggle checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <SectionHeader title="Sécurité du Système" description="Paramètres d'authentification et restrictions d'accès." />
                                
                                <div className="bg-[#0B1221] border border-slate-800/80 rounded-2xl p-6 space-y-6">
                                    <div className="flex items-center justify-between opacity-50 pointer-events-none">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-200">Authentification Double Facteur (2FA)</h4>
                                            <p className="text-xs text-slate-500 mt-1">Verrouillé par l'administrateur principal.</p>
                                        </div>
                                        <Toggle defaultChecked={true} disabled />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

// Composants internes réutilisables pour le UI
const TabButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap md:whitespace-normal
            ${active 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }
        `}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const SectionHeader = ({ title, description }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
    </div>
);

const Toggle = ({ checked, defaultChecked, onChange, disabled }) => {
    // Un mini-composant toggle "switch" style iOS/Modern
    return (
        <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={checked} 
                defaultChecked={defaultChecked} 
                onChange={onChange}
                disabled={disabled}
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
        </label>
    );
};

export default Settings;
