import mongoose from "mongoose";

const connectMongoDb = async () => {
  try {
    const connec = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${connec.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDb;
