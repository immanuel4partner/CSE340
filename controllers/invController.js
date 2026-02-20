const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invController = {}

/* ===============================
   Task 1: Build Management View
================================ */
invController.buildManagement = async function (req, res) {
  const nav = await utilities.getNav()

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash("notice"),
  })
}

/* ===============================
   Task 2: Add Classification View
================================ */
invController.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav()

  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    messages: req.flash("notice"),
  })
}

/* ===============================
   Insert Classification
================================ */
invController.addClassification = async function (req, res) {
  const { classification_name } = req.body

  try {
    const result = await invModel.addClassification(classification_name)

    if (result) {
      req.flash("notice", "✅ New classification added successfully!")
      return res.redirect("/inv/")   // ✅ Redirect instead of render
    } else {
      req.flash("notice", "❌ Classification insert failed.")
      return res.redirect("/inv/add-classification")
    }

  } catch (error) {
    console.error("Classification Insert Error:", error.message)

    req.flash("notice", "❌ Classification already exists or database error.")
    return res.redirect("/inv/add-classification")
  }
}

/* ===============================
   Task 3: Add Inventory View
================================ */
invController.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Inventory Item",
    nav,
    classificationList,
    errors: null,
    messages: req.flash("notice"),

    // Default empty values
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
  })
}

/* ===============================
   Insert Inventory Item
================================ */
invController.addInventory = async function (req, res) {

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  try {
    const result = await invModel.addInventory(req.body)

    if (result) {
      req.flash("notice", "✅ Inventory item added successfully!")
      return res.redirect("/inv/")   // ✅ Redirect instead of render
    } else {
      req.flash("notice", "❌ Failed to add inventory item.")
      return res.redirect("/inv/add-inventory")
    }

  } catch (error) {
    console.error("Inventory Insert Error:", error.message)

    req.flash("notice", "❌ Database error while adding inventory.")
    return res.redirect("/inv/add-inventory")
  }
}

/* ===============================
   Build Inventory by Classification
================================ */
invController.buildByClassificationId = async function (req, res) {
  const classificationId = req.params.classificationId
  const nav = await utilities.getNav()

  const data = await invModel.getInventoryByClassificationId(classificationId)
  const grid = await utilities.buildClassificationGrid(data.rows)

  const className = data.rows[0]?.classification_name || "Vehicles"

  res.render("inventory/classification", {
    title: className,
    nav,
    grid,
  })
}

/* ===============================
   Build Inventory Detail View
================================ */
invController.buildByInventoryId = async function (req, res, next) {
  const invId = req.params.invId
  const nav = await utilities.getNav()

  const vehicle = await invModel.getInventoryById(invId)

  if (!vehicle) {
    return next({ status: 404, message: "Vehicle not found." })
  }

  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicle,
  })
}

module.exports = invController
