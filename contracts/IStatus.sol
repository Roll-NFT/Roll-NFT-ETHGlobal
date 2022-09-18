// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

/// @custom:security-contact loizage@icloud.com
interface IStatus {
    
    /**
     * @dev Roll statuses and possible variations
     * 
     * @param SalesOpen (Open) - Roll is on going and available to participate. Tix sales are open.
     * @param SalesClosed (Closed) - Ready to select winner. Roll is on going and is not available to participate. Tix sales are closed.
     * @param Finished (Succeed) - Winner selected. Roll is finished and is not available to participate. Tix sales are closed. Winner can claim the Prize. Roll owner can claim Revenue.
     * @param Closed (Unsucceed) - No winner selected. Roll is finished and is not available to participate. Tix sales are closed. Roll owner can withdraw the Prize. Participant can refund Tix.
     * 
     */
    enum Status {
        
        SalesOpen,
        SalesClosed,
        Finished,
        Closed

    }

    /**
     * @dev Set Roll status to SalesOpen
     * Participants can buy Tix
     */
    function _openSales(Status status) internal {
        /**
         * @dev Set status to SalesOpen
         */
        status = Status.SalesOpen;
    }

    /**
     * @dev Set Roll status to SalesClosed
     * 
     * Period to finish (choose winner) or close the Roll
     */
    function _closeSales(Status status) internal {
        /**
         * @dev Set status to SalesClosed
         */
        status = Status.SalesClosed;
    }

    /**
     * @dev Set Roll status to Finished
     * Winner can claim the Prize
     * Roll owner can claim Revenue
     * 
     * Happens when Roll was successfully played
     */
    function _finishRoll(Status status) internal {
        /**
         * @dev Set status to Finished
         */
        status = Status.Finished;
    }

    /**
     * @dev Set Roll status to Closed.
     * Roll owner can withdraw the Prize
     * Participants can refund Tix
     * 
     * Happens when conditions to play the Roll are not met
     */
    function _closeRoll(Status status) internal {
        /**
         * @dev set status to Closed
         */
        status = Status.Closed;
    }

    /**
     * @dev Get status of the Roll
     */
    function rollStatus(uint _rollId, uint _rollType) public view virtual returns (Status) {
        
        return();
    }

    modifier rollOnSale() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    modifier rollingWinner() {
        require();
        _;
    }

    modifier rollFinished() {
        require();
        _;
    }

    modifier rollClosed() {
        require();
        _;
    }

}
