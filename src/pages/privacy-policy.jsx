import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import PrivacyPolicyArea from "@containers/privacy-policy";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const PrivacyPolicy = () => (
    <Wrapper>
        <SEO pageTitle="Privacy Policy" />
        <Header />
        <main id="main-content">
            <PrivacyPolicyArea />
        </main>
        <Footer />
    </Wrapper>
);

export default PrivacyPolicy;
