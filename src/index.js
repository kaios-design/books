// import l10n.js before react modules
import 'kaios-gaia-l10n';
import React from 'react';
import ReactDOM from 'react-dom';

import Shelf from './panels/shelf';

import 'kaid/lib/style.css';
import './index.scss';

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

ReactDOM.render(<App />, document.getElementById('app'));
