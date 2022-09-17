/* eslint-disable no-console */
import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import Breadcrumb from "@components/breadcrumb";
import ExploreProductArea from "@containers/explore-product/layout-03";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { balancesUpdate } from "../store/actions/balances";

const prepareData = (obj) =>
    obj.items
        .filter((item) => item.type === "nft")
        .map((collection, i) =>
            collection.nft_data.map((nft, j) => ({
                id: (i + 1) * 100 + j,
                collection: collection.contract_name,
                contract_address: collection.contract_address,
                token_id: nft.token_id,
                token_balance: nft.token_balance,
                title: nft.external_data.name,
                description: nft.external_data.description,
                image: nft.external_data.image,
                attributes: nft.external_data.attributes,
                supports_erc: nft.supports_erc,
            }))
        )
        .flat();

const MyNFTs = () => {
    const user = useSelector((state) => state.user);
    const balances = useSelector((state) => state.balances);
    const dispatch = useDispatch();

    const getBalances = async (address) => {
        console.log(
            `Fetching balances from ${address} through Covalent API... `
        );
        const covalentKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY;
        const covalentEndpoint = process.env.NEXT_PUBLIC_COVALENT_ENDPOINT;
        const covalentUrl = `${covalentEndpoint}/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=${covalentKey}`;
        await axios(covalentUrl)
            .then((response) => {
                console.log("Preparing data...");
                const _balances = prepareData(response.data.data);
                dispatch(balancesUpdate(_balances));
            })
            .catch((errorResponse) => {
                console.log("Error fetching data: ", errorResponse);
            })
            .finally(() => console.log("Done fetching data"));
    };

    useEffect(() => {
        if (user.address) {
            getBalances(user.address);
        }
    }, [user]);

    return (
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
                {balances?.length ? (
                    <ExploreProductArea
                        data={{
                            products: balances,
                        }}
                    />
                ) : (
                    "Looks Like you do not have any NFTs"
                )}
            </main>
            <Footer />
        </Wrapper>
    );
};

export default MyNFTs;
