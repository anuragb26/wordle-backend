import mongoose from "mongoose";
import debug from "debug";

const log: debug.IDebugger = debug("app:mongoose-service");

class MongooseService {
  private count = 0;
  private mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  };
  constructor() {
    this.connectWithRetry();
  }
  getMongoose() {
    return mongoose;
  }
  connectWithRetry = () => {
    if (!process.env.DB_URL) {
      throw new Error("No database configured!!");
    }
    log(`Attempting MongoDB connection (will retry if needed)`);
    mongoose
      .connect(process.env.DB_URL, this.mongooseOptions)
      .then(() => {
        log("MongoDB is  connected");
      })
      .catch((err) => {
        const retryWithSeconds = 5;
        log(
          `Unable to connect to mongodb,retry count ${++this
            .count} after  ${retryWithSeconds} seconds`,
          err
        );
      });
  };
}

export default new MongooseService();
