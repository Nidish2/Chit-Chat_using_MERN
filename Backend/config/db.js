const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log(`Connecting to MongoDB: ${process.env.MONGO_URI}`);
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold);
        console.error(error); // Additional error logging
        process.exit(1); // Exit with failure
    }
};

module.exports = connectDB;
