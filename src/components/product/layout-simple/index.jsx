import { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import ClientAvatar from "@ui/client-avatar";
import ShareDropdown from "@components/share-dropdown";
import { ImageType } from "@utils/types";
import PlaceBidModal from "@components/modals/placebid-modal";

const Product = ({
    overlay,
    title,
    slug,
    image,
    authors,
    disableShareDropdown,
}) => {
    const [showBidModal, setShowBidModal] = useState(false);
    const handleBidModal = () => {
        setShowBidModal((prev) => !prev);
    };
    return (
        <>
            <div
                className={clsx("product-style-one", !overlay && "no-overlay")}
            >
                <div className="card-thumbnail">
                    {image?.src && (
                        <Anchor path={slug}>
                            <Image
                                src={image.src}
                                alt={image?.alt || "NFT_portfolio"}
                                width={533}
                                height={533}
                            />
                        </Anchor>
                    )}
                </div>
                <div className="product-share-wrapper">
                    <div className="profile-share">
                        {authors?.map((client) => (
                            <ClientAvatar
                                key={client.name}
                                slug={client.slug}
                                name={client.name}
                                image={client.image}
                            />
                        ))}
                        <Anchor className="more-author-text" path={slug} />
                    </div>
                    {!disableShareDropdown && <ShareDropdown />}
                </div>
                <Anchor path={slug}>
                    <span className="product-name">{title}</span>
                </Anchor>
            </div>
            <PlaceBidModal show={showBidModal} handleModal={handleBidModal} />
        </>
    );
};

Product.propTypes = {
    overlay: PropTypes.bool,
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    image: ImageType.isRequired,
    authors: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            slug: PropTypes.string.isRequired,
            image: ImageType.isRequired,
        })
    ),
    disableShareDropdown: PropTypes.bool,
};

Product.defaultProps = {
    overlay: false,
};

export default Product;
