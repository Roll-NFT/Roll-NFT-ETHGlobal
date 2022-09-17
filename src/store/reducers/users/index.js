import { HYDRATE } from "next-redux-wrapper";
import { USER_UPDATE } from "../../actions";

const initialState = {
    id: null,
    address: null,
};

export const user = (state = initialState, action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.user;
        case USER_UPDATE:
            return action.payload;
        default:
            return state;
    }
};

export default user;
