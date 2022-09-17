import mongoose from "mongoose";

const raffleSchema = new mongoose.Schema(
    {
        raffleId: {
            type: String,
        },
        userId: {
            type: String,
        },
        nftId: {
            type: String,
        },
        nftContractAddress: {
            type: String,
        },
        nftCollection: {
            type: String,
        },
        nftImage: {
            type: String,
        },
        nftToken_id: {
            type: String,
        },
        description: {
            type: String,
        },
        title: {
            type: String,
        },
        endDate: {
            type: Date,
        },
        ticketPrice: {
            type: mongoose.Decimal128,
        },
        ticketSupply: {
            type: Number,
        },
    },
    { timestamps: true }
);

const Raffles =
    mongoose.models.raffles || mongoose.model("raffles", raffleSchema);

export default Raffles;
