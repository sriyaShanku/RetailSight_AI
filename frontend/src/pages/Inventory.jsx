import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, CheckCircle, Loader2, Info } from 'lucide-react';

const Inventory = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecommendations = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/inventory/recommendations');
            setRecommendations(res.data);
        } catch (e) {
            console.error("Failed to fetch inventory plan", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted-foreground">Calculating safety stocks and reorder points...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory Planning</h2>
                    <p className="text-muted-foreground mt-1">AI-driven reorder recommendations and safety stock analysis.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-all">
                        <Info size={16} /> Lead Time Settings
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4">Product Name / ID</th>
                                <th className="px-6 py-4">Risk Level</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Safety Stock</th>
                                <th className="px-6 py-4">Reorder Qty</th>
                                <th className="px-6 py-4">Suggested Date</th>
                                <th className="px-6 py-4">Status / Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recommendations.length > 0 ? recommendations.map((row, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        {row.product_name || `Product ${row.product_id}`}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border
                                    ${row.risk_level === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                row.risk_level === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    row.risk_level === 'OVERSTOCK' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                            {row.risk_level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground italic">{row.category || 'General'}</td>
                                    <td className="px-6 py-4 font-mono">{row.safety_stock} units</td>
                                    <td className="px-6 py-4 font-bold text-primary">{row.reorder_quantity > 0 ? row.reorder_quantity : '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground font-mono">{row.reorder_date}</td>
                                    <td className="px-6 py-4">
                                        {row.risk_level === 'HIGH' ?
                                            <button className="text-xs bg-red-500 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-red-600 transition-all shadow-md">ORDER NOW</button>
                                            : <div className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase">
                                                <CheckCircle size={14} /> Healthy
                                            </div>
                                        }
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                        No active inventory plans. Upload data to see AI recommendations.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
