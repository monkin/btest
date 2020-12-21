import { createSelector } from "reselect";
import { RedditItem, RedditPage } from "../api";
import { BtestState } from "./reducer";

export function selectRedditPages(state: BtestState) {
    return state.pages;
}

export function selectVisibleItems(state: BtestState) {
    return state.visibleItems;
}

export function selectIsLoading(state: BtestState) {
    return state.loadingCounter !== 0;
}

export const selectRedditItems = createSelector(selectRedditPages, pages => {
    return pages.reduce((items, page) => {
        items.push(...page.items);
        return items;
    }, [] as RedditItem[]);
});

/**
 * Last loaded reddit item id
 */
export const selectLastItemId = createSelector(selectRedditItems, items =>
    items.length ? items[items.length - 1].name : null,
);

export const selectLastVisiblePage = createSelector(
    selectRedditPages,
    selectVisibleItems,
    (pages, visibleItems) => {
        const visibleIds = new Set(visibleItems.map(item => item.name));
        for (let i = pages.length - 1; i >= 0; i--) {
            if (pages[i].items.some(item => visibleIds.has(item.name))) {
                return i;
            }
        }
        return pages.length ? 0 : null;
    },
);

/**
 * Trying to find page older than one minute
 * @returns (currentTime) => pageIndex;
 */
export const selectPageToUpdate = createSelector(
    selectRedditPages,
    selectLastVisiblePage,
    (pages, last) => {
        return (time: number) => {
            for (let i = 0; last !== null && i <= last; i++) {
                const page = pages[i];
                if (time - page.responseTime > 60_000) {
                    // if page is older than one minute
                    return {
                        index: i,
                        from: i
                            ? RedditPage.lastItem(pages[i - 1])?.name
                            : undefined,
                    };
                }
            }
            return null;
        };
    },
);
