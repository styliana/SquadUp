/**
 * Kompresuje i zmienia rozmiar obrazu przed uploadem.
 * @param {File} file - Oryginalny plik z inputa
 * @param {number} maxWidth - Maksymalna szerokość (domyślnie 800px)
 * @param {number} quality - Jakość JPEG (0.0 - 1.0, domyślnie 0.7)
 * @returns {Promise<Blob>} - Skompresowany plik (Blob)
 */
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Oblicz nowe wymiary zachowując proporcje
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Rysuj na Canvasie
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Eksportuj do Bloba (JPEG)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = (err) => reject(err);
    };
    
    reader.onerror = (err) => reject(err);
  });
};