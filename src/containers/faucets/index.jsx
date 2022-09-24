import PropTypes from "prop-types";
import clsx from "clsx";
import NFTFaucet from "@components/faucets/nft";
import TokenFaucet from "@components/faucets/token";

const FaucetArea = ({ space, className }) => (
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
                    <NFTFaucet />
                </div>
                <div className="col-lg-6">
                    <TokenFaucet />
                </div>
            </div>
        </div>
    </div>
);

FaucetArea.propTypes = {
    space: PropTypes.oneOf([1, 2]),
    className: PropTypes.string,
};

FaucetArea.defaultProps = {
    space: 1,
};

export default FaucetArea;
