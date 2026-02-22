import { useState, useRef } from "react";
import { setupAPI } from "@/services/setup";
import { settingsAPI } from "@/services/settings";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Building, User, Key, ArrowRight, Loader2, Store, Truck, ShoppingCart, ShoppingBag, Utensils, Wrench, Palette, Upload, Eye, EyeOff, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

const steps = [
    { id: 1, title: "Company Details", icon: Building },
    { id: 2, title: "Business Type", icon: Store },
    { id: 3, title: "License Activation", icon: Key },
    { id: 4, title: "Branding & Theme", icon: Palette },
    { id: 5, title: "Admin Account", icon: User },
    { id: 6, title: "Completion", icon: CheckCircle2 }
];

const businessTypes = [
    { id: 'bakery', name: 'Bakery', icon: Utensils, desc: 'Production tracking, ingredients, batch management.' },
    { id: 'retail', name: 'Retail Shop', icon: ShoppingBag, desc: 'POS, inventory, barcode scanning.' },
    { id: 'restaurant', name: 'Restaurant', icon: Utensils, desc: 'Table management, kitchen display, waiter app.' },
    { id: 'supermarket', name: 'Supermarket', icon: ShoppingCart, desc: 'High volume POS, shelf management.' },
    { id: 'pharmacy', name: 'Pharmacy', icon: Store, desc: 'Expiry tracking, prescription management.' },
    { id: 'hardware', name: 'Hardware', icon: Wrench, desc: 'Unit conversions, heavy item tracking.' },
    { id: 'fleet', name: 'Logistics / Fleet', icon: Truck, desc: 'Vehicle tracking, maintenance, driver management.' }
];

