import { useState, useEffect } from "react";
import Button from "@ui/button";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import nftFaucet from "@lib/contracts/_nftfaucet.json";
import PropTypes from "prop-types";
import Anchor from "@ui/anchor";
import countriesData from "../../data/countries.json";

const NFTFaucet = ({ user, authenticate }) => {
    const [contract, setContract] = useState(null);
    const [tokenId, setTokenId] = useState("");
    const [mintingState, setMintingState] = useState({
        minting: false,
        status: null,
    });

    const getContract = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const faucetContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_NFT_FAUCET_CONTRACT,
            nftFaucet.abi,
            signer
        );
        setContract(faucetContract);
        const txn = await faucetContract.getCurrentTokenId();
        if (txn) {
            setTokenId(txn.toNumber());
        }
    };

    const mintNFT = async () => {
        if (contract && tokenId) {
            try {
                const country = countriesData[tokenId];
                setMintingState({
                    minting: true,
                    status: {
                        error: false,
                        class: "text-warning",
                        msg: "Please confirm transaction on your wallet. NFT is minting...",
                    },
                });
                const mintTxn = await contract.mintFlagNFT(
                    country.code,
                    country.name,
                    country.ipfsCID,
                    country.city
                );
                await mintTxn.wait();
                toast(`NFT minted successfully!`);
                setMintingState({
                    minting: false,
                    status: {
                        error: false,
                        class: "text-success",
                        msg: "NFT minted successfully!",
                    },
                });
                setTokenId(tokenId + 1);
            } catch (error) {
                toast(`Token mint failed! ${error.reason}`);
                setMintingState({
                    minting: false,
                    status: {
                        error: true,
                        class: "text-danger",
                        msg: "NFT mint failed!",
                    },
                });
            }
        }
    };

    const onClick = () => {
        if (user) {
            mintNFT();
        } else {
            authenticate();
        }
    };

    useEffect(() => {
        if (user) {
            getContract();
        }
    }, [user]);

    return (
        <div className="form-wrapper-one registration-area">
            <h3 className="mb-1">NFT Faucet</h3>
            <h5 className="mb--30">Squared Country Flags Collection</h5>
            <p className="connect-td">
                This is a sample NFT collection created for the single purpouse
                of testing RollNFT features, such as creating a new Roll. <br />
                <br />
                You will need native token to pay for the gas fee:
                <Anchor
                    path="https://faucet.polygon.technology"
                    target="_blank"
                    className="mt-0"
                >
                    https://faucet.polygon.technology
                </Anchor>
                <br />
                Supported networks: {
                    process.env.NEXT_PUBLIC_APP_CHAIN_ID_NAME
                }{" "}
                (please connect your wallet to that network prior to minting).
            </p>
            <Button type="submit" size="medium" onClick={onClick}>
                {user ? "Mint NFT" : "Login to Mint"}
            </Button>
            {mintingState.status && (
                <p className={`mt-4 font-14 ${mintingState.status.class}`}>
                    {mintingState.status.msg}
                </p>
            )}
        </div>
    );
};

NFTFaucet.propTypes = {
    user: PropTypes.objectOf(PropTypes.any),
    authenticate: PropTypes.func.isRequired,
};

export default NFTFaucet;
