import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const UploadData = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/data/upload', formData);
            setStatus('success');

            // Format mapping string for UI
            const mappings = response.data.mappings;
            const mappingSummary = Object.entries(mappings)
                .map(([key, val]) => `${key} → ${val}`)
                .join(', ');

            setMessage(`${response.data.message} Columns mapped: ${mappingSummary}. AI is now analyzing...`);

            // Automatically trigger bulk forecast
            try {
                await axios.post('http://127.0.0.1:8000/api/forecast/bulk');
                setMessage(`Analysis Complete! ${response.data.message} Columns: ${mappingSummary}.`);
            } catch (aiErr) {
                console.error("Auto-AI trigger failed", aiErr);
            }
        } catch (error) {
            setStatus('error');
            const errorMsg = error.response?.data?.detail || 'Upload failed. Please check your CSV format.';
            setMessage(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Data Upload</h2>
                <p className="text-muted-foreground mt-1">Upload your historical sales data (CSV) to train the forecast models.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center border-dashed border-2 min-h-[300px]">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Upload size={48} className="text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-2">Drag & Drop or Select File</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Supported format: CSV. Required columns: product_id, date, quantity_sold, revenue, promotion_active.
                </p>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-primary text-primary-foreground hover:bg-blue-600 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                    Select CSV File
                </label>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={async () => {
                            if (window.confirm("This will delete all sales, products, and forecasts. Continue?")) {
                                try {
                                    await axios.post('http://127.0.0.1:8000/api/data/reset');
                                    setMessage("Database cleared successfully!");
                                    setStatus('success');
                                } catch (e) {
                                    setMessage("Reset failed");
                                    setStatus('error');
                                }
                            }
                        }}
                        className="text-xs text-muted-foreground hover:text-red-500 underline"
                    >
                        Clear All Existing Data
                    </button>
                </div>

                {file && (
                    <div className="mt-6 flex items-center p-3 bg-muted rounded-lg w-full max-w-sm">
                        <FileText size={20} className="mr-3 text-muted-foreground" />
                        <span className="truncate flex-1 font-medium">{file.name}</span>
                        <button
                            onClick={handleUpload}
                            disabled={status === 'uploading'}
                            className="ml-3 text-xs bg-white text-black px-3 py-1.5 rounded font-bold hover:bg-gray-200 disabled:opacity-50"
                        >
                            {status === 'uploading' ? 'Uploading...' : 'Upload Now'}
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="mt-4 flex items-center text-green-500 bg-green-500/10 px-4 py-2 rounded-lg">
                        <CheckCircle size={18} className="mr-2" />
                        {message}
                    </div>
                )}

                {status === 'error' && (
                    <div className="mt-4 flex items-center text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
                        <AlertCircle size={18} className="mr-2" />
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadData;
