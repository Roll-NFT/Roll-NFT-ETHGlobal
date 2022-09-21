import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    quantity: {
        type: Number,
    },
    userId: {
        type: String,
    },
    userAddress: {
        type: String,
    },
    total: {
        type: Number,
    },
    fee: {
        type: Number,
    },
    createdAt: {
        type: Date,
    },
});

const attributeSchema = new mongoose.Schema({
    trait_type: {
        type: String,
    },
    value: {
        type: String,
    },
});

const raffleSchema = new mongoose.Schema(
    {
        raffleId: {
            type: String,
        },
        userId: {
            type: String,
        },
        userAddress: {
            type: String,
        },
        network: {
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
        nftTokenId: {
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
            type: Number,
        },
        ticketCurrency: {
            type: String,
        },
        ticketSupply: {
            type: Number,
        },
        likeCount: {
            type: Number,
        },
        categories: {
            type: [String],
        },
        attributes: {
            type: [attributeSchema],
        },
        tickets: {
            type: [ticketSchema],
        },
        ticketsSold: {
            type: Number,
        },
        ticketsTotal: {
            type: Number,
        },
    },
    { timestamps: true }
);

const Raffles =
    mongoose.models.raffles || mongoose.model("raffles", raffleSchema);

export default Raffles;
