import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import Breadcrumb from "@components/breadcrumb";
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
            <Breadcrumb
                pageTitle="Support Center"
                currentPage="Support Center"
            />
            <ServiceArea />
            <SupportArea />
        </main>
        <Footer />
    </Wrapper>
);

export default Support;
