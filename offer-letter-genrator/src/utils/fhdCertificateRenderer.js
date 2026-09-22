import QRCode from 'qrcode';
import JSZip from 'jszip';

/**
 * Full HD (FHD) Certificate Rendering Engine
 * Native 1920x1080 (16:9) high-DPI canvas renderer
 */
export const FHD_WIDTH = 1920;
export const FHD_HEIGHT = 1080;

/**
 * Render a single certificate to an FHD HTMLCanvasElement
 * @param {Object} certificate - Certificate data object
 * @param {Object} [options] - Render options
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderFhdCertificateCanvas(certificate, options = {}) {
  const canvas = document.createElement('canvas');
  const width = options.width || FHD_WIDTH;
  const height = options.height || FHD_HEIGHT;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Smooth rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Background
  const templateBg = certificate.customBgImage ||
    (typeof window !== 'undefined' ? localStorage.getItem('certificate_active_template_bg') : null);

  if (templateBg) {
    try {
      const bgImg = await loadImage(templateBg);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch (e) {
      console.warn('Failed to load custom template, using fallback gradient:', e);
      drawFallbackBackground(ctx, width, height);
    }
  } else {
    drawFallbackBackground(ctx, width, height);
  }

  // Get field positions or sensible defaults
  const pos = certificate.fieldPositions || {
    name: { x: 50, y: 50, fontSize: 44, color: '#0f172a', fontFamily: 'Verdana, sans-serif', fontWeight: 'bold', show: true },
    qrCode: { x: 88, y: 80, size: 85, show: true },
    hash: { x: 50, y: 88, fontSize: 13, color: '#64748b', fontFamily: 'monospace', show: true },
    verificationUrl: { x: 50, y: 92, fontSize: 12, color: '#0284c7', fontFamily: 'Verdana, sans-serif', show: true }
  };

  const recipientName = certificate.recipientName || 'Candidate Name';
  const certId = certificate.credentialId || certificate.id || 'CERT-2026-FHD-001';
  const certHash = certificate.hash || `0x${certId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}e984f1a2076cb58210`;

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://itmbu-credentials.org';
  const verificationUrl = `${baseUrl}?verify=${encodeURIComponent(certId)}`;

  // 2. Draw Recipient / Candidate Name
  const nameCfg = pos.name || {};
  if (nameCfg.show !== false) {
    const fontSize = Math.round((nameCfg.fontSize || 38) * (height / 700));
    const fontFamily = nameCfg.fontFamily || 'Verdana, sans-serif';
    const fontWeight = nameCfg.fontWeight || '700';
    const color = nameCfg.color || '#0f172a';

    ctx.save();
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pxX = (Number(nameCfg.x || 50) / 100) * width;
    const pxY = (Number(nameCfg.y || 50) / 100) * height;

    // Subtle drop shadow for crisp readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillText(recipientName, pxX, pxY);
    ctx.restore();
  }

  // 3. Draw QR Code
  const qrCfg = pos.qrCode || {};
  if (qrCfg.show !== false) {
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: Math.round((qrCfg.size || 80) * (height / 700)),
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      const qrImg = await loadImage(qrDataUrl);
      const qrSize = Math.round((qrCfg.size || 80) * (height / 700));
      const pxX = (Number(qrCfg.x || 88) / 100) * width - qrSize / 2;
      const pxY = (Number(qrCfg.y || 80) / 100) * height - qrSize / 2;

      ctx.save();
      // Rounded white card background for QR code
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      roundRect(ctx, pxX - 6, pxY - 6, qrSize + 12, qrSize + 12, 8);
      ctx.fill();
      ctx.drawImage(qrImg, pxX, pxY, qrSize, qrSize);
      ctx.restore();
    } catch (e) {
      console.warn('Failed to draw QR code on canvas:', e);
    }
  }

  // 4. Draw Hash ID
  const hashCfg = pos.hash || pos.certId || {};
  if (hashCfg.show !== false) {
    const fontSize = Math.round((hashCfg.fontSize || 13) * (height / 700));
    const fontFamily = hashCfg.fontFamily || 'monospace';
    const color = hashCfg.color || '#475569';
    const bgPill = hashCfg.bgPill || 'none';

    ctx.save();
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pxX = (Number(hashCfg.x || 50) / 100) * width;
    const pxY = (Number(hashCfg.y || 88) / 100) * height;
    const text = `Hash ID: ${certHash}`;

    if (bgPill === 'dark') {
      const metrics = ctx.measureText(text);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      roundRect(ctx, pxX - metrics.width / 2 - 12, pxY - fontSize / 2 - 6, metrics.width + 24, fontSize + 12, 6);
      ctx.fill();
    } else if (bgPill === 'light') {
      const metrics = ctx.measureText(text);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      roundRect(ctx, pxX - metrics.width / 2 - 12, pxY - fontSize / 2 - 6, metrics.width + 24, fontSize + 12, 6);
      ctx.fill();
    }

    ctx.fillStyle = color;
    ctx.fillText(text, pxX, pxY);
    ctx.restore();
  }

  // 5. Draw Verification URL
  const urlCfg = pos.verificationUrl || {};
  if (urlCfg.show !== false) {
    const fontSize = Math.round((urlCfg.fontSize || 12) * (height / 700));
    const fontFamily = urlCfg.fontFamily || 'Verdana, sans-serif';
    const color = urlCfg.color || '#0284c7';
    const bgPill = urlCfg.bgPill || 'none';

    ctx.save();
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pxX = (Number(urlCfg.x || 50) / 100) * width;
    const pxY = (Number(urlCfg.y || 92) / 100) * height;

    const displayUrl = verificationUrl.replace(/^https?:\/\//, '');
    const text = `Verify at: ${displayUrl}`;

    if (bgPill === 'dark') {
      const metrics = ctx.measureText(text);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      roundRect(ctx, pxX - metrics.width / 2 - 12, pxY - fontSize / 2 - 6, metrics.width + 24, fontSize + 12, 6);
      ctx.fill();
    } else if (bgPill === 'light') {
      const metrics = ctx.measureText(text);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      roundRect(ctx, pxX - metrics.width / 2 - 12, pxY - fontSize / 2 - 6, metrics.width + 24, fontSize + 12, 6);
      ctx.fill();
    }

    ctx.fillStyle = color;
    ctx.fillText(text, pxX, pxY);
    ctx.restore();
  }

  return canvas;
}

/**
 * Render and download FHD PNG certificate
 */
