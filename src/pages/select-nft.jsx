/* eslint-disable no-console */
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-03";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ThreeDots } from "react-loader-spinner";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const MyNFTs = () => {
    const balances = useSelector((state) => state.balances);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (balances) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [balances]);

    return (
        <Wrapper>
            <SEO pageTitle="Select NFT" />
            <Header />
            <main id="main-content">
                <Breadcrumb
                    pageTitle="Select NFT for this Roll"
                    currentPage="Select NFT"
                    rootTitle="Create New Roll"
                    rootPath="/roll/create"
                />
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
                {balances && (
                    <ExploreProductArea
                        data={{
                            products: balances,
                        }}
                    />
                )}
            </main>
            <Footer />
        </Wrapper>
    );
};

export default MyNFTs;
