import { v4 } from "uuid";
import connectDB from "../../../lib/connectDB";
import Raffles from "../../../lib/raffleSchema";

export default async (req, res) => {
    await connectDB();

    // POST /api/rolls/
    if (req.method === "POST") {
        const { user, nft, form } = req.body;

        console.log(`Saving Raffle to the MondoDB... `);

        const newRaffle = new Raffles({
            raffleId: v4(),
            userId: user.id,
            userAddress: user.address,
            nftId: nft.id,
            nftContractAddress: nft.contractAddress,
            nftCollection: nft.collection,
            nftImage: nft.image,
            nftTokenId: nft.token_id,
            attributes: nft.attributes,
            description: form.description,
            title: form.raffleTitle,
            endDate: form.endDate,
            ticketSupply: form.supply,
            ticketPrice: form.price,
            ticketCurrency: "ETH",
            categories: ["Art"],
            likeCount: 0,
            tickets: [],
            ticketsSold: 0,
            ticketsTotal: 0,
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

        // GET /api/rolls/
    } else if (req.method === "GET") {
        const { query } = req;
        try {
            let filter = { $gte: query.startDate };
            if (query.endDate) {
                filter = { $gte: query.startDate, $lte: query.endDate };
            }
            const data = await Raffles.find({
                endDate: filter,
            });
            res.status(200).json({ data });
        } catch (error) {
            res.status(400).json({ error });
        }
    }
};
