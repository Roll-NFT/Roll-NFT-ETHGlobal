import { combineReducers } from "redux";
import balancesReducer from "./balances";
import userReducer from "./users";
import { rollReducer, categoryReducer, heroReducer } from "./rolls";

export default combineReducers({
    balances: balancesReducer,
    user: userReducer,
    roll: rollReducer,
    category: categoryReducer,
    hero: heroReducer,
});
