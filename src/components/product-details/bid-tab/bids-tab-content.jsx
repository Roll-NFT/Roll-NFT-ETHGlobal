import PropTypes from "prop-types";
import { RollType } from "@utils/types";
import Anchor from "@ui/anchor";
import { getEllipsisTxt } from "@utils/format";
import { formatDistance } from "date-fns";

const pluralize = require("pluralize");

const BidsTabContent = ({ bids, showAddress }) => (
    <div>
        {bids?.map((bid) => (
            <div
                className="top-seller-inner-one mt-0"
                key={`${bid.createdAt}-${showAddress}`}
                id={`${bid.createdAt}-${showAddress}`}
            >
                <div className="top-seller-wrapper">
                    <div className="top-seller-content">
                        <span>
                            {showAddress ? (
                                <Anchor
                                    path={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${bid.userAddress}`}
                                    className="ms-0"
                                    target="_blank"
                                >
                                    {getEllipsisTxt(bid.userAddress)}
                                </Anchor>
                            ) : (
                                "You"
                            )}{" "}
                            bought{" "}
                            {bid.quantity && (
                                <>
                                    {bid.quantity}{" "}
                                    {pluralize("ticket", bid.quantity)}
                                </>
                            )}{" "}
                            {bid.createdAt && (
                                <span>
                                    {formatDistance(
                                        new Date(bid.createdAt),
                                        new Date(),
                                        {
                                            addSuffix: true,
                                        }
                                    )}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

BidsTabContent.propTypes = {
    bids: PropTypes.arrayOf(RollType),
    showAddress: PropTypes.bool,
};

export default BidsTabContent;
