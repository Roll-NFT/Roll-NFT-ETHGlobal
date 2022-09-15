import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";

const PlaceBidModal = ({ show, handleModal }) => (
    <Modal
        className="rn-popup-modal placebid-modal-wrapper"
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
        <Modal.Header>
            <h3 className="modal-title">Order summary</h3>
        </Modal.Header>
        <Modal.Body>
            <p className="mb-0">You are about to purchase tickets for XXXXX</p>
            <div className="placebid-form-box">
                <div className="bid-content">
                    <div className="bid-content-mid">
                        <div className="bid-content-left">
                            <span>Number of tickets</span>
                            <span>Ticket price</span>
                            <span>Service fee</span>
                            <span>
                                <b>Total amount</b>
                            </span>
                        </div>
                        <div className="bid-content-right">
                            <span>XXX</span>
                            <span>XXX</span>
                            <span>10 wETH</span>
                            <span>
                                <b>9588 wETH</b>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bit-continue-button">
                    <Button
                        color="primary-alta"
                        size="medium"
                        onClick={handleModal}
                        className="float-start"
                    >
                        Cancel
                    </Button>
                    <Button path="/connect" size="medium" className="float-end">
                        Buy tickets
                    </Button>
                </div>
            </div>
        </Modal.Body>
    </Modal>
);

PlaceBidModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired,
};
export default PlaceBidModal;
