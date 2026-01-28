require("dotenv").config()

const express = require("express")
const { MongoClient } = require("mongodb")

const app = express()
app.use(express.json())

// Environment variables
const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI

// MongoDB connection
const client = new MongoClient(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

let productsCollection

async function startServer() {
  try {
    await client.connect()
    const db = client.db("shop")
    productsCollection = db.collection("products")
    console.log("MongoDB connected")

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to connect to MongoDB", error)
  }
}

startServer()

// GET /api/products
app.get("/api/products", async (req, res) => {
  try {
    const { category, minPrice, sort, fields } = req.query

    const filter = {}

    if (category) {
      filter.category = category
    }

    if (minPrice) {
      filter.price = { $gte: Number(minPrice) }
    }

    const sortOptions = {}
    if (sort === "price") {
      sortOptions.price = 1
    }

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

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "API is running" })
})

// Version endpoint (Practice Task 12)
app.get("/version", (req, res) => {
  res.json({
    version: "1.1",
    updatedAt: "2026-01-28"
  })
})
