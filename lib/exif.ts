import exifr from "exifr";

export async function extractDateTime(file: File): Promise<string | null> {
  try {
    const exif = await exifr.parse(file, ["DateTimeOriginal"]);
    const dt = exif?.DateTimeOriginal;
    if (dt instanceof Date) {
      return formatTime(dt);
    }
    return null;
  } catch {
    return null;
  }
}

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function getCurrentTime(): string {
  return formatTime(new Date());
}
