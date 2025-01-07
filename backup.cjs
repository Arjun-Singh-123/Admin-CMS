// backup.ts
// import { exec } from "child_process";
// import path from "path";
// import cron from "node-cron";
var exec = require("child_process").exec;
var path = require("path");
var cron = require("node-cron");
// import dotenv from "dotenv";
// Load environment variables from .env file
// dotenv.config();
// Define the cron job to run at 2:00 AM every day
cron.schedule("* * * * *", function () {
    console.log("Running daily backup task at 2 AM");
    var dbHost = "aws-0-ap-south-1.pooler.supabase.com";
    var dbPort = 6543;
    var dbUser = "postgres";
    var dbName = "postgres";
    var backupDir = path.resolve(process.cwd(), "backups");
    var backupFile = path.join(backupDir, "supabase_backup_".concat(new Date().toISOString().split("T")[0], ".sql"));
    console.log("Database Password:", process.env.DB_PASSWORD);
    // Ensure the backups directory exists
    exec("mkdir  ".concat(backupDir), function (err) {
        if (err) {
            console.error("Error creating backup directory:", err);
            return;
        }
        // Construct the connection string
        var connectionString = "postgresql://postgres.lpflijrmgfjwrcvpdvpi:".concat(process.env.DB_PASSWORD, "@aws-0-ap-south-1.pooler.supabase.com:6543/postgres");
        // Execute the pg_dump command
        var command = "pg_dump \"".concat(connectionString, "\" -f \"").concat(backupFile, "\"");
        exec(command, function (error, stdout, stderr) {
            if (error) {
                console.error("Error during pg_dump:", error);
                return;
            }
            console.log("Backup completed successfully:", stdout);
        });
    });
});
// Start the cron job immediately
console.log("Backup script is running...");
// // backup.ts
// import { exec } from "child_process";
// import path from "path";
// import cron from "node-cron";
// // Define the cron job to run at 2:00 AM every day
// cron.schedule("0 2 * * *", () => {
//   console.log("Running daily backup task at 2 AM");
// Define the cron job to run every minute for testing
// cron.schedule('* * * * *', () =>  // This runs every minute
//   const dbHost = "db.<unique-subdomain>.supabase.co";
//   const dbPort = 5432;
//   const dbUser = "postgres";
//   const dbName = "postgres";
//   const backupDir = path.resolve(process.cwd(), "backups");
//   const backupFile = path.join(
//     backupDir,
//     `supabase_backup_${new Date().toISOString().split("T")[0]}.sql`
//   );
//   // Ensure the backups directory exists
//   exec(`mkdir -p ${backupDir}`, (err) => {
//     if (err) {
//       console.error("Error creating backup directory:", err);
//       return;
//     }
//     // Execute the pg_dump command
//     const command = `PGPASSWORD=<YOUR_PASSWORD> pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${backupFile}`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error("Error during pg_dump:", error);
//         return;
//       }
//       console.log("Backup completed successfully:", stdout);
//     });
//   });
// });
// // Start the cron job immediately
// console.log("Backup script is running...");
