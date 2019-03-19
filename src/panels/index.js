import React from 'react';
import Shelf from './shelf';
import Reader from './reader';

import { BooksConsumer } from '../provider';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.panels = {};
    this.state = { panel: 'shelf' };
  }

  componentDidUpdate() {
    const { panel } = this.state;
    const { shelf, reader } = this.panels;
    if (panel === 'shelf') {
      reader.hide();
      shelf.show();
    } else {
      shelf.hide();
      reader.show();
    }
  }

  onSelectBook = () => {
    this.setState({
      panel: 'reader'
    })
  }

  onBackFromReader = () => {
    this.setState({
      panel: 'shelf'
    })
  }

  render() {
    return (
      <BooksConsumer>
        {
          ({ books, reading, get, update }) => (
            <>
              <Shelf
                onSelect={(file) => { if (reading.file !== file) { get(file); } this.onSelectBook() }}
                books={books}
                ref={(node) => { this.panels.shelf = node; }}
              />
              <Reader
                onBack={(file) => { update(file); this.onBackFromReader();}}
                file={reading.file}
                get={get}
                bookContent={reading.content}
                parsing={reading.parsing_progress}
                ref={(node) => { this.panels.reader = node; }}
              />
            </>
          )
        }
      </BooksConsumer>
    );
  }
}
