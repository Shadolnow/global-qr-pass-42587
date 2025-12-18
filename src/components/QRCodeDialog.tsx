import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Link2, Copy, Check, Image as ImageIcon, FileText, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    title?: string;
}

const QRCodeDialog = ({ open, onOpenChange, url, title = 'QR Code' }: QRCodeDialogProps) => {
    const qrRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    // Customization state
    const [qrSize, setQrSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
    const [includeMargin, setIncludeMargin] = useState(true);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const handleDownloadPNG = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = qrSize;
        canvas.height = qrSize;

        img.onload = () => {
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
                link.click();
                URL.revokeObjectURL(url);
                toast.success('QR Code downloaded as PNG!');
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleDownloadSVG = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.svg`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('QR Code downloaded as SVG!');
    };

    const handleDownloadPDF = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // A4 size in pixels at 72 DPI (for web)
        const pdfWidth = 595;
        const pdfHeight = 842;
        canvas.width = pdfWidth;
        canvas.height = pdfHeight;

        img.onload = () => {
            if (!ctx) return;

            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pdfWidth, pdfHeight);

            // Center the QR code
            const qrDisplaySize = 400;
            const x = (pdfWidth - qrDisplaySize) / 2;
            const y = (pdfHeight - qrDisplaySize) / 2;

            ctx.drawImage(img, x, y, qrDisplaySize, qrDisplaySize);

            // Add title
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(title, pdfWidth / 2, y - 40);

            // Add URL below QR
            ctx.font = '12px monospace';
            ctx.fillStyle = '#666666';
            const maxWidth = qrDisplaySize;
            const urlText = url.length > 60 ? url.substring(0, 57) + '...' : url;
            ctx.fillText(urlText, pdfWidth / 2, y + qrDisplaySize + 40);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.pdf`;
                link.click();
                URL.revokeObjectURL(url);
                toast.success('QR Code downloaded as PDF!');
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Check out this event: ${title}`,
                    url: url,
                });
                toast.success('Shared successfully!');
            } catch (error) {
                // User cancelled or error occurred
                if ((error as Error).name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gradient-cyber">{title}</DialogTitle>
                    <DialogDescription>
                        Download or share your event QR code with customization options
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preview">Preview & Download</TabsTrigger>
                        <TabsTrigger value="customize">
                            <Palette className="w-4 h-4 mr-2" />
                            Customize
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-6">
                        {/* QR Code Preview */}
                        <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-lg border-2 border-border">
                            <div
                                ref={qrRef}
                                className="bg-white p-4 rounded-lg shadow-lg"
                                style={{ backgroundColor: bgColor }}
                            >
                                <QRCodeSVG
                                    value={url}
                                    size={qrSize}
                                    level={errorLevel}
                                    fgColor={fgColor}
                                    bgColor={bgColor}
                                    includeMargin={includeMargin}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground text-center max-w-md break-all font-mono">
                                {url}
                            </p>
                        </div>

                        {/* Download Options */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Download Options</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    variant="outline"
                                    className="h-auto flex-col gap-2 p-4 hover:border-primary hover:bg-primary/5"
                                    onClick={handleDownloadPNG}
                                >
                                    <ImageIcon className="w-6 h-6 text-cyan-400" />
                                    <span className="font-semibold">PNG</span>
                                    <span className="text-xs text-muted-foreground">Raster Image</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto flex-col gap-2 p-4 hover:border-primary hover:bg-primary/5"
                                    onClick={handleDownloadSVG}
                                >
                                    <Download className="w-6 h-6 text-purple-400" />
                                    <span className="font-semibold">SVG</span>
                                    <span className="text-xs text-muted-foreground">Vector Image</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-auto flex-col gap-2 p-4 hover:border-primary hover:bg-primary/5"
                                    onClick={handleDownloadPDF}
                                >
                                    <FileText className="w-6 h-6 text-green-400" />
                                    <span className="font-semibold">PDF</span>
                                    <span className="text-xs text-muted-foreground">Document</span>
                                </Button>
                            </div>
                        </div>

                        {/* Share Options */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Share Options</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2 text-green-500" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy Link
                                        </>
                                    )}
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600"
                                    onClick={handleShare}
                                >
                                    <Link2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="customize" className="space-y-6">
                        {/* Size Control */}
                        <div className="space-y-2">
                            <Label htmlFor="size">QR Code Size: {qrSize}px</Label>
                            <input
                                id="size"
                                type="range"
                                min="128"
                                max="512"
                                step="32"
                                value={qrSize}
                                onChange={(e) => setQrSize(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>128px</span>
                                <span>512px</span>
                            </div>
                        </div>

                        {/* Error Correction Level */}
                        <div className="space-y-2">
                            <Label htmlFor="error-level">Error Correction Level</Label>
                            <Select value={errorLevel} onValueChange={(value: any) => setErrorLevel(value)}>
                                <SelectTrigger id="error-level">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L">Low (~7% recovery)</SelectItem>
                                    <SelectItem value="M">Medium (~15% recovery)</SelectItem>
                                    <SelectItem value="Q">Quartile (~25% recovery)</SelectItem>
                                    <SelectItem value="H">High (~30% recovery)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Higher levels allow the QR code to work even if partially damaged
                            </p>
                        </div>

                        {/* Color Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fg-color">Foreground Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="fg-color"
                                        type="color"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="w-14 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="flex-1 font-mono"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bg-color">Background Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="bg-color"
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-14 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="flex-1 font-mono"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Margin Toggle */}
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div>
                                <Label htmlFor="margin">Include Margin</Label>
                                <p className="text-xs text-muted-foreground">Add white space around QR code</p>
                            </div>
                            <Button
                                id="margin"
                                variant={includeMargin ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIncludeMargin(!includeMargin)}
                            >
                                {includeMargin ? 'ON' : 'OFF'}
                            </Button>
                        </div>

                        {/* Preview */}
                        <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                            <Label className="text-sm text-muted-foreground">Live Preview</Label>
                            <div
                                className="p-3 rounded-lg shadow-lg"
                                style={{ backgroundColor: bgColor }}
                            >
                                <QRCodeSVG
                                    value={url}
                                    size={200}
                                    level={errorLevel}
                                    fgColor={fgColor}
                                    bgColor={bgColor}
                                    includeMargin={includeMargin}
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setQrSize(256);
                                setFgColor('#000000');
                                setBgColor('#ffffff');
                                setErrorLevel('H');
                                setIncludeMargin(true);
                                toast.success('Settings reset to default');
                            }}
                        >
                            Reset to Default
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default QRCodeDialog;
