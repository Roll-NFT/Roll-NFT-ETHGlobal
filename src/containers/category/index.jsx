import PropTypes from "prop-types";
import clsx from "clsx";
import CategoryCard from "@components/category-card";
import { useDispatch } from "react-redux";
import { categoryUpdate } from "@store/actions/rolls";

const CategoryArea = ({ className, space, data: { items } }) => {
    const dispatch = useDispatch();

    const onClick = (category) => {
        dispatch(categoryUpdate(category));
    };

    return (
        <div
            className={clsx(
                "category-area",
                space === 1 && "pt--70",
                className
            )}
        >
            <div className="container">
                <div className="row g-5">
                    {items?.map((item, i) => (
                        <div
                            className="col-lg-3 col-xl-2 col-md-4 col-sm-6"
                            data-sal-delay={200 + i * 100}
                            data-sal="slide-up"
                            data-sal-duration="800"
                            key={item.id}
                        >
                            <CategoryCard
                                icon={item.icon}
                                title={item.title}
                                path={item.path}
                                onClick={onClick}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

CategoryArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1, 2]),
    data: PropTypes.shape({
        items: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                icon: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
                path: PropTypes.string.isRequired,
            })
        ),
    }),
};

CategoryArea.defaultProps = {
    space: 1,
};

export default CategoryArea;
