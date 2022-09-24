import {
    BALANCES_UPDATE,
    BALANCES_RESET,
    BALANCE_SELECT,
    CURRENCY_BALANCES_UPDATE,
} from "..";

export const balancesUpdate = (balances) => ({
    type: BALANCES_UPDATE,
    payload: balances,
});

export const balancesReset = () => ({
    type: BALANCES_RESET,
});

export const balanceSelect = (id) => ({
    type: BALANCE_SELECT,
    id,
});

export const currencyBalancesUpdate = (balances) => ({
    type: CURRENCY_BALANCES_UPDATE,
    payload: balances,
});
