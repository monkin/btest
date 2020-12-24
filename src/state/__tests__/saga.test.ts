import { call, delay, put } from "typed-redux-saga/macro";
import {
    clearErrorFlag,
    decLoadingCounter,
    incLoadingCounter,
    setErrorFlag,
} from "../actions";
import { loadRedditPage } from "../../api";
import { displayError, loadPage } from "../saga";
import { page } from "./common";

describe("loadPage", () => {
    const gen = loadPage();

    it("should increment loading counter on start", () => {
        expect(gen.next().value).toEqual(put(incLoadingCounter()));
    });

    it("should request the page", () => {
        expect(gen.next().value).toEqual(
            call(loadRedditPage, {
                subreddit: "programming",
                after: undefined,
            }),
        );
    });

    it("should set error flag in case of fail", () => {
        expect(gen.throw(new Error("fail")).value).toEqual(put(setErrorFlag()));
    });

    it("should display error", () => {
        expect(gen.next().value).toEqual(call(displayError, new Error("fail")));
    });

    it("should wait for two seconds befor the next attempt", () => {
        expect(gen.next().value).toEqual(delay(2000));
    });

    it("should try to request the page again", () => {
        expect(gen.next().value).toEqual(
            call(loadRedditPage, {
                subreddit: "programming",
                after: undefined,
            }),
        );
    });

    it("should clear error flag in case of success", () => {
        expect(gen.next(page(1)).value).toEqual(put(clearErrorFlag()));
    });

    it("should decrement loading counter before return", () => {
        expect(gen.next().value).toEqual(put(decLoadingCounter()));
    });

    it("sould return the loaded page", () => {
        expect(gen.next()).toEqual({ done: true, value: page(1) });
    });
});
