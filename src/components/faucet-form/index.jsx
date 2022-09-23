import { useState, useEffect } from "react";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useMoralis } from "react-moralis";
import countriesData from "../../data/countries.json";
import nftFaucet from "../../lib/NFTFaucet.json";

const FaucetForm = () => {
    const { authenticate, isAuthenticated, user } = useMoralis();
    const [contract, setContract] = useState(null);
    const [tokenId, setTokenId] = useState("");
    const [mintingState, setMintingState] = useState({
        minting: false,
        status: null,
    });

    const getCurrentTokenId = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const faucetContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_SC_FAUCET,
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
                        msg: "Please wait. NFT is minting...",
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
            } catch (error) {
                toast(`NFT mint failed!`);
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
        if (isAuthenticated) {
            mintNFT();
        } else {
            authenticate({
                signingMessage: "Roll NFT Authentication",
            });
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            getCurrentTokenId();
        }
    }, [user]);

    useEffect(() => {
        const onNFTMinted = async (sender, _tokenId, code) => {
            setTokenId(_tokenId.toNumber());
            setMintingState({
                minting: false,
                status: {
                    error: false,
                    class: "text-success",
                    msg: `NFT minted! ${process.env.NEXT_PUBLIC_RARIBLE_URL}${
                        process.env.NEXT_PUBLIC_SC_FAUCET
                    }:${_tokenId.toNumber()}`,
                },
            });
        };

        if (contract) {
            contract.on("CountryFlagNFTNFTMinted", onNFTMinted);
        }
        return () => {
            if (contract) {
                contract.off("CountryFlagNFTNFTMinted", onNFTMinted);
            }
        };
    }, [contract]);

    return (
        <div className="form-wrapper-one registration-area">
            <h3 className="mb--30">NFT Faucet</h3>
            <p>
                Supported network: {process.env.NEXT_PUBLIC_APP_CHAIN_ID_NAME}
            </p>
            <Button type="submit" size="medium" onClick={onClick}>
                Mint NFT
            </Button>
            {mintingState.status && (
                <p className={`mt-4 font-14 ${mintingState.status.class}`}>
                    {mintingState.status.msg}
                </p>
            )}
        </div>
    );
};
export default FaucetForm;
