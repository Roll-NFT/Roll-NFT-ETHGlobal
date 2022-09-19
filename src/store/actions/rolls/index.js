import { ROLL_UPDATE, CATEGORY_UPDATE, HERO_UPDATE } from "..";

export const rollUpdate = (roll) => ({
    type: ROLL_UPDATE,
    payload: roll,
});

export const categoryUpdate = (category) => ({
    type: CATEGORY_UPDATE,
    payload: category,
});

export const heroUpdate = (hero) => ({
    type: HERO_UPDATE,
    payload: hero,
});
