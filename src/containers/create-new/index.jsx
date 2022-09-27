/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { toast } from "react-toastify";
import Anchor from "@ui/anchor";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Router from "next/router";
import { balanceSelect } from "@store/actions/balances";
import { useMoralis } from "react-moralis";
import { ThreeDots } from "react-loader-spinner";
import { formatWithOptions } from "date-fns/fp";
import { eo } from "date-fns/locale";
import { addDays, addYears } from "date-fns";
import ROLTContract from "@lib/contracts/_roltcontract.json";
import ERC721Contract from "@lib/contracts/_erc721.json";
import { ticketUpdate, approveUpdate } from "@store/actions/rolls";
import { v4 } from "uuid";

const CreateNewArea = ({ className, space }) => {
    const [selectedImage, setSelectedImage] = useState();
    const [currencies, setCurrencies] = useState(null);
    const [currencyMapping, setCurrencyMapping] = useState(null);
    const [confirmButtonLabel, setConfirmButtonLabel] = useState("Approve");
    const [hasImageError, setHasImageError] = useState(false);
    const [roltContract, setRoltContract] = useState(null);
    const [nftContract, setNftContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nft, setNft] = useState(null);
    const dispatch = useDispatch();
    const approved = useSelector((state) => state.approved);
    const ticket = useSelector((state) => state.ticket);
    const balances = useSelector((state) => state.balances);
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

    const getAvailableCurrencies = () => {
        const _currencies =
            process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES.split(",");
        const _addresses =
            process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES_ADDRESSES.split(",");
        const currenciesMapping = {};
        for (let i = 0; i < _currencies.length; i++) {
            currenciesMapping[_currencies[i]] = _addresses[i];
        }
        setCurrencyMapping(currenciesMapping);
    };

    const getRoltContract = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_ROLT_CONTRACT,
            ROLTContract.abi,
            signer
        );
        setRoltContract(contract);
    };

    const getNftContract = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
            nft.contract_address,
            ERC721Contract.abi,
            signer
        );
        setNftContract(contract);
    };

    const saveRaffle = async () => {
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
                { user: userObj, nft, form: ticket },
                {
                    headers: {
                        "content-type": "application/json",
                    },
                }
            )
            .then((response) => {
                toast(
                    `Roll saved successfully! You will be redirected shortly.`
                );
                Router.push(`/roll/${response.data.raffleId}`).then(() => {
                    dispatch(approveUpdate(null));
                    dispatch(ticketUpdate(null));
                    dispatch(balanceSelect(0));
                    setLoading(false);
                    setConfirmButtonLabel("Approve");
                    reset();
                });
            })
            .catch((errorResponse) => {
                toast("Error saving Roll, please try again later!");
                console.log(errorResponse);
            })
            .finally(() => setLoading(false));
    };

    async function mint() {
        if (roltContract) {
            setLoading(true);
            try {
                const {
                    rollId, // string
                    rollName, // string
                    ticketSupply, // uint
                    currencyToken, // address
                    ticketPrice, // uint256 **
                    deadline, // uint64
                } = ticket;
                const prizeAddress = nft.contract_address; // address
                const prizeTokenId = nft.token_id; // uint256
                const mintTxn = await roltContract.mint(
                    rollId,
                    rollName,
                    ticketSupply,
                    currencyToken,
                    ticketPrice,
                    prizeAddress,
                    prizeTokenId,
                    deadline
                );
                await mintTxn.wait();
                saveRaffle();
                toast(
                    "ROLT NFT minted successfully! This NFT proves that you are the owner of this Roll."
                );
            } catch (error) {
                console.log(error);
                toast(`Token mint failed! ${error.reason}`);
                setLoading(false);
            }
        }
    }

    const approveToken = async () => {
        if (nftContract) {
            setLoading(true);
            try {
                const txn = await nftContract.approve(
                    process.env.NEXT_PUBLIC_ROLT_CONTRACT,
                    nft.token_id
                );
                await txn.wait();
                setConfirmButtonLabel("Create Roll");
                toast(
                    "Transfer approved successfully. You can now create the Roll!"
                );
            } catch (error) {
                toast(error.reason);
            }
            setLoading(false);
        }
    };

    const checkNetwork = () => {
        const networks = [process.env.NEXT_PUBLIC_APP_CHAIN_ID_HEX];
        return networks.includes(user.get("chainId"));
    };

    const handleClick = (event) => {
        setLoading(true);
        event.preventDefault();
        if (isAuthenticated) {
            if (checkNetwork()) {
                Router.push("/select-nft").then(() => {
                    setLoading(false);
                });
            } else {
                toast(
                    `The current network is not support. Please change to ${process.env.NEXT_PUBLIC_APP_CHAIN_ID_NAME}`
                );
                setLoading(false);
            }
        } else {
            authenticate({
                signingMessage: "Roll NFT Authentication",
            });
            setLoading(false);
        }
    };

    const onSubmit = (data) => {
        dispatch(
            ticketUpdate({
                rollId: v4(), // string
                rollName: data.raffleTitle, // Smart Contract
                ticketSupply: data.supply, // Smart Contract
                currencyToken: currencyMapping[data.currency], // Smart Contract
                ticketPrice: data.price, // Smart Contract
                deadline: Math.floor(+new Date(data.endDate) / 1000), // Smart Contract
                endDate: data.endDate, // API
                ticketCurrency: data.currency, // API
                description: data.description, // API
            })
        );
        if (loading) {
            return;
        }
        if (hasImageError) {
            return;
        }
        if (!approved) {
            approveToken();
            return;
        }
        const token_id = ethers.utils.parseUnits(nft.token_id.toString(), 0);
        if (Math.abs(approved.tokenId - token_id) < 1) {
            mint();
        } else {
            dispatch(approveUpdate(null));
        }
    };

    useEffect(() => {
        const onTokenApproval = (owner, spender, tokenId) => {
            dispatch(approveUpdate({ owner, spender, tokenId }));
        };
        if (nftContract) {
            nftContract.on("Approval", onTokenApproval);
        }
        return () => {
            if (nftContract) {
                nftContract.off("Approval", onTokenApproval);
            }
        };
    }, [nftContract]);

    useEffect(() => {
        if (isAuthenticated) {
            getRoltContract();
            if (nft) {
                getNftContract();
            }
        }
    }, [user, nft]);

    useEffect(() => {
        if (nft) {
            setSelectedImage(nft.image);
        }
    }, [nft]);

    useEffect(() => {
        setHasImageError(!selectedImage);
    }, [selectedImage]);

    useEffect(() => {
        getAvailableCurrencies();
        setCurrencies(process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES.split(","));
        if (balances) {
            const selected = balances.filter((item) => item.selected === true);
            if (selected?.length > 0) {
                setNft(selected[0]);
            }
        }
        return () => {
            setSelectedImage(null);
            setCurrencies(null);
            setCurrencyMapping(null);
            setConfirmButtonLabel("Approve");
            setHasImageError(null);
            setRoltContract(null);
            setNftContract(null);
            setLoading(null);
            setNft(null);
        };
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
                                                    confirmButtonLabel
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
};

CreateNewArea.defaultProps = {
    space: 1,
};

export default CreateNewArea;
