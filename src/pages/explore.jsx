import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import ExploreProductArea from "@containers/explore-product/layout-02";
import axios from "axios";
import { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Home02 = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    async function getRaffles() {
        setLoading(true);
        await axios(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/rolls`, {
            params: { startDate: new Date() },
        })
            .then((response) => {
                setProducts(response.data.data);
            })
            .catch((errorResponse) => {
                console.log(errorResponse);
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        getRaffles();
    }, []);

    return (
        <Wrapper>
            <SEO pageTitle="Explore" />
            <Header />
            <main id="main-content">
                {loading && (
                    <div className="container">
                        <div className="row text-center mt-5">
                            <ThreeDots
                                height="25"
                                width="50"
                                radius="9"
                                color="#00a3ff"
                                ariaLabel="three-dots-loading"
                                wrapperStyle={{ display: "block" }}
                                visible
                            />
                        </div>
                    </div>
                )}
                <ExploreProductArea
                    data={{
                        section_title: {
                            title: "Explore",
                        },
                        products,
                        showFilters: true,
                    }}
                />
            </main>
            <Footer />
        </Wrapper>
    );
};

export default Home02;
