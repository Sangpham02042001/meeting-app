const bcrypt = require('bcrypt')
const fs = require('fs')
const formidable = require('formidable')
const User = require('../models/user')
const sequelize = require('../models')

let saltRounds = 10

const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body
  try {
    let user = await User.findOne({
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
      return res.status(201).json({ user: newUser.toJSON() })
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getUserInfo = async (req, res) => {
  let userId = req.params.userId
  try {
    let user = User.findOne({
      where: {
        id: userId
      }
    })
    if (!user) {
      return res.status(200).json({
        message: 'User info not found'
      })
    }
    user.hash_password = undefined
    console.log((await user).getFullname)
    return res.status(200).json({ user })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const updateUserInfo = async (req, res) => {
  const form = formidable.IncomingForm()
  form.keepExtensions = true
  // console.log(form)
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err })
    }
    let avatar
    if (files.avatar) {
      avatar = fs.readFileSync(files.avatar.path)
    } else {
      avatar = null
    }
    let firstName = fields.firstName || ''
    let lastName = fields.lastName || ''
    let userId = Number(fields.userId)
    const result = await sequelize.query(
      'CALL updateBasicUserInfo(:userId, :firstName, :lastName, :avatar)',
      {
        replacements: {
          userId,
          firstName,
          lastName,
          avatar
        }
      }
    )
    console.log(result[0])
    let user = result[0]
    user.avatar = undefined
    return res.status(200).json({ user })
  })
}

module.exports = { signup, getUserInfo, updateUserInfo }