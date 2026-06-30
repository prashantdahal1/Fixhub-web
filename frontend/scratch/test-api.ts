import { DbUser } from "../lib/db-user";
import { connectDB } from "../lib/mongodb";

async function main() {
  await connectDB();
  const page = 1;
  const size = 10;
  
  const query = {};
  const totalItems = await DbUser.countDocuments(query);
  const totalPages = Math.ceil(totalItems / size) || 1;
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * size;

  const dbUsers = await DbUser.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size);

  console.log("Total Items:", totalItems);
  console.log("Returned users count:", dbUsers.length);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
