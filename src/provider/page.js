export const PAGE_WIDTH = 230;
export const CHUNK_SIZE = 32 * 1024;

export function calcPages(buffer, encoding) {
  const string = new TextDecoder(encoding).decode(buffer, { stream: true });

  const ctnr = document.createElement('div');
  ctnr.className = 'reader-page';
  const art = document.createElement('div');
  art.className = 'reader-article';
  ctnr.appendChild(art);
  art.innerHTML = string.replace(/\n/g, '<br>');

  document.body.appendChild(ctnr);
  const pages = Math.ceil(art.offsetWidth / PAGE_WIDTH);
  document.body.removeChild(ctnr);
  return pages;
}

export function readChunk(blob, chunk) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    const slice = blob.slice((chunk - 1) * CHUNK_SIZE, chunk * CHUNK_SIZE);
    fr.onload = () => { resolve(fr.result); };
    fr.onerror = () => { reject(); };
    fr.readAsArrayBuffer(slice);
  });
}
