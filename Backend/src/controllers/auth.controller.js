import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, gender, healthGoals } = req.body

    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      dateOfBirth,
      gender,
      healthGoals,
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const userInfo = await response.json()

    if (userInfo.error) {
      return res.status(400).json({ message: 'Invalid Google Token' })
    }

    const { email, name } = userInfo

    let user = await User.findOne({ email })

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      const randomPassword = Math.random().toString(36).slice(-8)
      user = await User.create({
        name,
        email,
        password: randomPassword,
      })

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (user) {
      if (req.body.name) user.name = req.body.name
      if (req.body.email) user.email = req.body.email
      if (req.body.dateOfBirth) user.dateOfBirth = req.body.dateOfBirth
      if (req.body.gender) user.gender = req.body.gender
      if (req.body.photoUrl) user.photoUrl = req.body.photoUrl
      if (req.body.phone) user.phone = req.body.phone
      if (req.body.height) user.height = req.body.height
      if (req.body.weight) user.weight = req.body.weight

      // Handle nested objects carefully
      if (req.body.healthProfile) {
        if (!user.healthProfile) user.healthProfile = {}
        const hp = req.body.healthProfile
        if (hp.diseases) user.healthProfile.diseases = hp.diseases
        if (hp.allergies) user.healthProfile.allergies = hp.allergies
        if (hp.medications) user.healthProfile.medications = hp.medications
        if (hp.activityLevel) user.healthProfile.activityLevel = hp.activityLevel
        if (hp.dietType) user.healthProfile.dietType = hp.dietType
      }

      if (req.body.emergencyContact) {
        if (!user.emergencyContact) user.emergencyContact = {}
        const ec = req.body.emergencyContact
        if (ec.name) user.emergencyContact.name = ec.name
        if (ec.phone) user.emergencyContact.phone = ec.phone
        if (ec.relation) user.emergencyContact.relation = ec.relation
      }

      if (req.body.alertSettings) {
        if (!user.alertSettings) user.alertSettings = {}
        const as = req.body.alertSettings
        if (as.emailAlerts !== undefined) user.alertSettings.emailAlerts = as.emailAlerts
        if (as.smsAlerts !== undefined) user.alertSettings.smsAlerts = as.smsAlerts
        if (as.emergencyAlerts !== undefined) user.alertSettings.emergencyAlerts = as.emergencyAlerts
      }

      if (req.body.password) {
        user.password = req.body.password
      }

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        photoUrl: updatedUser.photoUrl,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        height: updatedUser.height,
        weight: updatedUser.weight,
        healthProfile: updatedUser.healthProfile,
        emergencyContact: updatedUser.emergencyContact,
        alertSettings: updatedUser.alertSettings,
        token: generateToken(updatedUser._id),
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: error.message })
  }
}