export async function downloadFhdCertificatePng(certificate, customFilename = null) {
  const canvas = await renderFhdCertificateCanvas(certificate);
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const safeName = (certificate.recipientName || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = customFilename || `Certificate_${safeName}_${certificate.credentialId || certificate.id || 'FHD'}.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate a ZIP containing FHD PNGs for a batch of certificates
 * @param {Array} certificates - List of certificate objects
 * @param {string} zipFilename - Output zip filename
 * @param {Function} [onProgress] - Callback (current, total, filename)
 * @returns {Promise<Blob>}
 */
export async function generateBatchCertificatesZip(certificates, zipFilename = 'Certificates_FHD_Batch.zip', onProgress = null) {
  const zip = new JSZip();
  const folder = zip.folder('FHD_Certificates');

  for (let i = 0; i < certificates.length; i++) {
    const cert = certificates[i];
    const canvas = await renderFhdCertificateCanvas(cert);
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

    const safeName = (cert.recipientName || `Participant_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${String(i + 1).padStart(3, '0')}_Certificate_${safeName}_${cert.credentialId || cert.id || 'FHD'}.png`;

    folder.file(filename, base64Data, { base64: true });

    if (onProgress) {
      onProgress(i + 1, certificates.length, filename);
    }
  }

  // Also include metadata CSV inside the zip
  let csvContent = 'Index,Name,Email ID,Certificate ID,Hash ID,Verification URL,Status\n';
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://itmbu-credentials.org';

  certificates.forEach((cert, idx) => {
    const certId = cert.credentialId || cert.id || '';
    const certHash = cert.hash || '';
    const vUrl = `${baseUrl}?verify=${encodeURIComponent(certId)}`;
    const status = cert.emailSent ? 'Delivered' : 'Generated';
    csvContent += `"${idx + 1}","${(cert.recipientName || '').replace(/"/g, '""')}","${(cert.recipientEmail || '').replace(/"/g, '""')}","${certId}","${certHash}","${vUrl}","${status}"\n`;
  });

  folder.file('Batch_Manifest.csv', csvContent);

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return zipBlob;
}

/**
 * Trigger download of generated ZIP blob
 */
export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helpers
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawFallbackBackground(ctx, width, height) {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1e293b');
  grad.addColorStop(1, '#090e1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Elegant golden border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 14;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(55, 55, width - 110, height - 110);
}

function roundRect(ctx, x, y, width, height, radius = 6) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
