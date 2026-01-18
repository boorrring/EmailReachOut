import app from "./app";
import { env } from "./config/env";
import { testConnection } from "./config/db";

testConnection();

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
