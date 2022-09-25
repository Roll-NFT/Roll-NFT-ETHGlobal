import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import Router from "next/router";
import { useDispatch } from "react-redux";
import { balanceSelect } from "@store/actions/balances";
import { ThreeDots } from "react-loader-spinner";
import { useState, useEffect } from "react";

const Product = ({ overlay, collection, title, slug, image, id }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleClick = (e) => {
        e.preventDefault();
        setLoading(true);
        dispatch(balanceSelect(id));
        Router.push(slug).then(() => {
            setLoading(false);
        });
    };

    useEffect(
        () => () => {
            setLoading(null);
        },
        []
    );

    return (
        <div
            className={clsx("product-style-one", !overlay && "no-overlay")}
            key={`item-${id}`}
        >
            <div className="card-thumbnail">
                {image && (
                    <Anchor
                        path="#"
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
                        {loading && (
                            <ThreeDots
                                height="25"
                                width="50"
                                radius="9"
                                color="#00a3ff"
                                ariaLabel="three-dots-loading"
                                wrapperStyle={{
                                    display: "block",
                                    left: "50%",
                                    transform: "translate(-50%)",
                                    bottom: "120px",
                                    position: "absolute",
                                }}
                                visible
                            />
                        )}
                    </Anchor>
                )}
            </div>
            <div className="product-share-wrapper">
                {/* <div className="profile-share"> */}
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
                {/* </div> */}
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
