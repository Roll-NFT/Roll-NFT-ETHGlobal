import { useState, useEffect } from "react";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import countriesData from "../../data/countries.json";
import nftFaucet from "../../lib/NFTFaucet.json";

const FaucetForm = () => {
    const user = useSelector((state) => state.user);
    const [contract, setContract] = useState(null);
    const [tokenId, setTokenId] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });
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
        console.log("currentTokenId is: ", txn);
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
                console.log("Mintando NFT...");
                const mintTxn = await contract.mintFlagNFT(
                    country.code,
                    country.name,
                    country.ipfsCID,
                    country.city
                );
                await mintTxn.wait();
                console.log("mintTxn:", mintTxn);
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

    const onSubmit = () => {
        mintNFT();
    };

    useEffect(() => {
        if (user) {
            getCurrentTokenId();
        }
    }, [user]);

    useEffect(() => {
        const onNFTMinted = async (sender, _tokenId, code) => {
            setTokenId(_tokenId.toNumber());
            console.log(
                `NFT Minted - sender: ${sender} tokenId: ${_tokenId.toNumber()} code: ${code}`
            );
            setMintingState({
                minting: false,
                status: {
                    error: false,
                    class: "text-success",
                    msg: `NFT minted! ${process.env.NEXT_PUBLIC_SC_FAUCET}${
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
            <form
                className="rwt-dynamic-form"
                id="contact-form"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="mb-5">
                    <label htmlFor="address" className="form-label">
                        Your Address
                    </label>
                    <input
                        id="address"
                        type="text"
                        value={user.address}
                        {...register("address", {
                            required: "Address is required",
                        })}
                    />
                    {errors.address && (
                        <ErrorText>{errors.address?.message}</ErrorText>
                    )}
                </div>
                <Button type="submit" size="medium">
                    Mint NFT
                </Button>
                {mintingState.status && (
                    <p className={`mt-4 font-14 ${mintingState.status.class}`}>
                        {mintingState.status.msg}
                    </p>
                )}
            </form>
        </div>
    );
};
export default FaucetForm;
