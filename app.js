const app = require("./utils/config");
const port = process.env.PORT || 8000;

const { connectToDatabase } = require("./utils/db");
const routes = require("./route/index.routes");

connectToDatabase()
  .then(() => {
    app.use(routes);

    app.listen(port, () => {
      console.log("Listening on port " + port);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
