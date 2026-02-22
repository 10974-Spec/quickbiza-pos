import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api"; // Ensure you use the axios instance

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        password: "",
        confirm_password: "",
        invite_code: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md animate-fade-up">

                <div className="neo-card p-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold font-display text-foreground">Join Team</h1>
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                            Please enter your details and the invite code provided by your administrator.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1 ml-1">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                required
                                className="neo-input w-full"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1 ml-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="neo-input w-full"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        className="neo-input w-full pr-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1 ml-1">Confirm</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirm_password"
                                        required
                                        className="neo-input w-full pr-10"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold mb-1 ml-1 text-primary">Invite Code</label>
                            <input
                                type="text"
                                name="invite_code"
                                required
                                className="neo-input w-full border-primary/50 bg-primary/5 font-mono text-center tracking-widest uppercase"
                                value={formData.invite_code}
                                onChange={(e) => setFormData({ ...formData, invite_code: e.target.value.toUpperCase() })}
                                placeholder="XXXX-XXXX"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="neo-button w-full bg-primary text-primary-foreground py-3 mt-6 flex items-center justify-center gap-2 text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/50 font-medium">
                        &copy; 2026 QuickBiza POS System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
