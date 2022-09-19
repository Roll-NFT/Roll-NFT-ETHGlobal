import connectDB from "../../../lib/connectDB";
import Raffles from "../../../lib/raffleSchema";

export default async (req, res) => {
    await connectDB();

    const { slug } = req.query;

    // POST /api/rolls/hero
    if (req.method === "POST" && slug === "hero") {
        try {
            const { filter, sort } = req.body;
            const data = await Raffles.find({
                filter,
            })
                .sort(sort)
                .limit(2);
            res.status(200).json({ data });
        } catch (error) {
            res.status(400).json({ error });
        }
        return;
    }

    let data = null;
    const filter = { raffleId: slug };
    console.log(`Searching for Raffle with id '${slug}' in the MondoDB... `);
    try {
        data = await Raffles.findOne(filter);
    } catch (error) {
        res.status(400).json({ error });
        console.error(error);
    }

    if (!data) {
        console.log("Raffle not found!");
        res.status(400).json({
            error: { message: "Raffle not found!" },
        });
    }

    // GET /api/rolls
    if (req.method === "GET") {
        console.log("Raffle found!");
        res.status(200).json({ data });
    }

    // PUT /api/rolls
    if (req.method === "PUT") {
        console.log(`data is: `);
        console.log(data);
        console.log(`req.body is: `);
        console.log(req.body);
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
        console.log(`Updating Raffle with id '${slug}'... `);
        await Raffles.findOneAndUpdate({ raffleId: slug }, update);
        console.log("Raffle updated!");
        data = await Raffles.findOne(filter);
        res.status(200).json({ data });
    }
};
