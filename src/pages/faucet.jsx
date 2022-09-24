import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import FaucetArea from "@containers/faucets";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Faucet = () => (
    <Wrapper>
        <SEO pageTitle="NFT Faucet" />
        <Header />
        <main id="main-content">
            <FaucetArea />
        </main>
        <Footer />
    </Wrapper>
);

export default Faucet;
