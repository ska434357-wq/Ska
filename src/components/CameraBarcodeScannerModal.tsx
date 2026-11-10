import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../data/initialProducts';
import { findProductByBarcode, getProductBarcode } from '../utils/barcodeMatcher';
import { playScannerBeep } from '../utils/scannerAudio';

interface CameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductScanned: (product: Product, scannedCode: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const CameraBarcodeScannerModal: React.FC<CameraBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductScanned,
  onShowToast
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastScannedResult, setLastScannedResult] = useState<{
    product: Product;
    code: string;
    timestamp: number;
  } | null>(null);

  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'pharmacy-interactive-barcode-reader';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Initialize and start camera scanner when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setCameraError(null);
    setLastScannedResult(null);

    const startScanner = async () => {
      try {
        // Wait for DOM element to be ready
        await new Promise(r => setTimeout(r, 150));
        const el = document.getElementById(readerElementId);
        if (!el || !isMounted) return;

        const html5QrCode = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          verbose: false
        });

        scannerInstanceRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.333333
          },
          (decodedText: string) => {
            if (!isMounted) return;
            handleBarcodeDetection(decodedText);
          },
          () => {
            // Frame scanned with no barcode, standard behavior
          }
        );

        if (isMounted) {
          setIsCameraActive(true);
        }
      } catch (err: unknown) {
        console.warn('Erreur initialisation caméra:', err);
        if (!isMounted) return;
        const msg =
          err instanceof Error
            ? err.message
            : String(err);
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          setCameraError(
            'Accès à la caméra refusé. Veuillez autoriser la caméra dans les paramètres de votre navigateur.'
          );
        } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
          setCameraError(
            'Aucune caméra vidéo détectée sur cet appareil. Vous pouvez utiliser une douchette USB/Bluetooth ou charger une photo.'
          );
        } else {
          setCameraError(
            'Impossible de démarrer le flux vidéo. Utilisez le mode douchette ou le sélecteur ci-dessous.'
          );
        }
        setIsCameraActive(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerInstanceRef.current) {
        try {
          if (scannerInstanceRef.current.isScanning) {
            scannerInstanceRef.current.stop().then(() => {
              scannerInstanceRef.current?.clear();
              scannerInstanceRef.current = null;
            }).catch(() => {});
          } else {
            scannerInstanceRef.current.clear();
            scannerInstanceRef.current = null;
          }
        } catch {
          // Cleanup error ignored
        }
      }
    };
  }, [isOpen]);

  // Debounced handling of detected barcode to prevent duplicates
  const handleBarcodeDetection = (code: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < 1200) {
      return; // Ignore duplicate scans within 1.2s
    }
    lastScanTimeRef.current = now;

    const matchedProduct = findProductByBarcode(code, products);

    if (matchedProduct) {
      if (soundEnabled) {
        playScannerBeep('success');
      }
      setLastScannedResult({
        product: matchedProduct,
        code,
        timestamp: now
      });
      onProductScanned(matchedProduct, code);
      onShowToast(
        'Code-barres scanné !',
        `#${matchedProduct.no} ${matchedProduct.designation} identifié (${code}).`,
        'success'
      );
    } else {
      if (soundEnabled) {
        playScannerBeep('error');
      }
      onShowToast(
        'Code non répertorié',
        `Le code « ${code} » ne correspond à aucun des 302 comprimés de la pharmacie.`,
        'warning'
      );
    }
  };

  // Scan from photo upload
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerInstanceRef.current) return;

    try {
      const decoded = await scannerInstanceRef.current.scanFile(file, true);
      handleBarcodeDetection(decoded);
    } catch {
      playScannerBeep('error');
      onShowToast(
        'Aucun code détecté',
        'Impossible de lire un code-barres net sur cette image.',
        'error'
      );
    }
  };

  if (!isOpen) return null;

  // Some demo products to test scanning
  const demoSamples = products.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-teal-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/40">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                Scanner Caméra Code-Barres
              </h3>
              <p className="text-xs text-teal-300/80">
                Pointez la caméra vers le code-barres (EAN-13, CIP, Code 128)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition ${
                soundEnabled
                  ? 'bg-teal-500/20 border-teal-400/40 text-teal-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title={soundEnabled ? 'Son activé (bip douchette)' : 'Son coupé'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Camera Video Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
          {/* HTML5 QR Code Mount Point */}
          <div id={readerElementId} className="w-full h-full max-h-[360px]" />

          {/* Animated Laser Overlay if camera is running */}
          {isCameraActive && !cameraError && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
              {/* Target box */}
              <div className="w-64 h-36 border-2 border-dashed border-teal-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                {/* Glowing Laser scanning line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-bounce" />
                <div className="absolute top-2 left-2 text-[10px] font-mono text-teal-300 bg-black/60 px-1.5 py-0.5 rounded">
                  ALIGNER LE CODE-BARRES
                </div>
              </div>
            </div>
          )}

          {/* Error Message Fallback */}
          {cameraError && (
            <div className="p-6 text-center max-w-sm space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-amber-200">{cameraError}</div>
              <p className="text-xs text-slate-400">
                Vous pouvez également charger une photo de boîte ou utiliser les raccourcis de test ci-dessous.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase flex items-center gap-2 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Scanner une image</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileScan}
        />

        {/* Live Scan Result Banner */}
        {lastScannedResult && (
          <div className="p-3 bg-emerald-950/80 border-t border-emerald-500/40 text-emerald-200 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-extrabold text-white">
                  #{lastScannedResult.product.no} {lastScannedResult.product.designation}
                </span>
                <span className="text-[11px] text-emerald-400/80 block">
                  Code : {lastScannedResult.code} • Stock théorique : {lastScannedResult.product.quantite} u.
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 rounded font-bold uppercase text-[10px]">
              Détecté
            </span>
          </div>
        )}

        {/* Quick Test Barcodes & Alternative Tools */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-teal-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tester un comprimé en 1 clic :</span>
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-teal-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <Upload className="w-3 h-3" />
              <span>Scanner photo</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {demoSamples.map(p => {
              const barcode = getProductBarcode(p.no);
              return (
                <button
                  key={p.id}
                  onClick={() => handleBarcodeDetection(barcode)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-teal-600/30 text-slate-200 hover:text-teal-200 border border-white/10 text-[11px] font-medium transition flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-teal-400" />
                  <span>#{p.no} {p.designation.slice(0, 18)}...</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-1 border-t border-white/5">
            Compatible avec les douchettes USB & Bluetooth en appuyant directement sur la gâchette.
          </div>
        </div>
      </div>
    </div>
  );
};
