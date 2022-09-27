import PropTypes from "prop-types";
import clsx from "clsx";
import NFTFaucet from "@components/faucets/nft";
import NFTPortFaucet from "@components/faucets/nftport";
import TokenFaucet from "@components/faucets/token";
import { useMoralis } from "react-moralis";

const FaucetArea = ({ space, className }) => {
    const { authenticate, isAuthenticated, user } = useMoralis();

    const login = () => {
        authenticate({
            signingMessage: "Roll NFT Authentication",
        });
    };

    return (
        <div
            className={clsx(
                "login-area message-area",
                space === 1 && "rn-section-gapTop",
                className
            )}
        >
            <div className="container">
                <div className="row g-5">
                    <div className="col-lg-6">
                        {process.env.NEXT_PUBLIC_FAUCET === "custom" ? (
                            <NFTFaucet
                                user={isAuthenticated ? user : null}
                                authenticate={login}
                            />
                        ) : (
                            <NFTPortFaucet
                                user={isAuthenticated ? user : null}
                                authenticate={login}
                            />
                        )}
                    </div>
                    <div className="col-lg-6">
                        <TokenFaucet />
                    </div>
                </div>
            </div>
        </div>
    );
};

FaucetArea.propTypes = {
    space: PropTypes.oneOf([1, 2]),
    className: PropTypes.string,
};

FaucetArea.defaultProps = {
    space: 1,
};

export default FaucetArea;
