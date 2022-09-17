import PropTypes from "prop-types";
import { IDType, ImageType } from "@utils/types";
import Anchor from "@ui/anchor";
import { getEllipsisTxt } from "@utils/format";

const BidsTabContent = ({ bids }) => (
    <div>
        {bids?.map((bid) => (
            <div className="top-seller-inner-one mt-0">
                <div className="top-seller-wrapper">
                    <div className="top-seller-content">
                        {bid.bidAt && (
                            <span className="count-number">{bid.bidAt}</span>
                        )}
                        <span>
                            {bid.amount && (
                                <>{bid.amount} ticket(s) bought by</>
                            )}{" "}
                            <Anchor path="#" className="ms-0">
                                {getEllipsisTxt(
                                    "0xe220825b597e4D5867218E0Efa9684Dd26957b00"
                                )}
                            </Anchor>
                        </span>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

BidsTabContent.propTypes = {
    bids: PropTypes.arrayOf(
        PropTypes.shape({
            id: IDType.isRequired,
            user: PropTypes.shape({
                name: PropTypes.string.isRequired,
                slug: PropTypes.string.isRequired,
                image: ImageType.isRequired,
            }),
            amount: PropTypes.string.isRequired,
            bidAt: PropTypes.string.isRequired,
        })
    ),
};

export default BidsTabContent;
