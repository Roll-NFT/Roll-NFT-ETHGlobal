import PropTypes from "prop-types";
import clsx from "clsx";
import TabContainer from "react-bootstrap/TabContainer";
import TabContent from "react-bootstrap/TabContent";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import { useSelector } from "react-redux";
import BidsTabContent from "./bids-tab-content";
import DetailsTabContent from "./details-tab-content";

const BidTab = ({ className, bids, owner, properties, tags }) => {
    const user = useSelector((state) => state.user);

    return (
        <TabContainer defaultActiveKey="nav-home">
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
                            owner={owner}
                            properties={properties}
                            tags={tags}
                        />
                    </TabPane>
                    <TabPane eventKey="nav-participants">
                        <BidsTabContent bids={bids} showAddress />
                    </TabPane>
                    <TabPane eventKey="nav-tickets">
                        <BidsTabContent
                            bids={bids.filter((bid) => bid.userId === user.id)}
                            showAddress={false}
                        />
                    </TabPane>
                </TabContent>
            </div>
        </TabContainer>
    );
};

BidTab.propTypes = {
    className: PropTypes.string,
    bids: PropTypes.arrayOf(PropTypes.shape({})),
    owner: PropTypes.shape({}),
    properties: PropTypes.arrayOf(PropTypes.shape({})),
    tags: PropTypes.arrayOf(PropTypes.string),
};

export default BidTab;
