const express = require('express');
const dotenv = require('dotenv');
const insuranceRoutes = require('./routes/insurance');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS globally here
app.use(cors());  // Allow cross-origin requests
app.use(express.json());

// Mount the insurance routes
app.use('/api/insurance', insuranceRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
