import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useTheme } from '@/context/ThemeContext';

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        password: "",
        confirm_password: "",
        invite_code: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { logo, companyName, primaryColor } = useTheme();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', {
                username: formData.username,
                full_name: formData.full_name,
                password: formData.password,
                invite_code: formData.invite_code
            });

            if (formData.invite_code) {
                localStorage.setItem('inviteJoined', 'true');
            }

            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (error: any) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.error || "Registration failed");
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

                .field-row {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
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
            `}</style>

            {/* Nav */}
            <div className="nav-bar fade-up">
                <div className="nav-logo">
                    {logo
                        ? <img src={logo} alt="logo" className="nav-logo-img" />
                        : <div style={{ width: 26, height: 26, background: 'var(--foreground)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserPlus size={13} color="var(--background)" />
                        </div>
                    }
                    <span className="nav-logo-text">{companyName || 'QuickBiza POS'}</span>
                </div>
                <span className="nav-tag">Join Team</span>
            </div>

            {/* Card */}
            <div className="card fade-up-2">
                {/* LEFT */}
                <div className="left">
                    <div>
                        <div className="left-tag">Register</div>
                        <h1 className="left-title">Join<br />Team</h1>
                        <p className="left-sub">
                            Enter your details and the invite code provided by your administrator to join {companyName || 'QuickBiza'}.
                        </p>
                    </div>

                    <div className="left-bottom">
                        <div className="avatar-stack">
                            <div className="avatar" style={{ background: primaryColor }}>{companyName?.[0] || 'Q'}</div>
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
                    <p className="right-heading">Your details</p>

                    <form onSubmit={handleRegister}>
                        <div className="field-group">
                            <div className="field-label">Full Name *</div>
                            <input
                                required
                                name="full_name"
                                type="text"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="text-input"
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <div className="field-group">
                            <div className="field-label">Username *</div>
                            <input
                                required
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                className="text-input"
                                disabled={loading}
                            />
                        </div>

                        <div className="field-row">
                            <div className="field-group">
                                <div className="field-label">Password *</div>
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="text-input"
                                    disabled={loading}
                                />
                            </div>
                            <div className="field-group">
                                <div className="field-label">Confirm *</div>
                                <input
                                    required
                                    name="confirm_password"
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="text-input"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="field-group">
                            <div className="field-label" style={{ color: primaryColor || '#ea580c' }}>Invite Code *</div>
                            <input
                                required
                                name="invite_code"
                                type="text"
                                value={formData.invite_code}
                                onChange={(e) => setFormData({ ...formData, invite_code: e.target.value.toUpperCase() })}
                                placeholder="XXXX-XXXX"
                                className="text-input"
                                style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-black" style={{ border: `2px solid ${primaryColor || '#ea580c'}` }}>
                            {loading
                                ? <Loader2 size={16} className="spin" />
                                : <><span>Create Account</span><ArrowRight size={16} /></>
                            }
                        </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
                        <p className="form-footer" style={{ margin: 0 }}>
                            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--foreground)', textDecoration: 'none' }}>
                                <ArrowLeft size={14} />
                                <span style={{ color: '#a1a1aa', fontWeight: 500 }}>Already have an account?</span>
                                <span style={{ textDecoration: 'underline' }}>Sign in</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
