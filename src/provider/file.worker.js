onmessage = ({ data: { file, offset, length } }) => {
  const fr = new FileReaderSync();  // eslint-disable-line
  const slice = file.slice(offset, offset + length);
  postMessage(fr.readAsArrayBuffer(slice));
}
