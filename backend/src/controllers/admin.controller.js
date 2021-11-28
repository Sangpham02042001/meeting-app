const bcrpyt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Team = require('../models/team')
const sequelize = require('../models')
const { QueryTypes } = require('sequelize')



const adminSignin = async (req, res) => {
    let { email, password } = req.body
    try {
        let user = await User.findOne({
            where: {
                email
            }
        })

        if (user && user.role === 'admin') {
            const isPasswordMatch = await bcrpyt.compare(password, user.hash_password);
            if (!isPasswordMatch) {
                return res.status(401).json({ error: "Email and Password haven't matched" })
            }
            const token = jwt.sign({
                id: user.id,
                name: user.firstName + ' ' + user.lastName,
                company: 'SPICY_CODE',
                role: user.role
            }, process.env.JWT_SECRET_KEY)

            user.hash_password = undefined
            return res.status(200).json({
                token,
                lastName: user.lastName,
                firstName: user.firstName,
                id: user.id,
                avatar: user.avatar
            })
        } else {
            return res.status(401).json({ error: 'Could not sign in' })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error })
    }
}

const getAllUsers = async (req, res) => {
    try {
        let users = await User.findAll({})
        return res.json({
            users
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error })
    }

}

const deleteUser = async (req, res) => {
    let { userId } = req.params;
    try {
        await User.destroy({
            where: {
                id: userId
            }
        })
        return res.status(200).json({
            ids: userId,
            message: "Delete successfully!"
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: 'Delete error'
        })
    }

}

module.exports = { adminSignin, getAllUsers, deleteUser }