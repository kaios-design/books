// import l10n.js before react modules
import 'kaios-gaia-l10n';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './panels';

import 'kaid/lib/style.css';
import './index.scss';

ReactDOM.render(<App />, document.getElementById('app'));
