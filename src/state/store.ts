import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { btestReducer } from "./reducer";
import { btestSaga } from "./saga";

export function createBtestStore() {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(btestReducer, applyMiddleware(sagaMiddleware));
    sagaMiddleware.run(btestSaga);
    return store;
}
