import { useState, useEffect } from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import { fetchDashboard } from '../services/api';

export default function ServerStatusBanner() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'waking' | 'ready' | 'hidden'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer;
    let isMounted = true;
    const startTime = Date.now();

    const checkServer = async () => {
      try {
        const controller = new AbortController();
        // If it doesn't respond within 2.5 seconds, backend is in cold sleep
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        await fetchDashboard();
        clearTimeout(timeoutId);

        if (isMounted) {
          // If server was warm, stay hidden
          setStatus('hidden');
          return;
        }
      } catch (err) {
        if (isMounted) {
          setStatus('waking');
          timer = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
          }, 1000);
        }
      }

      // Poll every 4 seconds until backend finishes spinning up
      const pollInterval = setInterval(async () => {
        try {
          await fetchDashboard();
          if (isMounted) {
            clearInterval(pollInterval);
            clearInterval(timer);
            setStatus('ready');

            // Fade out after 3.5 seconds
            setTimeout(() => {
              if (isMounted) setStatus('hidden');
            }, 3500);
          }
        } catch {
          // Still booting
        }
      }, 4000);

      return () => {
        clearInterval(pollInterval);
        clearInterval(timer);
      };
    };

    checkServer();

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (status === 'checking' || status === 'hidden') return null;

  if (status === 'ready') {
    return (
      <div style={{
        background: 'rgba(20, 184, 166, 0.15)',
        borderBottom: '1px solid rgba(20, 184, 166, 0.4)',
        backdropFilter: 'blur(12px)',
        color: '#2DD4BF',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        zIndex: 999
      }}>
        <CheckCircle2 size={16} />
        <span>Backend server is online! Live fleet telemetry connected.</span>
      </div>
    );
  }

  // Waking up status
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(18, 24, 36, 0.95))',
      borderBottom: '1px solid rgba(249, 115, 22, 0.35)',
      backdropFilter: 'blur(12px)',
      color: '#F8FAFC',
      padding: '10px 18px',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      zIndex: 999
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F97316' }}>
        <Zap size={16} style={{ animation: 'pulse 1.5s infinite' }} />
        <strong>Waking Up Cloud Instance</strong>
      </div>
      
      <span style={{ color: '#94A3B8' }}>
        Render free tier puts inactive servers to sleep. Spin-up takes ~30s (<strong>{elapsedSeconds}s</strong> elapsed).
      </span>

      <div style={{
        width: '120px',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '999px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${Math.min((elapsedSeconds / 35) * 100, 95)}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #F97316, #FB923C)',
          transition: 'width 1s linear'
        }} />
      </div>
    </div>
  );
}
