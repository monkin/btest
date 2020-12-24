import React, { useCallback } from "react";
import { FlatList, ViewToken } from "react-native";
import { Divider } from "react-native-elements";
import { RedditItem } from "../api";
import { RedditPost } from "./RedditPost";

export interface RedditListProps {
    data: RedditItem[];
    refreshing: boolean;
    onRefresh: () => void;
    onLoadMore: () => void;
    onViewableItemsChange: (items: RedditItem[]) => void;
    onScroll: () => void;
}

export function RedditList({
    data,
    onRefresh,
    onLoadMore,
    refreshing,
    onViewableItemsChange,
    onScroll,
}: RedditListProps) {
    const handleViewableItemsChange = useCallback(
        ({
            viewableItems,
        }: {
            viewableItems: ViewToken[];
            changed: ViewToken[];
        }) => {
            onViewableItemsChange(viewableItems.map(v => v.item));
        },
        [onViewableItemsChange],
    );
    return (
        <FlatList<RedditItem>
            data={data}
            keyExtractor={(v, i) => `${v.name}_${i}`}
            renderItem={item => <RedditPost data={item.item} />}
            ItemSeparatorComponent={Divider}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onEndReached={onLoadMore}
            onViewableItemsChanged={handleViewableItemsChange}
            onScroll={onScroll}
        />
    );
}
