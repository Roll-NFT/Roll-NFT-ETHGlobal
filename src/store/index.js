import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import reducers from "./reducers";

const saver = (store) => (next) => (action) => {
    const result = next(action);
    localStorage["redux-store"] = JSON.stringify(store.getState());
    return result;
};

function loadState() {
    try {
        const serializedState = localStorage.getItem("redux-store");
        if (!serializedState) return undefined;
        return JSON.parse(serializedState);
    } catch (e) {
        return undefined;
    }
}

const makeStore = () => {
    // Create store
    const store = configureStore({
        reducer: reducers,
        middleware: [saver],
        devTools: true,
        preloadedState: loadState(),
    });

    // Return store
    return store;
};

// export an assembled wrapper
export const storeWrapper = createWrapper(makeStore, { debug: false });
