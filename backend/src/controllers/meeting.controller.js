const { QueryTypes } = require('sequelize')
const { sequelize } = require('../models/meeting')
const Meeting = require('../models/meeting')
const Message = require('../models/message')
const User = require('../models/user')
const fs = require('fs')
const { Readable } = require('stream');
const { v4 } = require('uuid')
const axios = require('axios')

const getMeetingById = async (req, res) => {
  const { meetingId } = req.params
  const meeting = await Meeting.findOne({
    where: {
      id: meetingId
    }
  })
  return res.status(200).json({ meeting })
}

const getMeetingInfo = async ({ meetingId }) => {
  try {
    let meeting = await Meeting.findByPk(meetingId)
    if (!meeting) {
      return null
    }
    let users = await meeting.getMembers()
    users = users.map(user => {
      return {
        id: user.id,
        userName: user.firstName + ' ' + user.lastName,
        email: user.email
      }
    })
    return {
      ...meeting.dataValues,
      members: users
    };
  } catch (error) {
    console.log(error)
  }
}

const createMeeting = async (req, res) => {
  let { teamId } = req.body
  let { id } = req.auth
  try {
    const meeting = await Meeting.create({
      teamId,
      hostId: id
    })

    console.log(meeting)

    const janusServer = process.env.JANUS_SERVER

    let response = await axios.post(`${janusServer}`, {
      janus: 'create',
      transaction: 'meeting_app',
      id: Number(meeting.id)
    })
    console.log(response.data, response.status)
    if (response.data && response.data.janus === 'success') {
      let sessionId = response.data.data.id
      response = await axios.post(`${janusServer}/${sessionId}`, {
        janus: 'attach',
        transaction: 'meeting_app',
        plugin: 'janus.plugin.videoroom'
      })
      console.log(response.data, response.status)
      _id = response.data.data.id
      if (response.data && response.data.janus === 'success') {
        response = await axios.post(`${janusServer}/${sessionId}/${_id}`, {
          janus: 'message',
          transaction: 'meeting_app',
          body: {
            request: 'create',
            room: Number(meeting.id)
          }
        })
      }
    }
    return res.status(200).json({ meeting })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }

}

const getActiveMemberMeeting = async ({ meetingId, select }) => {
  try {
    let members = await sequelize.query(
      "SELECT ut.userId, CONCAT(u.firstName, ' ', u.lastName) as userName FROM users_meetings ut " +
      "INNER JOIN users u ON ut.userId = u.id " +
      "WHERE ut.meetingId = :meetingId AND ut.inMeeting = true;"
      , {
        replacements: {
          meetingId,
        },
        type: QueryTypes.SELECT
      }
    )
    return members;
  } catch (error) {
    console.log(error)
    return [];
  }
}

const addMemberMeeting = async ({ meetingId, userId }) => {
  try {
    await sequelize.query(
      "INSERT INTO users_meetings SET meetingId = :meetingId, userId = :userId, updatedAt = NOW(), createdAt = NOW()", {
      replacements: {
        meetingId,
        userId,
      },
    })

    const user = await User.findOne({
      where: {
        id: userId
      },
    })

    return {
      userId: user.id,
      userName: user.getFullName()
    };
  } catch (error) {
    console.log(error)
    return null;
  }
}

const outMeeting = async ({ meetingId, userId }) => {
  try {
    await sequelize.query(
      "UPDATE users_meetings SET inMeeting = false WHERE userId = :userId AND meetingId = :meetingId;", {
      replacements: {
        meetingId: Number(meetingId),
        userId,
      },
    })
    return {
      message: 'Out successfully'
    }
  } catch (error) {
    console.log(error)
    return null;
  }
}

const joinMeeting = async ({ meetingId, userId }) => {
  try {
    await sequelize.query(
      "UPDATE users_meetings SET inMeeting = true WHERE userId = :userId AND meetingId = :meetingId;", {
      replacements: {
        meetingId: Number(meetingId),
        userId,
      },
    })
    return {
      message: 'Join successfully'
    }
  } catch (error) {
    console.log(error)
    return null;
  }
}

const getUserMeeting = async ({ meetingId, userId }) => {
  try {
    let user = await sequelize.query(
      "SELECT * FROM users_meetings WHERE userId = :userId AND meetingId = :meetingId",
      {
        replacements: {
          userId,
          meetingId: Number(meetingId)
        },
        type: QueryTypes.SELECT
      }
    )
    console.log(user)
    if (user.length) {
      return user[0]
    } else {
      return null;
    }
  } catch (error) {
    console.log(error)
    return null;
  }
}

const updateMeetingState = async ({ meetingId }) => {
  try {
    const meeting = await Meeting.findOne({
      where: {
        id: meetingId
      }
    })
    meeting.active = false
    await meeting.save()
    // await sequelize.query(
    //   "UPDATE meetings m SET time = TIMESTAMPDIFF(SECOND, m.createdAt, NOW()) " +
    //   "WHERE m.id = :meetingId", {
    //   replacements: {
    //     meetingId
    //   }
    // })
    let members = await sequelize.query(
      "SELECT ut.userId FROM users_meetings ut " +
      "INNER JOIN meetings m ON m.id = ut.meetingId " +
      "WHERE m.id = :meetingId;",
      {
        replacements: {
          meetingId
        },
        type: QueryTypes.SELECT
      }
    )
    return members;
  } catch (error) {
    console.log(error)
    return []
  }
}

const sendMessageMeeting = async ({ senderId, content, image, meetingId }) => {
  try {
    let photoName = null;
    if (image) {
      photoName = v4() + '.png';
      let writeStream = fs.createWriteStream(`./src/public/messages-photos/${photoName}`);
      const imageStream = new Readable();
      imageStream._read = () => { }
      imageStream.push(image)
      imageStream.pipe(writeStream)
    }

    const message = await Message.create({
      content,
      userId: senderId,
      meetingId,
      photo: photoName
    })
    return message;
  } catch (error) {
    console.log(error)
    return null;
  }
}

const getMeetingMessages = async (req, res) => {
  const { meetingId } = req.params
  try {
    const meeting = await Meeting.findByPk(meetingId)
    const messages = await meeting.getMessages()
    return res.status(200).json({
      messages
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const getCurrentMeeting = async (req, res) => {
  const { id } = req.auth
  try {
    const result = await sequelize.query(
      "SELECT m.teamId, m.id FROM users_meetings ut " +
      "INNER JOIN meetings m ON ut.meetingId = m.id " +
      "WHERE userId = :id AND ut.inMeeting = true;",
      {
        replacements: {
          id
        },
        type: QueryTypes.SELECT
      }
    )
    return res.status(200).json({ meetingJoined: result[0] })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

module.exports = {
  getMeetingInfo, createMeeting, getActiveMemberMeeting,
  addMemberMeeting, outMeeting, joinMeeting,
  getUserMeeting, updateMeetingState, sendMessageMeeting,
  getMeetingMessages, getCurrentMeeting, getMeetingById
}