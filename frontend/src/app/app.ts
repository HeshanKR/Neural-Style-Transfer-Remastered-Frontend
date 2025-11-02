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

    this.http.post<{stylized_image: string}>('https://neural-style-transfer-remastered-production.up.railway.app/stylize', formData)
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
}
