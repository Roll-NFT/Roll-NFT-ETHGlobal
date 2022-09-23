import Cors from "cors";
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

    const { slug } = req.query;
    let data = null;

    // POST /api/rolls/hero
    if (req.method === "GET" && slug === "hero") {
        try {
            data = await Raffles.find({ endDate: { $gte: new Date() } })
                .sort("-ticketsSold")
                .limit(2);
            res.status(200).json({ data });
        } catch (error) {
            res.status(400).json({ error });
        }
        return;
    }

    const filter = { raffleId: slug };
    try {
        data = await Raffles.findOne(filter);
    } catch (error) {
        res.status(400).json({ error });
        console.error(error);
    }

    if (!data) {
        res.status(400).json({
            error: { message: "Roll not found!" },
        });
    }

    // GET /api/rolls
    if (req.method === "GET") {
        res.status(200).json({ data });
    }

    // PUT /api/rolls
    if (req.method === "PUT") {
        const { ticket } = req.body;
        const { tickets } = data;
        const newTickets = [...tickets, ticket];
        const ticketsSold = newTickets.reduce(
            (sumQty, item) => sumQty + item.quantity,
            0
        );
        const ticketsTotal = newTickets.reduce(
            (sum, item) => sum + (item.total - item.fee),
            0
        );
        const update = {
            tickets: newTickets,
            ticketsSold,
            ticketsTotal,
        };
        await Raffles.findOneAndUpdate({ raffleId: slug }, update);
        data = await Raffles.findOne(filter);
        res.status(200).json({ data });
    }
};
