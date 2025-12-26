import html2canvas, { Options } from 'html2canvas';

/**
 * Converts an HTML string to an image with YouTube thumbnail dimensions (1280x720).
 * @param {string} htmlString - The HTML string to convert.
 * @param {Object} options - Additional options for html2canvas (optional).
 * @returns {Promise<string>} A promise that resolves with the image data URL.
 */
export async function htmlToThumbnail(htmlString: string, options: Partial<Options> = {}) {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '1280px';
  container.style.height = '720px';
  container.style.overflow = 'hidden';
  container.style.backgroundColor = '#efeeea';
  container.innerHTML = htmlString;

  // Append the container to the body
  document.body.appendChild(container);

  try {
    // Use html2canvas to capture the content
    const canvas = await html2canvas(container, {
      width: 1280,
      height: 720,
      scale: 1, // Adjust this if you need higher resolution
      logging: false,
      useCORS: true,
      ...options,
    });

    // Convert the canvas to a Blob
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to Blob'));
          }
        },
        'image/jpeg',
        0.9
      ); // Using JPEG for smaller file size
    });
  } finally {
    // Clean up: remove the temporary container
    document.body.removeChild(container);
  }
}
