/**
 * Extract text from a PDF using pdfjs-dist
 */
export async function extractTextFromPdf(base64Data: string): Promise<string> {
  try {
    // Dynamic import to avoid build issues
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    const data = Buffer.from(base64Data, 'base64');
    const uint8Array = new Uint8Array(data);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item) => 'str' in item)
        .map((item) => (item as { str: string }).str)
        .join(' ');
      if (pageText.trim()) {
        textParts.push(`--- Page ${i} ---\n${pageText.trim()}`);
      }
    }

    return textParts.join('\n\n');
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    return '';
  }
}
