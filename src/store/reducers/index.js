import { combineReducers } from "redux";
import { USER_LOGOUT } from "../actions";
import { balancesReducer, currencyBalancesReducer } from "./balances";
// import userReducer from "./users";
import {
    rollReducer,
    categoryReducer,
    heroReducer,
    ticketReducer,
    approveReducer,
} from "./rolls";

const appReducer = combineReducers({
    balances: balancesReducer,
    currencyBalances: currencyBalancesReducer,
    // user: userReducer,
    roll: rollReducer,
    category: categoryReducer,
    hero: heroReducer,
    ticket: ticketReducer,
    approved: approveReducer,
});

const rootReducer = (state, action) => {
    if (action.type === USER_LOGOUT) {
        localStorage.removeItem("redux-store");
        return appReducer(undefined, action);
    }
    return appReducer(state, action);
};

export default rootReducer;
