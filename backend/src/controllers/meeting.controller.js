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

module.exports = { getMeetingInfo, createMeeting }