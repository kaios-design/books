// import l10n.js before react modules
import 'kaios-gaia-l10n';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './panels';
import { BooksProvider } from './provider';

import 'kaid/lib/style.css';
import './index.scss';

ReactDOM.render((
  <BooksProvider>
    <App />
  </BooksProvider>
), document.getElementById('app'));
