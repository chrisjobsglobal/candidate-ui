import { 
  Component, 
  ElementRef, 
  ViewChild, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  signal,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check, X, RotateCcw, Move, ZoomIn, ZoomOut } from 'lucide-angular';

export interface CropResult {
  croppedFile: File;
  originalFile: File;
  cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

@Component({
  selector: 'app-cover-photo-cropper',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Position Cover Photo</h3>
          <button
            (click)="onCancel()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <lucide-angular [img]="XIcon" size="20" class="text-gray-500"></lucide-angular>
          </button>
        </div>

        <!-- Cropper Container -->
        <div class="p-6">
          <div class="relative bg-gray-900 rounded-lg overflow-hidden" style="height: 500px;">
            <!-- Canvas for cropping -->
            <canvas
              #cropCanvas
              class="border border-gray-300 cursor-move"
              (mousedown)="startDrag($event)"
              (mousemove)="updateDrag($event)"
              (mouseup)="endDrag($event)"
              (mouseleave)="endDrag($event)"
              style="max-width: 100%; max-height: 100%;"
            ></canvas>
            
            <!-- Loading overlay -->
            <div
              *ngIf="isProcessing()"
              class="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div class="text-center text-white">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <span class="text-sm font-medium">Processing...</span>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
            <!-- Info -->
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-600">
                <span class="font-medium">Cover Photo Size:</span> 1216 × 224 pixels
              </div>
              <div class="text-sm text-gray-600">
                <lucide-angular [img]="MoveIcon" size="14" class="inline mr-1"></lucide-angular>
                Drag to position
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-3">
              <button
                (click)="resetPosition()"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <lucide-angular [img]="RotateCcwIcon" size="16" class="inline mr-1"></lucide-angular>
                Reset
              </button>
              <button
                (click)="onCancel()"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="onCrop()"
                [disabled]="isProcessing()"
                class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <lucide-angular [img]="CheckIcon" size="16"></lucide-angular>
                <span>Apply</span>
              </button>
            </div>
          </div>

          <!-- Tips -->
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>Tips:</strong> Drag the image to position it within the cover photo area (shown in blue). 
              The final cover photo will be 1216×224 pixels.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      z-index: 1000;
    }
    canvas {
      display: block;
      margin: 0 auto;
    }
  `]
})
export class CoverPhotoCropperComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cropCanvas') cropCanvas!: ElementRef<HTMLCanvasElement>;
  
  @Input() imageUrl: string = '';
  @Input() originalFile!: File;
  
  @Output() cropComplete = new EventEmitter<CropResult>();
  @Output() cropCancel = new EventEmitter<void>();

  // Icons
  readonly CheckIcon = Check;
  readonly XIcon = X;
  readonly RotateCcwIcon = RotateCcw;
  readonly MoveIcon = Move;
  readonly ZoomInIcon = ZoomIn;
  readonly ZoomOutIcon = ZoomOut;

  // State
  readonly isProcessing = signal(false);
  
  private ctx!: CanvasRenderingContext2D;
  private image: HTMLImageElement = new Image();
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private imageX = 0;
  private imageY = 0;
  private imageScale = 1;
  private canvasWidth = 0;
  private canvasHeight = 0;
  
  // Fixed crop dimensions based on cover photo requirements (1216x224)
  private readonly CROP_ASPECT_RATIO = 1216 / 224; // ≈ 5.43:1
  private cropMarkerWidth = 0;
  private cropMarkerHeight = 0;
  private cropMarkerX = 0;
  private cropMarkerY = 0;

  ngOnInit() {
    this.image.onload = () => {
      this.setupCanvas();
    };
    this.image.src = this.imageUrl;
  }

  ngAfterViewInit() {
    if (this.cropCanvas) {
      this.ctx = this.cropCanvas.nativeElement.getContext('2d')!;
    }
  }

  ngOnDestroy() {
    // Clean up
  }

  private setupCanvas() {
    const canvas = this.cropCanvas.nativeElement;
    const container = canvas.parentElement!;
    
    // Set canvas size to fit container
    const maxWidth = container.clientWidth - 20;
    const maxHeight = container.clientHeight - 20;
    
    this.canvasWidth = maxWidth;
    this.canvasHeight = maxHeight;
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    
    // Calculate scale to fit image in canvas while maintaining aspect ratio
    const imageAspect = this.image.width / this.image.height;
    const canvasAspect = maxWidth / maxHeight;
    
    if (imageAspect > canvasAspect) {
      // Image is wider than canvas
      this.imageScale = maxWidth / this.image.width;
    } else {
      // Image is taller than canvas
      this.imageScale = maxHeight / this.image.height;
    }
    
    // Center the image initially
    const scaledImageWidth = this.image.width * this.imageScale;
    const scaledImageHeight = this.image.height * this.imageScale;
    this.imageX = (maxWidth - scaledImageWidth) / 2;
    this.imageY = (maxHeight - scaledImageHeight) / 2;
    
    this.setupCropMarker();
    this.drawCanvas();
  }

  private setupCropMarker() {
    // Calculate crop marker size based on the cover photo aspect ratio
    const maxMarkerWidth = this.canvasWidth * 0.8;
    const maxMarkerHeight = this.canvasHeight * 0.6;
    
    // Use the cover photo aspect ratio (1216:224)
    this.cropMarkerWidth = Math.min(maxMarkerWidth, maxMarkerHeight * this.CROP_ASPECT_RATIO);
    this.cropMarkerHeight = this.cropMarkerWidth / this.CROP_ASPECT_RATIO;
    
    // Center the crop marker
    this.cropMarkerX = (this.canvasWidth - this.cropMarkerWidth) / 2;
    this.cropMarkerY = (this.canvasHeight - this.cropMarkerHeight) / 2;
  }

  private drawCanvas() {
    if (!this.ctx) return;
    
    const canvas = this.cropCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill background with dark color
    this.ctx.fillStyle = '#1f2937';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image
    const scaledWidth = this.image.width * this.imageScale;
    const scaledHeight = this.image.height * this.imageScale;
    this.ctx.drawImage(this.image, this.imageX, this.imageY, scaledWidth, scaledHeight);
    
    // Draw crop overlay
    this.drawCropOverlay();
  }

  private drawCropOverlay() {
    if (!this.ctx) return;
    
    // Draw semi-transparent overlay over entire canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Clear the crop marker area to show the image underneath
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillRect(this.cropMarkerX, this.cropMarkerY, this.cropMarkerWidth, this.cropMarkerHeight);
    this.ctx.restore();
    
    // Redraw the image in the crop area only
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(this.cropMarkerX, this.cropMarkerY, this.cropMarkerWidth, this.cropMarkerHeight);
    this.ctx.clip();
    
    const scaledWidth = this.image.width * this.imageScale;
    const scaledHeight = this.image.height * this.imageScale;
    this.ctx.drawImage(this.image, this.imageX, this.imageY, scaledWidth, scaledHeight);
    this.ctx.restore();
    
    // Draw crop marker border
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.cropMarkerX, this.cropMarkerY, this.cropMarkerWidth, this.cropMarkerHeight);
    
    // Draw corner indicators
    this.drawCornerIndicators();
    
    // Draw center crosshair
    this.drawCenterCrosshair();
  }

  private drawCornerIndicators() {
    const cornerSize = 12;
    const cornerThickness = 3;
    
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = cornerThickness;
    this.ctx.lineCap = 'round';
    
    // Top-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(this.cropMarkerX, this.cropMarkerY + cornerSize);
    this.ctx.lineTo(this.cropMarkerX, this.cropMarkerY);
    this.ctx.lineTo(this.cropMarkerX + cornerSize, this.cropMarkerY);
    this.ctx.stroke();
    
    // Top-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(this.cropMarkerX + this.cropMarkerWidth - cornerSize, this.cropMarkerY);
    this.ctx.lineTo(this.cropMarkerX + this.cropMarkerWidth, this.cropMarkerY);
    this.ctx.lineTo(this.cropMarkerX + this.cropMarkerWidth, this.cropMarkerY + cornerSize);
    this.ctx.stroke();
    
    // Bottom-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(this.cropMarkerX, this.cropMarkerY + this.cropMarkerHeight - cornerSize);
    this.ctx.lineTo(this.cropMarkerX, this.cropMarkerY + this.cropMarkerHeight);
    this.ctx.lineTo(this.cropMarkerX + cornerSize, this.cropMarkerY + this.cropMarkerHeight);
    this.ctx.stroke();
    
    // Bottom-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(this.cropMarkerX + this.cropMarkerWidth - cornerSize, this.cropMarkerY + this.cropMarkerHeight);
    this.ctx.lineTo(this.cropMarkerX + this.cropMarkerWidth, this.cropMarkerY + this.cropMarkerHeight);
    this.ctx.lineTo(this.cropMarkerX + this.cropMarkerWidth, this.cropMarkerY + this.cropMarkerHeight - cornerSize);
    this.ctx.stroke();
  }

  private drawCenterCrosshair() {
    const centerX = this.cropMarkerX + this.cropMarkerWidth / 2;
    const centerY = this.cropMarkerY + this.cropMarkerHeight / 2;
    const crossSize = 8;
    
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    
    // Horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - crossSize, centerY);
    this.ctx.lineTo(centerX + crossSize, centerY);
    this.ctx.stroke();
    
    // Vertical line
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - crossSize);
    this.ctx.lineTo(centerX, centerY + crossSize);
    this.ctx.stroke();
  }

  startDrag(event: MouseEvent) {
    const rect = this.cropCanvas.nativeElement.getBoundingClientRect();
    this.dragStartX = event.clientX - rect.left - this.imageX;
    this.dragStartY = event.clientY - rect.top - this.imageY;
    this.isDragging = true;
  }

  updateDrag(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const rect = this.cropCanvas.nativeElement.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    
    // Calculate new image position
    this.imageX = currentX - this.dragStartX;
    this.imageY = currentY - this.dragStartY;
    
    // Keep image within reasonable bounds (allow some overflow for positioning)
    const scaledWidth = this.image.width * this.imageScale;
    const scaledHeight = this.image.height * this.imageScale;
    
    const minX = -scaledWidth + 50;
    const maxX = this.canvasWidth - 50;
    const minY = -scaledHeight + 50;
    const maxY = this.canvasHeight - 50;
    
    this.imageX = Math.max(minX, Math.min(maxX, this.imageX));
    this.imageY = Math.max(minY, Math.min(maxY, this.imageY));
    
    this.drawCanvas();
  }

  endDrag(event: MouseEvent) {
    this.isDragging = false;
  }

  resetPosition() {
    // Reset image to center position
    const scaledImageWidth = this.image.width * this.imageScale;
    const scaledImageHeight = this.image.height * this.imageScale;
    this.imageX = (this.canvasWidth - scaledImageWidth) / 2;
    this.imageY = (this.canvasHeight - scaledImageHeight) / 2;
    this.drawCanvas();
  }

  hasCropArea(): boolean {
    return true; // Always true since we have a fixed crop marker
  }

  onCancel() {
    this.cropCancel.emit();
  }

  async onCrop() {
    this.isProcessing.set(true);

    try {
      // Create a new canvas for the cropped image
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d')!;
      
      // Set output size to exact cover photo dimensions
      const outputWidth = 1216;
      const outputHeight = 224;
      
      cropCanvas.width = outputWidth;
      cropCanvas.height = outputHeight;
      
      // Calculate the scale factors between canvas and actual image
      const scaleToOriginal = 1 / this.imageScale;
      
      // Convert crop marker position and size to original image coordinates
      const cropMarkerXInImage = (this.cropMarkerX - this.imageX) * scaleToOriginal;
      const cropMarkerYInImage = (this.cropMarkerY - this.imageY) * scaleToOriginal;
      const cropMarkerWidthInImage = this.cropMarkerWidth * scaleToOriginal;
      const cropMarkerHeightInImage = this.cropMarkerHeight * scaleToOriginal;
      
      // Calculate what portion of the original image to use
      const sourceX = Math.max(0, cropMarkerXInImage);
      const sourceY = Math.max(0, cropMarkerYInImage);
      const sourceWidth = Math.min(this.image.width - sourceX, cropMarkerWidthInImage - Math.max(0, -cropMarkerXInImage));
      const sourceHeight = Math.min(this.image.height - sourceY, cropMarkerHeightInImage - Math.max(0, -cropMarkerYInImage));
      
      // Calculate destination position (handles cases where crop marker extends beyond image)
      const destX = Math.max(0, -cropMarkerXInImage) * (outputWidth / cropMarkerWidthInImage);
      const destY = Math.max(0, -cropMarkerYInImage) * (outputHeight / cropMarkerHeightInImage);
      const destWidth = sourceWidth * (outputWidth / cropMarkerWidthInImage);
      const destHeight = sourceHeight * (outputHeight / cropMarkerHeightInImage);
      
      // Fill with a neutral background color first
      cropCtx.fillStyle = '#e5e7eb';
      cropCtx.fillRect(0, 0, outputWidth, outputHeight);
      
      // Draw the cropped portion of the image
      if (sourceWidth > 0 && sourceHeight > 0 && destWidth > 0 && destHeight > 0) {
        cropCtx.drawImage(
          this.image,
          sourceX, sourceY, sourceWidth, sourceHeight,
          destX, destY, destWidth, destHeight
        );
      }
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        cropCanvas.toBlob((blob: Blob | null) => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      });

      // Create file from blob
      const croppedFile = new File([blob], this.originalFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      const result: CropResult = {
        croppedFile,
        originalFile: this.originalFile,
        cropData: {
          x: Math.round(sourceX),
          y: Math.round(sourceY),
          width: Math.round(sourceWidth),
          height: Math.round(sourceHeight)
        }
      };

      this.cropComplete.emit(result);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
