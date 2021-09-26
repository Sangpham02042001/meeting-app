const formidable = require('formidable')
const fs = require('fs')
const { QueryTypes } = require('sequelize')
const sequelize = require('../models')
const Team = require('../models/team')
const User = require('../models/user')

const getTeamInfo = async (req, res) => {
  let { teamId } = req.params
  const teams = await sequelize.query(
    "SELECT t.name, t.teamType, COUNT(*) as numOfMembers " +
    "FROM teams t " +
    "LEFT JOIN users_teams ut ON t.id = ut.teamId " +
    "WHERE t.id = :teamId",
    {
      replacements: {
        teamId
      },
      raw: true,
      type: sequelize.QueryTypes.SELECT
    }
  )
  return res.status(200).json({
    team: teams[0]
  })
}

const createTeam = async (req, res) => {
  let { id } = req.auth
  const form = formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err })
    }
    let { name } = fields
    let coverPhoto,
      teamType = fields.teamType || 'public'
    if (files.coverPhoto) {
      coverPhoto = fs.readFileSync(files.coverPhoto.path)
    }
    try {
      let teams = await Team.findAll({
        where: {
          hostId: id
        },
        attributes: ['name']
      })
      if (teams.length > 0) {
        let check = teams.some(team => team.name === name)
        if (check) {
          return res.status(400).json({
            error: `Team with name ${name} has been created by you, please choose other name`
          })
        }
      }
      let team = await Team.create({
        name,
        coverPhoto,
        teamType,
        hostId: id
      })
      team.coverPhoto = undefined
      return res.status(201).json({ team })
    } catch (error) {
      console.log(error)
      return res.status(400).json({ error })
    }
  })
}

const getTeamCoverPhoto = async (req, res) => {
  let { teamId } = req.params
  let team = await Team.findOne({
    where: {
      id: teamId
    },
    attributes: ['coverPhoto']
  })
  if (!team) {
    return res.status(400).json({ error: 'Team not found' })
  }
  if (team.coverPhoto) {
    return res.send(team.coverPhoto)
  }
}

const getTeamMembers = async (req, res) => {
  let { teamId } = req.params
  try {
    const members = await sequelize.query(
      "CALL getTeamMembers(:teamId)",
      {
        replacements: {
          teamId
        }
      }
    )
    return res.status(200).json({ members })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getTeamRequestUsers = async (req, res) => {
  let { teamId } = req.params
  try {
    const requestMembers = await sequelize.query(
      "CALL getTeamRequestMembers(:teamId)",
      {
        replacements: {
          teamId
        }
      }
    )
    return res.status(200).json({ requestMembers })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
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
      throw `You aren't the admin of this group`
    }
    req.hostId = team.hostId
    next()
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const confirmUserRequests = async (req, res) => {
  let { teamId } = req.params
  let { users } = req.body
  let stringifyUsers = ''
  users.forEach(userId => stringifyUsers += `${userId},`)
  console.log(stringifyUsers)
  try {
    const messages = await sequelize.query(
      "CALL removeRequestUsers(:users, :teamId, :confirmFlag)",
      {
        replacements: {
          users: stringifyUsers,
          teamId,
          confirmFlag: true
        }
      }
    )
    console.log(messages[0])
    if (messages[0]) {
      return res.status(200).json(messages[0])
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const removeUserRequests = async (req, res) => {
  let { teamId } = req.params
  let { users } = req.body
  if (users.indexOf(req.hostId) >= 0) {
    throw `You are the admin of this group, can't remove yourself!`
  }
  let stringifyUsers = ''
  users.forEach(userId => stringifyUsers += `${userId},`)
  console.log(stringifyUsers)
  try {
    const messages = await sequelize.query(
      "CALL removeRequestUsers(:users, :teamId, :confirmFlag)",
      {
        replacements: {
          users: stringifyUsers,
          teamId,
          confirmFlag: false
        }
      }
    )
    console.log(messages[0])
    if (messages[0]) {
      return res.status(200).json(messages[0])
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const removeMembers = async (req, res) => {
  let { teamId } = req.params
  let { users } = req.body
  let stringifyUsers = ''
  users.forEach(userId => stringifyUsers += `${userId},`)
  console.log(stringifyUsers)
  try {
    await sequelize.query(
      "DELETE FROM users_teams ut " +
      "WHERE ut.teamId = :teamId AND FIND_IN_SET(ut.userId, :users);",
      {
        replacements: {
          teamId,
          users: stringifyUsers
        },
        type: QueryTypes.DELETE
      }
    )
    return res.status(200).json({
      message: 'Remove members successfully'
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const removeTeam = async (req, res) => {
  let { teamId } = req.params
  try {
    await sequelize.query(
      "DELETE FROM teams WHERE id = :teamId",
      {
        replacements: {
          teamId
        },
        type: QueryTypes.DELETE
      }
    )
    return res.status(200).json({ message: 'Delete team successfully' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const inviteUsers = async (req, res) => {
  let { users } = req.body
  let { teamId } = req.params
  try {
    let team = await Team.findOne({
      where: {
        id: teamId
      },
      attributes: ['hostId', 'name']
    })
    let host = await team.getHost()
    let adminName = host.getFullname()
    let content = `${adminName} has invited you to join ${team.name}`
    let relativeLink = `/teams/${teamId}`
    let result
    for (let user of users) {
      result = await sequelize.query(
        "DECLARE tmp VARCHAR(10); " +
        "SET tmp = createTeamNotification(:content, :relativeLink, :user, :teamId); " +
        "INSERT INTO invited_users_teams " +
        "SET teamId = :teamId, invitedUserId = :user, createdAt = NOW(), updatedAt = NOW(); ",
        {
          replacements: {
            teamId, user, relativeLink, content
          },
          type: QueryTypes.INSERT
        }
      )
      console.log(result)
    }
    return res.status(200).json({
      message: 'Invite successfully'
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const removeInvitations = async (req, res) => {
  let { teamId } = req.params
  let { users } = req.body
  try {
    if (!users || users.length === 0) {
      throw 'Error with removing empty user list'
    }
    let stringifyUsers = ''
    users.forEach(userId => stringifyUsers += `${userId},`)
    console.log(stringifyUsers)
    await sequelize.query(
      "DELETE FROM invited_users_teams iut " +
      "WHERE iut.teamId = :teamId AND FIND_IN_SET(iut.invitedUserId, :users);",
      {
        replacements: {
          teamId,
          users: stringifyUsers
        },
        type: QueryTypes.DELETE
      }
    )
    return res.status(200).json({
      message: 'Remove invitations successfully'
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

module.exports = {
  getTeamInfo, createTeam, getTeamCoverPhoto,
  getTeamMembers, getTeamRequestUsers, isAdmin,
  confirmUserRequests, removeUserRequests, removeMembers,
  removeTeam, inviteUsers, removeInvitations
}