import { HYDRATE } from "next-redux-wrapper";
import {
    ROLL_UPDATE,
    CATEGORY_UPDATE,
    HERO_UPDATE,
    TICKET_UPDATE,
    APPROVE_UPDATE,
} from "../../actions";

export const rollReducer = (state = null, action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.roll;
        case ROLL_UPDATE:
            return action.payload;
        default:
            return state;
    }
};

export const categoryReducer = (state = "all", action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.category;
        case CATEGORY_UPDATE:
            return action.payload;
        default:
            return state;
    }
};

export const heroReducer = (state = [], action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.hero;
        case HERO_UPDATE:
            return action.payload;
        default:
            return state;
    }
};

export const ticketReducer = (state = null, action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.ticket;
        case TICKET_UPDATE:
            return action.payload;
        default:
            return state;
    }
};

export const approveReducer = (state = null, action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.approved;
        case APPROVE_UPDATE:
            return action.payload;
        default:
            return state;
    }
};
