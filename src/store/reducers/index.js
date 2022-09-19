import { combineReducers } from "redux";
import balancesReducer from "./balances";
import userReducer from "./users";
import { rollReducer, categoryReducer } from "./rolls";

export default combineReducers({
    balances: balancesReducer,
    user: userReducer,
    roll: rollReducer,
    category: categoryReducer,
});
