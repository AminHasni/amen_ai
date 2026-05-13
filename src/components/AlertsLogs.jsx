import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { AlertTriangle, Info, Clock, CheckCircle2, ShieldAlert, Search, X } from 'lucide-react';

const AlertsLogs = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null); // { url: string, type: 'video' | 'image' }

    useEffect(() => {
        fetchAlerts();

        // Subscribe to real-time inserts
        const subscription = supabase
            .channel('public:alerts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
                setAlerts(current => [payload.new, ...current]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) {
            console.error('Erreur lors de la récupération des alertes:', error);
        } else {
            setAlerts(data || []);
        }
        setLoading(false);
    };

    const getStatusIcon = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('critical') || s.includes('danger') || s.includes('menace')) return <ShieldAlert className="text-red-500" size={20} />;
        if (s.includes('warning') || s.includes('attention')) return <AlertTriangle className="text-amber-500" size={20} />;
        if (s.includes('resolved') || s.includes('ok')) return <CheckCircle2 className="text-emerald-500" size={20} />;
        return <Info className="text-cyan-500" size={20} />;
    };

    const getCardColorClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('critical') || s.includes('danger') || s.includes('menace')) return {
            card: 'bg-red-950/20 border-red-900/50 hover:bg-red-950/40',
            borderLeft: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]',
            iconBg: 'bg-red-950/50 border-red-800/50 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]',
            badge: 'bg-red-500/20 text-red-400 border-red-500/30 text-red-300 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'
        };
        if (s.includes('warning') || s.includes('attention')) return {
            card: 'bg-amber-950/20 border-amber-900/50 hover:bg-amber-950/40',
            borderLeft: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]',
            iconBg: 'bg-amber-950/50 border-amber-800/50 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]',
            badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]'
        };
        if (s.includes('resolved') || s.includes('ok')) return {
            card: 'bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-950/40',
            borderLeft: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]',
            iconBg: 'bg-emerald-950/50 border-emerald-800/50 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]',
            badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]'
        };
        // Default / Info
        return {
            card: 'bg-[#0B1221] border-slate-800/60 hover:bg-[#0F172A]',
            borderLeft: 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]',
            iconBg: 'bg-[#020617] border-slate-800 text-cyan-500',
            badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
        };
    };

    const formatAnalysisText = (text) => {
        if (!text) return null;
        
        let formattedText = text
            .replace(/(Analyse de la séquence d'images\s*:)/ig, '<strong class="text-cyan-400 block mb-1 mt-4 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1">$1</strong>')
            .replace(/(Objets\/personnes détectés\s*:)/ig, '<strong class="text-amber-400 block mb-1 mt-5 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1">$1</strong>')
            .replace(/(Évolution de l'action\s*:)/ig, '<strong class="text-indigo-400 block mb-1 mt-5 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1">$1</strong>')
            .replace(/(Évaluation du danger\s*:)/ig, '<strong class="text-red-400 block mb-1 mt-5 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1">$1</strong>')
            .replace(/(\[DANGER\s*:\s*[A-Z]+\])/ig, '<span class="inline-block px-2.5 py-1 mt-3 bg-red-500/10 text-red-400 rounded-md text-[10px] font-bold border border-red-500/20">$1</span>')
            .replace(/\s(-\s[A-Z0-9])/g, '<br /><span class="text-slate-500 ml-2">&bull;</span> $1');

        return <div dangerouslySetInnerHTML={{ __html: formattedText }} className="text-sm text-slate-300 leading-relaxed tracking-wide" />;
    };

    return (
        <div className="flex flex-col h-full bg-[#050B14] backdrop-blur-2xl border border-slate-800/80 rounded-xl overflow-hidden shadow-inner m-4 mt-0 xl:m-0 xl:mt-0 relative group">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-indigo-500/10"></div>

            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20"></div>
                        <div className="relative p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                            <ShieldAlert size={20} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide drop-shadow-sm">Centre d'Alertes</h2>
                        <p className="text-[11px] text-indigo-300/80 font-mono tracking-wider uppercase mt-0.5">Registre des incidents</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[#020617] border border-slate-800 shadow-inner rounded-md text-[10px] font-mono font-bold text-slate-400 tracking-widest">
                        {alerts.length} <span className="text-slate-600">ENTRÉES</span>
                    </div>
                </div>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative z-10">
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse bg-slate-900/50 h-28 rounded-xl border border-slate-800/50 w-full"></div>
                        ))}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-60">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20"></div>
                            <CheckCircle2 size={48} className="text-cyan-500/80 relative z-10" />
                        </div>
                        <p className="font-mono text-sm tracking-widest text-slate-400">SYSTÈME NOMINAL. AUCUNE ALERTE.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {alerts.map((alert) => {
                            const colors = getCardColorClass(alert.status);
                            
                            return (
                            <div 
                                key={alert.id} 
                                className={`group/alert relative border p-6 rounded-2xl transition-all duration-300 overflow-hidden shadow-lg ${colors.card}`}
                            >
                                {/* Glowing left border accent */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.borderLeft}`}></div>

                                <div className="flex items-start gap-5">
                                    <div className={`mt-0.5 p-2.5 rounded-xl border shadow-inner ${colors.iconBg}`}>
                                        {getStatusIcon(alert.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-md border uppercase ${colors.badge}`}>
                                                {alert.status || 'INFO'}
                                            </span>
                                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono bg-[#020617]/60 px-3 py-1.5 rounded-md border border-slate-800/80 backdrop-blur-sm">
                                                <Clock size={12} className="text-slate-500" />
                                                <span>{new Date(alert.created_at).toLocaleTimeString()} - {new Date(alert.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Analyse formatée avec espacement */}
                                        {alert.analysis && (
                                            <div className="mb-5 bg-[#020617]/30 p-4 rounded-xl border border-slate-800/40">
                                                {formatAnalysisText(alert.analysis)}
                                            </div>
                                        )}

                                        {/* Optional Media Preview */}
                                        {(alert.image_url || alert.video_url) && (
                                            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/60 mt-4">
                                                {alert.image_url && (
                                                    <button 
                                                        onClick={() => setSelectedMedia({ url: alert.image_url, type: 'image' })}
                                                        className="block w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-800 hover:border-cyan-500 transition-all duration-300 relative group/img cursor-pointer shadow-lg shrink-0"
                                                    >
                                                        <img src={alert.image_url} alt="Alerte Snapshot" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                                        <div className="absolute inset-0 bg-cyan-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                            <Search size={20} className="text-white drop-shadow-md" />
                                                        </div>
                                                    </button>
                                                )}
                                                {alert.video_url && (
                                                    <button 
                                                        onClick={() => setSelectedMedia({ url: alert.video_url, type: 'video' })}
                                                        className="flex items-center justify-center px-6 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 text-white font-bold gap-3 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] shrink-0 whitespace-nowrap"
                                                    >
                                                        <ShieldAlert size={18} />
                                                        <span className="text-xs tracking-widest uppercase">Voir l'extrait vidéo</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Media Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md cursor-pointer animate-in fade-in duration-300"
                        onClick={() => setSelectedMedia(null)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-[#020617] border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-4 justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                                    <ShieldAlert className="text-red-500" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm tracking-wide uppercase">Visionneuse de Preuve</h3>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">LECTURE SÉCURISÉE DU FICHIER</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <a 
                                    href={selectedMedia.url} 
                                    download
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-700 shadow-sm"
                                >
                                    TÉLÉCHARGER
                                </a>
                                <button 
                                    onClick={() => setSelectedMedia(null)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold rounded-lg transition-all border border-red-500/20 shadow-sm"
                                >
                                    <X size={16} /> FERMER
                                </button>
                            </div>
                        </div>

                        {/* Media Viewer */}
                        <div className="flex-1 overflow-hidden bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
                            {selectedMedia.type === 'image' ? (
                                <img 
                                    src={selectedMedia.url} 
                                    alt="Aperçu HD" 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <video 
                                    src={selectedMedia.url} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500 shrink-0">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                NE PAS PARTAGER CES IMAGES
                            </span>
                            <span className="hidden sm:flex items-center gap-4">
                                <span>CHIFFREMENT: AES-256</span>
                                <span>SOURCE: AMEN_IA_CORE</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertsLogs;
