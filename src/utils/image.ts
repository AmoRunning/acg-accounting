export function compressImage(file: File, maxDim = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxDim) { h = h * maxDim / w; w = maxDim; } }
        else { if (h > maxDim) { w = w * maxDim / h; h = maxDim; } }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('压缩失败'))),
          type,
          quality
        );
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(b64: string): Promise<Blob> {
  return fetch(b64).then((r) => r.blob());
}
