import { BtestState } from "../reducer";
import { selectLastVisiblePage } from "../selectors";
import { item, page } from "./common";

describe("selectLastVisiblePage", () => {
    it("should return 0 if no 'visibleItems' in state", () => {
        expect(
            selectLastVisiblePage({
                ...BtestState.empty(),
                pages: Array(5)
                    .fill(null)
                    .map((_, i) => page(i)),
            }),
        ).toEqual(0);
    });

    it("should return 0 if visible item not found in pages", () => {
        expect(
            selectLastVisiblePage({
                ...BtestState.empty(),
                visibleItems: [item("_not_found")],
                pages: Array(5)
                    .fill(null)
                    .map((_, i) => page(i)),
            }),
        ).toEqual(0);
    });

    it("should return last visible page index if 'visibleItems' are in state", () => {
        expect(
            selectLastVisiblePage({
                ...BtestState.empty(),
                pages: Array(5)
                    .fill(null)
                    .map((_, i) => page(i)),
                visibleItems: [item("_3_3"), item("_1_7")],
            }),
        ).toEqual(3);
    });
});
