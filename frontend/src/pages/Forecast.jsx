import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Zap, Activity } from 'lucide-react';

const Forecast = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            fetchExistingForecast();
        }
    }, [selectedProduct]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/data/products');
            setProducts(res.data);
            if (res.data.length > 0 && !selectedProduct) {
                setSelectedProduct(res.data[0].product_id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchExistingForecast = async () => {
        setFetching(true);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/forecast/${selectedProduct}`);
            if (res.data.length > 0) {
                formatAndSetData(res.data);
            } else {
                setForecastData([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const formatAndSetData = (rawData) => {
        const formatted = rawData.map(item => ({
            date: item.forecast_date,
            predicted: item.predicted_demand,
            lower: item.confidence_lower,
            upper: item.confidence_upper,
            range: [item.confidence_lower, item.confidence_upper]
        }));
        setForecastData(formatted);
    };

    const generateForecast = async () => {
        if (!selectedProduct) return;
        setLoading(true);
        try {
            const res = await axios.post(`http://127.0.0.1:8000/api/forecast/generate/${selectedProduct}`);
            formatAndSetData(res.data);
        } catch (err) {
            console.error("Forecast failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-background min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">AI Forecast Engine</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Advanced time-series analysis using Facebook Prophet + XGBoost.</p>
                </div>
                <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-lg">
                    <select
                        className="bg-transparent text-foreground rounded-lg px-4 py-2 outline-none cursor-pointer font-medium"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                        {products.map(p => (
                            <option key={p.product_id} value={p.product_id} className="bg-card">
                                {p.product_name || `Product ${p.product_id}`}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={generateForecast}
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Activity className="animate-spin" size={18} /> : <Zap size={18} />}
                        {loading ? 'Analyzing...' : 'Re-Run AI Model'}
                    </button>
                </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border shadow-2xl relative min-h-[550px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="text-primary" size={24} />
                        {products.find(p => p.product_id === selectedProduct)?.product_name || 'Product'} Forecast
                        {fetching && <Loader2 className="animate-spin text-muted-foreground ml-2" size={16} />}
                    </h3>
                    {forecastData.length > 0 && <span className="text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-bold">Model Ready</span>}
                </div>

                <div className="h-[450px] w-full mt-4">
                    {forecastData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecastData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fill="url(#colorPred)"
                                    name="AI Predicted Units"
                                    animationDuration={1500}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="upper"
                                    stroke="transparent"
                                    fill="#3b82f6"
                                    fillOpacity={0.05}
                                    name="Confidence Bound (High)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="lower"
                                    stroke="transparent"
                                    fill="#3b82f6"
                                    fillOpacity={0.05}
                                    name="Confidence Bound (Low)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20">
                            <Activity size={64} className="mb-6 opacity-20 animate-pulse text-primary" />
                            <p className="text-lg font-medium">No Forecast Data for this Product</p>
                            <p className="text-sm opacity-60 mt-2">Click "Re-Run AI Model" to generate a new 30-day forecast.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Add missing Loader2 import if not already there
import { Loader2 } from 'lucide-react';

export default Forecast;
