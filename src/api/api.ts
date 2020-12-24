import axios from "axios";

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
    after?: string;
    timeout?: number;
}): Promise<RedditPage> {
    const { subreddit, limit = 20, after, timeout = 10000 } = options;
    const response = await axios.get<RedditResponse>(
        `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/top.json`,
        {
            timeout: timeout,
            params: { after, limit },
        },
    );
    console.log(`Page loaded: ${JSON.stringify(response.config)}`);
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
    const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
    ).default;
    await AsyncStorage.setItem(`pages.${subreddit}`, JSON.stringify(pages));
}

export async function loadLocalPages(subreddit: string) {
    const AsyncStorage = (
        await import("@react-native-async-storage/async-storage")
    ).default;
    const item = await AsyncStorage.getItem(`pages.${subreddit}`);
    if (item) {
        return JSON.parse(item) as RedditPage[];
    } else {
        return null;
    }
}
