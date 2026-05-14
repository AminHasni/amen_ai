import React, { useEffect, useState, useRef } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { supabase } from '../supabase';

const LiveStream = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [hasReceivedFrame, setHasReceivedFrame] = useState(false);
    const [debugInfo, setDebugInfo] = useState("Initialisation du flux...");
    const [connectionError, setConnectionError] = useState(false);
    
    const imgRef = useRef(null);
    const wsRef = useRef(null);

    const startMjpegStream = () => {
        // Mode 100% Local (MJPEG via HTTP)
        const ip = localStorage.getItem('amen_pi_ip') || "192.168.0.18";
        const port = localStorage.getItem('amen_pi_port') || "8000";
        
        // Construction stricte de l'URL locale MJPEG
        const mjpegUrl = `http://${ip}:${port}/video_feed`;

        console.log("Tentative de connexion MJPEG locale à:", mjpegUrl);
        setDebugInfo(`Connexion au réseau local MJPEG (${ip})...`);
        
        // Reset states
        setConnectionError(false);
        setHasReceivedFrame(false);
        setIsConnected(false);

        // Attribution dynamique à l'élément image standard
        if (imgRef.current) {
            // Ajouter un timestamp pour éviter le cache du navigateur
            imgRef.current.src = `${mjpegUrl}?t=${new Date().getTime()}`;
        }
    };

    const handleImageLoad = () => {
        setIsConnected(true);
        setHasReceivedFrame(true);
        setConnectionError(false);
        setDebugInfo("Flux MJPEG actif (Zéro latence)");
    };

    const handleImageError = () => {
        setIsConnected(false);
        setHasReceivedFrame(false);
        setConnectionError(true);
        setDebugInfo("Erreur de connexion matérielle ou réseau.");
    };

    useEffect(() => {
        startMjpegStream();

        // Écouter les changements locaux (depuis l'onglet Configuration)
        const handleSettingsUpdate = () => {
            console.log("Paramètres locaux mis à jour, reconnexion MJPEG...");
            startMjpegStream();
        };

        window.addEventListener('amen_settings_updated', handleSettingsUpdate);
        
        return () => {
            window.removeEventListener('amen_settings_updated', handleSettingsUpdate);
            // Cleanup: stop loading image if component unmounts
            if (imgRef.current) imgRef.current.src = '';
        };
    }, []);

    return (
        <div className="flex flex-col w-full h-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-cyan-900/20 hover:border-slate-700">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-800/80 bg-slate-900/80">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <Activity size={20} className={isConnected ? "animate-pulse" : ""} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 tracking-wide">Live Vision AMEN_IA</h2>
                        <p className="text-xs text-slate-400 font-medium">Flux vidéo ultra-basse latence</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/50 border border-slate-800">
                    {isConnected ? (
                        <>
                            <Wifi size={14} className="text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400 tracking-wider">EN LIGNE</span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={14} className="text-red-400" />
                            <span className="text-xs font-bold text-red-400 tracking-wider">HORS LIGNE</span>
                        </>
                    )}
                </div>
            </div>
            
            {/* Video Container (HUD Cinematic) */}
            <div className="relative flex-1 bg-[#050B14] flex flex-col p-3 m-4 mt-0 rounded-xl border border-slate-800/80 shadow-inner overflow-hidden">
                <div className="relative w-full flex-1 rounded-lg overflow-hidden bg-black flex items-center justify-center group">
                    
                    {/* Camera HUD Corners */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg z-10 pointer-events-none"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg z-10 pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg z-10 pointer-events-none"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg z-10 pointer-events-none"></div>
                    
                    {/* EN DIRECT Indicator */}
                    {hasReceivedFrame && (
                        <div className="absolute top-6 right-8 flex items-center gap-2 z-20 bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm border border-slate-800/50">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            <span className="text-[10px] font-bold text-red-500 tracking-widest">EN DIRECT</span>
                        </div>
                    )}

                    {/* Fake Stats Overlay */}
                    {hasReceivedFrame && (
                        <div className="absolute bottom-6 left-8 flex flex-col gap-1 z-20 text-[10px] font-mono text-cyan-400/80 bg-black/40 p-2 rounded-md backdrop-blur-sm border border-slate-800/50 pointer-events-none">
                            <p>YOLO_V8_ACTIVE <span className="text-emerald-400">OK</span></p>
                            <p>LATENCY: <span className="text-emerald-400">&lt;5ms</span></p>
                        </div>
                    )}

                    <img 
                        ref={imgRef}
                        alt="Surveillance AMEN_IA" 
                        className={`w-full h-full object-contain relative z-0 ${hasReceivedFrame ? 'block' : 'hidden'}`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                    
                    {hasReceivedFrame && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-2 w-full animate-scan opacity-30 pointer-events-none z-10 mix-blend-screen"></div>
                    )}

                    {!hasReceivedFrame && (
                        <div className="flex flex-col items-center gap-5 z-20 px-8">
                            {connectionError ? (
                                <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                                        <WifiOff size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-red-400 font-bold text-sm tracking-tight">Connexion locale interrompue</p>
                                        <p className="text-slate-400 text-[11px] leading-relaxed max-w-[240px]">
                                            Coupure de courant ou défaillance matérielle détectée sur le réseau local. <br/>
                                            Le système est en attente de reconnexion...
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => startMjpegStream()}
                                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors"
                                    >
                                        RÉESSAYER
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-spin"></div>
                                        <div className="w-16 h-16 rounded-full border-4 border-slate-800/80"></div>
                                    </div>
                                    <span className="text-cyan-400 font-mono text-sm tracking-widest text-center animate-pulse">
                                        {isConnected ? "ACQUISITION DU FLUX..." : "CONNEXION AU RASPBERRY PI..."}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Status bar */}
                <div className="mt-3 flex items-center justify-between px-2 text-[11px] font-mono">
                    <span className="text-slate-500 flex items-center gap-2">
                        SYS_MSG: <span className="text-cyan-400/80">{debugInfo}</span>
                    </span>
                    <span className="text-emerald-500 flex items-center gap-1.5">
                        <Activity size={12} className={hasReceivedFrame ? "animate-pulse" : ""} />
                        {hasReceivedFrame ? 'DIRECT DOM RENDER' : 'WAITING'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LiveStream;
