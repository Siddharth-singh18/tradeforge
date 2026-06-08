require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const marketRoutes = require('./routes/market.routes');
const { startSimulator } = require('./socket/priceEmitter');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', require('./middleware/auth.middleware').protect, orderRoutes);
app.use('/api/portfolio', require('./middleware/auth.middleware').protect, portfolioRoutes);
app.use('/api/watchlists', require('./middleware/auth.middleware').protect, watchlistRoutes);
app.use('/api/market', marketRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('TradeForge API is running');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('subscribe_symbols', ({ symbols }) => {
    if (symbols && Array.isArray(symbols)) {
      symbols.forEach(symbol => {
        socket.join(symbol);
        console.log(`Socket ${socket.id} joined room ${symbol}`);
      });
    }
  });

  socket.on('unsubscribe_symbols', ({ symbols }) => {
    if (symbols && Array.isArray(symbols)) {
      symbols.forEach(symbol => {
        socket.leave(symbol);
        console.log(`Socket ${socket.id} left room ${symbol}`);
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start price simulator
startSimulator(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
