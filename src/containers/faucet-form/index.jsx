import PropTypes from "prop-types";
import clsx from "clsx";
import FaucetForm from "@components/faucet-form";

const FaucetFormArea = ({ space, className }) => (
    <div
        className={clsx(
            "login-area message-area",
            space === 1 && "rn-section-gapTop",
            className
        )}
    >
        <div className="container">
            <div className="row g-5">
                <div className="col-lg-3" />
                <div
                    className="col-lg-6"
                    data-sal="slide-up"
                    data-sal-delay="200"
                    data-sal-duration="800"
                >
                    <FaucetForm />
                </div>
                <div className="col-lg-3" />
            </div>
        </div>
    </div>
);

FaucetFormArea.propTypes = {
    space: PropTypes.oneOf([1, 2]),
    className: PropTypes.string,
};

FaucetFormArea.defaultProps = {
    space: 1,
};

export default FaucetFormArea;
