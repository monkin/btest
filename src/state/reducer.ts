import { combineReducers } from "redux";
import { createReducer } from "typesafe-actions";
import { RedditItem, RedditPage } from "../api";
import {
    appendRedditPage,
    clearErrorFlag,
    decLoadingCounter,
    incLoadingCounter,
    setErrorFlag,
    setRedditPages,
    setVisibleItems,
    updateRedditPage,
} from "./actions";

export const redditReducer = createReducer<
    RedditPage[],
    ReturnType<
        | typeof setRedditPages
        | typeof updateRedditPage
        | typeof appendRedditPage
    >
>([])
    .handleAction(setRedditPages, (_state, action) => action.payload)
    .handleAction(updateRedditPage, (state, { payload: { page, data } }) => {
        const result = [...state];
        result[page] = data;
        return result;
    })
    .handleAction(appendRedditPage, (state, { payload: { data } }) => {
        return [...state, data];
    });

export const visibleItemsReducer = createReducer<
    RedditItem[],
    ReturnType<typeof setVisibleItems>
>([]).handleAction(setVisibleItems, (_state, action) => action.payload);

export const loadingCounterReducer = createReducer<
    number,
    ReturnType<typeof incLoadingCounter | typeof decLoadingCounter>
>(0)
    .handleAction(incLoadingCounter, state => state + 1)
    .handleAction(decLoadingCounter, state => state - 1);

export const errorFlagReducer = createReducer<
    boolean,
    ReturnType<typeof setErrorFlag | typeof clearErrorFlag>
>(false)
    .handleAction(setErrorFlag, () => true)
    .handleAction(clearErrorFlag, () => false);

export interface BtestState {
    pages: RedditPage[];
    visibleItems: RedditItem[];
    loadingCounter: number;
    errorFlag: boolean;
}

export namespace BtestState {
    export function empty(): BtestState {
        return {
            pages: [],
            visibleItems: [],
            loadingCounter: 0,
            errorFlag: false,
        };
    }
}

export const btestReducer = combineReducers<BtestState>({
    visibleItems: visibleItemsReducer,
    pages: redditReducer,
    loadingCounter: loadingCounterReducer,
    errorFlag: errorFlagReducer,
});
