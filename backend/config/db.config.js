import mongoose from "mongoose";
import { configDotenv } from "dotenv";
const RECONNECT_INTERVAL = 5000;
configDotenv()

const db_uri = process.env.DB_URI

const connectMongoose = async () => {
    try {
        return await mongoose.connect(db_uri,{ bufferTimeoutMS: 30000 });
    } catch (error) {
        console.log(error);
        console.log(`Reconnecting in ${RECONNECT_INTERVAL/1000}s ...`);
        setTimeout(connectMongoose,RECONNECT_INTERVAL)
    }
}
export default connectMongoose();


