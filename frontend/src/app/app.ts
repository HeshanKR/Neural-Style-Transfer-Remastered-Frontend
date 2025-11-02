import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Neural Style Transfer');

  contentImage: File | null = null;
  styleImage: File | null = null;
  contentImagePreview: string | null = null;
  styleImagePreview: string | null = null;
  stylizedImage: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  onContentImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.contentImage = file;
      this.createImagePreview(file, 'content');
    }
  }

  onStyleImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.styleImage = file;
      this.createImagePreview(file, 'style');
    }
  }

  private createImagePreview(file: File, type: 'content' | 'style') {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'content') {
        this.contentImagePreview = e.target?.result as string;
      } else {
        this.styleImagePreview = e.target?.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  private getApiUrl(): string {
    // Check if we're in production (Vercel)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return 'https://neural-style-transfer-remastered-production.up.railway.app';
    }
    // Development fallback
    return 'http://localhost:5000';
  }

  stylizeImage() {
    if (!this.contentImage || !this.styleImage) {
      this.errorMessage = 'Please select both content and style images.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.stylizedImage = null;

    const formData = new FormData();
    formData.append('content', this.contentImage);
    formData.append('style', this.styleImage);

    this.http.post<{stylized_image: string}>(`${this.getApiUrl()}/stylize`, formData)
      .subscribe({
        next: (response) => {
          this.stylizedImage = 'data:image/jpeg;base64,' + response.stylized_image;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.error || 'An error occurred while processing the images.';
          this.isLoading = false;
        }
      });
  }

  downloadImage() {
    if (this.stylizedImage) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'stylized-image.png';
            link.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      };
      img.src = this.stylizedImage;
    }
  }
}
