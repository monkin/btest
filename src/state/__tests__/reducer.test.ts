import { setRedditPages } from "..";
import { RedditPage } from "../../api";
import { appendRedditPage, updateRedditPage } from "../actions";
import { redditReducer } from "../reducer";
import { page } from "./common";

describe("redditReducer", () => {
    it("should set reddit pages", () => {
        const pages: RedditPage[] = [page(0), page(1)];
        expect(redditReducer([], setRedditPages(pages))).toEqual(pages);
    });

    it("should append reddit page", () => {
        const pages: RedditPage[] = [page(0), page(1)];
        expect(redditReducer(pages, appendRedditPage(page(2)))).toEqual([
            page(0),
            page(1),
            page(2),
        ]);
    });

    it("should update reddit page", () => {
        const pages: RedditPage[] = [page(0), page(1)];
        expect(redditReducer(pages, updateRedditPage(1, page(2)))).toEqual([
            page(0),
            page(2),
        ]);
    });
});
