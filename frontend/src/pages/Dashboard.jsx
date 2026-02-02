import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, Loader2, Sparkles } from 'lucide-react';

const KPICard = ({ title, value, change, trend, icon: Icon, color }) => (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-lg relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}>
            <Icon size={64} />
        </div>
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
        <div className={`mt-2 flex items-center text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            <span className="font-medium">{change}</span>
            <span className="text-muted-foreground ml-1">vs last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_revenue: '$0',
        total_products: 0,
        high_risk_count: 0,
        total_risk_count: 0
    });
    const [trends, setTrends] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, trendsRes, recsRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/dashboard/stats'),
                axios.get('http://127.0.0.1:8000/api/dashboard/trends'),
                axios.get('http://127.0.0.1:8000/api/inventory/recommendations')
            ]);
            setStats(statsRes.data);
            setTrends(trendsRes.data);
            setAlerts(recsRes.data.slice(0, 5)); // Show top 5 alerts
        } catch (e) {
            console.error("Failed to fetch dashboard data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGenerateBulk = async () => {
        setGenerating(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/forecast/bulk');
            await fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted-foreground">Analyzing your retail data...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-background min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Dashboard</h2>
                    <p className="text-muted-foreground mt-1">Real-time inventory intelligence and forecasting.</p>
                </div>
                <button
                    onClick={handleGenerateBulk}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
                    disabled={generating}
                >
                    {generating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {generating ? 'Processing AI...' : 'Run Global Prediction'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Sales" value={stats.total_revenue} change="+12.5%" trend="up" icon={CheckCircle} color="blue" />
                <KPICard title="Products Tracked" value={stats.total_products} change="+2.4%" trend="up" icon={CheckCircle} color="purple" />
                <KPICard title="Stock-out Risk" value={stats.high_risk_count} change="+3" trend="down" icon={AlertTriangle} color="red" />
                <KPICard title="Inventory Alerts" value={stats.total_risk_count} change="-2" trend="up" icon={AlertTriangle} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h3 className="text-lg font-semibold mb-6">AI Demand Forecast: Units Sold</h3>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" name="Predicted" />
                                <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Alerts */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-xl">
                    <h3 className="text-lg font-semibold mb-4">Top AI Recommendations</h3>
                    <div className="space-y-4">
                        {alerts.length > 0 ? alerts.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors">
                                <div>
                                    <div className="font-bold text-slate-100 flex items-center gap-2">
                                        {item.product_name || 'Unnamed Product'}
                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-medium uppercase border border-blue-500/10">
                                            {item.category || 'General'}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                        ID: <span className="text-slate-200">{item.product_id}</span>
                                    </div>
                                    <div className={`text-xs mt-1 font-bold ${item.risk_level === 'HIGH' ? 'text-red-400' :
                                            item.risk_level === 'OVERSTOCK' ? 'text-blue-400' :
                                                'text-yellow-400'
                                        }`}>
                                        {item.risk_level} RISK
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase ${item.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                                        item.risk_level === 'OVERSTOCK' ? 'bg-blue-500/20 text-blue-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {item.risk_level === 'OVERSTOCK' ? 'CLEARANCE' : `REORDER ${item.reorder_quantity}`}
                                    </span>
                                    <div className="text-[10px] text-muted-foreground mt-1">By {item.reorder_date}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <AlertTriangle className="mx-auto text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">No recommendations yet. Run a prediction to generate insights.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
