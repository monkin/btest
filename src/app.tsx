import React from "react";
import { useSelector, Provider, useDispatch } from "react-redux";
import { SafeAreaView, StatusBar } from "react-native";
import FlashMessage from "react-native-flash-message";
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
        onLoadMore,
        onRefresh,
        onViewableItemsChange,
    } = React.useMemo(() => {
        return {
            onRefresh: () => dispatch(refreshRedditPages()),
            onLoadMore: () => dispatch(loadNextRedditPage()),
            onViewableItemsChange: (items: RedditItem[]) => {
                dispatch(setVisibleItems(items));
                dispatch(checkForRedditUpdates());
            },
        };
    }, [dispatch]);

    return (
        <RedditList
            data={useSelector(selectRedditItems)}
            refreshing={useSelector(selectIsLoading)}
            onRefresh={onRefresh}
            onLoadMore={onLoadMore}
            onViewableItemsChange={onViewableItemsChange}
        />
    );
}

export default function App() {
    const store = React.useMemo(createBtestStore, []);
    return (
        <Provider store={store}>
            <StatusBar />
            <SafeAreaView>
                <RedditListConnected />
                <FlashMessage position="bottom" />
            </SafeAreaView>
        </Provider>
    );
}
