const formidable = require('formidable')
const { QueryTypes } = require('sequelize')
const sequelize = require('../models')
const Team = require('../models/team')
const User = require('../models/user')
const Media = require('../models/media');
const Message = require('../models/message')
const { getMeetingInfo } = require('./meeting.controller')

const fs = require('fs')
const { v4 } = require('uuid')
const { Readable } = require('stream')
const Meeting = require('../models/meeting')

const getTeamInfo = async (req, res) => {
  let { teamId } = req.params
  const teams = await sequelize.query(
    "SELECT t.name, t.teamType, t.id, t.hostId, t.coverPhoto, t.teamCode, COUNT(*) as numOfMembers " +
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
  let team = teams[0]
  if (team.hostId !== req.auth.id && req.auth.role !== 'admin') {
    delete team.teamCode
  }
  return res.status(200).json({
    team: teams[0]
  })
}

const createTeam = async (req, res) => {
  const form = formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err })
    }
    let { name, hostId } = fields
    if (!hostId || hostId == null || hostId == 'null') {
      hostId = req.auth.id;
    }
    let coverPhoto,
      teamType = fields.teamType || 'public'
    if (files.coverPhoto) {
      let fileType = files.coverPhoto.path.split('.')[files.coverPhoto.path.split('.').length - 1]
      coverPhoto = `${v4()}.${fileType}`
      let writeStream = fs.createWriteStream(`./src/public/teams-coverphotos/${coverPhoto}`)
      fs.createReadStream(files.coverPhoto.path).pipe(writeStream)
    } else {
      coverPhoto = ''
    }
    try {
      let teams = await Team.findAll({
        where: {
          hostId
        },
        attributes: ['name']
      })
      if (teams.length > 0) {
        let check = teams.some(team => team.name === name)
        if (check) {
          return res.status(400).json({
            error: `Team with name ${name} has been created by you, please choose other name.`
          })
        }
      }
      let team = await Team.create({
        name,
        coverPhoto,
        teamType,
        hostId
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
    fs.createReadStream(`./src/public/teams-coverphotos/${team.coverPhoto}`).pipe(res)
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
    const requestUsers = await sequelize.query(
      "CALL getTeamRequestMembers(:teamId)",
      {
        replacements: {
          teamId
        }
      }
    )
    return res.status(200).json({ requestUsers })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getTeamInvitedUsers = async (req, res) => {
  let { teamId } = req.params
  try {
    const invitedUsers = await sequelize.query(
      "CALL getTeamInvitedUsers(:teamId)",
      {
        replacements: {
          teamId
        }
      }
    )
    return res.status(200).json({ invitedUsers })
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
  try {
    let team = await Team.findByPk(Number(teamId))
    if (team) {
      for (const userId of users) {
        await team.removeRequestUser(userId)
      }
    }
    return res.status(200).json({ message: 'Remove request successfully' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const confirmRequest = async (req, res) => {
  let { teamId } = req.params
  let { users } = req.body
  try {
    let team = await Team.findByPk(Number(teamId))
    if (team) {
      for (const userId of users) {
        await team.removeRequestUser(userId)
        await team.addMember(userId)
      }
    }
    return res.status(200).json({ message: 'Remove request successfully' })
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
    let team = await Team.findOne({
      where: {
        id: teamId
      },
      attributes: ['coverPhoto']
    })
    fs.unlink(`./src/public/teams-coverphotos/${team.coverPhoto}`, (err) => {
      if (err) {
        console.log(err)
        throw err
      }
    })
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
  let stringifyUsers = ''
  users.forEach(userId => stringifyUsers += `${userId},`)
  try {
    // const messages = await sequelize.query(
    //   "CALL inviteUsers(:teamId, :users)",
    //   {
    //     replacements: {
    //       users: stringifyUsers,
    //       teamId
    //     }
    //   }
    // )
    // if (messages[0]) {
    //   return res.status(200).json(messages[0])
    // } else {
    //   return res.status(400).json({ error: 'Some thing wrong' })
    // }
    let team = await Team.findOne({
      where: {
        id: teamId
      }
    })
    for (const user of users) {
      await team.addInivitedUser(user)
    }
    return res.status(200).json({ message: 'success' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const socketInviteUsers = async ({ teamId, users }) => {
  try {
    let arr = users.map(async user => {
      await sequelize.query('INSERT INTO invited_users_teams VALUES(NOW(), NOW(), :userId, :teamId);', {
        replacements: {
          userId: user.id,
          teamId
        }
      })
    })
    await Promise.all(arr)
    let hostName, teamName
    const team = await Team.findOne({
      where: {
        id: teamId
      },
      include: [{
        model: User,
        as: 'host'
      }]
    })
    if (team) {
      hostName = team.dataValues.host.firstName + ' ' + team.dataValues.host.lastName
      teamName = team.dataValues.name
      hostId = team.dataValues.hostId
    }
    return { hostName, teamName, hostId, message: 'success' }
  } catch (error) {
    console.log(error)
    return { error, message: 'error' }
  }
}

const socketConfirmRequest = async ({ teamId, userId, hostId }) => {
  try {
    let team = await Team.findByPk(teamId)
    if (hostId !== team.hostId) {
      throw "You aren't the admin of this team"
    }
    let requestUsers = await team.getRequestUsers({
      attributes: ['id']
    })
    if (!requestUsers.find(user => user.id == userId)) {
      throw "You haven't request to join this team"
    }
    await team.removeRequestUser(userId)
    await team.addMember(userId)
    team = await Team.findOne({
      where: {
        id: teamId
      },
      include: [{
        model: User,
        as: 'host'
      }]
    })
    let hostName, teamName
    if (team) {
      hostName = team.dataValues.host.firstName + ' ' + team.dataValues.host.lastName
      teamName = team.dataValues.name
    }
    return { hostName, teamName, message: 'success' }
  } catch (error) {
    console.log(error)
    return {
      message: 'error',
      error
    }
  }
}

const socketRemoveMember = async ({ teamId, userId, hostId }) => {
  try {
    let team = await Team.findOne({
      where: {
        id: teamId
      }
    })
    if (!team || !team.id) {
      throw 'Team not found'
    }
    if (team.hostId != hostId) {
      throw 'Not admin'
    }
    await team.removeMembers(userId)
    return {
      message: 'success'
    }
  } catch (error) {
    console.log(error)
    return {
      message: "error",
      error
    }
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

const searchTeams = async (req, res) => {
  let userId = req.auth.id
  let { name } = req.body
  try {
    let teams = await sequelize.query(
      "SELECT t.name, t.id, t.hostId FROM teams t " +
      "WHERE t.name LIKE :name AND t.teamType = 'public' " +
      "AND t.id NOT IN (SELECT teamId FROM users_teams WHERE userId = :userId " +
      " UNION SELECT teamId FROM invited_users_teams WHERE invitedUserId = :userId " +
      " UNION SELECT teamId FROM request_users_teams WHERE requestUserId = :userId);",
      {
        replacements: {
          userId, name: `%${name}%`
        },
        type: QueryTypes.SELECT
      }
    )
    return res.status(200).json({ teams })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const searchTeamWithCode = async (req, res) => {
  let { code } = req.query
  console.log(code)
  try {
    let team = await Team.findOne({
      where: {
        teamCode: code
      },
      include: [
        {
          model: User,
          as: 'host'
        }
      ]
    })
    if (team) {
      team.dataValues.host = {
        id: team.dataValues.host.id,
        name: team.dataValues.host.firstName + ' ' + team.dataValues.host.lastName
      }
    } else {
      throw `Team with code ${code} not found`
    }
    return res.status(200).json({ team })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const updateBasicTeamInfo = async (req, res) => {
  let { teamId } = req.params
  const form = formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err)
      return res.status(400).json({ error: err })
    }
    try {
      let coverPhoto
      if (files.coverPhoto) {
        let fileType = files.coverPhoto.path.split('.')[files.coverPhoto.path.split('.').length - 1]
        coverPhoto = `${v4()}.${fileType}`
        fs.createReadStream(files.coverPhoto.path)
          .pipe(fs.createWriteStream(`./src/public/teams-coverphotos/${coverPhoto}`))
      } else {
        coverPhoto = ''
      }
      let name = fields.name || ''
      let teamType = fields.teamType || ''
      let team = await Team.findOne({
        where: {
          id: teamId
        },
        attributes: ['coverPhoto']
      })
      if (files.coverPhoto) {
        fs.unlink(`./src/public/teams-coverphotos/${team.coverPhoto}`, (err) => {
          if (err) {
            console.log(err)
            throw err
          }
        })
      }
      const result = await sequelize.query(
        'CALL updateBasicTeamInfo(:teamId, :teamName, :coverPhoto, :teamType)',
        {
          replacements: {
            teamId,
            teamName: name,
            coverPhoto,
            teamType
          }
        }
      )
      let _team = result[0]
      return res.status(200).json({ team: _team })
    } catch (error) {
      console.log(error)
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

const sendMessage = async ({ teamId, senderId, content, files }) => {
  try {
    let multiMedia = [];
    if (files) {
      for (let file of files) {
        if (file) {
          let fileName = v4().concat('-', file.name)
          const fileStream = new Readable();
          let writeStream = fs.createWriteStream(`./src/public/messages-${/image\/(?!svg)/.test(file.type) ? 'photos' : 'files'}/${fileName}`)
          fileStream._read = () => { }
          fileStream.push(file.data)
          fileStream.pipe(writeStream)
          multiMedia.push({
            pathName: fileName,
            name: file.name,
            type: /image\/(?!svg)/.test(file.type) ? 'image' : 'file'
          });
        }
      }
    }

    const message = await Message.create({ content, teamId, userId: senderId });
    await Promise.all(multiMedia.map(async (m, idx) => {
      let media = await Media.create({ pathName: m.pathName, name: m.name, messageId: message.id, type: m.type })
      multiMedia[idx] = media;
    }))
    let tmpImages = []
    let tmpFiles = []
    for (let media of multiMedia) {
      if (media.type === "image") {
        tmpImages.push(media)
      } else {
        tmpFiles.push(media)
      }
    }
    message.files = tmpFiles;
    message.photos = tmpImages
    return message;
  } catch (error) {
    console.log(error)
    return null;
  }
}

const getMemberTeam = async ({ teamId }) => {
  try {
    let members = await sequelize.query(
      "CALL getTeamMembers(:teamId)",
      {
        replacements: {
          teamId
        }
      }
    )
    return members;
  } catch (error) {
    console.log(error)
    return [];
  }
}

const getMeetings = async (req, res) => {
  let { teamId } = req.params
  try {
    let meetings = await sequelize.query(
      "SELECT * FROM meetings WHERE teamId = :teamId",
      {
        replacements: {
          teamId
        },
        type: QueryTypes.SELECT
      }
    )
    meetings = meetings.map(meeting => {
      return getMeetingInfo({ meetingId: meeting.id })
    })
    meetings = await Promise.all(meetings)
    return res.status(200).json({ meetings });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getMeetingActive = async (req, res) => {
  let { teamId } = req.params
  try {
    let meeting = await sequelize.query(
      "SELECT * FROM meetings WHERE teamId = :teamId AND active = true",
      {
        replacements: {
          teamId
        },
        type: QueryTypes.SELECT
      }
    )
    let meetingActive = null
    if (meeting && meeting.length) {
      meetingActive = await getMeetingInfo({ meetingId: meeting[0].id })
    }
    return res.status(200).json({ meetingActive });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getTeamMeetMess = async (req, res) => {
  let { offset, num } = req.query
  let { teamId } = req.params
  try {
    let meetings = await sequelize.query(
      "SELECT * FROM meetings WHERE teamId = :teamId",
      {
        replacements: {
          teamId
        },
        type: QueryTypes.SELECT
      }
    )
    meetings = meetings.map(meeting => {
      return getMeetingInfo({ meetingId: meeting.id })
    })
    meetings = await Promise.all(meetings)
    meetings = meetings.map(meeting => ({
      ...meeting,
      isMeeting: true
    }))

    let messages = await Message.findAll({
      where: {
        teamId
      },
      include: {
        model: Media,
      }
    })

    for (let m of messages) {
      m.dataValues.isMessage = true
    }


    let numOfMeetMess = [...messages, ...meetings].length
    let meetmess = [...messages, ...meetings].sort((item1, item2) => {
      let time1 = new Date(item1.createdAt).getTime()
      let time2 = new Date(item2.createdAt).getTime()
      if (time1 > time2) {
        return -1;
      }
    }).splice(offset, num).reverse()

    for (let m of meetmess) {
      if (!m.isMeeting) {
        let tmpFiles = [];
        let tmpImages = []
        for (let media of m.dataValues.Media) {
          if (media.type === "image") {
            tmpImages.push(media)
          } else {
            tmpFiles.push(media)
          }
        }
        m.dataValues.files = tmpFiles;
        m.dataValues.photos = tmpImages;
        delete m.dataValues.Media;
      }
    }
    return res.status(200).json({ meetmess, numOfMeetMess });
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getTeamSharedFiles = async (req, res) => {
  try {
    let { teamId } = req.params

    const files = await sequelize.query(
      "SELECT m.id, m.messageId, m.name, m.type, m.createdAt FROM media m " +
      "INNER JOIN messages msg ON msg.id = m.messageId " +
      "INNER JOIN teams t ON t.id = msg.teamId " +
      "WHERE msg.teamId = :teamId AND m.type = 'file' " +
      "ORDER BY m.updatedAt DESC",
      {
        replacements: {
          teamId
        },
        type: QueryTypes.SELECT
      }
    )
    return res.status(200).json({ files })
  } catch (error) {
    console.log(error)
    return res.status(403).json({
      message: "Could not get files!"
    })
  }
}

const getTeamSharedImages = async (req, res) => {
  try {
    let { teamId } = req.params

    const images = await sequelize.query(
      "SELECT m.id, m.messageId, m.name, m.type, m.createdAt FROM media m " +
      "INNER JOIN messages msg ON msg.id = m.messageId " +
      "INNER JOIN teams t ON t.id = msg.teamId " +
      "WHERE msg.teamId = :teamId AND m.type = 'image' " +
      "ORDER BY m.updatedAt DESC",
      {
        replacements: {
          teamId
        },
        type: QueryTypes.SELECT
      }
    )
    return res.status(200).json({ images })
  } catch (error) {
    console.log(error)
    return res.status(403).json({
      message: "Could not get images!"
    })
  }
}


//ADMIN SITE

const getAllTeams = async (req, res) => {
  try {
    let teams = await Team.findAll({
      include: [{
        model: User,
        as: 'host',
        attributes: ['id', 'firstName', 'lastName']
      }, {
        model: User,
        as: 'members',
        attributes: ['id']
      }, {
        model: Meeting,
        as: 'meetings',
        attributes: ['id'],
      }],
      order: [
        ['updatedAt', 'DESC'],
        ['createdAt', 'DESC']
      ]
    })

    return res.status(200).json({ teams })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error: "Cann't get all teams" })
  }
}

const getTeamMeetings = async (req, res) => {
  let { teamId } = req.params
  try {
    let meetings = await Meeting.findAll({
      where: {
        teamId
      },
      order: [
        ['updatedAt', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'firstName', 'lastName']
      }]
    })
    return res.status(200).json({ meetings })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error: "Cann't get all meetings" })
  }
}

module.exports = {
  getTeamInfo, createTeam, getTeamCoverPhoto,
  getTeamMembers, getTeamRequestUsers,
  removeUserRequests, removeMembers,
  removeTeam, inviteUsers, removeInvitations,
  getTeamInvitedUsers, searchTeams, updateBasicTeamInfo,
  sendMessage, getMemberTeam,
  getTeamMeetMess, getMeetings, searchTeamWithCode,
  socketInviteUsers, socketConfirmRequest, getTeamSharedFiles,
  getTeamSharedImages, getMeetingActive, getAllTeams,
  getTeamMeetings, socketRemoveMember, confirmRequest
}