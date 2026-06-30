import mongoose from "mongoose";
import { DbUser } from "../lib/db-user";
import { connectDB } from "../lib/mongodb";

async function main() {
  await connectDB();
  const count = await DbUser.countDocuments({});
  console.log("Total users in MongoDB:", count);
  const users = await DbUser.find({}).limit(10);
  console.log("Fetched users limit 10:", users.length);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
