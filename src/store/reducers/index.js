import { combineReducers } from "redux";
import { balancesReducer, currencyBalancesReducer } from "./balances";
import userReducer from "./users";
import {
    rollReducer,
    categoryReducer,
    heroReducer,
    ticketReducer,
    approveReducer,
} from "./rolls";

export default combineReducers({
    balances: balancesReducer,
    currencyBalances: currencyBalancesReducer,
    user: userReducer,
    roll: rollReducer,
    category: categoryReducer,
    hero: heroReducer,
    ticket: ticketReducer,
    approved: approveReducer,
});
