import { ROLL_UPDATE, CATEGORY_UPDATE } from "..";

export const rollUpdate = (roll) => ({
    type: ROLL_UPDATE,
    payload: roll,
});

export const categoryUpdate = (category) => ({
    type: CATEGORY_UPDATE,
    payload: category,
});
