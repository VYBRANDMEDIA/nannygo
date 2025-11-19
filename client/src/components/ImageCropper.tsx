import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Move } from "lucide-react";

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageFile, onCropComplete, onCancel }: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
    
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Container dimensions (square viewport)
    const containerSize = container.offsetWidth;
    
    // Calculate displayed image size
    const displayWidth = image.width * zoom;
    const displayHeight = image.height * zoom;
    
    // Calculate what portion of the original image is visible in the crop area
    const scaleX = image.naturalWidth / displayWidth;
    const scaleY = image.naturalHeight / displayHeight;
    
    // Calculate crop coordinates in original image space
    const cropX = Math.max(0, -position.x * scaleX);
    const cropY = Math.max(0, -position.y * scaleY);
    const cropWidth = Math.min(containerSize * scaleX, image.naturalWidth - cropX);
    const cropHeight = Math.min(containerSize * scaleY, image.naturalHeight - cropY);

    // Set canvas to output size (800x800)
    canvas.width = 800;
    canvas.height = 800;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 800);

    // Draw cropped portion
    const size = Math.min(cropWidth, cropHeight);
    ctx.drawImage(
      image,
      cropX,
      cropY,
      size,
      size,
      0,
      0,
      800,
      800
    );

    // Convert to base64
    const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(croppedImage);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Foto aanpassen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Crop Area */}
          <div
            ref={containerRef}
            className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-move touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  position: 'absolute',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                className="max-w-none"
              />
            )}
            
            {/* Center guide */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
            </div>
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={0.1}
                max={5}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Move className="h-3 w-3" />
              Sleep de foto om te positioneren
            </p>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Annuleren
            </Button>
            <Button onClick={handleCrop} className="flex-1 bg-[#20B2AA] hover:bg-[#1a8f89]">
              Opslaan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
