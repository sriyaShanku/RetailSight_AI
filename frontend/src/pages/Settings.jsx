import React, { useState } from 'react';
import { User, Shield, Palette, Layout, Save, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    // Load persisted settings
    const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent') || 'blue');

    const themes = [
        { id: 'dark', name: 'Premium Dark', icon: Moon, color: 'bg-slate-900' },
        { id: 'light', name: 'Clean Light', icon: Sun, color: 'bg-slate-50' },
        { id: 'system', name: 'System Sync', icon: Monitor, color: 'bg-slate-500' },
    ];

    const accents = [
        { id: 'blue', color: 'bg-blue-600', hsl: '217.2 91.2% 59.8%' },
        { id: 'purple', color: 'bg-purple-600', hsl: '262.1 83.3% 57.8%' },
        { id: 'emerald', color: 'bg-emerald-600', hsl: '160.6 84.1% 39.4%' },
        { id: 'rose', color: 'bg-rose-600', hsl: '346.8 77.2% 49.8%' },
        { id: 'amber', color: 'bg-amber-600', hsl: '37.7 92.1% 50.2%' },
    ];

    // Apply changes in real-time
    React.useEffect(() => {
        const root = window.document.documentElement;

        // Handle Theme
        root.classList.remove('light', 'dark');
        if (selectedTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(selectedTheme);
        }
        localStorage.setItem('theme', selectedTheme);

        // Handle Accent
        const selectedAccent = accents.find(a => a.id === accentColor);
        if (selectedAccent) {
            root.style.setProperty('--primary', selectedAccent.hsl);
        }
        localStorage.setItem('accent', accentColor);
    }, [selectedTheme, accentColor]);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your account preferences and customize your dashboard experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Account Section */}
                <div className="md:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <User size={20} />
                        <h3>Account Profile</h3>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border-2 border-primary/10">
                                    <User size={40} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">{user?.username || 'Retail User'}</h4>
                                    <p className="text-sm text-muted-foreground">Retail Administrator</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Email Address</label>
                                    <div className="p-3 bg-background border border-border rounded-xl text-sm font-medium">
                                        {user?.email || 'admin@retailsight.ai'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Plan</label>
                                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm font-bold text-primary">
                                        Enterprise AI
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border md:col-span-3 my-4"></div>

                {/* Appearance Section */}
                <div className="md:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <Palette size={20} />
                        <h3>Appearance</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Customize how RetailSight looks on your device. Choose between dark, light, or system themes.
                    </p>
                </div>
                <div className="md:col-span-2 space-y-8">
                    {/* Theme Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setSelectedTheme(theme.id)}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${selectedTheme === theme.id
                                    ? 'border-primary bg-primary/5 ring-4 ring-primary/5'
                                    : 'border-border bg-card hover:border-border-hover'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${theme.color} flex items-center justify-center text-white shadow-inner`}>
                                    <theme.icon size={24} />
                                </div>
                                <span className="text-sm font-bold">{theme.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Accent Color */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-4 block">Accent Color</label>
                        <div className="flex flex-wrap gap-4">
                            {accents.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setAccentColor(item.id)}
                                    className={`w-10 h-10 rounded-full ${item.color} transition-all relative ${accentColor === item.id
                                        ? 'ring-4 ring-offset-4 ring-offset-background ring-primary scale-110'
                                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                                        }`}
                                >
                                    {accentColor === item.id && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border md:col-span-3 my-4"></div>

                {/* Security Section */}
                <div className="md:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <Shield size={20} />
                        <h3>Security</h3>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-bold">Two-Factor Authentication</h4>
                                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                            </div>
                            <div className="w-12 h-6 bg-muted rounded-full relative cursor-pointer opacity-50">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-primary hover:underline">Change Account Password</button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 group">
                    <Save size={20} className="group-hover:rotate-12 transition-transform" />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;
