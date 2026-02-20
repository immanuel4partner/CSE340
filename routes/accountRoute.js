const express = require("express")
const router = new express.Router()

const staticRoute = require("./static")
const invRoute = require("./inventoryRoute")
const errorRoute = require("./errorRoute")

const baseController = require("../controllers/baseController")
const accountController = require("../controllers/accountController")

const utilities = require("../utilities")
const accountValidate = require("../utilities/account-validation")

const pool = require("../database/")

// Deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/", utilities.handleErrors(accountController.buildLogin))

// Deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process registration
router.post(
  "/register",
  accountValidate.validateRegistration(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process login
router.post(
  "/login",
  accountValidate.validateLogin(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
