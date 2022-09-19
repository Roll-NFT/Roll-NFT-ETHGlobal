import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";

const ReportModal = ({ show, handleModal }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });
    const [serverState, setServerState] = useState({
        submitting: false,
        status: null,
    });
    const handleServerResponse = (ok, msg, form) => {
        setServerState({
            submitting: false,
            status: { ok, msg },
        });
        if (ok) {
            form.reset();
            // handleModal();
        }
    };
    const onSubmit = (data, e) => {
        const form = e.target;
        setServerState({ submitting: true });
        axios({
            method: "post",
            url: process.env.NEXT_PUBLIC_GETFORM_URL,
            data,
        })
            .then((_res) => {
                handleServerResponse(
                    true,
                    "Thanks for the report! We will work on your feedback.",
                    form
                );
            })
            .catch((err) => {
                handleServerResponse(
                    false,
                    "Error! Try again in a few seconds.",
                    form
                );
            });
    };

    return (
        <Modal
            className="rn-popup-modal report-modal-wrapper"
            show={show}
            onHide={handleModal}
            centered
        >
            {show && (
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleModal}
                >
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header className="report-modal-header">
                <h5 className="modal-title">Why are you reporting?</h5>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Describe why you think this item should be removed from our
                    site.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} id="contact-form">
                    <div className="report-form-box">
                        <h6 className="title">Message</h6>
                        <textarea
                            id="issue"
                            placeholder="Write issues"
                            {...register("issue", {
                                required:
                                    "A description of the issue is required",
                            })}
                        />
                        {errors.issue && (
                            <ErrorText>{errors.issue?.message}</ErrorText>
                        )}
                        <div className="report-button">
                            <Button
                                type="submit"
                                size="medium"
                                className="mr--10 w-auto"
                            >
                                Report
                            </Button>
                            <Button
                                color="primary-alta"
                                size="medium"
                                className="w-auto"
                                onClick={handleModal}
                            >
                                Cancel
                            </Button>
                            {serverState.status && (
                                <p
                                    className={`mt-4 font-14 ${
                                        !serverState.status.ok
                                            ? "text-danger"
                                            : "text-success"
                                    }`}
                                >
                                    {serverState.status.msg}
                                </p>
                            )}
                        </div>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

ReportModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired,
};
export default ReportModal;
