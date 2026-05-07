import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxWidthOrHeight: 1024,
    maxSizeMB: 1,
    useWebWorker: true,
    fileType: "image/jpeg",
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch {
    // If compression fails, return original if under 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("图片过大且压缩失败，请尝试上传更小的图片");
    }
    return file;
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
