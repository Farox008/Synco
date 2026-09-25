"use client";

import React, { useState, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Activity, Box, Layers, ShoppingCart, ArrowUpRight, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, error } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 3D Rotation State - Subtle angle
  const [rotation, setRotation] = useState({ x: 5, y: 15, z: -2 });
  const [isHovering, setIsHovering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(employeeId, password);
      // router.push('/') is handled in AuthContext
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isHovering) return;

    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();

    // Normalized position relative to the left panel
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((clientY - rect.top) / rect.height) * 2 - 1;

    setRotation({
      x: 5 - y * 4,
      y: 15 + x * 6,
      z: -2 + x * 2
    });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 5, y: 15, z: -2 });
  };

  return (
    <div className="login-container">
      <div
        className="login-left"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* The 3D Interactive Scene */}
        <div className="scene-container">
          <div
            className="isometric-world"
            style={{
              transform: `scale(1) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
            }}
          >
            {/* Base Grid / Floor */}
            <div className="floor-grid"></div>

            {/* Centered Hero Text inside the 3D World */}
            <div className="login-hero-text" style={{ position: 'absolute', top: '50%', left: '55%', transform: 'translate(-50%, -50%) translateZ(20px)', textAlign: 'left', width: '420px', pointerEvents: 'none' }}>
              <h1><span className="text-highlight">Connected</span> <br />Intelligence.</h1>
              <p style={{ fontSize: '16px', color: '#9CA3AF', marginTop: '16px', lineHeight: '1.5' }}>
                Real-time insights, seamless operations, <br />smarter decisions.
              </p>
            </div>

            {/* Floating Stat Card - Top Center */}
            <div className="card3d stat-panel" style={{ transform: 'translateX(0px) translateY(-280px) translateZ(80px)' }}>
              <h4>Total Output</h4>
              <h2>18.2K <small>parts</small></h2>
              <div className="trend up">+5.2% this week</div>
            </div>

            {/* Active Crew - Top Right */}
            <div className="card3d team-panel" style={{ transform: 'translateX(200px) translateY(-320px) translateZ(120px)' }}>
              <h4>Active Crew</h4>
              <div className="avatar-cluster">
                <div className="avatar3d" style={{ background: '#3B82F6', zIndex: 3 }}>JS</div>
                <div className="avatar3d" style={{ background: '#10B981', zIndex: 2, transform: 'translateX(-10px)' }}>MR</div>
                <div className="avatar3d" style={{ background: '#F59E0B', zIndex: 1, transform: 'translateX(-20px)' }}>AL</div>
              </div>
              <p>+4 others online</p>
            </div>

            {/* Systems Nominal Badge - Top Left */}
            <div className="card3d small-badge" style={{ transform: 'translateX(-300px) translateY(-280px) translateZ(160px)' }}>
              <div className="pulse-dot green" style={{ marginRight: '8px' }}></div>
              Systems Nominal
            </div>

            {/* Machine Fleet - Left Side */}
            <div className="card3d side-panel-1" style={{ transform: 'translateX(-340px) translateY(-40px) translateZ(60px)' }}>
              <div className="card3d-header">
                <Box size={18} />
                <h4>Machine Fleet</h4>
              </div>
              <div className="machine-list-3d">
                <div className="machine3d running">
                  <span>CNC-01</span>
                  <div className="pulse-dot green"></div>
                </div>
                <div className="machine3d running">
                  <span>VMC-02</span>
                  <div className="pulse-dot green"></div>
                </div>
              </div>
            </div>

            {/* Recent Purchases - Right Side */}
            <div className="card3d side-panel-2" style={{ transform: 'translateX(360px) translateY(30px) translateZ(90px)' }}>
              <div className="card3d-header">
                <ShoppingCart size={18} />
                <h4>Recent Purchases</h4>
              </div>
              <div className="purchase-list-3d">
                <div className="purchase3d">
                  <div className="p-icon"><ArrowUpRight size={14} color="#1A1D1F" /></div>
                  <div className="p-details">
                    <span>Raw Aluminum</span>
                    <small>RM 4,200</small>
                  </div>
                </div>
                <div className="purchase3d">
                  <div className="p-icon"><ArrowUpRight size={14} color="#1A1D1F" /></div>
                  <div className="p-details">
                    <span>Carbide End Mills</span>
                    <small>RM 850</small>
                  </div>
                </div>
              </div>
            </div>

            {/* OEE Score - Bottom Left-Center */}
            <div className="card3d" style={{ transform: 'translateX(-160px) translateY(200px) translateZ(100px)', padding: '20px', width: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#A0A0A0' }}>OEE Score</h4>
                <span className="badge red" style={{ fontSize: '10px' }}>Live</span>
              </div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '32px', color: '#FFFFFF' }}>92.4%</h2>
              <div style={{ color: '#27AE60', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>Excellent</div>
              <div className="chart-mockup" style={{ height: '40px' }}>
                <div className="chart-bar" style={{ height: '30%' }}></div>
                <div className="chart-bar" style={{ height: '45%' }}></div>
                <div className="chart-bar" style={{ height: '80%', backgroundColor: '#FF4D4D' }}></div>
                <div className="chart-bar" style={{ height: '60%' }}></div>
                <div className="chart-bar" style={{ height: '90%' }}></div>
              </div>
            </div>

            {/* Global Uptime - Far Bottom Left */}
            <div className="card3d uptime-panel" style={{ transform: 'translateX(-360px) translateY(200px) translateZ(80px)' }}>
              <div className="uptime-label">Global Uptime</div>
              <div className="uptime-value">99.98%</div>
              <div className="uptime-bars">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="uptime-bar" style={{ opacity: i === 7 ? 0.3 : 1, background: '#27AE60' }}></div>
                ))}
              </div>
            </div>

            {/* Energy Draw - Bottom Right-Center */}
            <div className="card3d mini-graph" style={{ transform: 'translateX(160px) translateY(180px) translateZ(120px)' }}>
              <div className="mini-graph-header" style={{ color: '#A0A0A0' }}>
                Energy Draw
              </div>
              <svg viewBox="0 0 100 40" className="sparkline">
                <path d="M0 30 Q 10 20, 20 25 T 40 10 T 60 15 T 80 5 T 100 20" fill="none" stroke="#FF4D4D" strokeWidth="2" />
              </svg>
              <h3 style={{ margin: '8px 0 0 0', color: '#FFF', fontSize: '20px' }}>4.2 <small style={{ fontSize: '12px', color: '#A0A0A0' }}>kW</small></h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#A0A0A0' }}>Normal</p>
            </div>

            {/* New Rush Order - Bottom Center */}
            <div className="card3d notification-panel" style={{ transform: 'translateX(-40px) translateY(340px) translateZ(150px)', width: '320px', padding: '16px' }}>
              <div className="notif-content" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="notif-icon" style={{ width: '36px', height: '36px', flexShrink: 0 }}><Zap size={18} color="#FF4D4D" /></div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#FFF', fontSize: '14px' }}>New Rush Order</h4>
                  <p style={{ margin: 0, color: '#A0A0A0', fontSize: '12px' }}>WO-9902 assigned to CNC-01</p>
                </div>
                <ArrowRight size={16} color="#6F767E" />
              </div>
            </div>

            {/* Abstract Shapes */}
            <div className="abstract-cube" style={{ '--x': '300px', '--y': '320px', '--z': '200px', animationDelay: '0s' } as React.CSSProperties}></div>
            <div className="abstract-cube" style={{ '--x': '-250px', '--y': '-450px', '--z': '80px', animationDelay: '-2s' } as React.CSSProperties}></div>
            <div className="abstract-cube" style={{ '--x': '350px', '--y': '-50px', '--z': '120px', animationDelay: '-5s' } as React.CSSProperties}></div>
            <div className="abstract-cube" style={{ '--x': '100px', '--y': '-350px', '--z': '150px', animationDelay: '-8s' } as React.CSSProperties}></div>
            <div className="abstract-cube" style={{ '--x': '-350px', '--y': '50px', '--z': '90px', animationDelay: '-1s' } as React.CSSProperties}></div>
            <div className="abstract-sphere" style={{ transform: 'translateX(-100px) translateY(-200px) translateZ(20px)' }}></div>
            <div className="abstract-sphere" style={{ transform: 'translateX(-320px) translateY(360px) translateZ(20px)' }}></div>
            <div className="abstract-sphere" style={{ transform: 'translateX(-320px) translateY(360px) translateZ(20px)' }}></div>
            <div className="abstract-sphere" style={{ transform: 'translateX(-320px) translateY(360px) translateZ(20px)' }}></div>
          </div>
        </div>
        <div className="mesh-gradient"></div>
      </div>

      <div className="login-right">
        {/* Brand moved outside the box at the top */}
        <div className="login-brand right-brand" style={{ marginBottom: '32px' }}>
          <div className="brand-logo">⬢</div>
          <span>Synco</span>
        </div>

        <div className="login-box">
          <div className="login-header">
            <h2>Sign In</h2>
            <p className="login-subtitle">Enter your credentials to access the dashboard.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="input-group">
              <label>Employee ID</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="P1042"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-actions">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className={`login-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="signup-prompt">
            Don't have an account? <a href="#">Contact IT Support</a>
          </p>
        </div>

        <div className="author-mention">
          Made by farox008
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          background-color: #FAFAFA;
          font-family: 'Inter', sans-serif;
        }

        /* LEFT SIDE */
        .login-left {
          flex: 1;
          background-color: #050505;
          background-image: 
            radial-gradient(at 0% 0%, rgba(20, 20, 25, 1) 0%, transparent 50%),
            radial-gradient(at 100% 100%, rgba(30, 20, 25, 1) 0%, transparent 50%);
          color: #FFFFFF;
          padding: 60px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* 3D SCENE SPECIFICS */
        .scene-container {
          position: absolute;
          inset: 0;
          perspective: 1200px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          pointer-events: none; /* Let the parent catch mouse moves */
        }

        .isometric-world {
          width: 800px;
          height: 800px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .floor-grid {
          position: absolute;
          width: 100%;
          inset: 100px;
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 32px;
          transform: translateZ(-20px);
          box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
        }

        /* Dark Glassmorphic 3D Cards */
        .card3d {
          position: absolute;
          top: 50%; left: 50%;
          background: rgba(22, 22, 26, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          transform-style: preserve-3d;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          color: #FFF;
        }

        .card3d-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card3d-header h4 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #A0A0A0;
        }

        .badge.red {
          background: rgba(255, 77, 77, 0.2);
          color: #FF4D4D;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .chart-mockup {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          height: 80px;
          transform: translateZ(20px);
        }

        .chart-bar {
          flex: 1;
          background: rgba(255,255,255,0.2);
          border-radius: 4px 4px 0 0;
        }

        .side-panel-1 { width: 220px; height: auto; margin-top: -100px; margin-left: -110px; }
        .side-panel-2 { width: 260px; height: auto; margin-top: -120px; margin-left: -130px; }

        .machine-list-3d, .purchase-list-3d {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .machine3d, .purchase3d {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          transform: translateZ(10px);
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .purchase3d { justify-content: flex-start; gap: 12px; }

        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; }
        .pulse-dot.green { background: #27AE60; box-shadow: 0 0 10px #27AE60; }
        .pulse-dot.red { background: #FF4D4D; box-shadow: 0 0 10px #FF4D4D; }

        .p-icon {
          width: 32px; height: 32px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center;
        }
        .p-details { display: flex; flex-direction: column; }
        .p-details span { font-size: 13px; font-weight: 600; color: #FFFFFF; }
        .p-details small { font-size: 12px; color: #A0A0A0; }

        .notification-panel {
          width: 300px; height: auto; margin-top: -40px; margin-left: -150px; padding: 16px 20px; border-left: 4px solid #FF4D4D;
        }

        .notif-content { display: flex; align-items: center; gap: 16px; transform: translateZ(20px); }
        .notif-content h4 { margin: 0 0 4px 0; font-size: 14px; color: #FFFFFF; }
        .notif-content p { margin: 0; font-size: 12px; color: #A0A0A0; }
        .notif-icon { width: 40px; height: 40px; background: rgba(255,77,77,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        .stat-panel { width: 220px; height: auto; margin-top: -80px; margin-left: -110px; text-align: center; }
        .stat-panel h4 { color: #A0A0A0; font-size: 14px; margin: 0 0 8px 0; }
        .stat-panel h2 { font-size: 32px; margin: 0 0 8px 0; color: #FFFFFF; }
        .stat-panel h2 small { font-size: 14px; color: #6F767E; }
        .trend.up { display: inline-block; background: rgba(39, 174, 96, 0.2); color: #27AE60; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; transform: translateZ(10px); }

        /* NEW UI ELEMENTS CSS */
        .team-panel { width: 200px; height: auto; padding: 20px; }
        .team-panel h4 { margin: 0 0 16px 0; font-size: 14px; color: #FFFFFF; }
        .avatar-cluster { display: flex; margin-bottom: 12px; }
        .avatar3d { width: 36px; height: 36px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; border: 2px solid rgba(25, 25, 30, 1); box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .team-panel p { margin: 0; font-size: 12px; color: #A0A0A0; }

        .small-badge { display: flex; align-items: center; padding: 12px 20px; width: auto; height: auto; font-size: 14px; font-weight: 600; color: #FFFFFF; border-radius: 100px; }
        
        .uptime-panel { width: 180px; height: auto; padding: 16px; }
        .uptime-label { font-size: 12px; color: #A0A0A0; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .uptime-value { font-size: 24px; font-weight: 800; color: #FFFFFF; margin-bottom: 12px; }
        .uptime-bars { display: flex; gap: 4px; align-items: flex-end; height: 24px; }
        .uptime-bar { flex: 1; height: 100%; border-radius: 2px; }

        .mini-graph { width: 160px; height: auto; padding: 16px; }
        .mini-graph-header { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #FFFFFF; font-weight: 600; margin-bottom: 12px; }
        .sparkline { width: 100%; height: 40px; overflow: visible; }

        .abstract-cube { position: absolute; width: 60px; height: 60px; background: rgba(255, 77, 77, 0.4); border: 2px solid rgba(255,77,77,0.8); border-radius: 16px; top: 50%; left: 50%; margin-top: -30px; margin-left: -30px; transform-style: preserve-3d; animation: floatCube 15s infinite linear; box-shadow: inset 0 0 20px rgba(255,77,77,0.5), 0 10px 30px rgba(255, 77, 77, 0.3); }
        .abstract-sphere { position: absolute; width: 40px; height: 40px; background: radial-gradient(circle at 30% 30%, rgba(100,100,100,1), rgba(20,20,20,1)); border-radius: 50%; top: 50%; left: 50%; margin-top: -20px; margin-left: -20px; box-shadow: 0 10px 20px rgba(0,0,0,0.8); }
        .abstract-ring { display: none; } /* Removed to match image */

        @keyframes floatCube { 
          0% { transform: translateX(var(--x)) translateY(var(--y)) translateZ(var(--z)) rotateX(0deg) rotateY(0deg); } 
          100% { transform: translateX(var(--x)) translateY(var(--y)) translateZ(var(--z)) rotateX(360deg) rotateY(360deg); } 
        }

        /* Typography & Rest of Login */
        .login-brand { display: flex; align-items: center; gap: 12px; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; z-index: 10; }
        .right-brand { margin-bottom: 32px; color: #1A1D1F; justify-content: center; width: 100%; max-width: 400px; }
        .brand-logo { color: #FF4D4D; font-size: 36px; line-height: 1; }

        .login-hero-text h1 { font-size: 70px; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em; margin: 0; color: #FFF; }
        .text-highlight { color: #FF4D4D; }

        .mesh-gradient {
          position: absolute; top: -30%; right: -30%; width: 100%; height: 100%;
          background: radial-gradient(circle at center, rgba(255,77,77,0.15) 0%, rgba(5,5,5,0) 60%);
          z-index: 1; pointer-events: none; animation: pulse 8s infinite alternate;
        }
        .mesh-gradient::after {
          content: ''; position: absolute; bottom: -40%; left: -40%; width: 120%; height: 120%;
          background: radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, rgba(5,5,5,0) 60%);
        }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.1); opacity: 1; } }

        /* RIGHT SIDE */
        .login-right { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #F9FAFB; }
        .login-box { width: 100%; max-width: 460px; background: #FFFFFF; padding: 56px; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03); }
        .login-header { text-align: center; }
        .login-box h2 { font-size: 36px; font-weight: 800; color: #111827; margin-bottom: 12px; letter-spacing: -0.03em; }
        .login-subtitle { color: #6B7280; font-size: 16px; margin-bottom: 48px; line-height: 1.5; }
        
        .login-form { display: flex; flex-direction: column; gap: 28px; }
        .input-group { display: flex; flex-direction: column; gap: 10px; }
        .input-group label { font-size: 14px; font-weight: 700; color: #374151; }
        
        .input-wrapper { position: relative; display: flex; align-items: center; gap:10px; }
        .input-icon { position: absolute; left: 5px; right: 18px; color: #9CA3AF; transition: color 0.2s ease; }
        .input-wrapper input { width: 100%; padding: 16px 16px 16px 12px; border: 2px solid #E5E7EB; border-radius: 14px; font-size: 16px; font-weight: 500; color: #111827; background-color: #F9FAFB; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); outline: none; }
        .input-wrapper input::placeholder { color: #9CA3AF; font-weight: 400; }
        .input-wrapper input:focus { border-color: #FF4D4D; background-color: #FFFFFF; box-shadow: 0 0 0 4px rgba(255, 77, 77, 0.15); }
        .input-wrapper input:focus + .input-icon { color: #FF4D4D; }

        .login-actions { display: flex; justify-content: space-between; align-items: center; }
        .remember-me { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: #4B5563; cursor: pointer; }
        .remember-me input { width: 18px; height: 18px; accent-color: #FF4D4D; }
        .forgot-password { font-size: 14px; font-weight: 600; color: #FF4D4D; text-decoration: none; transition: color 0.2s; }
        .forgot-password:hover { color: #DC2626; }

        .login-button { background-color: #FF4D4D; color: #FFFFFF; border: none; padding: 20px; border-radius: 14px; font-size: 16px; font-weight: 700; display: flex; justify-content: center; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 6px 16px rgba(255, 77, 77, 0.25); margin-top: 8px; }
        .login-button:hover:not(:disabled) { background-color: #DC2626; transform: translateY(-2px); box-shadow: 0 10px 24px rgba(255, 77, 77, 0.35); }
        .login-button:active:not(:disabled) { transform: translateY(0); }
        .login-button.loading { opacity: 0.8; cursor: not-allowed; }

        .signup-prompt { text-align: center; margin-top: 40px; font-size: 15px; color: #6B7280; }
        .signup-prompt a { color: #111827; font-weight: 700; text-decoration: none; margin-left: 4px; }
        .signup-prompt a:hover { text-decoration: underline; }

        .author-mention { margin-top: 32px; font-size: 14px; color: #9CA3AF; font-weight: 600; letter-spacing: 0.02em; }

        @media (max-width: 1024px) {
          .login-left { display: none; }
          .login-right { background-color: #FFFFFF; }
          .login-box { box-shadow: none; padding: 24px; }
        }
      `}</style>
    </div>
  );
}
