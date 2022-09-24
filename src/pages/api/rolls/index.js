import Cors from "cors";
import { v4 } from "uuid";
import connectDB from "../../../lib/connectDB";
import Raffles from "../../../lib/raffleSchema";

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const whitelistedDomains = process.env.WHITELISTED_DOMAINS.split(",");
const cors = Cors({
    origin: whitelistedDomains,
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async (req, res) => {
    // Run the middleware
    await runMiddleware(req, res, cors);

    await connectDB();

    // POST /api/rolls/
    if (req.method === "POST") {
        const { user, nft, form } = req.body;

        const categories = [
            "Art",
            "Music",
            "Metaverse",
            "Domain Name",
            "Game",
            "Collectibles",
        ];
        const random = Math.floor(Math.random() * categories.length);
        const category = categories[random];

        const newRaffle = new Raffles({
            raffleId: v4(),
            userId: user.id,
            userAddress: user.address,
            network: { id: user.networkId, name: user.chain },
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
            ticketCurrency: form.currency,
            categories: [category],
            likeCount: 0,
            tickets: [],
            ticketsSold: 0,
            ticketsTotal: 0,
        });
        await newRaffle.save();

        try {
            await newRaffle.save();
            res.status(200).json({ raffleId: newRaffle.raffleId });
        } catch (error) {
            res.status(400).json({ error });
            console.error(error);
        }
    }

    // GET /api/rolls/
    if (req.method === "GET") {
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
