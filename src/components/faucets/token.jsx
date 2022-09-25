import { useState, useEffect } from "react";
import Button from "@ui/button";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useMoralis } from "react-moralis";
import rollToken from "@lib/contracts/RollToken.json";
import Anchor from "@ui/anchor";

const TokenFaucet = () => {
    const { authenticate, isAuthenticated, user } = useMoralis();
    const [contract, setContract] = useState(null);
    const [mintingState, setMintingState] = useState({
        minting: false,
        status: null,
    });

    const mint = async () => {
        if (contract) {
            setMintingState({
                minting: true,
                status: {
                    error: false,
                    class: "text-warning",
                    msg: "Please confirm transaction on your wallet. Token is minting...",
                },
            });
            try {
                const wei = ethers.utils.parseUnits("10", 18);
                const mintTxn = await contract.mint(
                    user.get("ethAddress"),
                    wei
                );
                await mintTxn.wait();
                if (mintTxn) {
                    toast(`Token minted successfully!`);
                    setMintingState({
                        minting: false,
                        status: {
                            error: false,
                            class: "text-success",
                            msg: "Token minted successfully!",
                        },
                    });
                }
            } catch (error) {
                toast(`Token mint failed! ${error.reason}`);
                setMintingState({
                    minting: false,
                    status: {
                        error: true,
                        class: "text-danger",
                        msg: "Token mint failed!",
                    },
                });
            }
        }
    };

    const onClick = () => {
        if (isAuthenticated) {
            mint();
        } else {
            authenticate({
                signingMessage: "Roll NFT Authentication",
            });
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const tokenContract = new ethers.Contract(
                process.env.NEXT_PUBLIC_TOKEN_FAUCET,
                rollToken.abi,
                signer
            );
            setContract(tokenContract);
        }
    }, [isAuthenticated]);

    return (
        <div className="form-wrapper-one registration-area">
            <h3 className="mb-1">ERC20 Token Faucet</h3>
            <h5 className="mb--30">Roll Token (ROLL)</h5>
            <p className="connect-td">
                This is a sample ERC20 Token created for the single purpouse of
                testing RollNFT features, such as buying Roll tickets. <br />
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
                Mint 10 ROLLS
            </Button>
            {mintingState.status && (
                <p className={`mt-4 font-14 ${mintingState.status.class}`}>
                    {mintingState.status.msg}
                </p>
            )}
        </div>
    );
};
export default TokenFaucet;
