"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Trash2, Download, Loader2 } from "lucide-react";
import { uploadDocument, deleteDocument, getDocuments } from "@/app/actions/documents";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is set up, or standard alert

interface DocumentManagerProps {
    jobId: string;
    initialDocuments: {
        id: string;
        name: string;
        size: number;
        mediaType: string;
        createdAt: Date;
    }[];
}

export function DocumentManager({ jobId, initialDocuments }: DocumentManagerProps) {
    const [documents, setDocuments] = useState(initialDocuments);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            alert("File is too large (Max 4MB)");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadDocument(jobId, formData);

        if (result.error) {
            alert(result.error);
        } else {
            // Refresh list optimistically or re-fetch
            // Ideally we re-fetch, but for now we rely on parent revalidation or full page reload.
            // Let's verify via action
            // In a real app we'd use router.refresh() 
            window.location.reload();
        }
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDelete = async (docId: string) => {
        if (!confirm("Delete this file?")) return;

        // Optimistic UI
        const previous = documents;
        setDocuments(prev => prev.filter(d => d.id !== docId));

        const result = await deleteDocument(docId);
        if (result.error) {
            alert(result.error);
            setDocuments(previous); // Revert
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Documents
                </h3>
                <span className="text-xs text-muted-foreground">{documents.length} files</span>
            </div>

            <div className="space-y-3">
                {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 group hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded bg-blue-500/10 text-blue-500">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{formatBytes(doc.size)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                onClick={() => handleDelete(doc.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {documents.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed border-white/10 rounded-xl">
                        No documents yet
                    </div>
                )}
            </div>

            <div className="pt-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                />
                <Button
                    variant="outline"
                    className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isUploading ? "Uploading..." : "Upload Resume / Cover Letter"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">Max 4MB • PDF, DOC, TXT</p>
            </div>
        </div>
    );
}
