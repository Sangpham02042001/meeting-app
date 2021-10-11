const Notification = require('../models/notification')

const updateRead = async (req, res) => {
  let { notiId } = req.params
  let { id } = req.auth
  try {
    let notification = await Notification.findOne({
      where: {
        id: notiId
      }
    })
    if (notification.userId != id) {
      throw `Not authorized`
    }
    notification.isRead = true
    await notification.save()
    return res.status(200).json({ notification })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const deleteNotification = async (req, res) => {
  let { notiId } = req.params
  let { id } = req.auth
  try {
    let notification = await Notification.findOne({
      where: {
        id: notiId
      }
    })
    if (notification.userId != id) {
      throw `Not authorized`
    }
    await notification.destroy()
    return res.status(200).json({ message: 'Delete notification successfully' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

module.exports = { updateRead, deleteNotification }