
// Use this script to seed your database with the initial community snippets.
// Run `npm run db:seed` from your terminal.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initialCommunitySnippets = [
  { 
    id: 'community-1', 
    title: 'Custom Framer Motion Animation', 
    description: 'A reusable animation variant for stunning enter effects. This is a very common pattern when working with Framer Motion and can be easily extended to include more complex animations and transitions.', 
    tags: ['framer-motion', 'react', 'animation', 'variants', 'ui'], 
    language: 'TypeScript',
    author: 'Elena Petrova',
    avatar: `https://placehold.co/40x40.png`,
    dataAiHint: 'woman developer',
    starCount: 1200,
    isPublic: true,
    codeSnippet: `export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};`
  },
  { 
    id: 'community-2', 
    title: 'Drizzle ORM Schema', 
    description: 'Example schema for a posts and users table using Drizzle. Drizzle ORM provides a type-safe SQL-like experience for TypeScript projects, making database interactions safer and more predictable.', 
    tags: ['drizzle', 'orm', 'database', 'typescript'], 
    language: 'TypeScript',
    author: 'John Smith',
    avatar: `https://placehold.co/40x40.png`,
    dataAiHint: 'man developer',
    starCount: 876,
    isPublic: true,
    codeSnippet: `import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
});`
  },
  { 
    id: 'community-3', 
    title: 'Tailwind CSS Plugin', 
    description: 'A simple plugin to add custom utilities for text shadows. Tailwind plugins are a powerful way to extend the framework with your own styles and logic.', 
    tags: ['tailwindcss', 'css', 'plugin'], 
    language: 'JavaScript',
    author: 'Emily White',
    avatar: `https://placehold.co/40x40.png`,
    dataAiHint: 'woman coder',
    starCount: 2300,
    isPublic: true,
    codeSnippet: `const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addUtilities }) {
  const newUtilities = {
    '.text-shadow': {
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    },
  }
  addUtilities(newUtilities)
})`
  },
  { 
    id: 'community-4', 
    title: 'Python Data Class', 
    description: 'A simple dataclass for representing a user with roles. Dataclasses are a feature in Python that automatically generates special methods like __init__(), __repr__(), and more.', 
    tags: ['python', 'dataclass'], 
    language: 'Python',
    author: 'Chen Wei',
    avatar: `https://placehold.co/40x40.png`,
    dataAiHint: 'asian developer',
    starCount: 950,
    isPublic: true,
    codeSnippet: `from dataclasses import dataclass, field
from typing import List

@dataclass
class User:
    username: str
    roles: List[str] = field(default_factory=list)`
  },
  {
    id: 'community-5',
    title: 'Async Rust with Tokio',
    description: 'A basic TCP echo server implemented using Tokio, the asynchronous runtime for Rust. This example demonstrates how to bind a listener and accept incoming connections.',
    tags: ['rust', 'async', 'tokio', 'networking'],
    language: 'Rust',
    author: 'Alex Johnson',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'male programmer',
    starCount: 1500,
    isPublic: true,
    codeSnippet: `use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;
    let (mut socket, _) = listener.accept().await?;
    // ...
}`
  },
  {
    id: 'community-6',
    title: 'Go Gin Middleware',
    description: 'A custom logging middleware for the Gin web framework. Middleware in Gin allows you to process a request before it reaches the main handler, which is useful for logging, authentication, and more.',
    tags: ['golang', 'gin', 'middleware', 'api'],
    language: 'Go',
    author: 'Maria Garcia',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'latina developer',
    starCount: 720,
    isPublic: true,
    codeSnippet: `func LoggerMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        log.Printf(
            "| %d | %s | %s %s",
            c.Writer.Status(),
            time.Since(start),
            c.Request.Method,
            c.Request.RequestURI,
        )
    }
}`
  }
];


async function seedDatabase() {
  console.log('Starting to seed database...');
  try {
    const batch = writeBatch(db);
    const snippetsCollection = collection(db, 'snippets');

    initialCommunitySnippets.forEach(snippet => {
      const { id, ...snippetData } = snippet;
      const docRef = doc(snippetsCollection, id);
      batch.set(docRef, {
        ...snippetData,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Firestore doesn't require an explicit close, but if it did, it would be here.
    // In Node.js environment, the script will exit automatically.
    process.exit(0);
  }
}

seedDatabase();
