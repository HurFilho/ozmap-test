const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/ozmap-mongodb";

const init = async function () {
  await mongoose
    .connect(MONGO_URI)
    .then(() => {
      return mongoose.connection.db.collections();
    })
    .then((collections) => {
      const deletePromises = collections.map((collection) => {
        return collection.deleteMany({});
      });
      return Promise.all(deletePromises);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
};

init();
