import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import HeroArea from "@containers/hero";
import CategoryArea from "@containers/category";
import LiveExploreArea from "@containers/live-explore";
import ServiceArea from "@containers/services";
import TopSellerArea from "@containers/top-seller/layout-01";
import ExploreProductArea from "@containers/explore-product/layout-01";
import { normalizedData } from "@utils/methods";

// Demo Data
import homepageData from "../data/home.json";
import productData from "../data/products.json";
import sellerData from "../data/sellers.json";

export async function getStaticProps() {
    return {
        props: { className: "template-color-1 nft-body-connect" },
    };
}

const Home = () => {
    const content = normalizedData(homepageData?.content || []);
    const liveAuctionData = productData.filter(
        (prod) =>
            prod?.auction_date && new Date() <= new Date(prod?.auction_date)
    );
    const newestData = productData
        .sort(
            (a, b) =>
                Number(new Date(b.published_at)) -
                Number(new Date(a.published_at))
        )
        .slice(0, 5);

    return (
        <Wrapper>
            <SEO pageTitle="Roll NFT" />
            <Header />
            <main id="main-content">
                <HeroArea data={content["hero-section"]} />
                <ServiceArea data={content["service-section"]} />
                <CategoryArea data={content["category-section"]} />
                <LiveExploreArea
                    data={{
                        ...content["live-explore-section"],
                        products: liveAuctionData,
                    }}
                />
                <TopSellerArea
                    data={{
                        ...content["top-sller-section"],
                        sellers: sellerData,
                    }}
                />
                <ExploreProductArea
                    data={{
                        ...content["explore-product-section"],
                        products: productData,
                    }}
                />
            </main>
            <Footer />
        </Wrapper>
    );
};

export default Home;
