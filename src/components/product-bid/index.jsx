import PropTypes from "prop-types";

const ProductBid = ({ price, likeCount }) => (
    <div className="bid-react-area">
        {price.amount > 0 && (
            <div className="last-bid">
                Total value: {price.amount}
                {price.currency}
            </div>
        )}
    </div>
);

ProductBid.propTypes = {
    price: PropTypes.shape({
        amount: PropTypes.number,
        currency: PropTypes.string,
    }),
    likeCount: PropTypes.number,
};

export default ProductBid;
