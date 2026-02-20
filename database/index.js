const { Pool } = require("pg")
require("dotenv").config()
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool
if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
})
 
// Added for troubleshooting queries
// during development
module.exports = {
  async query(text, params) {
    try {
      const lower = text.toLowerCase()
      const isSessionQuery = lower.includes("session")
      const isSelect = lower.startsWith("select")
      if (!isSelect && !isSessionQuery) {
        console.log("non-select or session query", { text, params })
      }
      const res = await pool.query(text, params)
      //console.log("TEST ALL: executed query", { text, params })
      return res
    } catch (error) {
      console.error("error in query", { text, params, error })
      throw error
    }
  },
}
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  module.exports = pool
}
 


