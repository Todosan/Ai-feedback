const express = require('express');
const dotenv = require('dotenv');
const insuranceRoutes = require('./routes/insurance');
const cors = require('cors');



dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/api/insurance', insuranceRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
