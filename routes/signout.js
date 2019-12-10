const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/check').checkLogin;

//GET /signout 退出
router.get('/',checkLogin,(req,res,next) => {
    //清空session中的用户信息
    req.session.user = null;
    req.flash('success','退出成功');
    res.redirect('/posts');
});

module.exports = router;