import PropTypes from "prop-types";
import clsx from "clsx";
import { useMoralis, useChain } from "react-moralis";
import Logo from "@components/logo";
import MainMenu from "@components/menu/main-menu";
import MobileMenu from "@components/menu/mobile-menu";
import UserDropdown from "@components/user-dropdown";
import ColorSwitcher from "@components/color-switcher";
import BurgerButton from "@ui/burger-button";
import Button from "@ui/button";
import { useOffcanvas, useSticky } from "@hooks";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
    balancesUpdate,
    currencyBalancesUpdate,
} from "@store/actions/balances";
import headerData from "../data/header.json";
import menuData from "../data/menu.json";

const Header = ({ className }) => {
    const sticky = useSticky();
    const { offcanvas, offcanvasHandler } = useOffcanvas();
    const { authenticate, isAuthenticated, user, setUserData } = useMoralis();
    const { chain } = useChain();
    const dispatch = useDispatch();
    const balances = useSelector((state) => state.balances);

    const prepareNFTBalances = (obj, network) =>
        obj.items
            .filter(
                (item) =>
                    item.type === "nft" && item.supports_erc.includes("erc721")
            )
            .map((collection, i) =>
                collection.nft_data.map((nft, j) => ({
                    id: (i + 1) * 100 + j,
                    collection: collection.contract_name,
                    contract_address: collection.contract_address,
                    network,
                    token_id: nft.token_id,
                    token_balance: nft.token_balance,
                    title: nft.external_data.name,
                    description: nft.external_data.description,
                    image: nft.external_data.image,
                    attributes: nft.external_data.attributes,
                    supports_erc: nft.supports_erc,
                    type: "nft",
                }))
            )
            .flat();

    const prepareCurrencyBalances = (obj, network, supportedCurrency) =>
        obj.items
            .filter(
                (item) =>
                    item.type === "cryptocurrency" &&
                    item.supports_erc.includes("erc20") &&
                    supportedCurrency.includes(item.contract_ticker_symbol)
            )
            .map((coin, i) => ({
                id: i,
                network,
                ...coin,
            }))

            .flat();

    const getBalances = async (address, network) => {
        const covalentKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY;
        const covalentEndpoint = process.env.NEXT_PUBLIC_COVALENT_ENDPOINT;
        const covalentUrl = `${covalentEndpoint}/${network}/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=${covalentKey}`;
        await axios(covalentUrl)
            .then((response) => {
                const nftBalances = prepareNFTBalances(
                    response.data.data,
                    network
                );
                dispatch(balancesUpdate(nftBalances));

                const supportedCurrency =
                    process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES.split(",");
                const currencyBalances = prepareCurrencyBalances(
                    response.data.data,
                    network,
                    supportedCurrency
                );
                dispatch(currencyBalancesUpdate(currencyBalances));
            })
            .catch((errorResponse) => {
                console.log("Error fetching data: ", errorResponse);
            });
    };

    useEffect(() => {
        if (user) {
            getBalances(user.get("ethAddress"), user.get("networkId"));
        }
    }, [user]);

    useEffect(() => {
        if (user && chain) {
            const { chainId } = chain;
            setUserData({
                chain: chain.name,
                chainId,
                blockExplorerUrl: chain.blockExplorerUrl,
                faucets: chain.faucets,
                networkId: chain.networkId,
                currency: chain.nativeCurrency,
            });
        }
    }, [user, chain]);

    // useEffect(() => {
    //     if (userApp) {
    //         if (
    //             userApp.chainId !== process.env.NEXT_PUBLIC_APP_CHAIN_ID_HEX &&
    //             userApp.chainId !== process.env.NEXT_PUBLIC_APP_CHAIN_ID_HEX_ALT
    //         ) {
    //             Router.push("/error");
    //         }
    //     }
    // }, []);

    return (
        <>
            <header
                className={clsx(
                    "rn-header haeder-default black-logo-version header--fixed header--sticky",
                    sticky && "sticky",
                    className
                )}
            >
                <div className="container">
                    <div className="header-inner">
                        <div className="header-left">
                            <Logo logo={headerData.logo} />
                            <div className="mainmenu-wrapper">
                                <nav
                                    id="sideNav"
                                    className="mainmenu-nav d-none d-xl-block"
                                >
                                    <MainMenu menu={menuData} />
                                </nav>
                            </div>
                        </div>
                        <div className="header-right">
                            {/* <div className="setting-option d-none d-lg-block">
                                <SearchForm />
                            </div>
                            <div className="setting-option rn-icon-list d-block d-lg-none">
                                <div className="icon-box search-mobile-icon">
                                    <button
                                        type="button"
                                        aria-label="Click here to open search form"
                                        onClick={searchHandler}
                                    >
                                        <i className="feather-search" />
                                    </button>
                                </div>
                                <FlyoutSearchForm isOpen={search} />
                            </div> */}
                            {!isAuthenticated && (
                                <div className="setting-option header-btn">
                                    <div className="icon-box">
                                        <Button
                                            color="primary-alta"
                                            className="connectBtn"
                                            size="small"
                                            onClick={() =>
                                                authenticate({
                                                    signingMessage:
                                                        "Roll NFT Authentication",
                                                })
                                            }
                                        >
                                            Wallet connect
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {isAuthenticated && (
                                <div className="setting-option rn-icon-list user-account">
                                    <UserDropdown />
                                </div>
                            )}
                            {/* <div className="setting-option rn-icon-list notification-badge">
                                <div className="icon-box">
                                    <Anchor path={headerData.activity_link}>
                                        <i className="feather-bell" />
                                        <span className="badge">6</span>
                                    </Anchor>
                                </div>
                            </div> */}
                            <div className="setting-option mobile-menu-bar d-block d-xl-none">
                                <div className="hamberger">
                                    <BurgerButton onClick={offcanvasHandler} />
                                </div>
                            </div>
                            <div
                                id="my_switcher"
                                className="setting-option my_switcher"
                            >
                                <ColorSwitcher />
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <MobileMenu
                isOpen={offcanvas}
                onClick={offcanvasHandler}
                menu={menuData}
                logo={headerData.logo}
            />
        </>
    );
};

Header.propTypes = {
    className: PropTypes.string,
};

export default Header;
