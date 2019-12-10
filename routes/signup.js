const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const sha1 = require('sha1');

const checkNotLogin = require('../middlewares/check').checkNotLogin;
const UserModel = require('../models/users');

//GET /signup   注册页面
router.get('/',checkNotLogin,(req,res,next) => {
    res.render('signup');
});

//POST /signup 用户注册
router.post('/',checkNotLogin,(req,res,next) => {
    const name = req.fields.name;
    const gender = req.fields.gender;
    const bio = req.fields.bio;
    const avatar = req.files.avatar.path.split(path.sep).pop();
    let password = req.fields.password;
    const repassword = req.fields.repassword;

    //校验参数
    try{
        if(!(name.length >= 1 && name.length <= 10)){
            throw new Error('名字请限制在1 - 10 个字符');
        }
        if(password.length < 6){
            throw new Error('密码至少 6 个字符');
        }
        if(password !== repassword){
            throw new Error('两次输入密码不一致');
        }
        if(['m','f','x'].indexOf(gender) === -1){
            throw new Error('性别只能是 m、f 或 x');
        }
        if(!req.files.avatar.name){
            throw new Error('缺少头像');
        }
        if(!(bio.length >= 1 && bio.length <= 30)){
            throw new Error('个人简介请限制在 1 - 30 字符');
        }
    }catch (e) {
        //注册失败
        fs.unlink(req.files.avatar.path,(err) => {});
        req.flash('error',e.message);
        return res.redirect('/signup');
    }

    //明文密码加密
    password = sha1(password);

    //待写入数据库的用户信息
    let user = {
        name:name,
        password:password,
        gender: gender,
        bio:bio,
        avatar:avatar
    }
    //用户信息写入数据库
    UserModel.create(user)
        .then((result) => {
            //次user 是插入mongodb后的值，包含_id
            user = result.ops[0];
            //删除密码这种敏感信息，将用户存入session
            delete user.password;
            req.session.user = user;
            //写入flash
            req.flash('success','注册成功')
            //调整到首页
            res.redirect('/posts');
        })
        .catch((e) => {
            //注册失败异步删除上传的头像
            fs.unlink(req.files.avatar.path,(err) => {});
            //用户名被占用则跳转到注册页
            if(e.message.match('duplicate key')){
                req.flash('error','用户名已被占用');
                return res.redirect('/signup');
            }
            next(e);
        })
});

module.exports = router;