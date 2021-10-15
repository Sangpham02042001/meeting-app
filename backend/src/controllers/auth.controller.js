const bcrpyt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Team = require('../models/team')
const sequelize = require('../models')
const { QueryTypes } = require('sequelize')

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
        company: 'SPICY_CODE'
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
      req.auth = user;
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

const isAdmin = async (req, res, next) => {
  let { id } = req.auth
  let { teamId } = req.params
  try {
    let team = await Team.findOne({
      where: {
        id: teamId
      },
      attributes: ['hostId']
    })
    if (!team) {
      throw `Team not found`
    }
    if (team.hostId != id) {
      throw `You aren't the admin of this team`
    }
    req.hostId = team.hostId
    next()
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const isMember = async (req, res, next) => {
  let { id } = req.auth
  let { teamId } = req.params
  try {
    let user_team = await sequelize.query(
      "SELECT * FROM users_teams " +
      "WHERE userId = :id AND teamId = :teamId",
      {
        replacements: {
          id,
          teamId
        },
        type: QueryTypes.SELECT
      }
    )
    if (user_team.length > 0) {
      next()
    } else {
      throw `You aren't a member of this team`
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

module.exports = {
  signin, requireSignin, isAdmin,
  isMember
}