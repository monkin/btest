import { RedditItem, RedditPage } from "../../api";

export function item(suffix: string): RedditItem {
    return {
        name: `name_${suffix}`,
        permalink: `/r/permalink_${suffix}`,
        score: 100,
        title: `title_${suffix}`,
        url: `https://url_${suffix}.com/`,
    };
}

export function page(id: number, time = id * 60_000): RedditPage {
    return {
        responseTime: time,
        items: Array(20)
            .fill(null)
            .map((_, i) => item(`_${id}_${i}`)),
    };
}
