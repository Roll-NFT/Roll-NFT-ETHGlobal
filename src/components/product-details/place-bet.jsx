import { useState, useEffect } from "react";
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
import { rollUpdate } from "@store/actions/rolls";
import { useMoralis } from "react-moralis";

const PlaceBet = ({
    title,
    ticketsSold,
    ticketSupply,
    ticketPrice,
    ticketCurrency,
    endDate,
    host,
    btnColor,
    className,
}) => {
    const [showBidModal, setShowBidModal] = useState(false);
    const [ticket, setTicket] = useState(null);
    const user = useSelector((state) => state.user);
    const router = useRouter();
    const dispatch = useDispatch();
    const { authenticate, isAuthenticated } = useMoralis();
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

    const buyTickets = async () => {
        await axios
            .put(
                `/api/rolls/${slug}`,
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
                console.log(`Tickets acquired successfully!`);
            })
            .catch((errorResponse) => {
                toast("Error updating Raffle, please try again later!");
                console.log("Error saving Raffle: ", errorResponse);
            });
    };

    const onSubmit = async (data) => {
        if (!isAuthenticated) {
            authenticate({
                signingMessage: "Roll NFT Authentication",
            });
            return;
        }
        handleBidModal();
        const _quantity = parseInt(data.quantity, 10);
        const _fee = _quantity * ticketPrice * 0.05;
        const _total = _quantity * ticketPrice + _fee;
        setTicket({
            quantity: _quantity,
            userId: user.id,
            userAddress: user.address,
            total: _total,
            fee: _fee,
            createdAt: new Date(),
        });
    };

    return (
        <>
            <div className={clsx("place-bet-area", className)}>
                <div className="rn-bet-create">
                    <div className="bid-list winning-bid">
                        <h6 className="title mb-3">
                            <b>Tickets sold</b>: {ticketsSold}/{ticketSupply}
                        </h6>
                        <h6 className="title mb-3">
                            <b>Ticket price</b>: {ticketPrice}
                            {ticketCurrency}
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
                                Buy Raffle Tickets
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
    endDate: PropTypes.string,
    host: PropTypes.string,
    btnColor: PropTypes.string,
    className: PropTypes.string,
};

export default PlaceBet;
