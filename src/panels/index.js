import React from 'react';
import Shelf from './shelf';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.panels = {};
    this.state = { panel: 'shelf' };
  }

  render() {
    return (
      <>
        <Shelf ref={(node) => { this.panels.shelf = node; }} />
      </>
    );
  }
}
