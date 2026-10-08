const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 5_592_500;
const DATA_URL_PATTERN = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/;

function hasExpectedImageSignature(mimeType: string, bytes: Buffer): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/gif":
      return bytes.length >= 6 && (bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a");
    case "image/webp":
      return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
    default:
      return false;
  }
}

export function isSafeImageUrl(value: string): boolean {
  if (value.startsWith("data:")) {
    if (value.length > MAX_IMAGE_DATA_URL_LENGTH) return false;
    const match = DATA_URL_PATTERN.exec(value);
    if (!match) return false;

    const base64 = match[2];
    const bytes = Buffer.from(base64, "base64");
    return bytes.length > 0
      && bytes.length <= MAX_IMAGE_BYTES
      && bytes.toString("base64") === base64
      && hasExpectedImageSignature(match[1], bytes);
  }

  if (value.startsWith("/images/")) {
    return !/[\\\0\u0000-\u001f]/.test(value) && !value.includes("..");
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
