import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import Router from "next/router";
import { useDispatch } from "react-redux";
import { balanceSelect } from "@store/actions/balances";

const Product = ({ overlay, collection, title, slug, image, id }) => {
    const dispatch = useDispatch();
    const handleClick = (event) => {
        event.preventDefault();
        dispatch(balanceSelect(id));
        Router.push(slug);
    };

    return (
        <div
            className={clsx("product-style-one", !overlay && "no-overlay")}
            key={`item-${id}`}
        >
            <div className="card-thumbnail">
                {image && (
                    <Anchor
                        path={slug}
                        onClick={(e) => {
                            handleClick(e);
                        }}
                    >
                        <Image
                            src={image}
                            alt={title}
                            width={533}
                            height={533}
                        />
                    </Anchor>
                )}
            </div>
            <div className="product-share-wrapper">
                <div className="profile-share">
                    <div>
                        {collection}
                        <Anchor
                            path={slug}
                            onClick={(e) => {
                                handleClick(e);
                            }}
                        >
                            <span className="product-name">{title}</span>
                        </Anchor>
                    </div>
                </div>
            </div>
        </div>
    );
};

Product.propTypes = {
    overlay: PropTypes.bool,
    collection: PropTypes.string,
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    image: PropTypes.string,
    id: PropTypes.number.isRequired,
};

Product.defaultProps = {
    overlay: false,
};

export default Product;
