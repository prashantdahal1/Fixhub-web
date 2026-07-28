import mongoose from "mongoose";

await mongoose.connect("mongodb://localhost:27017/fixhub");

// Reset seeded services to pending so admin approval workflow works
const result = await mongoose.connection.db
  .collection("services")
  .updateMany({}, { $set: { approvalStatus: "pending", isActive: false } });

console.log("Reset to pending:", result.modifiedCount, "services");
await mongoose.disconnect();
process.exit(0);
