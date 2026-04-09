import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Handle missing database URL gracefully for frontend demo
const databaseUrl = process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL;
const sql = databaseUrl && databaseUrl !== 'postgresql://placeholder:placeholder@placeholder.neon.tech/placeholder' 
  ? neon(databaseUrl) 
  : null;

export const db = sql ? drizzle(sql) : null;