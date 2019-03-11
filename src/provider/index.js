import 'kaios-gaia-mediadb';
import React, { Component } from 'react';

export const BooksContext = React.createContext();

export default class BooksProvider extends Component {
  books = [];

  state = {
    books: []
  };

  componentDidMount() {
    this.initDB();
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
    // TODO: better regExp
    const book = {
      title: file.name.replace(/[^/]*[/]+/g, '').replace(/.txt$/, ''),
      author: '',
      filename: file.name
    };
    this.books.push(book);
  }

  removeBooks = ({ detail: files }) => {
    if (files.length > 0) {
      files.forEach((file) => { this.removeBook(file); });
    }
    this.flush();
  }

  removeBook = (file) => {
    const { books } = this;
    let i = 0;
    for (i = 0; i < books.length; i++) {
      if (books[i].filename === file.name)
        break;
    }
    if (i >= books.length) return;
    books.splice(i, 1);
  }

  flush = () => {
    this.setState({ books: [...this.books] });
  }

  render() {
    return (
      <BooksContext.Provider value={this.state}>
        {this.props.children}
      </BooksContext.Provider>
    )
  }
}
