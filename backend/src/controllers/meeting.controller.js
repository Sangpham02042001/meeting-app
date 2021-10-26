const { QueryTypes } = require('sequelize')
const { sequelize } = require('../models/meeting')
const Meeting = require('../models/meeting')
const User = require('../models/user')

const getMeetingInfo = async ({ meetingId }) => {
  try {
    let meeting = await Meeting.findByPk(meetingId)
    if (!meeting) {
      return res.status(200).json({
        message: 'No meeting found'
      })
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

module.exports = {
  getMeetingInfo, createMeeting, getActiveMemberMeeting,
  addMemberMeeting, outMeeting, joinMeeting,
  getUserMeeting, updateMeetingState
}