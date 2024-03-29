const express = require('express');
const router = express.Router();
const checkNotLogin = require('../middlewares/check').checkNotLogin;

const sha1 = require('sha1');
const UserModel = require('../models/users');

//GET /singin 登录页面
router.get('/',checkNotLogin,(req,res,next) => {
    res.render('signin');
});

//POST /singin 用户登录
router.post('/',checkNotLogin,(req,res,next) => {
    const name = req.fields.name;
    const password = req.fields.password;

    try{
        if(!name.length){
            throw new Error('请输入用户名');
        }
        if(!password.length){
            throw new Error('请填写密码');
        }
    }catch (e) {
        req.flash('error',e.message);
        return res.redirect('back');
    }

    UserModel.getUserByName(name)
        .then((user) => {
            if(!user){
                req.flash('error','用户不存在');
                return res.redirect('back');
            }
            //检查密码是否匹配
            if(sha1(password) !== user.password){
                req.flash('error','用户名或密码错误');
                return res.redirect('back');
            }
            req.flash('success','登录成功');
            //用户信息写入session
            delete user.password;
            req.session.user = user;
            //跳转到主页
            res.redirect('/posts');
        })
        .catch(next);
});

module.exports = router;