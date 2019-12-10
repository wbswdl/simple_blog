module.exports = {
    port:8080,
    session:{
        secret:'simple_blog',
        key:'simple_blog',
        maxAge:2592000000
    },
    mongodb:'mongodb://localhost:27017/myblog'
}