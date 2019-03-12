import React from 'react';
import Shelf from './shelf';

import { BooksContext } from '../provider';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.panels = {};
    this.state = { panel: 'shelf' };
  }

  render() {
    return (
      <BooksContext.Consumer>
        {
          ({ books }) => (
            <Shelf books={books} ref={(node) => { this.panels.shelf = node; }} />
          )
        }
      </BooksContext.Consumer>
    );
  }
}
