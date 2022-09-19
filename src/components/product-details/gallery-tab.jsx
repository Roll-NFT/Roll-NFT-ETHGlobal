import PropTypes from "prop-types";
import Image from "next/image";
import TabContent from "react-bootstrap/TabContent";
import TabContainer from "react-bootstrap/TabContainer";
import TabPane from "react-bootstrap/TabPane";
import Nav from "react-bootstrap/Nav";
import { ImageType } from "@utils/types";

const GalleryTab = ({ images }) => (
    <div className="product-tab-wrapper">
        <TabContainer defaultActiveKey="nav-0">
            <div className="pd-tab-inner justify-content-center">
                <Nav className="rn-pd-nav rn-pd-rt-content nav-pills d-none">
                    {images?.map((image, index) => (
                        <Nav.Link
                            id={`nav-link-${index}`}
                            key={image.src}
                            as="button"
                            eventKey={`nav-${index}`}
                        >
                            <span className="rn-pd-sm-thumbnail">
                                <Image
                                    id={`nav-link-image-${index}`}
                                    src={image.src}
                                    alt={image?.alt || "NFT"}
                                    width={167}
                                    height={167}
                                />
                            </span>
                        </Nav.Link>
                    ))}
                </Nav>
                <TabContent className="rn-pd-content">
                    {images?.map((image, index) => (
                        <TabPane
                            key={image.src}
                            eventKey={`nav-${index}`}
                            id={`tab-pane-${index}`}
                        >
                            <div className="rn-pd-thumbnail">
                                <Image
                                    id={`tab-pane-image-${index}`}
                                    src={image.src}
                                    alt={image?.alt || "NFT"}
                                    width={560}
                                    height={560}
                                />
                            </div>
                        </TabPane>
                    ))}
                </TabContent>
            </div>
        </TabContainer>
    </div>
);

GalleryTab.propTypes = {
    images: PropTypes.arrayOf(ImageType),
};
export default GalleryTab;
