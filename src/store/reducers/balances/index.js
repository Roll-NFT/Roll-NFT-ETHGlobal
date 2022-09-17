/* eslint-disable indent */
import { HYDRATE } from "next-redux-wrapper";
import { BALANCES_UPDATE, BALANCES_RESET, BALANCE_SELECT } from "../../actions";

const initialState = {
    id: 0,
    attributes: null,
    collection: null,
    contract_address: null,
    description: "",
    image: null,
    supports_erc: null,
    title: "",
    token_balance: null,
    token_id: null,
    selected: false,
};

export const balance = (state = initialState, action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.balance;
        case BALANCE_SELECT:
            return state.id === action.id
                ? {
                      ...state,
                      selected: true,
                  }
                : {
                      ...state,
                      selected: false,
                  };
        default:
            return state;
    }
};

export const balances = (state = [initialState], action = { type: null }) => {
    switch (action.type) {
        case HYDRATE:
            return action.payload.balances;
        case BALANCES_UPDATE:
            return action.payload;
        case BALANCES_RESET:
            return [];
        case BALANCE_SELECT:
            return state.map((item) => balance(item, action));
        default:
            return state;
    }
};

export default balances;
