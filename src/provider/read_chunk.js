export const CHUNK_SIZE = 32 * 1024;

export default function readChunk(blob, chunk) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    const slice = blob.slice((chunk - 1) * CHUNK_SIZE, chunk * CHUNK_SIZE);
    fr.onload = () => { resolve(fr.result); };
    fr.onerror = () => { reject(); };
    fr.readAsArrayBuffer(slice);
  });
}
