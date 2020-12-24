import React from "react";
import { Linking } from "react-native";
import { ListItem } from "react-native-elements";
import { RedditItem } from "../api";

export interface RedditPostProps {
    data: RedditItem;
}

export function RedditPost({ data }: RedditPostProps) {
    const url = data.url || `https://www.reddit.com/${data.permalink}`;
    return (
        <ListItem onPress={() => Linking.openURL(url)}>
            <ListItem.Content>
                <ListItem.Title>{data.title}</ListItem.Title>
                <ListItem.Subtitle>{url}</ListItem.Subtitle>
            </ListItem.Content>
        </ListItem>
    );
}
