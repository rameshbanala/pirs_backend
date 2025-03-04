import mongoose from "mongoose"

const connectMongoDB=async ()=>{
    try {
        const conn= await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully: ",conn.connection.host)
    } catch (error) {
        console.log("Error in connecting to mongodb",error.message);
        process.exit(1);
    }
}
export default connectMongoDB;