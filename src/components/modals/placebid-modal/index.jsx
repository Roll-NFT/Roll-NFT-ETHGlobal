import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "@ui/button";
import { RollTicketType } from "@utils/types";

const PlaceBidModal = ({
    show,
    cancel,
    confirm,
    title,
    ticketPrice,
    ticketCurrency,
    ticket,
}) => (
    <Modal
        className="rn-popup-modal placebid-modal-wrapper"
        show={show}
        onHide={cancel}
        centered
    >
        {show && (
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={cancel}
            >
                <i className="feather-x" />
            </button>
        )}
        <Modal.Header>
            <h3 className="modal-title">Order summary</h3>
        </Modal.Header>
        <Modal.Body>
            <p className="mb-0">
                You are about to purchase tickets for: {title}
            </p>
            <div className="placebid-form-box">
                <div className="bid-content">
                    <div className="bid-content-mid">
                        <div className="bid-content-left">
                            <span>Number of tickets</span>
                            <span>Ticket price</span>
                            <span>Service fee (5%)</span>
                            <span>
                                <b>Total amount</b>
                            </span>
                        </div>
                        <div className="bid-content-right">
                            <span>{ticket.quantity}</span>
                            <span>
                                {ticketPrice}
                                {ticketCurrency}
                            </span>
                            <span>
                                {ticket.fee}
                                {ticketCurrency}
                            </span>
                            <span>
                                <b>
                                    {ticket.total}
                                    {ticketCurrency}
                                </b>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bit-continue-button">
                    <Button
                        color="primary-alta"
                        size="medium"
                        onClick={cancel}
                        className="float-start"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="medium"
                        className="float-end"
                        onClick={confirm}
                    >
                        Buy tickets
                    </Button>
                </div>
            </div>
        </Modal.Body>
    </Modal>
);

PlaceBidModal.propTypes = {
    show: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
    confirm: PropTypes.func.isRequired,
    title: PropTypes.string,
    ticketPrice: PropTypes.number,
    ticketCurrency: PropTypes.string,
    ticket: PropTypes.objectOf(RollTicketType),
};
export default PlaceBidModal;
