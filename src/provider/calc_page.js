export default function calcPageNum(buffer, encoding) {
  const ctnr = document.createElement('div');
  ctnr.className = "reader-page";
  const art = document.createElement('div');
  art.className = "reader-article";
  ctnr.appendChild(art);
  const string = new TextDecoder(encoding).decode(buffer, { stream: true });
  art.innerHTML = string.replace(/\n/g, '<br>');
  document.body.appendChild(ctnr);
  const pageNum = Math.ceil(art.offsetWidth / 230);
  document.body.removeChild(ctnr);
  return pageNum;
}
