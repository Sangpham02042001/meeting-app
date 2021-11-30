const Notification = require('../models/notification')
const Team = require('../models/team')
const User = require('../models/user')

const updateRead = async (req, res) => {
  let { notiId } = req.params
  let { content } = req.body
  let { id } = req.auth
  try {
    let notification = await Notification.findOne({
      where: {
        id: notiId
      }
    })
    // if (notification.userId != id) {
    //   throw `Not authorized`
    // }
    if (notification) {
      if (content) {
        notification.content = content
      }
      notification.isRead = !notification.isRead
      await notification.save()
    }
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
    // if (notification.userId != id) {
    //   throw `Not authorized`
    // }
    if (!notification) {
      return res.status(200).json({ message: 'Delete notification successfully' })
    }
    await notification.destroy()
    return res.status(200).json({ message: 'Delete notification successfully' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

const createTeamNofication = async ({ userId, content, relativeLink, createdBy, teamId }) => {
  try {
    let noti = await Notification.findOne({
      where: {
        teamId,
        userId,
        createdBy
      }
    })
    if (!noti) {
      noti = await Notification.create({
        userId, createdBy, content, relativeLink, teamId
      })
    } else if (noti.createdBy == createdBy) {
      noti.changed('createdAt', true)
      noti.set('createdAt', new Date(), { raw: true })
      noti.set('isRead', false)
      noti.set('content', content)
      noti.set('relativeLink', relativeLink)
      await noti.save()
    } else {
      noti.changed('createdAt', true)
      noti.set('createdAt', new Date(), { raw: true })
      noti.set('createdBy', createdBy)
      noti.set('isRead', false)
      noti.set('relativeLink', relativeLink)
      await noti.save()
    }
    noti = noti.dataValues
    return noti
  } catch (error) {
    console.log(error)
  }
}

const createMessageNotification = async ({ teamId, senderId, conversationId, receiverId, senderName }) => {
  try {
    if (teamId) {
      let team = await Team.findOne({
        where: {
          id: teamId,
        },
        attributes: ['name']
      })
      let teamName = team.name
      let content = `${senderName} sent message to team ${teamName}`
      let relativeLink = `/teams/${teamId}`
      team = await Team.findByPk(teamId)
      let members = await team.getMembers({
        attributes: ['id']
      })
      members = members.filter(m => m.id !== senderId);
      let noti
      for (const member of members) {
        noti = await Notification.findOne({
          where: {
            teamId, userId: member.id
          }
        })
        if (!noti || !noti.createdBy) {
          noti = await Notification.create({
            relativeLink, userId: member.id,
            content, teamId, createdBy: senderId
          })
        } else if (noti.createdBy == senderId) {
          noti.changed('createdAt', true)
          noti.set('createdAt', new Date(), { raw: true })
          noti.set('content', content)
          noti.set('relativeLink', relativeLink)
          noti.set('isRead', false)
          await noti.save()
        } else if (noti.createdBy) {
          noti.changed('createdAt', true)
          noti.set('createdAt', new Date(), { raw: true })
          noti.set('isRead', false)
          noti.set('content', content)
          noti.set('relativeLink', relativeLink)
          noti.set('createdBy', senderId)
          await noti.save()
        }
      }
      if (noti) {
        noti = {
          ...noti.dataValues,
          isNotiMess: true
        }
      }
      return {
        message: 'success',
        noti
      }
    }
    if (conversationId && receiverId) {
      let noti = await Notification.findOne({
        where: {
          conversationId, userId: receiverId
        }
      })
      let content = `${senderName} sent message to you.`
      let relativeLink = `/conversations/${senderId}`
      if (!noti || !noti.id) {
        noti = await Notification.create({
          content, relativeLink, userId: receiverId,
          createdBy: senderId, conversationId
        })
      } else if (noti.createdBy == senderId) {
        noti.changed('createdAt', true)
        noti.set('createdAt', new Date(), { raw: true })
        noti.set('isRead', false)
        await noti.save()
      }
      noti = {
        ...noti.dataValues,
        isNotiMess: true
      }

      return {
        message: 'success',
        noti
      }
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'error',
      noti: {},
      error
    }
  }
}

const createMeetingNofication = async ({ content, relativeLink, teamId, createdBy }) => {
  try {
    let team = await Team.findByPk(teamId)
    let members = await team.getMembers({
      attributes: ['id']
    })
    members = members.filter(m => m.id !== createdBy);
    let noti
    for (const member of members) {
      noti = await Notification.create({
        relativeLink, userId: member.id,
        content, teamId, createdBy
      })
    }
    return {
      message: 'success',
      noti
    }
  } catch (error) {
    console.log(error)
    return { error }
  }
}

const getAllNotifications = async (req, res) => {
  try {
    let notifications = await Notification.findAll({
      include: [
        { model: User, as: 'created', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
        // { model: Team, as: 'team', attributes: ['id', 'name'] },
      ],
      order: [
        ['updatedAt', 'DESC'],
        ['createdAt', 'DESC']
      ]
    })
    return res.status(200).json({ notifications })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
}

module.exports = {
  updateRead, deleteNotification,
  createTeamNofication, createMessageNotification,
  createMeetingNofication, getAllNotifications
}