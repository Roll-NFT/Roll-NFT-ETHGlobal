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

    // GET /api/users/rolls
    if (req.method === "GET") {
        const { query } = req;
        try {
            const data = await Raffles.find({
                userId: query.user,
            }).sort("-endDate");
            res.status(200).json({ data });
        } catch (error) {
            res.status(400).json({ error });
        }
    }
};
