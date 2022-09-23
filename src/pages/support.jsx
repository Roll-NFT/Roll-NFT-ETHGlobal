import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import ServiceArea from "@containers/services";
import SupportArea from "@containers/support";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Support = () => (
    <Wrapper>
        <SEO pageTitle="Support" />
        <Header />
        <main id="main-content">
            <ServiceArea />
            <SupportArea />
        </main>
        <Footer />
    </Wrapper>
);

export default Support;
