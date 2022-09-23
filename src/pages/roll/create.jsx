import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import Breadcrumb from "@components/breadcrumb";
import CreateNewArea from "@containers/create-new";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Home = () => {
    const balances = useSelector((state) => state.balances);
    const [nft, setNft] = useState(null);

    useEffect(() => {
        const _nft = balances.filter((item) => item.selected === true);
        if (_nft?.length > 0) {
            setNft(_nft[0]);
        }
    }, [balances]);

    return (
        <Wrapper>
            <SEO pageTitle="Create New Roll" />
            <Header />
            <main id="main-content">
                <Breadcrumb pageTitle="Create New Roll" />
                <CreateNewArea nft={nft} />
            </main>
            <Footer />
        </Wrapper>
    );
};

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

export default Home;
