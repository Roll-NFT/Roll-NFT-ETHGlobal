import PropTypes from "prop-types";
import clsx from "clsx";
import TabContainer from "react-bootstrap/TabContainer";
import TabContent from "react-bootstrap/TabContent";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import BidsTabContent from "./bids-tab-content";
import DetailsTabContent from "./details-tab-content";

const BidTab = ({ className, bids, owner, properties, tags }) => (
    <TabContainer defaultActiveKey="nav-home">
        <div className={clsx("tab-wrapper-one", className)}>
            <nav className="tab-button-one">
                <Nav as="div" className="nav-tabs">
                    <Nav.Link as="button" eventKey="nav-profile">
                        NFT Details
                    </Nav.Link>
                    <Nav.Link as="button" eventKey="nav-home">
                        Participants
                    </Nav.Link>
                </Nav>
            </nav>
            <TabContent className="rn-bid-content">
                <TabPane eventKey="nav-profile">
                    <DetailsTabContent
                        owner={owner}
                        properties={properties}
                        tags={tags}
                    />
                </TabPane>
                <TabPane eventKey="nav-home">
                    <BidsTabContent bids={bids} />
                </TabPane>
            </TabContent>
        </div>
    </TabContainer>
);

BidTab.propTypes = {
    className: PropTypes.string,
    bids: PropTypes.arrayOf(PropTypes.shape({})),
    owner: PropTypes.shape({}),
    properties: PropTypes.arrayOf(PropTypes.shape({})),
    tags: PropTypes.arrayOf(PropTypes.shape({})),
};

export default BidTab;
