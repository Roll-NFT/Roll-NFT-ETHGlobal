import { useState } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import PropTypes from "prop-types";
import Anchor from "@ui/anchor";
import Button from "@ui/button";
import PlaceBidModal from "@components/modals/placebid-modal";
import Countdown from "@ui/countdown/layout-02";
import { ImageType } from "@utils/types";
import ErrorText from "@ui/error-text";
import { getEllipsisTxt } from "@utils/format";

const PlaceBet = ({ highest_bid, auction_date, btnColor, className }) => {
    const [showBidModal, setShowBidModal] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
    });
    const handleBidModal = () => {
        setShowBidModal((prev) => !prev);
    };
    return (
        <>
            <div className={clsx("place-bet-area", className)}>
                <div className="rn-bet-create">
                    <div className="bid-list winning-bid">
                        {/* <div className="latest-bid mt-5">
                            <b>Tickets sold:</b> xxxxx
                        </div>
                        <div className="latest-bid mt-0">
                            <b>Ticket price:</b> xxxxx
                        </div> */}
                        <h6 className="title mb-3">
                            <b>Tickets sold</b>: 100/500
                        </h6>
                        <h6 className="title mb-3">
                            <b>Ticket price</b>: 0.5 ETH
                        </h6>
                        <h6 className="title mb-3">
                            <b>Host</b>:{" "}
                            <Anchor path="#">
                                {getEllipsisTxt(
                                    "0xe220825b597e4D5867218E0Efa9684Dd26957b00"
                                )}
                            </Anchor>
                        </h6>
                    </div>
                    {auction_date && (
                        <div className="bid-list left-bid">
                            <h6 className="title">Time remaining:</h6>
                            <Countdown className="mt--15" date={auction_date} />
                        </div>
                    )}
                </div>
                <div className="row mt--20">
                    <div className="col-md-2">
                        <input
                            id="quantity"
                            placeholder="Quantity"
                            className="h-100 border border-4 raffleQuantity"
                            {...register("quantity", {
                                required: "Qty is required",
                            })}
                        />
                        {errors.quantity && (
                            <ErrorText>{errors.quantity?.message}</ErrorText>
                        )}
                    </div>
                    <div className="col-md-1" />
                    <div className="col-md-9">
                        <Button
                            color={btnColor || "primary-alta"}
                            onClick={handleBidModal}
                        >
                            Buy Raffle Tickets
                        </Button>
                    </div>
                </div>
            </div>
            <PlaceBidModal show={showBidModal} handleModal={handleBidModal} />
        </>
    );
};

PlaceBet.propTypes = {
    highest_bid: PropTypes.shape({
        amount: PropTypes.string,
        bidder: PropTypes.shape({
            name: PropTypes.string,
            image: ImageType,
            slug: PropTypes.string,
        }),
    }),
    auction_date: PropTypes.string,
    btnColor: PropTypes.string,
    className: PropTypes.string,
};

export default PlaceBet;
