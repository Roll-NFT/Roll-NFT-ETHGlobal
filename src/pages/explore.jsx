import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-02";
import axios from "axios";
import { useState, useEffect } from "react";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Home02 = () => {
    const [products, setProducts] = useState([]);

    async function getRaffles() {
        await axios(`/api/rolls`, { params: { startDate: new Date() } })
            .then((response) => {
                setProducts(response.data.data);
            })
            .catch((errorResponse) => {
                console.log(errorResponse);
            });
    }

    useEffect(() => {
        getRaffles();
    }, []);

    return (
        <Wrapper>
            <SEO pageTitle="Explore" />
            <Header />
            <main id="main-content">
                <Breadcrumb pageTitle="Explore" currentPage="Explore" />
                <ExploreProductArea
                    data={{
                        section_title: {
                            title: "Explore",
                        },
                        products,
                    }}
                />
            </main>
            <Footer />
        </Wrapper>
    );
};

export default Home02;
