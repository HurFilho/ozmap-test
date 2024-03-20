import "dotenv/config";
import mongoose from "mongoose";

const init = async function () {
  await mongoose.connect(process.env.MONGO_URI);
};

export default init();
