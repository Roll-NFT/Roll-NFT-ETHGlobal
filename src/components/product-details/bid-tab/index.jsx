import PropTypes from "prop-types";
import clsx from "clsx";
import TabContainer from "react-bootstrap/TabContainer";
import TabContent from "react-bootstrap/TabContent";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import { NetworkType } from "@utils/types";
import { useMoralis } from "react-moralis";
import BidsTabContent from "./bids-tab-content";
import DetailsTabContent from "./details-tab-content";

const BidTab = ({ className, bids, network, properties, tags }) => {
    const { user } = useMoralis();

    return (
        <TabContainer defaultActiveKey="nav-profile">
            <div className={clsx("tab-wrapper-one", className)}>
                <nav className="tab-button-one">
                    <Nav as="div" className="nav-tabs">
                        <Nav.Link as="button" eventKey="nav-profile">
                            NFT Details
                        </Nav.Link>
                        <Nav.Link as="button" eventKey="nav-participants">
                            Participants
                        </Nav.Link>
                        <Nav.Link as="button" eventKey="nav-tickets">
                            My tickets
                        </Nav.Link>
                    </Nav>
                </nav>
                <TabContent className="rn-bid-content">
                    <TabPane eventKey="nav-profile">
                        <DetailsTabContent
                            network={network}
                            properties={properties}
                            tags={tags}
                        />
                    </TabPane>
                    <TabPane eventKey="nav-participants">
                        <BidsTabContent bids={bids} showAddress />
                    </TabPane>
                    <TabPane eventKey="nav-tickets">
                        {user && (
                            <BidsTabContent
                                bids={bids.filter(
                                    (bid) => bid.userId === user.id
                                )}
                                showAddress={false}
                            />
                        )}
                    </TabPane>
                </TabContent>
            </div>
        </TabContainer>
    );
};

BidTab.propTypes = {
    className: PropTypes.string,
    bids: PropTypes.arrayOf(PropTypes.shape({})),
    network: PropTypes.objectOf(NetworkType),
    properties: PropTypes.arrayOf(PropTypes.shape({})),
    tags: PropTypes.arrayOf(PropTypes.string),
};

export default BidTab;
