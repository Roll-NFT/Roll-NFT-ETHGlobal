import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { motion } from "framer-motion";
import SectionTitle from "@components/section-title/layout-02";
import Product from "@components/product/layout-01";
import FilterButtons from "@components/filter-buttons";
import { flatDeep } from "@utils/methods";
import { SectionTitleType, RollType } from "@utils/types";
import { useDispatch, useSelector } from "react-redux";
import { categoryUpdate } from "@store/actions/rolls";

const ExploreProductArea = ({ className, space, data }) => {
    const filters = [
        ...new Set(
            flatDeep(data?.products.map((item) => item.categories) || [])
        ),
    ];
    const [products, setProducts] = useState([]);
    const category = useSelector((state) => state.category);
    const dispatch = useDispatch();

    const filterHandler = (filterKey) => {
        const prods = data?.products ? [...data.products] : [];
        if (filterKey === "all") {
            setProducts(data?.products);
            dispatch(categoryUpdate("all"));
            return;
        }
        const filterProds = prods.filter((prod) =>
            prod.categories.includes(filterKey)
        );
        if (filterProds.length === 0) {
            filterHandler("all");
        } else {
            setProducts(filterProds);
            dispatch(categoryUpdate(filterKey));
        }
    };

    useEffect(() => {
        setProducts(data?.products);
        console.log(data?.products);
    }, [data?.products]);

    useEffect(() => {
        filterHandler(category);
    }, []);

    return (
        <div
            className={clsx(
                "rn-product-area masonary-wrapper-activation",
                space === 1 && "rn-section-gapTop",
                className
            )}
        >
            <div className="container">
                <div className="row align-items-center mb--60">
                    <div className="col-lg-4">
                        {data?.section_title && (
                            <SectionTitle
                                className="mb--0"
                                disableAnimation
                                {...data.section_title}
                            />
                        )}
                    </div>
                    <div className="col-lg-8">
                        <FilterButtons
                            buttons={filters}
                            filterHandler={filterHandler}
                            active={category}
                        />
                    </div>
                </div>
                <div className="col-lg-12">
                    <motion.div layout className="isotope-list item-5">
                        {products?.slice(0, 10)?.map((prod) => (
                            <motion.div
                                key={prod.raffleId}
                                className={clsx("grid-item")}
                                layout
                            >
                                <Product
                                    placeBid={!!data.placeBid}
                                    collection={prod.nftCollection}
                                    title={prod.title}
                                    slug={prod.raffleId}
                                    price={{
                                        amount: prod.ticketPrice,
                                        currency: prod.ticketCurrency,
                                    }}
                                    auction_date={prod.endDate}
                                    likeCount={prod.likeCount}
                                    ticketSupply={prod.ticketSupply}
                                    ticketsSold={prod.ticketsSold}
                                    ticketsTotal={prod.ticketsTotal}
                                    image={{
                                        src: prod.nftImage,
                                        alt: prod.title,
                                    }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

ExploreProductArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1, 2]),
    data: PropTypes.shape({
        section_title: SectionTitleType,
        products: PropTypes.arrayOf(RollType),
        placeBid: PropTypes.bool,
    }),
};

ExploreProductArea.defaultProps = {
    space: 1,
};

export default ExploreProductArea;
