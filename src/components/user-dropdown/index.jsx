import Anchor from "@ui/anchor";
import Image from "next/image";
import { useMoralis } from "react-moralis";
import { useSelector } from "react-redux";
import { getEllipsisTxt } from "@utils/format";
import { utils } from "ethers";

const UserDropdown = () => {
    const { logout, user } = useMoralis();
    const currencyBalances = useSelector((state) => state.currencyBalances);

    const fomatBalance = (balance) => {
        const res = utils.formatEther(balance);
        const round = (+res).toFixed(4);
        return round;
    };

    return (
        <div className="icon-box">
            <Anchor path="#">
                <Image
                    src="/images/icons/unknown-user.png"
                    alt="Images"
                    layout="fixed"
                    width={38}
                    height={38}
                />
            </Anchor>
            <div className="rn-dropdown">
                <div className="rn-inner-top">
                    <h4 className="title">
                        Connected as:{" "}
                        {getEllipsisTxt(user.get("ethAddress") || "")}
                    </h4>
                    <p className="title">{user.get("chain")}</p>
                </div>
                <div className="rn-product-inner">
                    <ul className="product-list">
                        {currencyBalances &&
                            currencyBalances.map((currency) => (
                                <li
                                    className="single-product-list"
                                    key={currency.contract_address}
                                >
                                    <div className="thumbnail">
                                        <Anchor path="#">
                                            <Image
                                                src={`/images/coins/${currency.contract_ticker_symbol.toLowerCase()}.png`}
                                                alt={currency.contract_name}
                                                layout="fixed"
                                                width={25}
                                                height={25}
                                            />
                                        </Anchor>
                                    </div>
                                    <div className="content">
                                        <span className="price">
                                            {fomatBalance(currency.balance)}{" "}
                                            {currency.contract_ticker_symbol}
                                        </span>
                                    </div>
                                    <div className="button" />
                                </li>
                            ))}
                    </ul>
                </div>
                <ul className="list-inner">
                    <li>
                        <Anchor path="/my-rolls">My Rolls</Anchor>
                    </li>
                    <li>
                        <button type="button" onClick={logout}>
                            Sign Out
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default UserDropdown;
