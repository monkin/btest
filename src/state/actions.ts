import { createAction } from "typesafe-actions";
import { RedditItem, RedditPage } from "../api";

export const setRedditPages = createAction(
    "reddit/set-pages",
    (pages: RedditPage[]) => pages,
)();
export const updateRedditPage = createAction(
    "reddit/update-page",
    (page: number, data: RedditPage) => ({ page, data }),
)();
export const appendRedditPage = createAction(
    "reddit/append-page",
    (data: RedditPage) => ({ data }),
)();
export const refreshRedditPages = createAction("reddit/refresh-pages")();
export const loadNextRedditPage = createAction("reddit/load-next-page")();
export const checkForRedditUpdates = createAction("reddit/check-for-updates")();
export const saveRedditPages = createAction("reddit/save-reddit-pages")();

export const setVisibleItems = createAction(
    "visible-items/set",
    (items: RedditItem[]) => items,
)();

export const incLoadingCounter = createAction("loading-counter/inc")();
export const decLoadingCounter = createAction("loading-counter/dec")();

export const setErrorFlag = createAction("error-flag/set")();
export const clearErrorFlag = createAction("error-flag/clear")();
