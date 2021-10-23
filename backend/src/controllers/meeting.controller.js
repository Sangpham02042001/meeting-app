const { QueryTypes } = require('sequelize')
const { sequelize } = require('../models/meeting')
const Meeting = require('../models/meeting')

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

const getMemberMeeting = async ({ meetingId }) => {
  try {
    let members = await sequelize.query(
      "SELECT userId FROM users_meetings WHERE meetingId = :meetingId", {
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
    const newMember = await sequelize.query(
      "INSERT INTO users_meetings SET meetingId = :meetingId, userId = :userId, updatedAt = NOW(), createdAt = NOW()", {
      replacements: {
        meetingId,
        userId,
      },
      type: QueryTypes.INSERT
    }
    )

    return newMember;
  } catch (error) {
    console.log(error)
    return null;
  }
}

module.exports = { getMeetingInfo, createMeeting, getMemberMeeting, addMemberMeeting }