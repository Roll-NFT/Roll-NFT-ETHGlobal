import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import HeroArea from "@containers/hero/layout-02";
import CategoryArea from "@containers/category";
import LiveExploreArea from "@containers/live-explore";
import ServiceArea from "@containers/services";
import TopSellerArea from "@containers/top-seller/layout-01";
import ExploreProductArea from "@containers/explore-product/layout-02";
import { normalizedData } from "@utils/methods";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { heroUpdate } from "@store/actions/rolls";
import homepageData from "../data/home.json";

const Home = () => {
    const content = normalizedData(homepageData?.content || []);
    const hero = useSelector((state) => state.hero);
    const dispatch = useDispatch();

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    const [endingSoonRaffles, setEndingSoonRaffles] = useState([]);
    async function getEndingSoonRaffles() {
        const soonish = 5;
        const startDate = new Date();
        const endDate = addDays(startDate, soonish);
        await axios(`/api/rolls`, {
            params: { startDate, endDate },
        })
            .then((response) => {
                setEndingSoonRaffles(response.data.data);
            })
            .catch((errorResponse) => {
                console.log(errorResponse);
            });
    }

    async function getHero() {
        await axios(`/api/rolls/hero`, {
            params: { startDate: new Date(), sort: "-ticketsSold" },
        })
            .then((response) => {
                dispatch(heroUpdate(response.data.data));
            })
            .catch((errorResponse) => {
                console.log(errorResponse);
            });
    }

    useEffect(() => {
        getEndingSoonRaffles();
        getHero();
    }, []);

    return (
        <Wrapper>
            <SEO pageTitle="Roll NFT" />
            <Header />
            <main id="main-content">
                <HeroArea
                    data={{
                        ...content["hero-section"],
                        products: hero,
                    }}
                />
                <ServiceArea data={content["service-section"]} />
                <LiveExploreArea
                    data={{
                        ...content["live-explore-section"],
                        products: endingSoonRaffles,
                    }}
                />
                <CategoryArea data={content["category-section"]} />

                {/* <TopSellerArea
                    data={{
                        ...content["top-sller-section"],
                        sellers: sellerData,
                    }}
                /> */}
                {/* <ExploreProductArea
                    data={{
                        ...content["live-explore-section"],
                        products: endingSoonRaffles,
                    }}
                    className="rn-live-bidding-area"
                /> */}
            </main>
            <Footer />
        </Wrapper>
    );
};

export async function getStaticProps() {
    return {
        props: { className: "template-color-1 nft-body-connect" },
    };
}

export default Home;
