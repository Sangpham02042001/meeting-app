const formidable = require('formidable')
const fs = require('fs')
const Team = require('../models/team')
const User = require('../models/user')

const getTeamInfo = async (req, res) => {

}

const createTeam = async (req, res) => {
  let { id } = req.auth
  const form = formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err })
    }
    let { name } = fields
    let coverPhoto,
      teamType = fields.teamType || 'public'
    if (files.coverPhoto) {
      coverPhoto = fs.readFileSync(files.coverPhoto.path)
    }
    try {
      let teams = await Team.findAll({
        where: {
          hostId: id
        },
        attributes: ['name']
      })
      if (teams.length > 0) {
        let check = teams.some(team => team.name === name)
        if (check) {
          return res.status(400).json({
            error: `Team with name ${name} has been created by you, please choose other name`
          })
        }
      }
      let team = await Team.create({
        name,
        coverPhoto,
        teamType,
        hostId: id
      }, {
        include: [User]
      })
      console.log(team)
      team.coverPhoto = undefined
      return res.status(201).json({ team })
    } catch (error) {
      console.log(error)
      return res.status(400).json({ error })
    }
  })
}

module.exports = { getTeamInfo, createTeam }