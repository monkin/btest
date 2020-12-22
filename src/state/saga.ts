import {
    all,
    call,
    fork,
    put,
    takeLatest,
    takeLeading,
    select,
    delay,
} from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { loadLocalPages, loadRedditPage } from "../api";
import {
    appendRedditPage,
    refreshRedditPages,
    setRedditPages,
    loadNextRedditPage,
    incLoadingCounter,
    decLoadingCounter,
    checkForRedditUpdates,
    updateRedditPage,
    setErrorFlag,
    clearErrorFlag,
} from "./actions";
import { selectLastItemId, selectPageToUpdate } from "./selectors";

export function displayError(error: Error) {
    setTimeout(() => {
        throw error;
    });
}

const subreddit = "programming";

export function* checkForUpdates() {
    while (true) {
        try {
            const time = yield* call(Date.now);
            const i = (yield* select(selectPageToUpdate))(time);

            // if any page needs to be updated
            if (i !== null) {
                const page = yield* call(loadRedditPage, {
                    subreddit: subreddit,
                    from: i.from,
                });

                const n = (yield* select(selectPageToUpdate))(time);

                // if pages were not updated during request
                if (n?.index === i.index && n.from === i.from) {
                    yield* put(updateRedditPage(i.index, page));
                }
            } else {
                break;
            }
        } catch (error) {
            yield call(displayError, error);
            yield* delay(2000);
        }
    }
}

/**
 * Check that visible pages are not older than one minute
 */
export function* updateSaga() {
    while (true) {
        yield takeLeading(getType(checkForRedditUpdates), checkForUpdates);
    }
}

/**
 * Load page with 5 attempts in case of network error
 */
export function* loadPage(from?: string) {
    yield* put(incLoadingCounter());
    try {
        // try five times in case of network errors
        for (let i = 0; i < 5; i++) {
            try {
                const page = yield* call(loadRedditPage, {
                    subreddit: subreddit,
                    from: from,
                });

                yield* put(clearErrorFlag()); // looks like we have network connection

                return page;
            } catch (error) {
                yield* put(setErrorFlag());
                yield* call(displayError, error);
                yield* delay(2000); // delay next request
            }
        }

        throw new Error(
            `Failed to load subreddit '${subreddit}' starting from '${from}'`,
        );
    } finally {
        yield* put(decLoadingCounter());
    }
}

/**
 * Listen for next page loading requests
 */
export function* loadNextPageSaga() {
    while (true) {
        // Ignore requests while loading the next page
        yield* takeLeading(getType(loadNextRedditPage), function* () {
            while (true) {
                try {
                    const lastItemId = yield* select(selectLastItemId);
                    const page = yield* loadPage(lastItemId ?? undefined);
                    const updatedItemId = yield* select(selectLastItemId);

                    // Append the page if nothing was updated during the request,
                    // repeat otherwise
                    if (lastItemId === updatedItemId) {
                        yield* put(appendRedditPage(page));
                        return;
                    }
                } catch (error) {
                    yield call(displayError, error);
                }
            }
        });
    }
}

/**
 * Listen for user initiated refresh
 */
export function* refreshSaga() {
    yield* takeLatest(getType(refreshRedditPages), function* () {
        const firstPage = yield* call(loadRedditPage, {
            subreddit: subreddit,
        });
        yield* put(appendRedditPage(firstPage));
    });
}

/**
 * Main saga that init app and start other sagas
 */
export function* btestSaga() {
    // Start data update loop
    yield* all([fork(updateSaga), fork(loadNextPageSaga), fork(refreshSaga)]);

    // Trying to load locally stored pages
    const storedPages = yield* call(loadLocalPages, subreddit);
    if (storedPages) {
        yield* put(setRedditPages(storedPages));
    } else {
        // Request first page from server if nothig found locally
        yield* put(loadNextRedditPage());
    }

    // Check for updates every minute
    while (true) {
        yield* put(checkForRedditUpdates());
        yield* delay(60_000);
    }
}
