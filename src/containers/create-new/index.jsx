/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { toast } from "react-toastify";
import Anchor from "@ui/anchor";
import { useDispatch } from "react-redux";
import axios from "axios";
import Router from "next/router";
import { balanceSelect } from "@store/actions/balances";
import { useMoralis } from "react-moralis";
import { ThreeDots } from "react-loader-spinner";
import { formatWithOptions } from "date-fns/fp";
import { eo } from "date-fns/locale";
import { addDays, addYears } from "date-fns";

const CreateNewArea = ({ className, space, nft }) => {
    const [selectedImage, setSelectedImage] = useState();
    const [currencies, setCurrencies] = useState(null);
    const [hasImageError, setHasImageError] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { authenticate, isAuthenticated, user } = useMoralis();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
    });

    const dateToString = formatWithOptions({ locale: eo }, "yyyy-MM-dd");

    const saveRaffle = async (form) => {
        setLoading(true);
        const userObj = {
            id: user.id,
            address: user.get("ethAddress"),
            chain: user.get("chain"),
            chainId: user.get("chainId"),
            networkId: user.get("networkId"),
        };
        await axios
            .post(
                `${process.env.NEXT_PUBLIC_API_ENDPOINT}/rolls`,
                { user: userObj, nft, form },
                {
                    headers: {
                        "content-type": "application/json",
                    },
                }
            )
            .then((response) => {
                toast(`Roll saved successfully! You will be redirected.`);
                Router.push(`/roll/${response.data.raffleId}`).then(() => {
                    reset();
                    setLoading(false);
                });
            })
            .catch((errorResponse) => {
                toast("Error saving Roll, please try again later!");
                console.log(errorResponse);
                setLoading(false);
            });
    };

    const handleClick = (event) => {
        setLoading(true);
        event.preventDefault();
        if (isAuthenticated) {
            Router.push("/select-nft").then(() => {
                setLoading(false);
            });
        } else {
            authenticate({
                signingMessage: "Roll NFT Authentication",
            });
            setLoading(false);
        }
    };

    const onSubmit = (data) => {
        if (loading) {
            return;
        }
        if (hasImageError) {
            return;
        }
        dispatch(balanceSelect(0));
        saveRaffle(data);
    };

    useEffect(() => {
        if (nft) {
            setSelectedImage(nft.image);
        }
    }, [nft]);

    useEffect(() => {
        setHasImageError(!selectedImage);
    }, [selectedImage]);

    useEffect(() => {
        setCurrencies(process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES.split(","));
    }, []);

    return (
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
                                        Choose NFT for Roll
                                    </h6>
                                    <p className="formate">
                                        Click the button below to select from
                                        all NFTs inside your wallet
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
                                            {loading && !selectedImage && (
                                                <ThreeDots
                                                    height="40"
                                                    width="40"
                                                    radius="9"
                                                    color="#00a3ff"
                                                    ariaLabel="three-dots-loading"
                                                    wrapperStyle={{
                                                        display: "block",
                                                    }}
                                                    visible
                                                />
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
                                                Roll Title*
                                            </label>
                                            <input
                                                id="raffleTitle"
                                                placeholder="e.g. 'Super Awesome NFT Roll'"
                                                defaultValue={
                                                    nft ? nft.title : ""
                                                }
                                                {...register("raffleTitle", {
                                                    required:
                                                        "Title is required",
                                                })}
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
                                                    nft ? nft.description : ""
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
                                                Roll End Date*
                                            </label>
                                            <input
                                                id="endDate"
                                                placeholder="e.g. '2022/12/31'"
                                                min={dateToString(
                                                    addDays(new Date(), 1)
                                                )}
                                                max={dateToString(
                                                    addYears(new Date(), 1)
                                                )}
                                                type="date"
                                                {...register("endDate", {
                                                    required:
                                                        "End date is required",
                                                })}
                                            />
                                            {errors.endDate && (
                                                <ErrorText>
                                                    {errors.endDate?.message}
                                                </ErrorText>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <div className="input-box pb--20">
                                            <label
                                                htmlFor="currency"
                                                className="form-label"
                                            >
                                                Currency*
                                            </label>
                                            <select
                                                id="currency"
                                                placeholder="e.g. '0.5'"
                                                {...register("currency", {
                                                    required:
                                                        "Currency is required",
                                                })}
                                            >
                                                <option value="">Select</option>
                                                {currencies &&
                                                    currencies.map(
                                                        (currency) => (
                                                            <option
                                                                value={currency}
                                                                key={currency}
                                                            >
                                                                {currency}
                                                            </option>
                                                        )
                                                    )}
                                            </select>
                                            {errors.currency && (
                                                <ErrorText>
                                                    {errors.currency?.message}
                                                </ErrorText>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <div className="input-box pb--20">
                                            <label
                                                htmlFor="price"
                                                className="form-label"
                                            >
                                                Ticket Price*
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
                                                {...register("termsCheckbox", {
                                                    required:
                                                        "You must accept the terms & conditions",
                                                })}
                                            />
                                            <label
                                                className="rn-check-box-label"
                                                htmlFor="termsCheckbox"
                                            >
                                                I accept Roll NFT&apos;s&nbsp;
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

                                    <div className="d-grid d-md-flex justify-content-md-end">
                                        <div className="input-box ">
                                            <Button type="submit">
                                                {!loading ? (
                                                    "Create Roll"
                                                ) : (
                                                    <ThreeDots
                                                        height="25"
                                                        width="50"
                                                        radius="9"
                                                        color="#fff"
                                                        ariaLabel="three-dots-loading"
                                                        wrapperStyle={{
                                                            display: "block",
                                                        }}
                                                        visible
                                                    />
                                                )}
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
