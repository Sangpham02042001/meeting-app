const bcrypt = require('bcrypt')
const fs = require('fs')
const formidable = require('formidable')
const User = require('../models/user')
const Team = require('../models/team')
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
      newUser.hash_password = undefined
      return res.status(201).json({ user: newUser })
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
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err })
    }
    try {
      let avatar
      if (files.avatar) {
        if (files.avatar.size > 2097152) {
          throw Error('Image upload larger than 2MB')
        }
        avatar = fs.readFileSync(files.avatar.path)
      } else {
        avatar = null
      }
      let firstName = fields.firstName || ''
      let lastName = fields.lastName || ''
      let userId = Number(req.auth.id)
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
      let user = result[0]
      return res.status(200).json({ user })
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError') {
        if (error.parent.errno == 1406) {
          return res.status(400).json({
            error: 'Too large image to update'
          })
        }
      }
      return res.status(400).json({
        error
      })
    }
  })
}

const getUserAvatar = async (req, res) => {
  let { userId } = req.params
  let user = await User.findOne({
    where: {
      id: userId
    },
    attributes: ['avatar']
  })
  if (user.avatar) {
    return res.send(user.avatar)
  }
}

const requestJoinTeam = async (req, res) => {
  let { teamId } = req.params
  try {
    let team = await Team.findOne({
      where: {
        id: teamId
      },
      attributes: ['hostId', 'name']
    })
    if (!team) {
      throw `Team ${team.name} not found`
    }
    if (team.hostId == req.auth.id) {
      throw 'You are the admin of this group'
    }
    team = await Team.findByPk(teamId)
    let requestUsers = await team.getRequestUsers({
      attributes: ['id']
    })
    let members = await team.getMembers({
      attributes: ['id']
    })
    if (members.length && members.map(m => m.id).indexOf(req.auth.id) >= 0) {
      throw `You are the member of ${team.name} team`
    }
    if (requestUsers.map(user => user.id).indexOf(req.auth.id) >= 0) {
      throw `You are requesting to join this team`
    }
    await team.addRequestUser(req.auth.id)
    return res.status(200).json({
      message: 'Request to join successfullly'
    })
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      error: err
    })
  }
}

const getTeamsJoined = async (req, res) => {
  const { id } = req.auth
  let user = await User.findByPk(id)
  let teams = await user.getTeams({
    attributes: ['id', 'hostId']
  })
  return res.status(200).json({
    teams
  })
}

const getTeamsRequesting = async (req, res) => {
  const { id } = req.auth
  let user = await User.findByPk(id)
  let teams = await user.getRequestingTeams({
    attributes: ['id', 'hostId']
  })
  return res.status(200).json({
    teams
  })
}

module.exports = {
  signup, getUserInfo, updateUserInfo, getUserAvatar,
  requestJoinTeam, getTeamsJoined, getTeamsRequesting
}