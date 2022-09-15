import PropTypes from "prop-types";
import clsx from "clsx";
import Sticky from "@ui/sticky";
import GalleryTab from "@components/product-details/gallery-tab";
import ProductTitle from "@components/product-details/title";
import BidTab from "@components/product-details/bid-tab";
import PlaceBet from "@components/product-details/place-bet";
import { ImageType } from "@utils/types";

// Demo Image

const ProductDetailsArea = ({ space, className, product }) => (
    <div
        className={clsx(
            "product-details-area",
            space === 1 && "rn-section-gapTop",
            className
        )}
    >
        <div className="container">
            <div className="row g-5">
                <div className="col-lg-6 col-md-12 col-sm-12">
                    <Sticky>
                        <GalleryTab images={product.images} />
                    </Sticky>
                </div>
                <div className="col-lg-6 col-md-12 col-sm-12 mt_md--50 mt_sm--60">
                    <div className="rn-pd-content-area">
                        <span>Collection name</span>
                        <ProductTitle
                            title={product.title}
                            likeCount={product.likeCount}
                        />
                        <div className="bid">
                            <span className="price me-4">
                                <b>Total Ticket Value:</b>{" "}
                                {product.price.amount}
                                {product.price.currency}
                            </span>
                            <span className="me-4">
                                <b>|</b>
                            </span>
                            <span className="price">
                                <b>NFT Floor price:</b> {product.price.amount}
                                {product.price.currency}
                            </span>
                        </div>

                        <div className="rn-bid-details">
                            <PlaceBet
                                highest_bid={product.highest_bid}
                                auction_date={product?.auction_date}
                            />
                            <br />
                            <BidTab
                                bids={product?.bids}
                                owner={product.owner}
                                properties={product?.properties}
                                tags={product?.tags}
                                history={product?.history}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

ProductDetailsArea.propTypes = {
    space: PropTypes.oneOf([1, 2]),
    className: PropTypes.string,
    product: PropTypes.shape({
        title: PropTypes.string.isRequired,
        likeCount: PropTypes.number,
        price: PropTypes.shape({
            amount: PropTypes.number.isRequired,
            currency: PropTypes.string.isRequired,
        }).isRequired,
        owner: PropTypes.shape({}),
        collection: PropTypes.shape({}),
        bids: PropTypes.arrayOf(PropTypes.shape({})),
        properties: PropTypes.arrayOf(PropTypes.shape({})),
        tags: PropTypes.arrayOf(PropTypes.shape({})),
        history: PropTypes.arrayOf(PropTypes.shape({})),
        highest_bid: PropTypes.shape({}),
        auction_date: PropTypes.string,
        images: PropTypes.arrayOf(ImageType),
    }),
};

ProductDetailsArea.defaultProps = {
    space: 1,
};

export default ProductDetailsArea;
