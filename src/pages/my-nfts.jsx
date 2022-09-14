import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-simple";

// Demo data
import productData from "../data/my_nfts.json";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Home02 = () => (
    <Wrapper>
        <SEO pageTitle="My NFTs" />
        <Header />
        <main id="main-content">
            <Breadcrumb
                pageTitle="Select a NFT for this Raffle"
                currentPage="Select NFT"
                rootTitle="Create New Raffle"
                rootPath="/create"
            />
            <ExploreProductArea
                data={{
                    products: productData,
                }}
            />
        </main>
        <Footer />
    </Wrapper>
);

export default Home02;
