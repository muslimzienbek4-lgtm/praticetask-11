require("dotenv").config()

const express = require("express")
const { MongoClient } = require("mongodb")

const app = express()
app.use(express.json())

// Environment variables
const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI

// MongoDB connection
const client = new MongoClient(MONGO_URI)

let productsCollection

async function connectDB() {
  await client.connect()
  const db = client.db("shop")
  productsCollection = db.collection("products")
  console.log("MongoDB connected")
}

connectDB()

// GET /api/products
app.get("/api/products", async (req, res) => {
  try {
    const { category, minPrice, sort, fields } = req.query

    // Filter
    const filter = {}

    if (category) {
      filter.category = category
    }

    if (minPrice) {
      filter.price = { $gte: Number(minPrice) }
    }

    // Sort
    const sortOptions = {}
    if (sort === "price") {
      sortOptions.price = 1
    }

    // Projection
    const projection = {}
    if (fields) {
      fields.split(",").forEach(field => {
        projection[field] = 1
      })
    }

    const products = await productsCollection
      .find(filter)
      .sort(sortOptions)
      .project(projection)
      .toArray()

    res.json(products)
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

// Root endpoint (REQUIRED FOR DEPLOYMENT)
app.get("/", (req, res) => {
  res.json({ message: "API is running" })
})

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
