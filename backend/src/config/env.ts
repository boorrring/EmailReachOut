export const env = {
  port: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || "5432",
  DB_USER: process.env.DB_USER || "reachuser",
  DB_PASSWORD: process.env.DB_PASSWORD || "reachpass",
  DB_NAME: process.env.DB_NAME || "reachinbox"
};
