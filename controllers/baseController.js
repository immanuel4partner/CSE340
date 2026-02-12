// controllers/baseController.js
const utilities = require("../utilities/")

const baseController = {}

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav()

  res.render("index", {
    title: "Home",
    pageClass: "home",
    nav,
  })
}

module.exports = baseController
