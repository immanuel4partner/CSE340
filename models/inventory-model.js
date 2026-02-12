const pool = require("../database/index");

async function getClassifications() {
  const sql = "SELECT * FROM public.classification ORDER BY classification_name";
  return await pool.query(sql);
}

async function getInventoryByClassificationId(classificationId) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.classification_id = $1
    ORDER BY i.inv_make, i.inv_model
  `;
  return await pool.query(sql, [classificationId]);
}

async function getInventoryById(invId) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1
  `;
  const result = await pool.query(sql, [invId]);
  return result.rows[0];
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
};
