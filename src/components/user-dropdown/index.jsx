import Image from "next/image";
import Anchor from "@ui/anchor";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "@utils/format";

const UserDropdown = () => {
    const { logout, user } = useMoralis();
    return (
        <>
            <div>
                Connected as <br />
                {getEllipsisTxt(user.get("ethAddress") || "")}
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
