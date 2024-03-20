import "./src/database/mongo.database";
import server from "./src/app";

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
