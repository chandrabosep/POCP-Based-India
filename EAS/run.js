import { eventData, userData } from "./data.js";
import { multiAttest } from "./multiAttest.js";

const run = async () => {
    await multiAttest(userData);
}

run()