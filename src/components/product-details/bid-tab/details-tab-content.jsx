import PropTypes from "prop-types";
import { IDType, ImageType, RollAttributeType } from "@utils/types";

const DetailsTabContent = ({ owner, properties, tags }) => (
    <div className="rn-pd-bd-wrapper mt--20">
        {properties && (
            <div className="rn-pd-sm-property-wrapper">
                <h6 className="pd-property-title">Property</h6>
                <div className="property-wrapper">
                    {properties.map((property) => (
                        <div
                            key={property.trait_type}
                            className="pd-property-inner"
                        >
                            <span className="color-body type">
                                {property.trait_type}
                            </span>
                            <span className="color-white value">
                                {property.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {tags && (
            <div className="rn-pd-sm-property-wrapper">
                <h6 className="pd-property-title">Tag</h6>
                <div className="catagory-wrapper">
                    {tags.map((tag) => (
                        <div key={tag.id} className="pd-property-inner">
                            {/* <span className="color-body type">{tag.type}</span> */}
                            <span className="color-white value">{tag}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

DetailsTabContent.propTypes = {
    owner: PropTypes.shape({
        name: PropTypes.string,
        total_sale: PropTypes.number,
        slug: PropTypes.string,
        image: ImageType,
    }),
    properties: PropTypes.arrayOf(PropTypes.objectOf(RollAttributeType)),
    tags: PropTypes.arrayOf(PropTypes.string),
};

export default DetailsTabContent;
