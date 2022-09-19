import PropTypes from "prop-types";
import clsx from "clsx";
import ShareDropdown from "../share-dropdown";

const ProductTitle = ({
    className,
    collection,
    title,
    likeCount,
    shareUrl,
}) => (
    <>
        <span>{collection}</span>
        <div className={clsx("pd-title-area", className)}>
            <h4 className="title">{title}</h4>
            <div className="pd-react-area">
                <div className="heart-count">
                    <i className="feather-heart" />
                    <span>{likeCount}</span>
                </div>
                <div className="count">
                    <ShareDropdown shareUrl={shareUrl} />
                </div>
            </div>
        </div>
    </>
);

ProductTitle.propTypes = {
    className: PropTypes.string,
    collection: PropTypes.string,
    title: PropTypes.string.isRequired,
    likeCount: PropTypes.number,
    shareUrl: PropTypes.string,
};

ProductTitle.defaultProps = {
    likeCount: 0,
};

export default ProductTitle;
