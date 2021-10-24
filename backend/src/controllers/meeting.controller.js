const { QueryTypes } = require('sequelize')
const { sequelize } = require('../models/meeting')
const Meeting = require('../models/meeting')
const User = require('../models/user')

const getMeetingInfo = async (req, res) => {

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

const getMemberMeeting = async ({ meetingId, select }) => {
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

module.exports = {
  getMeetingInfo, createMeeting, getMemberMeeting,
  addMemberMeeting, outMeeting, joinMeeting, getUserMeeting
}