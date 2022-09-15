import PropTypes from "prop-types";
import clsx from "clsx";
import Button from "@ui/button";

const TermsAndConditionsArea = ({ className, space }) => (
    <div
        className={clsx(
            "terms-condition-area",
            space === 1 && "rn-section-gapTop",
            className
        )}
    >
        <div className="container">
            <div className="row">
                <div className="offset-lg-2 col-lg-8 ">
                    <div className="condition-wrapper">
                        <h2>Terms & Conditions for the Rafles</h2>
                        <p className="mb-2">
                            - When you create a raffle, the NFT prize you have
                            chosen will be transferred from your wallet into our
                            escrow.
                        </p>
                        <p className="mb-2">
                            - Raffles will only proceed to the drawing stage if
                            the minimum number of tickets has been sold and the
                            deadline has been reached.
                        </p>
                        <p className="mb-2">
                            - Your NFT will be returned if the minimum number of
                            tickets has not been sold before the raffle
                            deadline.
                        </p>
                        <p className="mb-2">
                            - The host can draw the raffle anytime after the
                            specified deadline.
                        </p>
                        <p className="mb-2">
                            - The raffle should run for a minimum of 24 hours.
                        </p>
                        <p className="mb-2">
                            - Roll NFT will take a 5% commission fee from the
                            ticket sales.
                        </p>
                        <p className="mb-2">
                            - Raffles CANNOT be edited or cancelled once a
                            ticket is sold.
                        </p>
                        <p className="mb-2">
                            - Raffle tickets will not be refunded for the
                            participants that did not win the raffle.
                        </p>
                        <p className="mb-2">
                            - A single participant can buy at most 20% of total
                            number of tickets available
                        </p>
                        <p className="mb-2">
                            - NFT Roll does not take responsibility for
                            promoting or marketing the raffles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

TermsAndConditionsArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1]),
};
TermsAndConditionsArea.defaultProps = {
    space: 1,
};

export default TermsAndConditionsArea;