const colorPalettes = [
    { name: 'Orange (Default)', value: '#ea580c' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Windows Blue', value: '#0078d7' },
];

const SetupWizard = () => {
    const navigate = useNavigate();
    const { setTheme, setPrimaryColor, setLogo, iconSet, setIconSet } = useTheme();
    const { user } = useAuth();

    // Parse query params for initial step, handling HashRouter format
    // Example: #/setup?step=4
    const getStepFromUrl = () => {
        try {
            const hash = window.location.hash; // "#/setup?step=4"
            const searchPart = hash.split('?')[1];
            if (searchPart) {
                const params = new URLSearchParams(searchPart);
                return parseInt(params.get('step') || '1');
            }
        } catch (e) {
            console.error("Error parsing step from URL", e);
        }
        return 1;
    };

    const initialStep = getStepFromUrl();

    const [step, setStep] = useState(initialStep);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Branding State
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<'default' | 'win7' | 'saas' | 'material' | 'terminal'>('default');
    const [selectedColor, setSelectedColor] = useState('#ea580c');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        // Company
        name: "",
        email: "",
        phone: "",
        country: "Kenya",
        businessType: "",

        // License
        licenseKey: "",

        // Admin
        adminUsername: "admin",
        adminPassword: "",
        adminConfirmPassword: "",
        adminFullName: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            if (step === 1) {
                if (!formData.name) throw new Error("Company Name is required");
            }
            if (step === 2) {
                if (!formData.businessType) throw new Error("Please select a business type");
                const res = await setupAPI.createCompany({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    business_type: formData.businessType
                });
                if (!res.success) throw new Error("Failed to save company details");
            }
            if (step === 3) {
                if (!formData.licenseKey) throw new Error("License Key is required");
                const res = await setupAPI.activateLicense(formData.licenseKey);
                if (!res.success) throw new Error("License activation failed");
                toast.success("License Activated Successfully!");
            }
            if (step === 4) {
                // Save Branding
                await settingsAPI.updateSettings({
                    theme: selectedTheme,
                    primary_color: selectedColor,
                    receipt_footer_text: `Thank you for shopping at ${formData.name}!`
                });

                // Update Context immediately for preview
                setTheme(selectedTheme);
                setPrimaryColor(selectedColor);

                if (logoFile) {
                    const res = await settingsAPI.uploadLogo(logoFile);
                    if (res.success && res.logoPath) {
                        const baseUrl = import.meta.env.PROD ? 'http://localhost:5000' : 'http://localhost:5000';
                        setLogo(`${baseUrl}${res.logoPath}`);
                    }
                }
                toast.success("Branding applied!");
            }
            if (step === 5) {
                if (!formData.adminPassword) throw new Error("Password is required");
                if (formData.adminPassword !== formData.adminConfirmPassword) throw new Error("Passwords do not match");

                const res = await setupAPI.createAdmin({
                    username: formData.adminUsername,
                    password: formData.adminPassword,
                    fullName: formData.adminFullName
                });
                if (!res.success) throw new Error("Failed to create admin account");
            }

            if (step < 6) {
                // If on Branding (Step 4) and user is already logged in (Hybrid Flow), skip Admin Creation (Step 5)
                if (step === 4 && user) {
                    setStep(6);
                } else {
                    setStep(step + 1);
                }
            } else {
                navigate('/login');
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body text-foreground transition-colors duration-500">
            <div className="w-full max-w-5xl neo-card overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Sidebar */}
                <div className="bg-sidebar-background text-sidebar-foreground border-r-2 border-foreground p-8 flex flex-col justify-between md:w-1/3">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-10 h-10 object-contain rounded-md border-2 border-foreground bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                            ) : (
                                <div className="w-10 h-10 rounded-none border-2 border-foreground bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                            )}
                            <span className="font-display font-bold text-2xl tracking-tight">QuickBiza POS</span>
                        </div>
                        <div className="space-y-6">
                            {steps.map((s) => (
                                <div key={s.id} className={`flex items-center gap-3 transition-colors ${step >= s.id ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className={`
                                        w-8 h-8 flex items-center justify-center border-2 border-foreground rounded-md
                                        ${step > s.id ? 'bg-success text-success-foreground' : step === s.id ? 'bg-primary text-primary-foreground' : 'bg-card'}
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    `}>
                                        {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-sm font-bold font-display ${step === s.id ? 'text-primary' : ''}`}>{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-xs font-bold mt-8 opacity-60">
                        &copy; 2026 Nemtel Systems
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 bg-card flex-1 overflow-y-auto">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex flex-col"
                    >
                        {step === 1 && (
                            <div className="space-y-6 relative">
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                    <div className="bg-card border-2 border-foreground p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
                                        <Building className="w-12 h-12 mx-auto mb-4 text-primary" />
                                        <h3 className="font-display font-bold text-xl mb-2">Managed via Web Portal</h3>
                                        <p className="text-muted-foreground text-sm mb-4">
                                            Company details are now managed centrally on the QuickBiza Web Portal.
                                        </p>
                                        <a
                                            href="http://localhost:5174/register"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="neo-button bg-primary text-primary-foreground text-sm px-4 py-2 inline-flex items-center gap-2"
                                            onClick={(e) => {
                                                if (window.electron && window.electron.openExternal) {
                                                    e.preventDefault();
                                                    window.electron.openExternal('http://localhost:5174/register');
                                                }
                                            }}
                                        >
                                            Go to Web Portal <ArrowRight className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-50 pointer-events-none">
                                    <h2 className="text-3xl font-display font-bold">Welcome!</h2>
                                    <p className="text-muted-foreground font-medium">Let's get your organization set up.</p>
                                </div>

                                <div className="space-y-5 opacity-50 pointer-events-none">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Company Name</Label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            readOnly
                                            placeholder="e.g. My Awesome Business"
                                            className="neo-input w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label className="font-bold">Email</Label>
                                            <input
                                                name="email"
                                                value={formData.email}
                                                readOnly
                                                placeholder="info@company.com"
                                                className="neo-input w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">Phone</Label>
                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                readOnly
                                                placeholder="+254..."
                                                className="neo-input w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Country</Label>
                                        <input
                                            name="country"
                                            value={formData.country}
                                            readOnly
                                            className="neo-input w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 relative">
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                    <div className="bg-card border-2 border-foreground p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
                                        <Store className="w-12 h-12 mx-auto mb-4 text-primary" />
                                        <h3 className="font-display font-bold text-xl mb-2">Managed via Web Portal</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Business Type selection is handled during web registration.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-50 pointer-events-none">
                                    <h2 className="text-3xl font-display font-bold">Business Type</h2>
                                    <p className="text-muted-foreground font-medium">Select the category that fits best.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 opacity-50 pointer-events-none">
                                    {businessTypes.map((type) => (
                                        <div
                                            key={type.id}
                                            className={`
                                                p-4 border-2 rounded-lg transition-all flex items-start gap-4
                                                border-foreground bg-card
                                            `}
                                        >
                                            <div className="p-2 rounded-md border-2 border-foreground bg-background">
                                                <type.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold font-display text-lg">{type.name}</h3>
                                                <p className="text-sm text-muted-foreground font-medium leading-tight">{type.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 relative">
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                    <div className="bg-card border-2 border-foreground p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
                                        <Key className="w-12 h-12 mx-auto mb-4 text-primary" />
                                        <h3 className="font-display font-bold text-xl mb-2">Managed via Web Portal</h3>
                                        <p className="text-muted-foreground text-sm">
                                            License activation is handled automatically after web registration.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-50 pointer-events-none">
                                    <h2 className="text-3xl font-display font-bold">Activate License</h2>
                                    <p className="text-muted-foreground font-medium">Enter your product key to unlock features.</p>
                                </div>

                                <div className="space-y-6 opacity-50 pointer-events-none">
                                    <div className="space-y-2">
                                        <Label className="font-bold">License Key</Label>
                                        <input
                                            name="licenseKey"
                                            value={formData.licenseKey}
                                            readOnly
                                            placeholder="SOKO-XXXX-YYYY-ZZZZ"
                                            className="neo-input w-full font-mono text-center text-xl tracking-widest uppercase py-4"
                                        />
                                    </div>
                                    <div className="bg-yellow-100 border-2 border-foreground p-4 rounded-lg text-sm text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="font-display font-bold mb-1 flex items-center gap-2">
                                            <Wrench className="w-4 h-4" />
                                            Testing Mode
                                        </p>
                                        <p>Use trial key: <code className="bg-white px-2 py-0.5 rounded border border-foreground font-mono font-bold">SOKO-TRIAL-2026</code></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-display font-bold">Branding & Theme</h2>
                                    <p className="text-muted-foreground font-medium">Customize the look and feel of your POS.</p>
                                </div>

                                <div className="space-y-8">
                                    {/* Logo Upload */}
                                    <div className="space-y-3">
                                        <Label className="font-bold">Company Logo</Label>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-24 h-24 border-2 border-dashed border-foreground bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 overflow-hidden relative"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <div className="text-center p-2">
                                                        <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                                                        <span className="text-xs font-bold text-muted-foreground">Upload</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleLogoSelect}
                                                />
                                            </div>
                                            <div className="text-sm text-muted-foreground flex-1">
                                                <p>Upload your business logo. Recommended size: 500x500px.</p>
                                                <p className="text-xs opacity-70 mt-1">This will appear on receipts and the sidebar.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Theme */}
                                    <div className="space-y-3">
                                        <Label className="font-bold">System Theme</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div
                                                className={`p-4 border-2 rounded-lg cursor-pointer text-center space-y-2 ${selectedTheme === 'default' ? 'border-primary bg-primary/5' : 'border-foreground bg-card'}`}
                                                onClick={() => setSelectedTheme('default')}
                                            >
                                                <div className="h-20 bg-background border border-border rounded flex flex-col p-2 gap-2 overflow-hidden relative">
                                                    <div className="h-2 w-full bg-foreground/10 rounded-full"></div>
                                                    <div className="flex gap-1 h-full">
                                                        <div className="w-1/4 bg-foreground/5 h-full rounded"></div>
                                                        <div className="w-3/4 bg-foreground/5 h-full rounded"></div>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs bg-black/5">Neobrutalist</div>
                                                </div>
                                                <p className="font-bold text-sm">Default</p>
                                            </div>

                                            <div
                                                className={`p-4 border-2 rounded-lg cursor-pointer text-center space-y-2 ${selectedTheme === 'win7' ? 'border-primary bg-primary/5' : 'border-foreground bg-card'}`}
                                                onClick={() => {
                                                    setSelectedTheme('win7');
                                                    setSelectedColor('#0078d7'); // Auto-select Windows Blue
                                                }}
                                            >
                                                <div className="h-20 bg-[#e0f7fa] border border-[#2b5797] rounded flex flex-col overflow-hidden relative font-sans">
                                                    <div className="h-6 bg-gradient-to-r from-[#1c66bc] to-[#2b5797] text-white text-[8px] flex items-center px-1">QuickBiza POS</div>
                                                    <div className="flex-1 bg-white"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs font-serif text-[#1e1e1e]">Windows 7</div>
                                                </div>
                                                <p className="font-bold text-sm">Classic Win7</p>
                                            </div>

                                            {/* SaaS Dark Theme */}
                                            <div
                                                className={`p-4 border-2 rounded-lg cursor-pointer text-center space-y-2 ${selectedTheme === 'saas' ? 'border-primary bg-primary/5' : 'border-foreground bg-card'}`}
                                                onClick={() => {
                                                    setSelectedTheme('saas');
                                                    setSelectedColor('#3b82f6'); // Electric Blue
                                                }}
                                            >
                                                <div className="h-20 bg-[#0f172a] border border-[#1e293b] rounded flex flex-col p-2 gap-2 overflow-hidden relative">
                                                    <div className="h-2 w-full bg-[#3b82f6] rounded-full"></div>
                                                    <div className="flex gap-1 h-full">
                                                        <div className="w-1/4 bg-[#1e293b] h-full rounded"></div>
                                                        <div className="w-3/4 bg-[#1e293b] h-full rounded"></div>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white">Modern SaaS</div>
                                                </div>
                                                <p className="font-bold text-sm">Fintech Dark</p>
                                            </div>

                                            {/* Material Theme */}
                                            <div
                                                className={`p-4 border-2 rounded-lg cursor-pointer text-center space-y-2 ${selectedTheme === 'material' ? 'border-primary bg-primary/5' : 'border-foreground bg-card'}`}
                                                onClick={() => {
                                                    setSelectedTheme('material');
                                                    setSelectedColor('#3b82f6'); // Google Blue
                                                }}
                                            >
                                                <div className="h-20 bg-[#fafafa] border-none shadow-md rounded flex flex-col p-2 gap-2 overflow-hidden relative">
                                                    <div className="h-6 w-6 bg-[#3b82f6] rounded-full absolute bottom-2 right-2 shadow-lg z-10"></div>
                                                    <div className="h-2 w-full bg-[#e0e0e0] rounded"></div>
                                                    <div className="h-10 w-full bg-white shadow-sm rounded"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-[#3b82f6] z-20">Material v3</div>
                                                </div>
                                                <p className="font-bold text-sm">Google Material</p>
                                            </div>

                                            {/* Terminal Theme */}
                                            <div
                                                className={`p-4 border-2 rounded-lg cursor-pointer text-center space-y-2 ${selectedTheme === 'terminal' ? 'border-primary bg-primary/5' : 'border-foreground bg-card'}`}
                                                onClick={() => {
                                                    setSelectedTheme('terminal');
                                                    setSelectedColor('#00FF88'); // Neon Green
                                                }}
                                            >
                                                <div className="h-20 bg-black border border-[#00FF88] rounded-none flex flex-col p-2 gap-2 overflow-hidden relative font-mono">
                                                    <div className="text-[6px] text-[#00FF88] text-left leading-tight">
                                                        &gt; INIT SYSTEM<br />
                                                        &gt; LOADING...<br />
                                                        &gt; READY_
                                                    </div>
                                                    <div className="h-2 w-full bg-[#00FF88] mt-auto"></div>
                                                </div>
                                                <p className="font-bold text-sm">Terminal / Tech</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Palette */}
                                    <div className="space-y-3">
                                        <Label className="font-bold">Primary Color</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {colorPalettes.map((color) => (
                                                <div
                                                    key={color.value}
                                                    onClick={() => setSelectedColor(color.value)}
                                                    className={`
                                                        w-10 h-10 rounded-full cursor-pointer border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-transform hover:scale-110
                                                        ${selectedColor === color.value ? 'border-foreground ring-2 ring-primary ring-offset-2' : 'border-transparent'}
                                                    `}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                >
                                                    {selectedColor === color.value && <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Icon System Selection */}
                                    <div className="space-y-3">
                                        <Label className="font-bold">Icon System</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: 'lucide', name: 'Lucide', desc: 'Clean, modern, default.', iconClass: 'lucide' },
                                                { id: 'fontawesome', name: 'Font Awesome', desc: 'Classic, solid icons.', iconClass: 'fa-solid fa-flag' },
                                                { id: 'material', name: 'Material Design', desc: 'Google standard.', iconClass: 'material-icons' },
                                                { id: 'boxicons', name: 'Boxicons', desc: 'Web-friendly simple icons.', iconClass: 'bx bx-cube' },
                                                { id: 'twemoji', name: 'Twemoji', desc: 'Twitter/X Emoji Style.', iconEmoji: '🐦' },
                                                { id: 'icons8', name: 'Icons8', desc: '3D Office Style.', iconImg: 'https://img.icons8.com/color/48/business-report.png' },
                                                { id: 'fluent-emoji', name: 'Fluent Emoji', desc: 'Microsoft 3D Style.', iconImg: 'https://img.icons8.com/3d-fluency/94/rocket.png' },
                                                { id: 'pixelart', name: 'Pixelart', desc: 'Retro game style.', iconClass: 'pixelart-icons-font-heart' },
                                            ].map((iconSys) => (
                                                <div
                                                    key={iconSys.id}
                                                    onClick={() => setIconSet(iconSys.id as any)}
                                                    className={`
                                                        p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center gap-3
                                                        ${iconSet === iconSys.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-foreground bg-card hover:bg-muted'}
                                                    `}
                                                >
                                                    <div className="w-8 h-8 flex items-center justify-center text-lg bg-background border border-foreground rounded overflow-hidden">
                                                        {iconSys.id === 'lucide' && <Settings className="w-5 h-5" />}
                                                        {iconSys.iconClass && iconSys.id !== 'lucide' && <i className={`${iconSys.iconClass} flex items-center justify-center`} style={{ fontSize: 24 }}></i>}
                                                        {iconSys.id === 'material' && <span className="material-icons text-xl flex items-center justify-center">category</span>}
                                                        {iconSys.iconEmoji && <span className="flex items-center justify-center text-xl">{iconSys.iconEmoji}</span>}
                                                        {iconSys.iconImg && <img src={iconSys.iconImg} alt="icon" className="w-6 h-6 object-contain" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold font-display text-sm">{iconSys.name}</h3>
                                                        <p className="text-[10px] text-muted-foreground">{iconSys.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-6 relative">
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                    <div className="bg-card border-2 border-foreground p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
                                        <User className="w-12 h-12 mx-auto mb-4 text-primary" />
                                        <h3 className="font-display font-bold text-xl mb-2">Managed via Web Portal</h3>
                                        <p className="text-muted-foreground text-sm">
                                            Admin account creation is handled during web registration.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-50 pointer-events-none">
                                    <h2 className="text-3xl font-display font-bold">Admin Account</h2>
                                    <p className="text-muted-foreground font-medium">Create your primary access account.</p>
                                </div>

                                <div className="space-y-5 opacity-50 pointer-events-none">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Full Name</Label>
                                        <input
                                            name="adminFullName"
                                            value={formData.adminFullName}
                                            readOnly
                                            placeholder="John Doe"
                                            className="neo-input w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Username</Label>
                                        <input
                                            name="adminUsername"
                                            value={formData.adminUsername}
                                            readOnly
                                            className="neo-input w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label className="font-bold">Password</Label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    name="adminPassword"
                                                    value={formData.adminPassword}
                                                    readOnly
                                                    className="neo-input w-full pr-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">Confirm</Label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    name="adminConfirmPassword"
                                                    value={formData.adminConfirmPassword}
                                                    readOnly
                                                    className="neo-input w-full pr-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="text-center space-y-8 py-12 flex flex-col items-center justify-center h-full">
                                <div className="w-24 h-24 bg-success text-success-foreground rounded-full border-4 border-foreground flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-display font-bold">All Set!</h2>
                                    <p className="text-muted-foreground font-medium max-w-md mx-auto">
                                        Your company profile is ready. Let's get to work!
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-8 flex justify-between">
                            {step > 1 && step < 6 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    disabled={loading}
                                    className="neo-button bg-card text-foreground px-6 py-3"
                                >
                                    Back
                                </button>
                            )}
                            <div className={step === 1 ? 'ml-auto' : ''}>
                                <button
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="neo-button bg-primary text-primary-foreground flex items-center gap-2 px-8 py-3 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {step === 6 ? "Go to Login" : "Next Step"}
                                    {step < 6 && <ArrowRight className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;
