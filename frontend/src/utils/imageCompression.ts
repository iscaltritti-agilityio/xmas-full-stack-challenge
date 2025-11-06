import { PROFILE_IMAGE_MAX_WIDTH, PROFILE_IMAGE_MAX_HEIGHT, PROFILE_IMAGE_QUALITY } from '../constants';

export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > PROFILE_IMAGE_MAX_WIDTH) {
            height *= PROFILE_IMAGE_MAX_WIDTH / width;
            width = PROFILE_IMAGE_MAX_WIDTH;
          }
        } else {
          if (height > PROFILE_IMAGE_MAX_HEIGHT) {
            width *= PROFILE_IMAGE_MAX_HEIGHT / height;
            height = PROFILE_IMAGE_MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const compressedReader = new FileReader();
            compressedReader.onloadend = () => {
              resolve(compressedReader.result as string);
            };
            compressedReader.onerror = () => reject(new Error('Failed to read compressed image'));
            compressedReader.readAsDataURL(blob);
          },
          'image/jpeg',
          PROFILE_IMAGE_QUALITY
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

