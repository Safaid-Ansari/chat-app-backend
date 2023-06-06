const mongoose = require("mongoose");

const { exec } = require("child_process");

function restartMongoDB() {
  exec("mongod --shutdown", (error) => {
    if (error) {
      console.error("Failed to shutdown MongoDB:", error);
    } else {
      console.log("MongoDB shutdown successful");

      // Start the MongoDB server
      exec("mongod", (error) => {
        if (error) {
          console.error("Failed to start MongoDB:", error);
        } else {
          console.log("MongoDB started successfully");
        }
      });
    }
  });
}

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`MongoDB Connected ${connect.connection.host}`.cyan.underline);
  } catch (error) {
    console.log(`Error : ${error.message}`.red.bold);
    restartMongoDB();
    // process.exit();
  }
};

module.exports = connectDB;
