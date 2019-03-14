import 'kaios-gaia-mediadb';
import React, { Component } from 'react';

import readChunk, { CHUNK_SIZE } from './read_chunk';
import FileWorker from './file.worker';
import calcPageNum from './calc_page';

export const BooksContext = React.createContext();

export default class BooksProvider extends Component {
  books = new Map();

  state = {
    books: new Map(),
    curr: null,
    content: null,
    chunk: 1,
    progress: 0,
    get: (filename, chunk, onGet) => { this.getBookContent(filename, chunk, onGet); },
    update: (file) => { this.updateMetadata(file); }
  };

  componentDidMount() {
    this.initDB();
    this.initWorker();
  }

  initDB = () => {
    const bookdb = new MediaDB('sdcard', null, {  // eslint-disable-line
      mimeTypes: ['text/plain'],
      autoscan: false
    });

    bookdb.onenumerable = this.enum;
    bookdb.oncreated = this.addBooks;
    bookdb.ondeleted = this.removeBooks;
    this.bookdb = bookdb;
  };

  initWorker = () => {
    const worker = new FileWorker();
    worker.onmessage = ({ data }) => {
      const { name, idx, buffer } = data;
      const file = this.books.get(name);

      if (idx === -1) {
        file.metadata.parse = 'end';
      }

      if (buffer) {
        const { pages } = file.metadata;
        const num = calcPageNum(buffer, file.metadata.encoding);
        pages.push((pages[pages.length - 1] || 0) + num);
      }

      const { curr } = this.state;
      if (curr === file) {
        this.setState({ curr: file, progress: idx });
      }
    }
    this.worker = worker;
  }

  enum = () => {
    const { bookdb } = this;
    bookdb.enumerate('name', null, 'next', (file) => {
      if (file) {
        this.addBook(file);
      } else {
        this.done();
      }
    });
  }

  done = () => {
    const { bookdb, flush } = this;
    flush();
    bookdb.addEventListener('ready', () => { bookdb.scan() });
    if (bookdb.state === MediaDB.READY) { // eslint-disable-line
      bookdb.scan();
    }
  }

  addBooks = ({ detail: files }) => {
    if (files.length > 0) {
      files.forEach((file) => { this.addBook(file); });
    }
    this.flush();
  }

  /**
   * The structure of file info of txt files got from mediadb is as below
   *   {
   *     "name": "/sdcard/books/some.txt",
   *     "type": "text/plain",
   *     "size": 16407,
   *     "date": 1551160483000,
   *     "metadata": { }
   *   }
   * Large txt files shouldn't be loaded as a whole in reader, it would be split
   * to chunks and calculate pages of each chunk respectively. It's hard to
   * make a continuous reading experience when switching between chunks as words
   * may be cut accidentally by CHUNK_SIZE and leave some blank are in last page of
   * the chunk. Need a better algorithm to do text process later.
   *
   * Metadata field saved back to book database includes:
   *
   *     title          cut from txt file name
   *     read           last read date
   *     page           last page read
   *     pages          array that saves page accumulated by previous chunks
   *     chunk          last chunk read
   *     chunks         Math.ceil(size / CHUNK_SIZE) || 1;
   *     parse          chunk parsing state, 'init' - start' - 'pause' -'end'
   *     encoding       for text decoder, 'utf-8' or 'gbk'
   */
  addBook = (file) => {
    if (!file.metadata.title) {
      file.metadata = {
        title: file.name.replace(/(.*\/)*([^.]+).*/ig, '$2'),
        read: 0,
        page: 1,
        pages: [],
        chunk: 1,
        chunks: Math.ceil(file.size / CHUNK_SIZE) || 1,
        parse: 'init'
      }
    }
    this.books.set(file.name, file);
  }

  removeBooks = ({ detail: files }) => {
    if (files.length > 0) {
      files.forEach((file) => { this.books.delete(file.name); });
    }
    this.flush();
  }

  flush = () => {
    this.setState({ books: new Map(this.books) });
  }

  render() {
    return (
      <BooksContext.Provider value={this.state}>
        {this.props.children}
      </BooksContext.Provider>
    )
  }

  getBookContent = (filename, chunk, onGet) => {
    if (!filename) {
      return;
    }
    // const { size, metadata } = this.books.get(filename);
    const file = this.books.get(filename);
    const { size, metadata } = file;

    if (this.state.curr === file && this.state.chunk === chunk) {
      return;
    }

    if (chunk) {
      metadata.chunk = chunk;
    }

    console.log('books, get book content: ----- ' + JSON.stringify(file));

    this.bookdb.getFile(filename,
      (fileBlob) => {
        const stream = size >= metadata.chunk * CHUNK_SIZE;
        readChunk(fileBlob, metadata.chunk).then((buffer) => {
          let content = '';
          if (!metadata.encoding) {
            const utf8Decoder = new TextDecoder('utf-8');
            const gbkDecoder = new TextDecoder('gbk');
            const utf8 = utf8Decoder.decode(buffer, { stream });
            const gbk = gbkDecoder.decode(buffer, { stream });
            // Stupid but quick guess if it's utf-8 or gbk encoding
            // jschardet (https://github.com/aadsm/jschardet) seems too heavy
            // May add menu to switch encoding later.
            if (utf8.length > gbk.length * 1.1) {
              this.decoder = gbkDecoder;
              metadata.encoding = 'gbk';
              content = gbk;
            } else {
              this.decoder = utf8Decoder;
              metadata.encoding = 'utf-8';
              content = utf8;
            }
          } else {
            if (!this.decoder || this.decoder.encoding !== metadata.encoding) {
              this.decoder = new TextDecoder(metadata.encoding);
            }
            content = this.decoder.decode(buffer, { stream });
          }

          if (metadata.parse === 'init' || metadata.parse === 'pause') {
            metadata.parse = 'start';
            metadata.pages = [];
            this.worker.postMessage({ name: filename, blob: fileBlob, size });
          }
          this.setState({ curr: file, chunk: file.metadata.chunk, content });
          onGet && onGet();
        });
      },
      // on error
      () => {
        console.log('Could not load file');
      }
    );
  }

  updateMetadata = (file) => {
    this.bookdb.updateMetadata(file.name, file.metadata);
  }
}
