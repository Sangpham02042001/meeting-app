const bcrypt = require('bcrypt')
const dbConnection = require('../db-connection')

const signup = async (req, res) => {
  let saltRounds = 10
  const { firstName, lastName, email, password } = req.body
  bcrypt.hash(password, saltRounds, (error, hash_password) => {
    if (error) {
      return res.status(400).json({ error })
    }
    let sql = `INSERT INTO users(firstName, lastName, email, hash_password)` +
      ` VALUES('${firstName}','${lastName}','${email}','${hash_password}')`
    dbConnection.query(sql, (error, results, fields) => {
      if (error) {
        return res.status(400).json({ error })
      }
      return res.status(201).json({ results })
    })
  })
}

module.exports = { signup }