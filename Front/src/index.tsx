import React from 'react';
import ReactDOM from 'react-dom';
import SportApp from './sportApp';
import * as serviceWorker from './serviceWorker';
import 'antd/dist/antd.css';

ReactDOM.render(<SportApp />, document.getElementById('root'));

/* WARNING: Enabling this will stop MySport to work properly. You should check facebook/devices auth before enabling this */
serviceWorker.unregister();
