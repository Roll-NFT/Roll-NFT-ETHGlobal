/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import Button from "@ui/button";
import ProductModal from "@components/modals/product-modal";
import ErrorText from "@ui/error-text";
import { toast } from "react-toastify";
import Anchor from "@ui/anchor";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Router from "next/router";
import { balanceSelect } from "@store/actions/balances";
import { useMoralis } from "react-moralis";

const CreateNewArea = ({ className, space, nft }) => {
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState();
    const [hasImageError, setHasImageError] = useState(false);
    const [previewData, setPreviewData] = useState({});
    const { authenticate, isAuthenticated } = useMoralis();
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
    });

    const handleProductModal = () => {
        setShowProductModal(false);
    };

    const saveRaffle = async (form) => {
        await axios
            .post(
                "/api/rolls",
                { user, nft, form },
                {
                    headers: {
                        "content-type": "application/json",
                    },
                }
            )
            .then((response) => {
                toast(`Raffle saved successfully!`);
                console.log(
                    `Raffle '${response.data.raffleId}' saved successfully!`
                );
                Router.push(`/roll/${response.data.raffleId}`);
            })
            .catch((errorResponse) => {
                toast("Error saving Raffle, please try again later!");
                console.log("Error saving Raffle: ", errorResponse);
            });
    };

    const handleClick = (event) => {
        event.preventDefault();
        if (isAuthenticated) {
            Router.push("/select-nft");
        } else {
            authenticate({
                signingMessage: "Roll NFT Authentication",
            });
        }
    };
    const onSubmit = (data, e) => {
        if (hasImageError) {
            return;
        }
        const { target } = e;
        const submitBtn =
            target.localName === "span" ? target.parentElement : target;
        const isPreviewBtn = submitBtn.dataset?.btn;
        if (isPreviewBtn && selectedImage) {
            setPreviewData({ ...data, image: selectedImage });
            setShowProductModal(true);
        }
        if (!isPreviewBtn) {
            dispatch(balanceSelect(0));
            reset();
            saveRaffle(data);
        }
    };

    useEffect(() => {
        if (nft) {
            setSelectedImage(nft.image);
        }
    }, [nft]);

    useEffect(() => {
        setHasImageError(!selectedImage);
    }, [selectedImage]);

    return (
        <>
            <div
                className={clsx(
                    "create-area",
                    space === 1 && "rn-section-gapTop",
                    className
                )}
            >
                <form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <div className="container">
                        <div className="row g-5">
                            <div className="col-lg-3 offset-1 ml_md--0 ml_sm--0">
                                <div className="upload-area">
                                    <div className="upload-formate mb--30">
                                        <h6 className="title">
                                            Choose NFT for Raffle
                                        </h6>
                                        <p className="formate">
                                            Click the button below to select
                                            from all NFTs inside your wallet
                                        </p>
                                    </div>

                                    <Anchor
                                        path="#"
                                        className="select-nft"
                                        onClick={(e) => {
                                            handleClick(e);
                                        }}
                                    >
                                        <div className="brows-file-wrapper">
                                            {selectedImage && (
                                                <img
                                                    id="createfileImage"
                                                    src={selectedImage}
                                                    alt=""
                                                    data-black-overlay="6"
                                                />
                                            )}
                                            <label
                                                htmlFor="file"
                                                title="No File Choosen"
                                            >
                                                {!selectedImage && (
                                                    <>
                                                        <i className="feather-upload" />
                                                        <span className="text-center">
                                                            Choose a NFT
                                                        </span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </Anchor>
                                    {hasImageError && !selectedImage && (
                                        <ErrorText>NFT is required</ErrorText>
                                    )}
                                </div>
                                {/*
                                <div className="mt--100 mt_sm--30 mt_md--30 d-none d-lg-block">
                                    <h5> Note: </h5>
                                    <span>
                                        {" "}
                                        Service fee : <strong>2.5%</strong>{" "}
                                    </span>{" "}
                                    <br />
                                    <span>
                                        {" "}
                                        You will receive :{" "}
                                        <strong>25.00 ETH $50,000</strong>
                                    </span>
                                </div> */}
                            </div>
                            <div className="col-lg-7">
                                <div className="form-wrapper-one">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="name"
                                                    className="form-label"
                                                >
                                                    Raffle Title*
                                                </label>
                                                <input
                                                    id="raffleTitle"
                                                    placeholder="e.g. 'Super Awesome NFT Raffle'"
                                                    defaultValue={
                                                        nft ? nft.title : ""
                                                    }
                                                    {...register(
                                                        "raffleTitle",
                                                        {
                                                            required:
                                                                "Title is required",
                                                        }
                                                    )}
                                                />
                                                {errors.raffleTitle && (
                                                    <ErrorText>
                                                        {
                                                            errors.raffleTitle
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="description"
                                                    className="form-label"
                                                >
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    rows="3"
                                                    placeholder="e.g. 'This is the Super Awesome NFT Collection, the ultimate...'"
                                                    defaultValue={
                                                        nft
                                                            ? nft.description
                                                            : ""
                                                    }
                                                />
                                                {errors.description && (
                                                    <ErrorText>
                                                        {
                                                            errors.description
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="endDate"
                                                    className="form-label"
                                                >
                                                    Raffle End Date*
                                                </label>
                                                <input
                                                    id="endDate"
                                                    placeholder="e.g. '2022/12/31'"
                                                    type="date"
                                                    {...register("endDate", {
                                                        required:
                                                            "End date is required",
                                                    })}
                                                />
                                                {errors.endDate && (
                                                    <ErrorText>
                                                        {
                                                            errors.endDate
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="price"
                                                    className="form-label"
                                                >
                                                    Ticket Price (ETH)*
                                                </label>
                                                <input
                                                    id="price"
                                                    placeholder="e.g. '0.5'"
                                                    {...register("price", {
                                                        pattern: {
                                                            value: /^[0-9.]+$/,
                                                            message:
                                                                "Please enter a number",
                                                        },
                                                        required:
                                                            "Price is required",
                                                    })}
                                                />
                                                {errors.price && (
                                                    <ErrorText>
                                                        {errors.price?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="supply"
                                                    className="form-label"
                                                >
                                                    Ticket Supply*
                                                </label>
                                                <input
                                                    id="Supply"
                                                    placeholder="e.g. '100'"
                                                    {...register("supply", {
                                                        pattern: {
                                                            value: /^[0-9]+$/,
                                                            message:
                                                                "Please enter a number",
                                                        },
                                                        required:
                                                            "Supply is required",
                                                    })}
                                                />
                                                {errors.supply && (
                                                    <ErrorText>
                                                        {errors.supply?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="input-box pb--20 rn-check-box">
                                                <input
                                                    type="checkbox"
                                                    className="rn-check-box-input"
                                                    id="termsCheckbox"
                                                    {...register(
                                                        "termsCheckbox",
                                                        {
                                                            required:
                                                                "You must accept the terms & conditions",
                                                        }
                                                    )}
                                                />
                                                <label
                                                    className="rn-check-box-label"
                                                    htmlFor="termsCheckbox"
                                                >
                                                    I accept NFT Roll&nbsp;
                                                    <Anchor
                                                        path="/terms-condition"
                                                        target="_blank"
                                                    >
                                                        terms & conditions
                                                    </Anchor>
                                                </label>
                                                <br />
                                                {errors.termsCheckbox && (
                                                    <ErrorText>
                                                        {
                                                            errors.termsCheckbox
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        {/* <div className="col-md-12 col-xl-4">
                                            <div className="input-box">
                                                <Button
                                                    color="primary-alta"
                                                    fullwidth
                                                    type="submit"
                                                    data-btn="preview"
                                                    onClick={handleSubmit(
                                                        onSubmit
                                                    )}
                                                >
                                                    Preview
                                                </Button>
                                            </div>
                                        </div> */}

                                        <div className="d-grid d-md-flex justify-content-md-end">
                                            <div className="input-box ">
                                                <Button type="submit">
                                                    Create Raffle
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {showProductModal && (
                <ProductModal
                    show={showProductModal}
                    handleModal={handleProductModal}
                    data={previewData}
                />
            )}
        </>
    );
};

CreateNewArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1]),
    nft: PropTypes.shape(),
};

CreateNewArea.defaultProps = {
    space: 1,
};

export default CreateNewArea;
