import React from 'react';
import Shelf from './shelf';

import BooksProvider from '../provider';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.panels = {};
    this.state = { panel: 'shelf' };
  }

  render() {
    return (
      <BooksProvider>
        <Shelf ref={(node) => { this.panels.shelf = node; }} />
      </BooksProvider>
    );
  }
}
