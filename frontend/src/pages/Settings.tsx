import { AppLayout } from "@/components/AppLayout";
import { Settings as SettingsIcon, Building2, Printer, DollarSign, Save, Bell, TestTube, User, X, Box, MessageCircle, Mail, Phone, Lightbulb, Eye, EyeOff } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import api, { usersAPI } from "@/services/api";
import { licenseAPI } from "@/services/license";
import { useLicense } from "@/hooks/useLicense";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTheme, ThemeContext } from "@/context/ThemeContext";
import { MainLayout } from "@/components/MainLayout";
import { DraggableFeedbackModal } from "@/components/DraggableFeedbackModal";

// --- Constants ---

const THEME_OPTIONS = [
  {
    id: 'default',
    name: 'Modern (Default)',
    description: 'Clean, balanced design for everyday use.',
    colors: { background: '#ffffff', primary: '#ea580c', card: '#f4f4f5', border: '#e4e4e7', foreground: '#18181b' },
    primaryColor: '#ea580c'
  },
  {
    id: 'neo',
    name: 'Neobrutalism',
    description: 'Bold, high-contrast, confident.',
    colors: { background: '#fffbeb', primary: '#ea580c', card: '#ffffff', border: '#000000', foreground: '#000000' },
    primaryColor: '#ea580c'
  },
  {
    id: 'win7',
    name: 'Windows 7 (Aero)',
    description: 'Nostalgic, glassy, desktop-like experience.',
    colors: { background: '#e0f7fa', primary: '#0078d7', card: '#ffffff', border: '#a3d4ee', foreground: '#000000' },
    primaryColor: '#0078d7'
  },
  {
    id: 'saas',
    name: 'SaaS Dark',
    description: 'Professional, dark mode for fintech.',
    colors: { background: '#0f172a', primary: '#3b82f6', card: '#1e293b', border: '#334155', foreground: '#f8fafc' },
    primaryColor: '#3b82f6'
  },
  {
    id: 'material',
    name: 'Material Design',
    description: 'Google-inspired, elevated, ripple effects.',
    colors: { background: '#f5f5f5', primary: '#6200ee', card: '#ffffff', border: '#e0e0e0', foreground: '#000000' },
    primaryColor: '#6200ee'
  },
  {
    id: 'terminal',
    name: 'Terminal / Dev',
    description: 'Monospaced, green-on-black, hacker vibe.',
    colors: { background: '#0d1117', primary: '#00ff88', card: '#161b22', border: '#30363d', foreground: '#c9d1d9' },
    primaryColor: '#00ff88'
  },
  {
    id: 'retro',
    name: 'Retro Pixel',
    description: '8-bit arcade style, fun and chunky.',
    colors: { background: '#2d2b55', primary: '#ff0055', card: '#1e1e3f', border: '#ffffff', foreground: '#ffffff' },
    primaryColor: '#ff0055'
  },
  {
    id: 'access',
    name: 'Classic Business',
    description: 'Data-dense, reliable, MS Access style.',
    colors: { background: '#cccccc', primary: '#005a9e', card: '#eeeeee', border: '#999999', foreground: '#000000' },
    primaryColor: '#005a9e'
  }
];

const LAYOUT_OPTIONS = [
  { id: 'sidebar-collapsible', name: 'Collapsible Sidebar', description: 'Standard dashboard layout.' },
  { id: 'top-nav', name: 'Top Navigation', description: 'Web-app style, wider content area.' },
  { id: 'dual-nav', name: 'Dual Navigation', description: 'Enterprise style with sub-menus.' },
  { id: 'tabs', name: 'Tab-Based', description: 'Browser-like tab management.' },
  { id: 'grid', name: 'Modular Grid', description: 'Dashboard widgets layout.' },
  { id: 'pos-full', name: 'Full-Screen POS', description: 'Optimized for touch/sales.' },
  { id: 'floating', name: 'Floating Panel', description: 'Modern, detached UI layers.' },
  { id: 'windows', name: 'Windows Desktop', description: 'Multi-window task management.' },
  { id: 'command', name: 'Command Center', description: 'High-density data view.' },
];

