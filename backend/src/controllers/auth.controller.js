const bcrpyt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const signin = async (req, res) => {
  let { email, password } = req.body
  try {
    let user = await User.findOne({
      where: {
        email
      }
    })
    if (user) {
      const isPasswordMatch = await bcrpyt.compare(password, user.hash_password);
      if (!isPasswordMatch) {
        return res.status(401).json({ error: "Email and Password haven't matched" })
      }
      const token = jwt.sign({
        id: user.id,
        name: user.name,
        password: password
      }, process.env.JWT_SECRET_KEY)

      user.avatar = undefined
      user.hash_password = undefined
      console.log(user.getFullName())
      return res.status(200).json({
        token,
        lastName: user.lastName,
        firstName: user.firstName,
        id: user.id
      })
    } else {
      return res.status(401).json({ error: 'Email not found' })
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1]
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY)
    if (user) {
      req.auth = user
      console.log('require sign in', user.id)
      next()
    } else {
      return res.status(403).json({
        error: 'User not found'
      })
    }
  } else {
    return res.status(403).json({
      error: 'Not sign in'
    })
  }
}

module.exports = { signin, requireSignin }