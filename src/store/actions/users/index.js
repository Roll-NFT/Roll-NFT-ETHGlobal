import { USER_UPDATE, USER_LOGOUT } from "..";

export const userUpdate = (user) => ({
    type: USER_UPDATE,
    payload: user,
});

export const userLogout = (user) => ({
    type: USER_LOGOUT,
    payload: user,
});
