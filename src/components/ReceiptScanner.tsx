import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, FileImage, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OCRResult {
  merchant?: string;
  amount?: number;
  date?: string;
  items?: string[];
  rawText?: string;
}

interface ReceiptScannerProps {
  onReceiptScanned?: (result: OCRResult) => void;
}

export default function ReceiptScanner({ onReceiptScanned }: ReceiptScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "שגיאה",
        description: "אנא העלה קובץ תמונה (JPG, PNG וכו')",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      scanReceipt(base64);
    };
    reader.readAsDataURL(file);
  };

  const scanReceipt = async (base64Image: string) => {
    setIsScanning(true);
    
    try {
      // Simulate OCR processing (in production, call real OCR API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock OCR result
      const mockResult: OCRResult = {
        merchant: parseCompanyName(base64Image),
        amount: parseAmount(base64Image),
        date: new Date().toISOString().split('T')[0],
        rawText: "סופר פארם\nתאריך: 20/02/2026\nסה\"כ: 125.50 ₪",
      };

      setResult(mockResult);
      
      if (onReceiptScanned) {
        onReceiptScanned(mockResult);
      }

      toast({
        title: "✅ הקבלה נסרקה בהצלחה!",
        description: `זוהה: ${mockResult.merchant} • ₪${mockResult.amount}`,
      });
      
    } catch (error) {
      toast({
        title: "שגיאה בסריקה",
        description: "לא הצלחנו לסרוק את הקבלה. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Simple parsers (in production, use real OCR)
  const parseCompanyName = (text: string): string => {
    const companies = ["סופר פארם", "רמי לוי", "שופרסל", "ויקטורי", "מגה"];
    return companies[Math.floor(Math.random() * companies.length)];
  };

  const parseAmount = (text: string): number => {
    return Math.random() * 500 + 50;
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
        <Camera className="w-4 h-4" />
        סרוק קבלה
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              סריקת קבלה
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!preview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">העלה תמונה של קבלה</p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF עד 10MB
                    </p>
                  </div>
                  <Button type="button" variant="secondary">
                    בחר קובץ
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="w-full h-48 object-contain rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 left-2"
                    onClick={handleReset}
                    disabled={isScanning}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {isScanning && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">סורק קבלה...</span>
                  </div>
                )}

                {result && !isScanning && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">פרטים שזוהו</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">סוחר:</span>
                        <span className="font-medium">{result.merchant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">סכום:</span>
                        <span className="font-medium">₪{result.amount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">תאריך:</span>
                        <span className="font-medium">{result.date}</span>
                      </div>
                      {result.rawText && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            טקסט מלא
                          </summary>
                          <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-auto">
                            {result.rawText}
                          </pre>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    סרוק קבלה נוספת
                  </Button>
                  {result && (
                    <Button
                      onClick={() => {
                        if (onReceiptScanned && result) {
                          onReceiptScanned(result);
                        }
                        setIsOpen(false);
                        handleReset();
                      }}
                      className="flex-1"
                    >
                      צור תנועה
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
