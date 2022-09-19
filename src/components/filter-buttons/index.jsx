import PropTypes from "prop-types";
import clsx from "clsx";

const FilterButtons = ({ buttons, filterHandler, active }) => (
    <div className="button-group isotop-filter filters-button-group d-flex justify-content-start justify-content-lg-end mt_md--30 mt_sm--30">
        <button
            type="button"
            className={clsx(active === "all" && "is-checked")}
            onClick={() => filterHandler("all")}
        >
            All
        </button>
        {buttons.map((button) => (
            <button
                key={button}
                type="button"
                className={clsx(button === active && "is-checked")}
                onClick={() => filterHandler(button)}
            >
                {button}
            </button>
        ))}
    </div>
);

FilterButtons.propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.string),
    filterHandler: PropTypes.func,
    active: PropTypes.string.isRequired,
};

FilterButtons.defaultProps = {
    active: "all",
};

export default FilterButtons;
