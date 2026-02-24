import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LogIn, Loader2, ArrowRight, Users, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [licenseError, setLicenseError] = useState<{ message: string, btnText: string } | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { logo, companyName, primaryColor } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Please enter username and password');
            return;
        }
        setLoading(true);
        try {
            const data = await login(username, password);
            if (localStorage.getItem('inviteJoined')) {
                toast.success(`You have successfully joined ${data?.company_name || 'the company'}!`);
                localStorage.removeItem('inviteJoined');
            } else {
                toast.success('Login successful!');
            }
            navigate('/');
        } catch (error: any) {
            console.error('Login error:', error);
            const errCode = error.response?.data?.code;
            if (['LICENSE_INACTIVE', 'LICENSE_MISSING', 'LICENSE_EXPIRED', 'LICENSE_REVOKED'].includes(errCode)) {

                let btnText = 'Buy License';
                if (errCode === 'LICENSE_EXPIRED' || errCode === 'LICENSE_REVOKED') btnText = 'Reactivate License';
                if (errCode === 'LICENSE_MISSING') btnText = 'Get License';

                setLicenseError({ message: error.response.data.error, btnText });
            } else {
                toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            background: 'var(--background)',
            color: 'var(--foreground)',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflow: 'hidden',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --background: #f0ede8;
                    --foreground: #18181b;
                    --muted-foreground: #71717a;
                    --border: #e2ddd8;
                    --primary: #ea580c;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fadeUp 0.45s ease forwards; }

                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 0.8s linear infinite; }

                /* Nav */
                .nav-bar {
                    width: 100%; max-width: 900px;
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 12px; flex-shrink: 0;
                }
                .nav-logo { display: flex; align-items: center; gap: 8px; }
                .nav-logo-img {
                    width: 26px; height: 26px; object-fit: contain;
                }
                .nav-logo-icon {
                    width: 26px; height: 26px; background: var(--foreground);
                    border-radius: 6px; display: flex; align-items: center; justify-content: center;
                }
                .nav-logo-text { font-size: 13px; font-weight: 700; color: var(--foreground); letter-spacing: -0.02em; }
                .nav-tag {
                    font-size: 11px; font-weight: 600; color: var(--muted-foreground);
                    background: #fff; border: 1px solid var(--border);
                    border-radius: 20px; padding: 4px 12px;
                }

                /* Two-panel card */
                .card {
                    width: 100%; max-width: 900px;
                    background: #fff;
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    display: flex; overflow: hidden;
                    box-shadow: 0 12px 48px rgba(0,0,0,0.08);
                    flex: 1; min-height: 0;
                }

                /* LEFT */
                .left {
                    width: 380px; flex-shrink: 0;
                    background: #f5f1ec;
                    padding: 44px 40px;
                    display: flex; flex-direction: column;
                    justify-content: space-between;
                    border-right: 1px solid var(--border);
                    position: relative; overflow: hidden;
                }
                .left-tag {
                    display: inline-flex; align-items: center;
                    border: 1.5px solid var(--foreground);
                    border-radius: 20px; padding: 5px 14px;
                    font-size: 12px; font-weight: 600; color: var(--foreground);
                    margin-bottom: 28px;
                }
                .left-title {
                    font-size: 52px; font-weight: 800;
                    color: var(--foreground); line-height: 1.0;
                    letter-spacing: -0.04em; margin-bottom: 20px;
                }
                .left-sub {
                    font-size: 13px; color: var(--muted-foreground); line-height: 1.65;
                    max-width: 280px;
                }
                .left-bottom {
                    display: flex; align-items: center; gap: 12px; margin-top: 32px;
                }
                .avatar-stack { display: flex; }
                .avatar {
                    width: 30px; height: 30px; border-radius: 50%;
                    border: 2px solid #f5f1ec;
                    margin-left: -8px; overflow: hidden;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 700; color: #fff;
                }
                .avatar:first-child { margin-left: 0; }
                .left-social-text { font-size: 11px; color: var(--muted-foreground); font-weight: 500; line-height: 1.4; }
                .left-social-text strong { color: var(--foreground); }

                /* Decorative circle */
                .deco-circle {
                    position: absolute;
                    width: 260px; height: 260px;
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.06);
                    bottom: -80px; right: -80px;
                    pointer-events: none;
                }
                .deco-circle-2 {
                    position: absolute;
                    width: 180px; height: 180px;
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.06);
                    bottom: -40px; right: -40px;
                    pointer-events: none;
                }

                /* RIGHT */
                .right {
                    flex: 1; padding: 44px 44px;
                    display: flex; flex-direction: column; justify-content: center;
                    overflow: hidden;
                    background: #fff;
                }
                .right-heading {
                    font-size: 13px; font-weight: 700; color: #a1a1aa;
                    letter-spacing: 0.06em; text-transform: uppercase;
                    margin-bottom: 28px;
                }

                .field-label {
                    font-size: 13px; font-weight: 500; color: #52525b;
                    margin-bottom: 6px;
                }
                .text-input {
                    width: 100%; padding: 0 0 10px 0;
                    background: transparent;
                    border: none; border-bottom: 1.5px solid #d4d0cb;
                    font-size: 14px; font-family: 'DM Sans', sans-serif;
                    color: var(--foreground); outline: none;
                    transition: border-color 0.2s;
                }
                .text-input::placeholder { color: #c4c0bb; }
                .text-input:focus { border-bottom-color: var(--foreground); }
                .field-group { margin-bottom: 22px; }

                .btn-black {
                    width: 100%; padding: 16px 24px;
                    background: var(--foreground); color: #fff; border: none;
                    border-radius: 50px; font-size: 15px; font-weight: 700;
                    font-family: 'DM Sans', sans-serif; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    transition: background 0.2s, transform 0.15s;
                    margin-top: 8px;
                }
                .btn-black:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
                .btn-black:disabled { opacity: 0.55; cursor: not-allowed; }

                .form-footer {
                    margin-top: 16px; text-align: center;
                    font-size: 12px; color: #a1a1aa;
                }
                .form-footer a {
                    color: var(--foreground); font-weight: 700;
                    text-decoration: underline; text-underline-offset: 2px;
                }
                .hint {
                    margin-top: 20px; padding: 10px 14px;
                    background: #f5f1ec; border: 1px solid var(--border);
                    border-radius: 10px; font-size: 11px; color: var(--muted-foreground);
                    text-align: center;
                }
            `}</style>

            {/* Nav */}
            <div className="nav-bar fade-up">
                <div className="nav-logo">
                    {logo
                        ? <img src={logo} alt="logo" className="nav-logo-img" />
                        : <div style={{ width: 26, height: 26, background: 'var(--foreground)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LogIn size={13} color="var(--background)" />
                        </div>
                    }
                    <span className="nav-logo-text">{companyName || 'QuickBiza POS'}</span>
                </div>
                <span className="nav-tag">Admin Portal</span>
            </div>

            {/* Card */}
            <div className="card fade-up-2">

                {/* LEFT */}
                <div className="left">
                    <div>
                        <div className="left-tag">Sign in</div>
                        <h1 className="left-title">Welcome<br />back!</h1>
                        <p className="left-sub">
                            Sign in to access your {companyName || 'QuickBiza'} dashboard and manage your business.
                        </p>
                    </div>

                    <div className="left-bottom">
                        <div className="avatar-stack">
                            {/* Dynamic avatars based on primary color/theme could go here, for now generic colors */}
                            {/* Use primary color for first avatar to show theme linkage */}
                            <div className="avatar" style={{ background: primaryColor }}>S</div>
                            <div className="avatar" style={{ background: 'var(--foreground)' }}>N</div>
                            <div className="avatar" style={{ background: '#71717a' }}>M</div>
                        </div>
                        <div className="social-text">
                            <strong>Nemtel Systems</strong><br />© 2026 All rights reserved
                        </div>
                    </div>

                    <div className="deco-circle" style={{ width: 260, height: 260, bottom: -90, right: -90 }} />
                    <div className="deco-circle" style={{ width: 170, height: 170, bottom: -45, right: -45 }} />
                </div>

                {/* RIGHT */}
                <div className="right">
                    <p className="right-heading">Your credentials</p>

                    <form onSubmit={handleSubmit}>
                        <div className="field-group">
                            <div className="field-label">Username *</div>
                            <input
                                required
                                name="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="text-input"
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <div className="field-group">
                            <div className="field-label">Password *</div>
                            <input
                                required
                                name="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="text-input"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-black" style={{ border: '2px solid #ea580c' }}>
                            {loading
                                ? <Loader2 size={16} className="spin" />
                                : <><span>Sign in</span><ArrowRight size={16} /></>
                            }
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
                        <p className="form-footer" style={{ margin: 0 }}>
                            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--foreground)', textDecoration: 'none' }}>
                                <Users size={14} />
                                <span style={{ color: '#a1a1aa', fontWeight: 500 }}>Have an invite code?</span>
                                <span style={{ textDecoration: 'underline' }}>Join Team</span>
                            </Link>
                        </p>

                        <p className="form-footer" style={{ margin: 0 }}>
                            <span style={{ color: '#a1a1aa', fontWeight: 500 }}>No account yet? </span>
                            <a
                                href="https://quickbiza.vercel.app/register"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    if (window.electron && window.electron.openExternal) {
                                        e.preventDefault();
                                        window.electron.openExternal('https://quickbiza.vercel.app/register');
                                    }
                                }}
                            >
                                Get Started
                            </a>
                        </p>
                    </div>

                    <div className="hint">
                        Default admin access: <strong style={{ color: 'var(--foreground)' }}>admin / admin123</strong>
                    </div>
                </div>
            </div>

            {/* License Error Modal Overlay */}
            {licenseError && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--background)', borderRadius: '12px', padding: '24px',
                        width: '100%', maxWidth: '400px', border: '1px solid var(--border)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
                    }}>
                        <button
                            onClick={() => setLicenseError(null)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                            <X size={24} />
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--foreground)', margin: 0, textAlign: 'center' }}>
                            Access Denied
                        </h3>

                        <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                            {licenseError.message}
                        </p>

                        <a
                            href="https://quickbiza.vercel.app/license"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-white"
                            style={{
                                width: '100%', marginTop: '8px', textDecoration: 'none', textAlign: 'center',
                                padding: '12px 24px', borderRadius: '8px', fontWeight: 600, display: 'block'
                            }}
                            onClick={(e) => {
                                if (window.electron && window.electron.openExternal) {
                                    e.preventDefault();
                                    window.electron.openExternal('https://quickbiza.vercel.app/license');
                                }
                            }}
                        >
                            {licenseError.btnText}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}