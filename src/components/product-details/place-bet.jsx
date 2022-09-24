import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import PropTypes from "prop-types";
import Anchor from "@ui/anchor";
import Button from "@ui/button";
import PlaceBidModal from "@components/modals/placebid-modal";
import Countdown from "@ui/countdown/layout-02";
import ErrorText from "@ui/error-text";
import { getEllipsisTxt } from "@utils/format";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import axios from "axios";
import { rollUpdate, ticketUpdate } from "@store/actions/rolls";
import { useMoralis, useChain } from "react-moralis";
import erc20Token from "@lib/ERC20.json";
import { NetworkType } from "@utils/types";

const PlaceBet = ({
    title,
    ticketsSold,
    ticketSupply,
    ticketPrice,
    ticketCurrency,
    network,
    endDate,
    host,
    btnColor,
    className,
}) => {
    const [showBidModal, setShowBidModal] = useState(false);
    const [currencyMapping, setCurrencyMapping] = useState(null);
    const [currencyContract, setCurrencyContract] = useState(null);
    const router = useRouter();
    const dispatch = useDispatch();
    const ticket = useSelector((state) => state.ticket);
    const { authenticate, isAuthenticated, user } = useMoralis();
    const { chain } = useChain();
    const { slug } = router.query;
    const stock = ticketSupply - ticketsSold;
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });

    const handleBidModal = () => {
        setShowBidModal((prev) => !prev);
    };

    const availableCurrencies = () => {
        const _currencies = process.env.NEXT_PUBLIC_CURRENCIES.split(",");
        const _addresses =
            process.env.NEXT_PUBLIC_CURRENCIES_ADDRESSES.split(",");
        const currenciesMapping = {};
        for (let i = 0; i < _currencies.length; i++) {
            currenciesMapping[_currencies[i]] = _addresses[i];
        }
        setCurrencyMapping(currenciesMapping);
    };

    const getCurrencyContract = async () => {
        const erc20TokenAddress = currencyMapping[ticketCurrency.toUpperCase()];
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            erc20TokenAddress,
            erc20Token.abi,
            signer
        );
        setCurrencyContract(contract);
    };

    const saveTicketsDB = async () => {
        await axios
            .put(
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/rolls/${slug}`,
                { ticket },
                {
                    headers: {
                        "content-type": "application/json",
                    },
                }
            )
            .then((response) => {
                handleBidModal();
                dispatch(rollUpdate(response.data.data));
                toast(`Tickets acquired successfully!`);
            })
            .catch((errorResponse) => {
                toast("Error updating Roll, please try again later!");
                console.log(errorResponse);
            });
    };

    const buyTickets = async () => {
        const wei = ethers.utils.parseUnits(ticket.total.toString(), 18);
        const txn = await currencyContract.transfer(
            process.env.NEXT_PUBLIC_CORE_CONTRACT,
            wei
        );
    };

    const onSubmit = async (data) => {
        if (!isAuthenticated) {
            authenticate({
                signingMessage: "Roll NFT Authentication",
            });
            return;
        }
        if (chain && network.id !== chain.networkId) {
            toast(`Wrong network! Please change to network #${network.name}`);
            return;
        }
        handleBidModal();
        const _quantity = parseInt(data.quantity, 10);
        const _fee = _quantity * ticketPrice * 0.05;
        const _total = _quantity * ticketPrice + _fee;
        dispatch(
            ticketUpdate({
                quantity: _quantity,
                userId: user.id,
                userAddress: user.get("ethAddress"),
                total: _total,
                fee: _fee,
                createdAt: new Date(),
            })
        );
    };

    useEffect(() => {
        const onTokenTransfer = (from, to, value) => {
            saveTicketsDB();
        };
        if (currencyContract) {
            currencyContract.on("Transfer", onTokenTransfer);
        }
        return () => {
            if (currencyContract) {
                currencyContract.off("Transfer", onTokenTransfer);
            }
        };
    }, [currencyContract]);

    useEffect(() => {
        if (isAuthenticated) {
            getCurrencyContract();
        }
    }, [user]);

    useEffect(() => {
        availableCurrencies();
    }, []);

    return (
        <>
            <div className={clsx("place-bet-area", className)}>
                <div className="rn-bet-create">
                    <div className="bid-list winning-bid">
                        <h6 className="title mb-3">
                            <b>Tickets sold</b>: {ticketsSold}/{ticketSupply}
                        </h6>
                        <h6 className="title mb-3">
                            <b>Ticket price</b>: {ticketPrice} {ticketCurrency}
                        </h6>
                        <h6 className="title mb-3">
                            <b>Host</b>:{" "}
                            <Anchor
                                path={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${host}`}
                            >
                                {getEllipsisTxt(host || "")}
                            </Anchor>
                        </h6>
                    </div>
                    {endDate && (
                        <div className="bid-list left-bid">
                            <h6 className="title">Time remaining:</h6>
                            <Countdown className="mt--15" date={endDate} />
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row mt--20">
                        <div className="col-md-2">
                            <input
                                id="quantity"
                                placeholder="Quantity"
                                className="h-100 border border-4 raffleQuantity"
                                {...register("quantity", {
                                    required: "Qty is required",
                                    min: {
                                        value: 1,
                                        message: "Qty is required",
                                    },
                                    max: {
                                        value: stock,
                                        message: "Unavailable",
                                    },
                                })}
                            />
                            {errors.quantity && (
                                <ErrorText>
                                    {errors.quantity?.message}
                                </ErrorText>
                            )}
                        </div>
                        <div className="col-md-1" />
                        <div className="col-md-9">
                            <Button
                                type="submit"
                                color={btnColor || "primary-alta"}
                                // onClick={handleBidModal}
                            >
                                Buy Roll Tickets
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
            {ticket && (
                <PlaceBidModal
                    show={showBidModal}
                    cancel={handleBidModal}
                    confirm={buyTickets}
                    title={title}
                    ticketPrice={ticketPrice}
                    ticketCurrency={ticketCurrency}
                    ticket={ticket}
                />
            )}
        </>
    );
};

PlaceBet.propTypes = {
    title: PropTypes.string,
    ticketsSold: PropTypes.number,
    ticketSupply: PropTypes.number,
    ticketPrice: PropTypes.number,
    ticketCurrency: PropTypes.string,
    network: PropTypes.objectOf(NetworkType),
    endDate: PropTypes.string,
    host: PropTypes.string,
    btnColor: PropTypes.string,
    className: PropTypes.string,
};

export default PlaceBet;
