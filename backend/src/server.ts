import app from "./app";
import { env } from "./config/env";
import { testConnection } from "./config/db";
import { createTables } from "./db/migrations";

const startServer = async () => {
  await testConnection();
  await createTables();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();
