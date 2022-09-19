import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import Breadcrumb from "@components/breadcrumb";
import ContactTopArea from "@containers/contact-top";
import ContactFormArea from "@containers/contact-form";
import GoogleMapArea from "@containers/google-map";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Contact = () => (
    <Wrapper>
        <SEO pageTitle="Contact" />
        <Header />
        <main id="main-content">
            <Breadcrumb pageTitle="Contact Us" currentPage="Contact Us" />
            {/* <ContactTopArea /> */}
            <ContactFormArea />
            {/* <GoogleMapArea /> */}
        </main>
        <Footer />
    </Wrapper>
);

export default Contact;
