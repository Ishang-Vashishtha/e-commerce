const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getAdminStats } = require('../controllers/analyticsController.js');
const {admin} = require('../middlewares/adminMiddleware');


const router = express.Router();

router.get("/",protect,admin,getAdminStats);

module.exports = router;