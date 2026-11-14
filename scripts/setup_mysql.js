import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { initMySQL, syncDataToMySQL, getMySQLConfig } from "../server/mysql.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
  const config = getMySQLConfig();
  console.log("==================================================");
  console.log(" Digital Time Capsule - MySQL Database Setup Tool");
  console.log("==================================================");
  console.log(`Connecting to MySQL on ${config.host}:${config.port} (user: ${config.user})...`);

  const ok = await initMySQL({ silent: false });
  if (!ok) {
    console.error("\n[Setup Failed] Unable to establish connection with MySQL server.");
    console.error("Please verify that:");
    console.error("1. MySQL service is running on your machine (e.g. MySQL80 service or XAMPP).");
    console.error("2. Your .env file has the correct DB_HOST, DB_PORT, DB_USER, and DB_PASSWORD.\n");
    process.exit(1);
  }

  // Read current database.json to populate MySQL
  const jsonPath = path.resolve(process.cwd(), "data", "database.json");
  if (fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, "utf-8");
      const jsonData = JSON.parse(content);
      console.log(`\nImporting existing JSON data into MySQL...`);
      console.log(`- Users: ${jsonData.users?.length || 0}`);
      console.log(`- Capsules: ${jsonData.capsules?.length || 0}`);
      console.log(`- Memories: ${jsonData.memories?.length || 0}`);
      console.log(`- Letters: ${jsonData.letters?.length || 0}`);
      
      const synced = await syncDataToMySQL(jsonData);
      if (synced) {
        console.log("\n[Success] All records migrated successfully into MySQL database!");
      } else {
        console.warn("\n[Warning] Some records could not be synced into MySQL.");
      }
    } catch (err) {
      console.error("Error reading JSON file during migration:", err);
    }
  } else {
    console.log("No data/database.json found, blank MySQL schema ready.");
  }

  console.log("\nMySQL setup completed successfully.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal setup error:", err);
  process.exit(1);
});

