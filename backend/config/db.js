import mongoose from 'mongoose';
export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing in .env');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('✔ MongoDB connected:', mongoose.connection.name);
}