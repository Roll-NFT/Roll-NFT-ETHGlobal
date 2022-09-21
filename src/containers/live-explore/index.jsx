import PropTypes from "prop-types";
import clsx from "clsx";
import SectionTitle from "@components/section-title/layout-01";
import Product from "@components/product/layout-01";
import Slider, { SliderItem } from "@ui/slider";
import { SectionTitleType, ProductType, RollType } from "@utils/types";

const SliderOptions = {
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 2,
    arrows: true,
    responsive: [
        {
            breakpoint: 1399,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 576,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: true,
                arrows: false,
            },
        },
    ],
};

const LiveExploreArea = ({ data, className, space }) => (
    <div
        className={clsx(
            "rn-live-bidding-area",
            space === 1 && "rn-section-gapTop",
            className
        )}
    >
        <div className="container">
            {data?.section_title && (
                <div className="row mb--50">
                    <div className="col-lg-12">
                        <SectionTitle {...data.section_title} />
                    </div>
                </div>
            )}
            {data?.products && (
                <div className="row">
                    <div className="col-lg-12">
                        <Slider
                            options={SliderOptions}
                            className="banner-one-slick slick-arrow-style-one rn-slick-dot-style slick-gutter-15"
                        >
                            {data.products.map((prod) => (
                                <SliderItem
                                    key={prod.raffleId}
                                    className="single-slide-product"
                                >
                                    <Product
                                        placeBid={!!data.placeBid}
                                        collection={prod.nftCollection}
                                        title={prod.title}
                                        slug={prod.raffleId}
                                        latestBid={1}
                                        price={{
                                            amount: prod.ticketPrice,
                                            currency: prod.ticketCurrency,
                                        }}
                                        auction_date={prod.endDate}
                                        likeCount={prod.likeCount}
                                        image={{
                                            src: prod.nftImage,
                                            alt: prod.title,
                                        }}
                                    />
                                </SliderItem>
                            ))}
                        </Slider>
                    </div>
                </div>
            )}
        </div>
    </div>
);

LiveExploreArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1, 2]),
    data: PropTypes.shape({
        section_title: SectionTitleType,
        products: PropTypes.arrayOf(RollType).isRequired,
        placeBid: PropTypes.bool,
    }),
};

LiveExploreArea.defaultProps = {
    space: 1,
};

export default LiveExploreArea;
