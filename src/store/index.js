import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import reducers from "./reducers";

const makeStore = () => {
    // Create store
    const store = configureStore({ reducer: reducers, devTools: true });

    // Return store
    return store;
};

// export an assembled wrapper
export const storeWrapper = createWrapper(makeStore, { debug: false });
