import { v4 } from "uuid";
import connectDB from "../../lib/connectDB";
import Raffles from "../../lib/raffleSchema";

export default async (req, res) => {
    const { userId, nft, form } = req.body;

    console.log(`Saving Raffle to the MondoDB... `);

    await connectDB();
    const newRaffle = new Raffles({
        raffleId: v4(),
        userId,
        nftId: nft.id,
        nftContractAddress: nft.contractAddress,
        nftCollection: nft.collection,
        nftImage: nft.image,
        nftTokenId: nft.token_id,
        description: form.description,
        title: form.raffleTitle,
        endDate: form.endDate,
        ticketPrice: form.price,
        ticketSupply: form.supply,
    });
    await newRaffle.save();

    try {
        await newRaffle.save();
        console.log("Raffle saved successfully");
        res.status(200).json({ raffleId: newRaffle.raffleId });
    } catch (error) {
        res.status(400).json({ error });
        console.error(error);
    }
};
