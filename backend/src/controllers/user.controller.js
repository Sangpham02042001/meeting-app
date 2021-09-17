const bcrypt = require('bcrypt')
const User = require('../models/user')

const signup = async (req, res) => {
  let saltRounds = 10
  const { firstName, lastName, email, password } = req.body
  try {
    const user = await User.findOne({
      where: {
        email: email
      }
    })
    if (user) {
      console.log(user.toJSON())
      return res.status(400).json({ error: `${email} has already existed` })
    }
    bcrypt.hash(password, saltRounds, async (error, hash_password) => {
      if (error) {
        return res.status(400).json({ error })
      }
      const newUser = await User.create({
        firstName, lastName, email, hash_password
      })
      console.log(newUser.toJSON())
      return res.status(201).json(newUser.toJSON())
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

module.exports = { signup }