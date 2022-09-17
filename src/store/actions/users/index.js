import { USER_UPDATE } from "..";

export const userUpdate = (user) => ({
    type: USER_UPDATE,
    payload: user,
});
