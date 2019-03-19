import { CHUNK_SIZE } from './page';

onmessage = async function ({ data: { name, blob, size } }) {
  const fr = new FileReaderSync();  // eslint-disable-line
  let offset = 0, idx = 0, slice = null, buffer = null;
  while (offset < size) {
    slice = blob.slice(offset, offset + CHUNK_SIZE);
    // TODO: readAsText and parse chapters
    buffer = fr.readAsArrayBuffer(slice);
    postMessage({ name, idx, buffer });
    await sleep(1000);
    idx++;
    offset += CHUNK_SIZE;
  }
  postMessage({ name, idx: -1, buffer: null });
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
