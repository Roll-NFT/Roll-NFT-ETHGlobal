import { useState, useEffect } from "react";
import Button from "@ui/button";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import nftFaucet from "@lib/contracts/_nftportfaucet.json";
import PropTypes from "prop-types";

const NFTPortFaucet = ({ user, authenticate }) => {
    const [contract, setContract] = useState(null);
    const [mintingState, setMintingState] = useState({
        minting: false,
        status: null,
    });

    const getContract = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const faucetContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_NFT_PORT_CONTRACT,
            nftFaucet.abi,
            signer
        );
        setContract(faucetContract);
    };

    async function mintNFT() {
        if (contract) {
            try {
                setMintingState({
                    minting: true,
                    status: {
                        error: false,
                        class: "text-warning",
                        msg: "Please confirm transaction on your wallet. NFT is minting...",
                    },
                });
                const value = 0;
                const mintTxn = await contract.mint(1, {
                    from: user.get("ethAddress"),
                    value: value.toString(),
                });
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
            } catch (error) {
                console.log(error);
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
    }

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
            <h3 className="mb-1">NFT Port Faucet</h3>
            <h5 className="mb--30">Created using NFT Port</h5>
            <p className="connect-td">
                This is a sample NFT collection created for the single purpouse
                of testing RollNFT features, such as creating a new Roll. <br />
                <br />
                You will need MATIC token to pay for the gas fee.
                <br />
                Supported networks: Polygon Mainnet (please connect your wallet
                to that network prior to minting).
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

NFTPortFaucet.propTypes = {
    user: PropTypes.objectOf(PropTypes.any),
    authenticate: PropTypes.func.isRequired,
};

export default NFTPortFaucet;
