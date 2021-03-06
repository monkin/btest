import {
    call,
    fork,
    put,
    takeLeading,
    select,
    delay,
    takeLatest,
} from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { loadLocalPages, loadRedditPage, saveLocalPages } from "../api";
import { showMessage } from "react-native-flash-message";
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
    saveRedditPages,
} from "./actions";
import { refreshInterval, subredditName } from "./const";
import {
    selectLastItemId,
    selectPageToUpdate,
    selectRedditPages,
} from "./selectors";
import SplashScreen from "react-native-splash-screen";

export function displayError(error: Error) {
    showMessage({
        message: "Error",
        description: error.message,
    });
}

export function* checkForUpdates() {
    while (true) {
        try {
            const time = yield* call(Date.now);
            const i = (yield* select(selectPageToUpdate))(time);

            // if any page needs to be updated
            if (i !== null) {
                const page = yield* call(loadRedditPage, {
                    subreddit: subredditName,
                    after: i.after,
                });

                const n = (yield* select(selectPageToUpdate))(time);

                // if pages were not updated during request
                if (n?.index === i.index && n.after === i.after) {
                    yield* put(updateRedditPage(i.index, page));
                    yield* put(saveRedditPages());
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
    yield* takeLeading(getType(checkForRedditUpdates), checkForUpdates);
}

/**
 * Load page with 5 attempts in case of network error
 */
export function* loadPage(after?: string) {
    yield* put(incLoadingCounter());
    try {
        // try five times in case of network errors
        for (let i = 0; i < 5; i++) {
            try {
                const page = yield* call(loadRedditPage, {
                    subreddit: subredditName,
                    after: after,
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
            `Failed to load subreddit '${subredditName}' starting from '${after}'`,
        );
    } finally {
        yield* put(decLoadingCounter());
    }
}

/**
 * Listen for next page loading requests
 */
export function* loadNextPageSaga() {
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
                    yield* put(saveRedditPages());
                    return;
                }

                if (!lastItemId) {
                    yield* call(SplashScreen.hide);
                }
            } catch (error) {
                yield call(displayError, error);
            }
        }
    });
}

/**
 * Listen for user initiated refresh
 */
export function* refreshSaga() {
    yield* takeLeading(getType(refreshRedditPages), function* () {
        const firstPage = yield* call(loadRedditPage, {
            subreddit: subredditName,
        });
        yield* put(setRedditPages([firstPage]));
    });
}

/**
 * Save loaded pages to local storage
 */
export function* saveLocalPagesSaga() {
    yield* takeLatest(getType(saveRedditPages), function* () {
        const pages = yield* select(selectRedditPages);
        yield* call(saveLocalPages, subredditName, pages);
    });
}

/**
 * Main saga that init app and start other sagas
 */
export function* btestSaga() {
    // Start data update loop
    yield* fork(updateSaga);
    yield* fork(loadNextPageSaga);
    yield* fork(refreshSaga);
    yield* fork(saveLocalPagesSaga);

    // Trying to load locally stored pages
    const storedPages = yield* call(loadLocalPages, subredditName);
    if (storedPages) {
        yield* put(setRedditPages(storedPages));
        yield* call(SplashScreen.hide);
    } else {
        // Request first page from server if nothig found locally
        yield* put(loadNextRedditPage());
    }

    // Check for updates every minute
    while (true) {
        yield* put(checkForRedditUpdates());
        yield* delay(refreshInterval);
    }
}
