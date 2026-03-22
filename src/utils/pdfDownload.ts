import jsPDF from 'jspdf';

const isSafari = () => {
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|Chromium/i.test(ua);
};

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * Universal PDF download – Safari/iOS compatible.
 * Safari blocks programmatic <a> clicks on blob/data URIs in many contexts,
 * so we open the blob in a new tab and let the user save from there.
 */
export function downloadPdfFromDoc(doc: jsPDF, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9_\-. ]/g, '').replace(/\s+/g, '_');
  const buf = doc.output('arraybuffer');
  const blob = new Blob([buf], { type: 'application/pdf' });

  // Safari (desktop & iOS): open blob in new tab — most reliable method
  if (isSafari() || isIOS()) {
    try {
      const blobUrl = URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');
      if (newWindow) {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
        return;
      }
      // popup blocked — fall through to link method
      URL.revokeObjectURL(blobUrl);
    } catch { /* fall through */ }
  }

  // Method 1: native jsPDF save (Chrome, Firefox, Edge)
  try {
    doc.save(safe);
    return;
  } catch { /* fallback */ }

  // Method 2: Blob URL + <a> click
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safe;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // Small delay before cleanup for Safari fallback
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 250);
    return;
  } catch { /* fallback */ }

  // Method 3: open blob URL in current window as last resort
  try {
    const url = URL.createObjectURL(blob);
    window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 120_000);
  } catch {
    // absolute last resort: data URI
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    const b64 = btoa(binary);
    window.open(`data:application/pdf;base64,${b64}`, '_blank');
  }
}

/** Load an image URL as base64 data URI */
export async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Resize image to fit within bounds for smaller PDF size */
export async function resizeImage(dataUrl: string, maxW: number, maxH: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Load brand logo (Ergon) */
export async function loadBrandLogo(): Promise<string | null> {
  const { default: logoUrl } = await import('@/assets/logo-ergon-clean.png');
  const raw = await loadImageAsBase64(logoUrl);
  if (!raw) return null;
  return resizeImage(raw, 500, 200);
}
