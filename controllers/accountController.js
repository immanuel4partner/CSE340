const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  return res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    pageClass: "login",
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  return res.render("account/register", {
    title: "Register",
    nav,
    pageClass: "register",
    errors: null,
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash(
        "success",
        `Congratulations, you're registered ${account_firstname}.`
      )
      return res.redirect("/account/login")
    }

    req.flash("error", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Register",
      nav,
      pageClass: "register",
      errors: null,
    })
  } catch (error) {
    req.flash("error", "An unexpected error occurred.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      pageClass: "register",
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login attempt
 * *************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      req.flash("error", "Email address not found.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        pageClass: "login",
      })
    }

    const match = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (!match) {
      req.flash("error", "Incorrect password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        pageClass: "login",
      })
    }

    // ✅ SUCCESS LOGIN
    req.session.account = accountData

    // 🔥 Updated Success Message
    req.flash("success", `Welcome back, ${accountData.account_firstname}!`)

    return res.redirect("/")
  } catch (error) {
    req.flash("error", "Login failed. Please try again.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      pageClass: "login",
    })
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
}