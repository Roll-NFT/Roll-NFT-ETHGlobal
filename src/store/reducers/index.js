import { combineReducers } from "redux";
import balancesReducer from "./balances";
import userReducer from "./users";

export default combineReducers({
    balances: balancesReducer,
    user: userReducer,
});
