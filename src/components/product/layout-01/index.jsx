import { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import CountdownTimer from "@ui/countdown/layout-01";
import ShareDropdown from "@components/share-dropdown";
import ProductBid from "@components/product-bid";
import Button from "@ui/button";
import { ImageType } from "@utils/types";
import PlaceBidModal from "@components/modals/placebid-modal";

const Product = ({
    overlay,
    collection,
    title,
    slug,
    price,
    likeCount,
    auction_date,
    image,
    placeBid,
    ticketSupply,
    ticketsTotal,
    ticketsSold,
    disableShareDropdown,
}) => {
    const [showBidModal, setShowBidModal] = useState(false);
    const handleBidModal = () => {
        setShowBidModal((prev) => !prev);
    };
    return (
        <>
            <div
                className={clsx(
                    "product-style-one",
                    !overlay && "no-overlay",
                    placeBid && "with-placeBid"
                )}
            >
                <div className="card-thumbnail">
                    {image?.src && (
                        <Anchor path={`/roll/${slug}`}>
                            <Image
                                src={image.src}
                                alt={image?.alt || "NFT_portfolio"}
                                width={533}
                                height={533}
                            />
                        </Anchor>
                    )}
                    {auction_date && <CountdownTimer date={auction_date} />}
                    {placeBid && (
                        <Button onClick={handleBidModal} size="small">
                            Place Bid
                        </Button>
                    )}
                </div>
                <div className="product-share-wrapper">
                    <div className="profile-share">
                        <div>
                            {collection}
                            <Anchor path={`/roll/${slug}`}>
                                <span className="product-name">{title}</span>
                            </Anchor>
                        </div>
                    </div>
                    {!disableShareDropdown && (
                        <ShareDropdown
                            shareUrl={`${process.env.NEXT_PUBLIC_APP_URL}/roll/${slug}`}
                        />
                    )}
                </div>

                <div className="latest-bid mt-5">
                    <b>Tickets sold:</b> {ticketsSold}/{ticketSupply}
                </div>
                <div className="latest-bid mt-0">
                    <b>Ticket price:</b> {price.amount} {price.currency}
                </div>
                <ProductBid
                    price={{ amount: ticketsTotal, currency: price.currency }}
                    likeCount={likeCount}
                    ticketsTotal={ticketsTotal}
                />
            </div>
            {placeBid && (
                <PlaceBidModal
                    show={showBidModal}
                    handleModal={handleBidModal}
                />
            )}
        </>
    );
};

Product.propTypes = {
    overlay: PropTypes.bool,
    collection: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    price: PropTypes.shape({
        amount: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired,
    }).isRequired,
    likeCount: PropTypes.number.isRequired,
    auction_date: PropTypes.string,
    image: ImageType.isRequired,
    placeBid: PropTypes.bool,
    ticketSupply: PropTypes.number,
    ticketsTotal: PropTypes.number,
    ticketsSold: PropTypes.number,
    disableShareDropdown: PropTypes.bool,
};

Product.defaultProps = {
    overlay: false,
};

export default Product;