// --- Helper Components ---

// Mock Provider to override theme context for Demo Mode
const MockThemeProvider = ({ children, theme, layout, primaryColor }: any) => {
  // We need to provide existing functions but mock the state values
  // We can get the real context to passthrough functions if needed, but for visual demo, setters don't matter much.
  // Actually, `MainLayout` and its children use `useTheme` which uses `useContext(ThemeContext)`.
  // We need to provide a context value.
  const realContext = useTheme();

  const mockValue = {
    ...realContext,
    theme,
    layout,
    primaryColor,
    // We can keep setters as no-ops or link to real ones if we wanted interactive demo (but strict demo is better)
  };

  return (
    <ThemeContext.Provider value={mockValue}>
      {/* We also need to Apply the theme class to a wrapper div instead of document.documentElement 
                 BECAUSE MainLayout/Children might rely on global CSS classes.
                 However, `ThemeProvider` (real one) puts classes on `document.documentElement`.
                 If we want the DEMO to look right, we need to scope the CSS. 
                 
                 If the CSS uses `:root` variables, we can't easily scope them without Shadow DOM.
                 BUT, if the CSS uses `.theme-xxx` classes, we can wrap the demo in a div with that class.
                 
                 PROBLEM: Many styles might use `body` or `:root` selectors. 
                 If the theme relies on `.theme-name` class on `html`, we can simulate it by putting `.theme-name` on a wrapper div 
                 AND ensuring our CSS selectors support `.theme-name .component` (which they usually do via nesting or simple descent).
             */}
      <div className={`theme-${theme} w-full h-full bg-background text-foreground`} style={{ '--primary': primaryColor, '--primary-hex': primaryColor } as any}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Demo Content to show inside the layout
const DemoContent = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="neo-card p-6 bg-card text-card-foreground">
        <h3 className="font-bold text-lg mb-2">Total Revenue</h3>
        <p className="text-3xl font-display font-bold text-primary">KES 125,000</p>
        <p className="text-sm text-muted-foreground mt-2">+12% from yesterday</p>
      </div>
      <div className="neo-card p-6 bg-card text-card-foreground">
        <h3 className="font-bold text-lg mb-2">Active Orders</h3>
        <p className="text-3xl font-display font-bold text-primary">24</p>
        <p className="text-sm text-muted-foreground mt-2">4 pending delivery</p>
      </div>
      <div className="neo-card p-6 bg-card text-card-foreground">
        <h3 className="font-bold text-lg mb-2">Low Stock</h3>
        <p className="text-3xl font-display font-bold text-destructive">3</p>
        <p className="text-sm text-muted-foreground mt-2">Items need reorder</p>
      </div>
    </div>
    <div className="neo-card p-6 bg-card text-card-foreground min-h-[200px] flex items-center justify-center border-dashed">
      <p className="text-muted-foreground">Main Content Area</p>
    </div>
  </div>
);

const DemoPreview = ({ show, theme, layout, primaryColor }: any) => {
  if (!show) return null;

  return (
    <div className="mt-8 neo-card border-2 border-primary/20 overflow-hidden animate-fade-up">
      <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <TestTube className="w-5 h-5 text-primary" />
            Live Preview
          </h2>
          <p className="text-xs text-muted-foreground">
            Previewing <strong>{THEME_OPTIONS.find(t => t.id === theme)?.name}</strong> with <strong>{LAYOUT_OPTIONS.find(l => l.id === layout)?.name}</strong> layout.
          </p>
        </div>
      </div>

      {/* Preview Area - Fixed Height for inline scrolling */}
      <div className="h-[500px] w-full overflow-hidden relative bg-background/50">
        <MockThemeProvider theme={theme} layout={layout} primaryColor={primaryColor}>
          <div className="absolute inset-0 overflow-auto transform scale-[0.9] origin-top">
            <MainLayout>
              <DemoContent />
            </MainLayout>
          </div>
        </MockThemeProvider>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { theme, setTheme, primaryColor, setPrimaryColor, layout, setLayout, iconSet, setIconSet } = useTheme();
  const { user, updateUser } = useAuth();
  const { refreshModules } = useLicense();
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  // Module Settings State
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [savingModules, setSavingModules] = useState(false);

  useEffect(() => {
    // Load enabled modules
    licenseAPI.getModules().then(mods => setActiveModules(mods));
  }, []);

  const AVAILABLE_MODULES = [
    { id: 'manufacturing', name: 'Production & Manufacturing', desc: 'BOMs, recipes, and daily production linking to inventory.' },
    { id: 'payroll', name: 'Payroll & HR', desc: 'Manage employees, salaries, and payslips.' },
    { id: 'fleet', name: 'Fleet Management', desc: 'Track vehicles, drivers, trips, and maintenance.' },
    { id: 'customers', name: 'Customers & CRM', desc: 'Track customer profiles, credit, and history.' },
    { id: 'multi_branch', name: 'Multi-Branch', desc: 'Manage multiple store locations and transfers.' },
    { id: 'marketing', name: 'Marketing & Promos', desc: 'Discounts, campaigns, and promotional rules.' },
    { id: 'loyalty', name: 'Loyalty Program', desc: 'Points system and rewards for repeat customers.' },
    { id: 'online_store', name: 'Online Ordering', desc: 'Receive and manage orders from the web.' },
    { id: 'iot', name: 'Hardware & IoT', desc: 'Advanced integration for scales, scanners, external displays.' }
  ];

  const handleToggleModule = async (moduleId: string, isEnabling: boolean) => {
    setSavingModules(true);
    try {
      let newModules;
      if (isEnabling) {
        newModules = [...activeModules, moduleId];
      } else {
        newModules = activeModules.filter(m => m !== moduleId);
      }

      await licenseAPI.updateModules(newModules);
      setActiveModules(newModules);
      refreshModules();
      toast.success(`${isEnabling ? 'Enabled' : 'Disabled'} module successfully.`);
    } catch (error: any) {
      toast.error('Failed to update modules configuration');
    } finally {
      setSavingModules(false);
    }
  };

  // Preview State
  const [previewTheme, setPreviewTheme] = useState(theme);
  const [previewLayout, setPreviewLayout] = useState(layout);
  const [previewColor, setPreviewColor] = useState(primaryColor);

  // Custom Hex Input State
  const [hexInput, setHexInput] = useState(primaryColor);

  // Sync Hex Input with Preview Color
  useEffect(() => {
    setHexInput(previewColor);
  }, [previewColor]);

  // Access Control State
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [adminAuth, setAdminAuth] = useState({ password: "" });
  const [authError, setAuthError] = useState("");

  // Password Visibility State
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const handleVerifyAdmin = async () => {
    setAuthError("");
    setVerifying(true);
    try {
      await usersAPI.verifyAdmin(adminAuth);
      setIsAccessGranted(true);
      toast.success("Access Granted");
    } catch (error: any) {
      setAuthError(error.response?.data?.error || "Invalid credentials");
      toast.error("Access Denied");
    } finally {
      setVerifying(false);
    }
  };

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    username: user?.username || "",
    password: "",
    confirm_password: "",
    profile_image: undefined as File | undefined,
    preview_url: user?.profile_image ? `http://localhost:5000/uploads/profiles/${user.profile_image}` : ""
  });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleUpdateProfile = () => {
    // If changing password, require current password confirmation
    if (profileData.password) {
      if (profileData.password !== profileData.confirm_password) {
        toast.error("Passwords do not match");
        return;
      }
      setShowPasswordModal(true);
    } else {
      // If just updating info, proceed directly
      handleConfirmUpdate();
    }
  };

  const handleConfirmUpdate = async () => {
    try {
      setLoading(true);
      const res: any = await usersAPI.updateProfile(user!.id, {
        full_name: profileData.full_name,
        username: profileData.username,
        password: profileData.password || undefined,
        current_password: currentPassword || undefined,
        profile_image: profileData.profile_image
      });

      updateUser({
        full_name: profileData.full_name,
        username: profileData.username,
        ...(res.profile_image ? { profile_image: res.profile_image } : {})
      });

      toast.success("Profile updated successfully");
      setProfileData(prev => ({ ...prev, password: "", confirm_password: "", profile_image: undefined }));
      setShowPasswordModal(false);
      setCurrentPassword("");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setLoading(true);
      const response = await api.post('/notifications/test');
      toast.success("Test notification created! Check the Notifications page.");
      console.log('Test notification:', response.data);
    } catch (error: any) {
      console.error('Error creating test notification:', error);
      toast.error(error.response?.data?.error || "Failed to create test notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure system preferences</p>
        </div>

        {/* Account Settings */}
        <div className="neo-card p-4 border-l-4 border-l-primary">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Settings
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden bg-muted flex items-center justify-center">
                {profileData.preview_url ? (
                  <img src={profileData.preview_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <label
                htmlFor="profile-upload"
                className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <span className="text-xs font-bold">Change</span>
              </label>
              <input
                type="file"
                id="profile-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setProfileData({
                      ...profileData,
                      profile_image: file,
                      preview_url: URL.createObjectURL(file)
                    });
                  }
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Upload a company logo or generic avatar. This will be visible on receipts or in the sidebar depending on the layout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2">Full Name</label>
              <input
                type="text"
                className="neo-input w-full"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Username</label>
              <input
                type="text"
                className="neo-input w-full"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">New Password (leave blank to keep current)</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="neo-input w-full pr-10"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="neo-input w-full pr-10"
                  value={profileData.confirm_password}
                  onChange={(e) => setProfileData({ ...profileData, confirm_password: e.target.value })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Profile
            </button>
          </div>
        </div>



        {/* Personalization */}
        <div className="space-y-6">
          <div className="neo-card p-4">
            <h2 className="font-display font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Theme Selection
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {THEME_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`
                    relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-300
                    ${theme === option.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border hover:border-primary/50'}
                  `}
                >
                  {/* Theme Preview */}
                  <div className="h-24 w-full flex flex-col" style={{ backgroundColor: option.colors.background }}>
                    <div className="h-2 w-full" style={{ backgroundColor: option.colors.primary }}></div>
                    <div className="flex-1 p-2 flex gap-2">
                      <div className="w-1/4 h-full rounded-sm" style={{ backgroundColor: option.colors.card, border: `1px solid ${option.colors.border}` }}></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-3/4 rounded-full" style={{ backgroundColor: option.colors.foreground, opacity: 0.2 }}></div>
                        <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: option.colors.foreground, opacity: 0.1 }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="p-3 bg-card border-t-2 border-border">
                    <p className="font-bold text-sm text-center">{option.name}</p>
                    <p className="text-[10px] text-muted-foreground text-center line-clamp-1">{option.description}</p>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTheme(option.id as any);
                        setPrimaryColor(option.primaryColor);
                        // Also update preview to match
                        setPreviewTheme(option.id as any);
                        setPreviewColor(option.primaryColor);
                      }}
                      className="neo-button bg-primary text-primary-foreground text-xs py-1 px-3 w-full"
                    >
                      Apply
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTheme(option.id as any);
                        setPreviewColor(option.primaryColor);
                        setShowDemo(true);
                      }}
                      className="neo-button bg-white text-black text-xs py-1 px-3 w-full"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="block text-xs font-semibold mb-2">Primary Color</label>
              <div className="flex flex-wrap gap-3 items-center">
                {/* Presets */}
                {[
                  { name: 'Orange', value: '#ea580c' },
                  { name: 'Blue', value: '#3b82f6' },
                  { name: 'Green', value: '#22c55e' },
                  { name: 'Purple', value: '#a855f7' },
                  { name: 'Red', value: '#ef4444' },
                  { name: 'Pink', value: '#ec4899' },
                  { name: 'Cyan', value: '#06b6d4' },
                  { name: 'Yellow', value: '#eab308' },
                  { name: 'Teal', value: '#14b8a6' },
                ].map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setPrimaryColor(color.value);
                      setPreviewColor(color.value);
                    }}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm
                      ${primaryColor === color.value ? 'border-foreground scale-110 ring-2 ring-primary ring-offset-2' : 'border-transparent'}
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}

                {/* Custom Picker */}
                <div className="relative group w-8 h-8 rounded-full overflow-hidden border-2 border-border shadow-sm hover:scale-110 transition-transform cursor-pointer">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setPreviewColor(e.target.value);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Custom Color"
                  />
                  <div className="w-full h-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-md">+</span>
                  </div>
                </div>

                {/* Hex Code Input */}
                <div className="flex items-center gap-2 bg-muted/20 border-2 border-border rounded-full px-3 py-1 ml-2">
                  <span className="text-muted-foreground text-xs font-mono">#</span>
                  <input
                    type="text"
                    value={hexInput.replace('#', '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow partial typing
                      if (/^[0-9A-Fa-f]*$/.test(val) && val.length <= 6) {
                        setHexInput(val.startsWith('#') ? val : '#' + val);

                        // Update preview only if valid
                        if (val.length === 3 || val.length === 6) {
                          const newColor = val.startsWith('#') ? val : '#' + val;
                          setPreviewColor(newColor);
                          // Optionally update primaryColor immediately if that's desired behavior for color picker
                          setPrimaryColor(newColor);
                        }
                      }
                    }}
                    className="bg-transparent border-none focus:outline-none text-xs font-mono w-16 uppercase"
                    placeholder="HEX"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="neo-card p-4">
            <h2 className="font-display font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Layout Strategy
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* ... Layout Options ... */}
              {LAYOUT_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`
                    relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-300
                    ${layout === option.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border hover:border-primary/50'}
                  `}
                >
                  {/* ... (keep layout preview content) ... */}
                  {/* Layout Visual Preview */}
                  <div className="h-32 bg-muted/20 relative p-2">
                    {/* ... (Layout SVG/Div previews) ... */}
                    <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                      {option.name}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="p-3 bg-card border-t-2 border-border">
                    <p className="font-bold text-sm text-center">{option.name}</p>
                    <p className="text-[10px] text-muted-foreground text-center line-clamp-1">{option.description}</p>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayout(option.id as any);
                        setPreviewLayout(option.id as any);
                      }}
                      className="neo-button bg-primary text-primary-foreground text-xs py-1 px-3 w-full"
                    >
                      Apply
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewLayout(option.id as any);
                        setShowDemo(true);
                      }}
                      className="neo-button bg-white text-black text-xs py-1 px-3 w-full"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="neo-card p-4">
            <h2 className="font-display font-bold mb-4 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Icon System
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'lucide', name: 'Lucide', desc: 'Clean, modern, default.', iconClass: 'lucide' },
                { id: 'fontawesome', name: 'Font Awesome', desc: 'Classic, solid icons.', iconClass: 'fa-solid fa-flag' },
                { id: 'material', name: 'Material Design', desc: 'Google standard.', iconClass: 'material-icons' },
                { id: 'boxicons', name: 'Boxicons', desc: 'Web-friendly simple icons.', iconClass: 'bx bx-cube' },
                { id: 'twemoji', name: 'Twemoji', desc: 'Twitter/X Emoji Style.', iconEmoji: '🐦' },
                { id: 'openmoji', name: 'OpenMoji', desc: 'Open source colorful.', iconEmoji: '🎨' },
                { id: 'icons8', name: 'Icons8', desc: '3D Office Style.', iconImg: 'https://img.icons8.com/color/48/business-report.png' },
                { id: 'fluent-emoji', name: 'Fluent Emoji', desc: 'Microsoft 3D Style.', iconImg: 'https://img.icons8.com/3d-fluency/94/rocket.png' },
                { id: 'pixelart', name: 'Pixelart', desc: 'Retro game style.', iconClass: 'pixelart-icons-font-heart' },
              ].map((iconSys) => (
                <div
                  key={iconSys.id}
                  onClick={() => setIconSet(iconSys.id as any)}
                  className={`
                            p-4 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center text-center gap-2
                            ${iconSet === iconSys.id ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' : 'border-border bg-card hover:border-primary/50'}
                        `}
                >
                  <div className="text-2xl mb-1 flex items-center justify-center h-8 w-8">
                    {iconSys.id === 'lucide' && <SettingsIcon className="w-8 h-8" />}
                    {iconSys.iconClass && iconSys.id !== 'lucide' && <i className={`${iconSys.iconClass} flex items-center justify-center`} style={{ fontSize: 24 }}></i>}
                    {iconSys.id === 'material' && <span className="material-icons text-3xl flex items-center justify-center">category</span>}
                    {iconSys.iconEmoji && <span className="flex items-center justify-center text-2xl">{iconSys.iconEmoji}</span>}
                    {iconSys.iconImg && <img src={iconSys.iconImg} alt="icon" className="w-8 h-8 object-contain" />}
                  </div>
                  <h3 className="font-bold text-sm">{iconSys.name}</h3>
                  <p className="text-xs text-muted-foreground">{iconSys.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="neo-button bg-primary text-primary-foreground px-8 py-3 text-lg w-full md:w-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              {showDemo ? (
                <>
                  <X className="w-5 h-5" />
                  Hide Demo
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  See Live Demo
                </>
              )}
            </button>
          </div>

          {/* Inline Demo Preview */}
          <DemoPreview
            show={showDemo}
            theme={previewTheme}
            layout={previewLayout}
            primaryColor={previewColor}
          />
        </div>

        {/* Business Information / About Us */}
        <div className="neo-card p-6 bg-gradient-to-br from-card to-muted/30">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">

            {/* Left: About Brand */}
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                QuickBiza POS
              </h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-lg">
                QuickBiza is a high-performance, resilient point-of-sale and business management platform designed for modern enterprises. Built with offline-first capabilities, intelligent cloud syncing, and comprehensive module scaling for retail, manufacturing, and logistics.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => window.open('https://wa.me/254700000000', '_blank')}
                  className="neo-button bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 py-2 px-4 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={() => window.open('mailto:support@quickbiza.com', '_blank')}
                  className="neo-button bg-primary text-primary-foreground flex items-center justify-center gap-2 py-2 px-4 shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  Email Support
                </button>
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-lg bg-card font-bold text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  +254 700 000 000
                </div>
              </div>
            </div>

            {/* Right: Feedback & Suggestions */}
            <div className="w-full md:w-auto flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/30 rounded-xl bg-background text-center">
              <Lightbulb className="w-8 h-8 text-warning mb-3" />
              <h3 className="font-bold mb-2 text-sm">Have an Idea or Found a Bug?</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
                Help us improve the platform by sharing your feedback or reporting errors directly to our engineers.
              </p>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="neo-button bg-warning text-black flex items-center justify-center gap-2 py-2 px-6 shadow-md hover:scale-105 transition-transform w-full"
              >
                <TestTube className="w-4 h-4" />
                Submit Suggestion
              </button>
            </div>

          </div>
        </div>

        {/* Tax Settings */}
        <div className="neo-card p-4">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Tax Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2">VAT Rate (%)</label>
              <input type="number" className="neo-input w-full" defaultValue="16" step="0.01" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Tax PIN</label>
              <input type="text" className="neo-input w-full" defaultValue="P000000000A" />
            </div>
          </div>
        </div>

        {/* Printer Settings */}
        <div className="neo-card p-4">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Printer Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2">Receipt Printer</label>
              <select className="neo-input w-full">
                <option>Auto-detect</option>
                <option>USB Thermal Printer</option>
                <option>Network Printer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Paper Width</label>
              <select className="neo-input w-full">
                <option>58mm</option>
                <option>80mm</option>
              </select>
            </div>
            <div className="col-span-full">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm">Auto-print receipts after payment</span>
              </label>
            </div>
          </div>
        </div>

        {/* M-Pesa Settings */}
        <div className="neo-card p-4">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            M-Pesa Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2">Business Short Code</label>
              <input type="text" className="neo-input w-full" defaultValue="174379" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Environment</label>
              <select className="neo-input w-full">
                <option>Sandbox</option>
                <option>Production</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Consumer Key</label>
              <input type="password" className="neo-input w-full" defaultValue="••••••••••••" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Consumer Secret</label>
              <input type="password" className="neo-input w-full" defaultValue="••••••••••••" />
            </div>
          </div>
        </div>

        {/* Module Settings (Feature Toggles) */}
        <div className="neo-card p-4 border-2 border-primary">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2">
            <Box className="w-4 h-4 text-primary" />
            Module Settings (Optional Features)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Enable or disable optional system features. Disabled modules will be hidden from the sidebar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_MODULES.map(mod => {
              const isEnabled = activeModules.includes(mod.id);
              return (
                <div key={mod.id} className="p-4 border-2 border-border bg-card rounded flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{mod.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{mod.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isEnabled}
                      onChange={(e) => handleToggleModule(mod.id, e.target.checked)}
                      disabled={savingModules}
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Developer Tools */}
        <div className="neo-card p-4 border-4 border-warning">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Developer Tools
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Test the notification system by creating a random notification
            </p>
            <button
              onClick={handleTestNotification}
              disabled={loading}
              className="neo-button bg-warning text-white flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Test Notification'}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="neo-button bg-primary text-primary-foreground flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Update Profile
          </button>
        </div>
      </div>

      {/* Confirm Password Modal */}
      {
        showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background border-2 border-border p-6 w-full max-w-md shadow-lg animate-fade-up">
              <h3 className="text-lg font-bold font-display mb-4">Confirm Changes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please enter your current password to confirm these changes.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="neo-input w-full pr-10"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword("");
                    }}
                    className="neo-button bg-muted text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmUpdate}
                    disabled={loading || !currentPassword}
                    className="neo-button bg-primary text-primary-foreground"
                  >
                    {loading ? "Saving..." : "Confirm & Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Admin Verification Modal (Access Control) */}
      {
        !isAccessGranted && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="bg-background border-2 border-border p-8 w-full max-w-md shadow-2xl animate-fade-up">
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-display">Admin Access Required</h2>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  Please enter admin credentials to access settings.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2">Admin Password</label>
                  <input
                    type="password"
                    className="neo-input w-full"
                    value={adminAuth.password}
                    onChange={(e) => setAdminAuth({ ...adminAuth, password: e.target.value })}
                    placeholder="Enter your password"
                    autoFocus
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Please enter the password for the currently logged-in admin account.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive text-sm font-medium">
                    {authError}
                  </div>
                )}

                <button
                  onClick={handleVerifyAdmin}
                  disabled={verifying || !adminAuth.password}
                  className="w-full neo-button bg-primary text-primary-foreground mt-2"
                >
                  {verifying ? "Verifying..." : "Access Settings"}
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Render the Feedback Modal safely on top of everything */}
      <DraggableFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        user={user}
      />

    </AppLayout >
  );
};

export default SettingsPage;
