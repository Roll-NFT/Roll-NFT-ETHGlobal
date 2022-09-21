import Anchor from "@ui/anchor";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "@utils/format";
import { useSelector } from "react-redux";

const UserDropdown = () => {
    const { logout } = useMoralis();
    const user = useSelector((state) => state.user);

    return (
        <>
            <div>
                Connected as <br />
                <u>{getEllipsisTxt(user.address || "")}</u> <br />
                {user && <span>to {user.chain}</span>}
            </div>
            <div className="mainmenu-wrapper">
                <div className="mainmenu-nav d-none d-xl-block">
                    <div className="mainmenu">
                        <nav
                            id="sideNav"
                            className="mainmenu-nav d-none d-xl-block"
                        >
                            <ul className="ps-1">
                                <li>
                                    <Anchor
                                        path="#"
                                        onClick={logout}
                                        className="its_new"
                                    >
                                        Sign Out
                                    </Anchor>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserDropdown;
