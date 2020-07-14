import { createBrowserHistory } from 'history';
import { RouterModel, syncHistoryWithStore } from 'mst-react-router'

export const routerModel = RouterModel.create();
const browserHistory = createBrowserHistory();

export const history = syncHistoryWithStore(browserHistory, routerModel);
