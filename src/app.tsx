import React from "react";
import { useSelector, Provider, useDispatch } from "react-redux";
import { SafeAreaView, StatusBar } from "react-native";
import {
    checkForRedditUpdates,
    createBtestStore,
    loadNextRedditPage,
    refreshRedditPages,
    selectIsLoading,
    selectRedditItems,
    setVisibleItems,
} from "./state";
import { RedditList } from "./ui";
import { RedditItem } from "./api";

function RedditListConnected() {
    const dispatch = useDispatch();
    const {
        onScroll,
        onLoadMore,
        onRefresh,
        onViewableItemsChange,
    } = React.useMemo(() => {
        return {
            onScroll: () => dispatch(checkForRedditUpdates()),
            onRefresh: () => dispatch(refreshRedditPages()),
            onLoadMore: () => dispatch(loadNextRedditPage()),
            onViewableItemsChange: (items: RedditItem[]) =>
                dispatch(setVisibleItems(items)),
        };
    }, [dispatch]);

    return (
        <RedditList
            data={useSelector(selectRedditItems)}
            refreshing={useSelector(selectIsLoading)}
            onRefresh={onRefresh}
            onLoadMore={onLoadMore}
            onViewableItemsChange={onViewableItemsChange}
            onScroll={onScroll}
        />
    );
}

export default function App() {
    const store = React.useMemo(createBtestStore, []);
    // React.useMemo(() => import("./state"), []);
    return (
        <Provider store={store}>
            <StatusBar />
            <SafeAreaView>
                <RedditListConnected />
            </SafeAreaView>
        </Provider>
    );
}
