import dotenv from "dotenv";

const result = dotenv.config();

import "./config/env.js";
import "./config/database.js";
import app from "./app.js";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});