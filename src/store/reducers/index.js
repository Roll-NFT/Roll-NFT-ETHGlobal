import { combineReducers } from "redux";
import balancesReducer from "./balances";
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
    user: userReducer,
    roll: rollReducer,
    category: categoryReducer,
    hero: heroReducer,
    ticket: ticketReducer,
    approved: approveReducer,
});
