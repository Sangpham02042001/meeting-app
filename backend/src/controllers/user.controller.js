const bcrypt = require('bcrypt')
const fs = require('fs')
const { v4 } = require('uuid')
const formidable = require('formidable')
const User = require('../models/user')
const Team = require('../models/team')
const sequelize = require('../models')
const { QueryTypes } = require('sequelize')

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
    let user = await User.findOne({
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
    user.avatar = undefined
    return res.status(200).json({ id: user.id, userName: user.getFullName(), email: user.email })
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
        let fileType = files.avatar.path.split('.')[files.avatar.path.split('.').length - 1]
        avatar = `${v4()}.${fileType}`
        fs.createReadStream(files.avatar.path)
          .pipe(fs.createWriteStream(`./src/public/users-avatars/${avatar}`))
      } else {
        avatar = ''
      }
      let firstName = fields.firstName || ''
      let lastName = fields.lastName || ''
      let userId = Number(req.auth.id)
      let user = await User.findOne({
        where: {
          id: userId
        },
        attributes: ['avatar']
      })
      if (user.avatar && files.avatar) {
        fs.unlink(`./src/public/users-avatars/${user.avatar}`, (err) => {
          if (err) {
            throw err
          }
        })
      }
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
      let updatedUser = result[0]
      return res.status(200).json({ user: updatedUser })
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
    fs.createReadStream(`./src/public/users-avatars/${user.avatar}`).pipe(res)
  } else {
    fs.createReadStream('./src/public/images/default_avatar.png').pipe(res)
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
      throw `Team with id ${teamId} not found`
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

const getJoinedTeams = async (req, res) => {
  const { id } = req.auth
  let user = await User.findByPk(id)
  let teams = await user.getTeams({
    attributes: ['id', 'hostId', 'name'],
  })
  teams = teams.map(team => {
    return {
      id: team.id,
      name: team.name,
      hostId: team.hostId
    }
  })
  return res.status(200).json({
    teams
  })
}

const getRequestingTeams = async (req, res) => {
  const { id } = req.auth
  let user = await User.findByPk(id)
  let teams = await user.getRequestingTeams({
    attributes: ['id', 'hostId', 'name']
  })
  return res.status(200).json({
    teams
  })
}

const outTeam = async (req, res) => {
  try {
    let { userId, teamId } = req.params
    let team = await Team.findOne({
      where: {
        id: teamId
      },
      attributes: ['hostId', 'name']
    })
    if (team) {
      await sequelize.query(
        "DELETE FROM users_teams ut WHERE ut.teamId = :teamId AND ut.userId = :userId",
        {
          replacements: {
            teamId: teamId, userId
          }
        }
      )
      return res.status(200).json({
        message: 'Out team successfully'
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const cancelJoinRequest = async (req, res) => {
  let { userId } = req.params
  let { teams } = req.body
  let stringifyTeams = ''
  teams.forEach(teamId => stringifyTeams += `${teamId},`)
  try {
    await sequelize.query(
      "DELETE FROM request_users_teams rut " +
      "WHERE rut.requestUserId = :userId AND FIND_IN_SET(rut.teamId, ':teams')",
      {
        replacements: {
          userId,
          teams: stringifyTeams
        },
        type: QueryTypes.DELETE
      }
    )
    return res.status(200).json({ message: 'Cancel join request successfully' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const confirmInvitations = async (req, res) => {
  let { userId } = req.params
  let { teams } = req.body
  let stringifyTeams = ''
  teams.forEach(teamId => stringifyTeams += `${teamId},`)
  try {
    const messages = await sequelize.query(
      "CALL removeInvitations(:teams, :userId, :confirmFlag)",
      {
        replacements: {
          teams: stringifyTeams,
          userId,
          confirmFlag: true
        }
      }
    )
    if (messages[0]) {
      return res.status(200).json(messages[0])
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const removeInvitations = async (req, res) => {
  let { userId } = req.params
  let { teams } = req.body
  let stringifyTeams = ''
  teams.forEach(teamId => stringifyTeams += `${teamId},`)
  try {
    const messages = await sequelize.query(
      "CALL removeInvitations(:teams, :userId, :confirmFlag)",
      {
        replacements: {
          teams: stringifyTeams,
          userId,
          confirmFlag: false
        }
      }
    )
    if (messages[0]) {
      return res.status(200).json(messages[0])
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getInvitations = async (req, res) => {
  const { id } = req.auth
  try {
    let user = await User.findByPk(id)
    let teams = await user.getInvitedTeams({
      attributes: ['id', 'hostId', 'name']
    })
    return res.status(200).json({
      teams
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getNotifications = async (req, res) => {
  let { id } = req.auth
  let { offset, num } = req.query
  try {
    let numOf_UnReadNotifications = await sequelize.query(
      "SELECT COUNT(*) as numOf_UnReadNotifications FROM notifications WHERE userid = :id AND isRead = 0;",
      {
        replacements: {
          id
        },
        type: QueryTypes.SELECT
      }
    )
    numOf_UnReadNotifications = numOf_UnReadNotifications[0]['numOf_UnReadNotifications']
    if (isNaN(offset) || isNaN(num)) {
      let notifications = await sequelize.query(
        "SELECT *, TIME_TO_SEC(TIMEDIFF(NOW(), createdAt)) AS timeDifferent FROM notifications WHERE userId = :id ORDER BY createdAt DESC;",
        {
          replacements: {
            id
          },
          type: QueryTypes.SELECT
        }
      )
      let numOfNotifications = await sequelize.query(
        "SELECT COUNT(*) as numOfNotifications FROM notifications WHERE userid = :id;",
        {
          replacements: {
            id
          },
          type: QueryTypes.SELECT
        }
      )
      numOfNotifications = numOfNotifications[0]['numOfNotifications']
      let fragFlag = false
      if (numOfNotifications > 10) {
        notifications = notifications.slice(0, 10),
          fragFlag = true
      }
      return res.status(200).json({ notifications, numOfNotifications, numOf_UnReadNotifications })
    } else {
      let notifications = await sequelize.query(
        "SELECT *, TIME_TO_SEC(TIMEDIFF(NOW(), createdAt)) AS timeDifferent FROM notifications WHERE userId = :id ORDER BY createdAt ASC LIMIT :offset, :num;",
        {
          replacements: {
            id, offset: Number(offset), num: Number(num)
          },
          type: QueryTypes.SELECT
        }
      )
      if (notifications.length == 0) {
        return res.status(400).json({ error: 'error' })
      }
      return res.status(200).json({ notifications, numOf_UnReadNotifications })
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

// const unReadNotification = async (req, res) => {
//   let { id } = req.auth
//   try {
//     let numOf_UnReadNotifications = await sequelize.query(
//       "SELECT COUNT(*) as numOfNotifications FROM notifications WHERE userid = :id AND isRead = 0;",
//       {
//         replacements: {
//           id
//         },
//         type: QueryTypes.SELECT
//       }
//     )
//   }
// }

const searchUsers = async (req, res) => {
  let { id } = req.auth
  let { text } = req.body
  try {
    let result = await sequelize.query(
      'CALL searchUsers(:id, :text)',
      {
        replacements: {
          id, text
        }
      }
    )
    return res.status(200).json({ users: result })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}



module.exports = {
  signup, getUserInfo, updateUserInfo, getUserAvatar,
  requestJoinTeam, getJoinedTeams, getRequestingTeams,
  outTeam, cancelJoinRequest, confirmInvitations,
  removeInvitations, getInvitations, getNotifications,
  searchUsers
}