import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import FaucetFormArea from "@containers/faucet-form";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Faucet = () => (
    <Wrapper>
        <SEO pageTitle="NFT Faucet" />
        <Header />
        <main id="main-content">
            <FaucetFormArea />
        </main>
        <Footer />
    </Wrapper>
);

export default Faucet;
