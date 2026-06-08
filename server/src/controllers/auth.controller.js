const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Generate JWT Access Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '15m',
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      // Set refresh token in HTTP-only cookie
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        virtualFunds: user.virtualFunds,
        token: accessToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    // Auto-create demo user if it doesn't exist in the database
    if (!user && email === 'demo@tradeforge.com') {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@tradeforge.com',
        password: 'password',
        virtualFunds: 1000000
      });
      
      // Also seed some initial holdings for the demo
      const Holding = require('../models/Holding.model');
      await Holding.create([
        { symbol: 'RELIANCE.NS', quantity: 50, avgBuyPrice: 2800.00, userId: user._id },
        { symbol: 'TCS.NS', quantity: 20, avgBuyPrice: 3800.00, userId: user._id },
        { symbol: 'HDFCBANK.NS', quantity: 150, avgBuyPrice: 1550.00, userId: user._id }
      ]);
      
      user.virtualFunds = 1000000 - (50*2800) - (20*3800) - (150*1550);
      await user.save();
    }

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        virtualFunds: user.virtualFunds,
        token: accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  const cookies = req.headers.cookie;
  if (!cookies) return res.status(401).json({ message: 'No cookies found' });

  // Extract the jwt cookie
  const cookieArray = cookies.split(';');
  let refreshToken = null;
  for (let cookie of cookieArray) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'jwt') {
      refreshToken = value;
      break;
    }
  }

  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateToken(user._id);
    res.json({ token: accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token expired or invalid' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = '';
      await user.save();
    }
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    virtualFunds: req.user.virtualFunds,
  });
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
};
