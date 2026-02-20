/* ***********************
 * Require Statements
 *************************/
const express = require("express")
require("dotenv").config()
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const flash = require("connect-flash")
const PgSession = require("connect-pg-simple")(session)
const app = express()

const staticRoute = require("./routes/static")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities")
const invRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")  
const errorRoute = require("./routes/errorRoute")
const pool = require('./database/')

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* **********************
 * Middleware 
 *************************/
// Serve static files
app.use(express.static("public"))
// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Session middleware
app.use(
  session({
    store: new PgSession({ createTableIfMissing: true, pool }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
)

// Flash middleware
app.use(flash())

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

// Build nav for all GET requests
app.use(async (req, res, next) => {
  if (req.method !== "GET") return next()
  try {
    res.locals.nav = await utilities.getNav()
    next()
  } catch (err) {
    next(err)
  }
})

/* ***********************
 * Routes
 *************************/
app.use(staticRoute)
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/account", accountRoute) 
app.use("/inv", invRoute)
app.use(errorRoute)

// Chrome DevTools probe (prevents log spam)
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.sendStatus(204)
})

/* **********************
 * File not found route - must be last route
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ************************
 * Express Error Handler
 ***************************/
app.use(async (err, req, res, next) => {
  let nav = []
  try {
    nav = await utilities.getNav()
  } catch (e) {
    console.error("Nav build failed inside error handler:", e.message)
  }

  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`App listening on port ${port}`)
})

// Handle port conflicts gracefully
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Kill the old process or change the port.`)
  } else {
    console.error(err)
  }
})
