import PropTypes from "prop-types";
import Button from "@ui/button";
import Product from "@components/product/layout-01";
import {
    HeadingType,
    TextType,
    ButtonType,
    ItemType,
    RollType,
} from "@utils/types";

const HeroArea = ({ data: { headings, texts, buttons, items, products } }) => (
    <div className="banner-area banner-16 pt--50 pb--50 pt_md--70 pt_sm--30 pb_md--90 pb_sm--50 bg-color--2">
        <div className="container">
            <div className="row">
                <div className="col-lg-6 order-lg-1 order-md-2 order-sm-2 order-2">
                    <div className="left-banner-16-wrapepr mt_md--100 mt_sm--100">
                        {headings?.[0]?.content && (
                            <h1
                                className="title"
                                dangerouslySetInnerHTML={{
                                    __html: headings[0].content,
                                }}
                            />
                        )}
                        {texts?.[0]?.content && (
                            <p
                                className="disc"
                                dangerouslySetInnerHTML={{
                                    __html: texts[0].content,
                                }}
                            />
                        )}
                        <div className="button-group d-flex flex-wrap">
                            {buttons?.map(({ content, id, ...btn }, i) => (
                                <Button
                                    {...btn}
                                    key={id}
                                    className={
                                        i !== buttons.length - 1 && "mr--30"
                                    }
                                >
                                    {content}
                                </Button>
                            ))}
                        </div>
                        {/* <div className="odometer-area-slide ">
                            {items?.map((item, i) => (
                                <FunFact
                                    data-sal-delay={400 + i * 200}
                                    data-sal="slide-left"
                                    data-sal-duration="800"
                                    key={item.id}
                                    title={item.title}
                                    counter={item.counter}
                                />
                            ))}
                        </div> */}
                    </div>
                </div>
                <div className="col-lg-6 order-lg-2 order-md-1 order-sm-1 order-1">
                    <div className="row g-5">
                        {products?.map((prod) => (
                            <div className="col-lg-6 col-md-6" key={prod.id}>
                                <Product
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
                                    disableShareDropdown
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

HeroArea.propTypes = {
    data: PropTypes.shape({
        headings: PropTypes.arrayOf(HeadingType),
        texts: PropTypes.arrayOf(TextType),
        buttons: PropTypes.arrayOf(ButtonType),
        items: PropTypes.arrayOf(ItemType),
        products: PropTypes.arrayOf(RollType),
    }),
};

export default HeroArea;
