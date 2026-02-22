import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';

interface DataImportProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'products' | 'customers' | 'suppliers';
    onSuccess: () => void;
}

const DataImport: React.FC<DataImportProps> = ({ isOpen, onClose, type, onSuccess }) => {
    const { theme } = useTheme();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; imported: number; errors: any[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get(`/import/template/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_template.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to download template");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`/import/${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResult(response.data);
            if (response.data.success) {
                toast.success(`Successfully imported ${response.data.imported} items!`);
                onSuccess();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Import failed");
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={`sm:max-w-md ${theme === 'saas' ? 'bg-[#0f172a] text-white border-gray-800' : ''}`}>
                <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                        Import {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DialogTitle>
                    <DialogDescription>
                        Bulk upload data using an Excel sheet.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Step 1: Download Template */}
                    <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                        <div className="text-sm">
                            <p className="font-bold">1. Get Template</p>
                            <p className="text-muted-foreground text-xs">Download the formatted Excel file.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                    </div>

                    {/* Step 2: Upload */}
                    <div className="space-y-2">
                        <p className="text-sm font-bold">2. Upload Filled File</p>
                        <div
                            className={`
                                border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
                                ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:bg-muted/50'}
                            `}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <div className="text-center">
                                    <FileSpreadsheet className="w-10 h-10 text-primary mx-auto mb-2" />
                                    <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">Click to change</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                    <p className="font-bold text-sm">Click to Upload</p>
                                    <p className="text-xs text-muted-foreground">or drag and drop Excel file</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className={`p-4 rounded-lg text-sm ${result.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800'}`}>
                            <div className="flex items-center gap-2 font-bold mb-1">
                                {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {result.success ? 'Import Complete' : 'Import Failed'}
                            </div>
                            <p>Successfully imported: {result.imported} items.</p>
                            {result.errors.length > 0 && (
                                <div className="mt-2 max-h-32 overflow-y-auto">
                                    <p className="font-bold mb-1">Errors ({result.errors.length}):</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        {result.errors.map((err, i) => (
                                            <li key={i}>Row {err.row}: {err.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleClose}>Close</Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="gap-2"
                    >
                        {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Import Data
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DataImport;
