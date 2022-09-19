import PropTypes from "prop-types";
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import Breadcrumb from "@components/breadcrumb";
import ProductDetailsArea from "@containers/product-details";
import ProductArea from "@containers/product";
import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { rollUpdate } from "@store/actions/rolls";

const ProductDetails = ({ recentViewRolls, relatedRolls }) => {
    const router = useRouter();
    const roll = useSelector((state) => state.roll);
    const dispatch = useDispatch();
    const { slug } = router.query;

    async function findRaffle(id) {
        console.log("slug is: ", id);
        await axios(`/api/rolls/${id}`)
            .then((response) => {
                console.log(`Raffle found!`);
                // setRoll(response.data.data);
                dispatch(rollUpdate(response.data.data));
                console.log(response.data.data);
            })
            .catch((errorResponse) => {
                console.log("Raffle not found!");
                console.log(errorResponse);
            });
    }

    useEffect(() => {
        if (slug) {
            findRaffle(slug);
        }
    }, [slug]);

    return (
        <Wrapper>
            <SEO pageTitle="Roll Details" />
            <Header />
            <main id="main-content">
                <Breadcrumb
                    pageTitle="Roll Details"
                    currentPage="Roll Details"
                />
                {roll ? (
                    <ProductDetailsArea roll={roll} />
                ) : (
                    <ProductDetailsArea />
                )}
                {recentViewRolls && (
                    <ProductArea
                        data={{
                            section_title: { title: "Recent View" },
                            products: recentViewRolls,
                        }}
                    />
                )}
                {relatedRolls && (
                    <ProductArea
                        data={{
                            section_title: { title: "Related Item" },
                            products: relatedRolls,
                        }}
                    />
                )}
            </main>
            <Footer />
        </Wrapper>
    );
};

export async function getStaticPaths() {
    return {
        paths: [], // indicates that no page needs be created at build time
        fallback: "blocking", // indicates the type of fallback
    };
}

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

ProductDetails.propTypes = {
    recentViewRolls: PropTypes.arrayOf(PropTypes.shape({})),
    relatedRolls: PropTypes.arrayOf(PropTypes.shape({})),
};

export default ProductDetails;
