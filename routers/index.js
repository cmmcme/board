module.exports = function(app, dbo) {
    app.get('/', function(req, res) {
        sess = req.session;
        var isSignUp = req.query.isSignUp;
        if(sess.userId) {
            res.redirect('/main');
        } else {
            res.render('defaultPage', {
                title : 'My Board',
                length : 5,
                isSignUp : isSignUp,
                userId : sess.userId
            });
        }
    });

    app.post('/login', function(req, res) {
        sess = req.session;
        let username = req.body.username;
        let password = req.body.password;
        let userInfoCol = dbo.collection('userInfo');
        userInfoCol.findOne({userId : username}, function(err, result){
            if(err) throw err;
            if(result.password == password) {
                sess.userId = username;
                res.redirect('/main');
            } else {
                res.redirect('/');
            }
        });
    });

    app.get('/logout', function(req, res) {
        req.session.destroy(function(err){
            if(err) throw err;
            res.redirect('/');
         });
    });

    app.get('/signup', function(req, res) {
        res.render('signUp');
    });

    app.post('/dupcheck', function(req, res) {
        let userId = req.body.userId;
        let password = req.body.password;
        let userInfoCol = dbo.collection('userInfo');
        userInfoCol.findOne({userId : userId}, function(err, result){
            if(err) throw err;

            if(!result) {
                userInfoCol.insertOne({userId : userId, password : password}, function(err,result) {
                    if(err) throw err;
                    res.redirect('/?isSignUp=1');
                });
            } else {
                res.redirect('/?isSignUp=-1');
            }
        });
    });

    app.get('/main', function(req, res) {
        sess = req.session;
        if(!sess.userId) {
            res.redirect('/');
        } else {
            let boardCol=dbo.collection('board');
            boardCol.find().sort({num : -1}).toArray(function(err, result) {
                if(err) throw err;

                let maxDisplayNum=Math.min(result.length,10)
                let page=result.length/10+1;
                res.render('main',{ 
                    boardResult:result,
                    maxDisplayNum:maxDisplayNum,
                    page:page
                });
            });
        }
    });

    app.get('/main/new', function(req, res) {
        sess = req.session;
        if(!sess.userId) {
            res.redirect('/');
        } else {
            res.render('write',{});
        }
    });

    app.post('/main/write-complete', function(req, res) {
        sess = req.session;
        let content=req.body.content;
        let title=req.body.title;
        let boardCol=dbo.collection('board');
        boardCol.count().then((cnt) => { 
            boardCol.insertOne({num:cnt + 1,title:title,contents:content,count:1,writer:sess.userId},function(err,result){
                if(err) throw err;
                res.redirect('/main');
            });
        });
    });
}
