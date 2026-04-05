import { useRef, useState, useCallback } from "react";
import { Camera, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoCaptureProps {
  onCapture: (photo: string) => void;
  onClose?: () => void;
  aspectRatio?: "1:1" | "4:3" | "16:9";
}

export function PhotoCapture({ onCapture, onClose, aspectRatio = "4:3" }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = s;
      setStream(s);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Camera error:", err);
    }
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    setPhoto(canvasRef.current.toDataURL("image/jpeg", 0.8));
  }, []);

  const confirm = useCallback(() => {
    if (photo) {
      onCapture(photo);
      stream?.getTracks().forEach(t => t.stop());
    }
  }, [photo, onCapture, stream]);

  const retake = useCallback(() => setPhoto(null), []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-end p-4">
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-6 w-6 text-white" /></Button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {photo ? (
          <img src={photo} alt="Captured" className="max-w-full max-h-full object-contain" />
        ) : (
          <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-full" onLoadedMetadata={startCamera} />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="p-4 flex justify-center gap-4">
        {photo ? (
          <>
            <Button variant="outline" onClick={retake}><RotateCcw className="mr-2 h-4 w-4" />Repetir</Button>
            <Button onClick={confirm}><Check className="mr-2 h-4 w-4" />Confirmar</Button>
          </>
        ) : (
          <Button size="lg" onClick={capture}><Camera className="mr-2 h-5 w-5" />Capturar</Button>
        )}
      </div>
    </div>
  );
}
