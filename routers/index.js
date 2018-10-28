module.exports = function(app, dbo) {
    app.get('/', function(req, res) {
        sess = req.session;
        console.log(sess.userId);
        if(sess.userId) {
            res.redirect('/main');
        } else {
            res.render('defaultPage', {
                title : 'My Board',
                length : 5,
                userId : sess.userId
            });
        }
    });

    app.post('/login', function(req, res) {
        sess = req.session;
        let username = req.body.username;
        let password = req.body.password;
        console.log(username, password);
        let userInfoCol = dbo.collection('userInfo');
        userInfoCol.findOne({_userId_ : username}, function(err, result){
            if(err) throw err;
            console.log('!!');
            if(result.password == password) {
                sess.userId = username;
                res.redirect('/main');
            } else {
                res.redirect('/');
            }
        });
    });

    app.get('/main', function(req, res) {
        sess = req.session;
        if(!sess.userId) {
            res.redirect('/');
        } else {
            res.render('main');
            console.log(sess.userId);
        }
    });
}