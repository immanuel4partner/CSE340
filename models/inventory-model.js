const pool = require("../database/index")

/* ===============================
   Get All Classifications
================================ */
async function getClassifications() {
  const sql =
    "SELECT * FROM public.classification ORDER BY classification_name"
  return await pool.query(sql)
}

/* ===============================
   Insert New Classification
================================ */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("Add Classification Error:", error)
    return null
  }
}

/* ===============================
   Insert New Inventory Item
================================ */
async function addInventory(data) {
  try {
    const sql = `
      INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_year,
       inv_description, inv_image, inv_thumbnail,
       inv_price, inv_miles, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `
    const result = await pool.query(sql, [
      data.classification_id,
      data.inv_make,
      data.inv_model,
      data.inv_year,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_miles,
      data.inv_color,
    ])

    return result.rows[0]
  } catch (error) {
    console.error("Add Inventory Error:", error)
    return null
  }
}

/* ===============================
   Get Inventory by Classification
================================ */
async function getInventoryByClassificationId(classificationId) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.classification_id = $1
    ORDER BY i.inv_make, i.inv_model
  `
  return await pool.query(sql, [classificationId])
}

/* ===============================
   Get Inventory by ID
================================ */
async function getInventoryById(invId) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1
  `
  const result = await pool.query(sql, [invId])
  return result.rows[0]
}

module.exports = {
  getClassifications,
  addClassification,
  addInventory,
  getInventoryByClassificationId,
  getInventoryById,
}
