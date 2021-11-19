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

const createNofication = async ({ userId, content, relativeLink, createdBy, teamId }) => {
  try {
    let noti = await Notification.findOne({
      where: {
        teamId,
        userId
      }
    })
    console.log(`noti, ${noti}`)
    if (!noti) {
      noti = await Notification.create({
        userId, createdBy, content, relativeLink, teamId
      })
    } else if (noti.createdBy == createdBy) {
      noti.changed('createdAt', true)
      noti.set('createdAt', new Date(), { raw: true })
      noti.set('isRead', false)
      await noti.save()
    } else {
      noti.changed('createdAt', true)
      noti.set('createdAt', new Date(), { raw: true })
      noti.set('createdBy', createdBy)
      noti.set('isRead', false)
      await noti.save()
    }
    noti = noti.dataValues
    return noti
  } catch (error) {
    console.log(error)
  }
}

module.exports = { updateRead, deleteNotification, createNofication }