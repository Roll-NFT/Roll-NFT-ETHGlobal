import PropTypes from "prop-types";
import clsx from "clsx";
import Anchor from "@ui/anchor";

const Breadcrumb = ({
    pageTitle,
    currentPage,
    className,
    space,
    rootPath,
    rootTitle,
}) => (
    <div
        className={clsx(
            "rn-breadcrumb-inner",
            className,
            space === 1 && "ptb--10"
        )}
    >
        <div className="container">
            <div className="row align-items-center">
                <div className="col-lg-6 col-md-6 col-12">
                    <h5 className="pageTitle text-center text-md-start">
                        {pageTitle}
                    </h5>
                </div>
                <div className="col-lg-6 col-md-6 col-12">
                    <ul className="breadcrumb-list">
                        <li className="item">
                            <Anchor path={rootPath}>{rootTitle}</Anchor>
                        </li>
                        <li className="separator">
                            <i className="feather-chevron-right" />
                        </li>
                        <li className="item current">
                            {currentPage || pageTitle}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

Breadcrumb.propTypes = {
    rootPath: PropTypes.string,
    rootTitle: PropTypes.string,
    pageTitle: PropTypes.string.isRequired,
    currentPage: PropTypes.string,
    className: PropTypes.string,
    space: PropTypes.oneOf([1]),
};

Breadcrumb.defaultProps = {
    rootPath: "/",
    rootTitle: "Home",
    space: 1,
};

export default Breadcrumb;
