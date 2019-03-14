import 'kaios-gaia-mediadb';
import React, { Component } from 'react';
import FileWorker from './file.worker';

export const BooksContext = React.createContext();

export default class BooksProvider extends Component {
  books = new Map();

  state = {
    books: new Map(),
    curr: null,
    content: null,
    get: (filename) => { this.getBookContent(filename); }
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
      const content = new TextDecoder('gbk').decode(data, { stream: true });
      this.setState({  curr: this.curr, content });
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

  /*
    {
      "name": "/sdcard/books/some.txt",
      "type": "text/plain",
      "size": 16407,
      "date": 1551160483000,
      "metadata": { }
    }
  */
  addBook = (file) => {
    if (!file.metadata.title) {
      file.metadata = {
        title: file.name.replace(/(.*\/)*([^.]+).*/ig, '$2'),
        author: '',
        page: 1,
        total_pages: 1,
        read_date: 0,
        parsed: false,
        pages: []
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

  getBookContent = (filename) => {
    if (!filename) {
      return;
    }

    console.log(`to get book:${filename}`);
    this.bookdb.getFile(filename,
      (fileBlob) => {
        this.curr = filename;
        this.worker.postMessage({ file: fileBlob, offset: 0, length: 300 * 1024 });
      },
      // on error
      () => {
        console.log('Could not load file');
      }
    );
  }
}
