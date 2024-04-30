const express = require ('express');
const {register , login , getMe , logout, update} = require ('../controllers/users');

const router = express.Router();

const {protect} = require ('../middleware/user');

router.post('/register' , register);
router.post('/login' , login);
router.get('/me' , protect , getMe);
router.get('/logout' , logout);

router.put('/update/:id', protect, update);

module.exports = router;
