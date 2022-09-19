import { HYDRATE } from "next-redux-wrapper";
import { ROLL_UPDATE, CATEGORY_UPDATE } from "../../actions";

export const rollReducer = (state = null, action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.user;
        case ROLL_UPDATE:
            return action.payload;
        default:
            return state;
    }
};

export const categoryReducer = (state = "all", action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.user;
        case CATEGORY_UPDATE:
            return action.payload;
        default:
            return state;
    }
};
