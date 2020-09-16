import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {createStore} from "redux";
import './styles/index.css';
import App from './App';
import Reducer from "./redux/rootReducer"
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import Dotenv from "dotenv";

Dotenv.config();


const _window = window as any;
//@ts-ignore
const store = createStore(
    Reducer,
    _window.__REDUX_DEVTOOLS_EXTENSION__ 
    && _window.__REDUX_DEVTOOLS_EXTENSION__() 
);

ReactDOM.render(
    <Provider store={store}>
        <App /> 
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
