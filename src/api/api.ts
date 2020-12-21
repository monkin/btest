import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { selectVisibleItems } from "../state";

export interface RedditItem {
    /**
     * Id
     */
    name: string;
    title: string;
    score: number;
    url?: string;
    permalink: string;
}

export interface RedditResponse {
    kind: string;
    data: {
        dist: number;
        children: {
            kind: string;
            data: {
                name: string;
                title: string;
                score: number;
                url?: string;
                permalink: string;
                // ... some other fields
            };
        }[];
    };
}

export interface RedditPage {
    responseTime: number;
    items: RedditItem[];
}

export namespace RedditPage {
    export function lastItem({ items }: RedditPage) {
        if (items.length) {
            return items[items.length - 1];
        } else {
            return null;
        }
    }
}

export async function loadRedditPage(options: {
    subreddit: string;
    limit?: number;
    from?: string;
    timeout?: number;
}): Promise<RedditPage> {
    const { subreddit, limit = 20, from, timeout = 10_000 } = options;
    const response = await axios.get<RedditResponse>(
        `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/top.json`,
        {
            timeout: timeout,
            data: { from, limit },
        },
    );
    return {
        responseTime: Date.now(),
        items: response.data.data.children.map(
            // remove unused fields
            ({ data: { name, score, title, permalink, url } }) => {
                return {
                    name,
                    score,
                    title,
                    permalink,
                    url,
                };
            },
        ),
    };
}

export async function saveLocalPages(subreddit: string, pages: RedditPage[]) {
    await AsyncStorage.setItem(`pages.${subreddit}`, JSON.stringify(pages));
}

export async function loadLocalPages(subreddit: string) {
    const item = await AsyncStorage.getItem(`pages.${subreddit}`);
    if (item) {
        return JSON.parse(item) as RedditPage[];
    } else {
        return null;
    }
}
