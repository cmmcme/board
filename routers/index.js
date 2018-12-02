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
                const url = require('url');
                res.redirect(url.format({
                    pathname : '/main',
                    query: {
                        "pos" : 1
                    }
                }));
            } else {
                res.redirect('/');
            }
        });
    });
    app.get('/main', function(req, res) {
        sess = req.session;
        let pos = req.query.pos;
        if(!sess.userId) {
            res.redirect('/');
        } else {
            let boardCol=dbo.collection('board');
            let boardIndex = dbo.collection('boardIndex');
        //    boardIndex.find()
            boardCol.count().then((cnt) => { 
                let page=Math.floor(cnt/10+1);
                boardCol.find({num : {$gte:(pos-1)*10 + 1, $lte :pos * 10}}).sort({num : -1}).toArray(function(err, result) {
                    if(err) throw err;
                    let maxDisplayNum=Math.min(result.length,10)
                    res.render('main',{ 
                        boardResult:result,
                        maxDisplayNum:maxDisplayNum,
                        page:page
                    });
                });
            });
        }
    });
    app.post('/main/read',function(req,res){
        let index = parseInt(req.body.write_id);
        let boardCol=dbo.collection('board');
        boardCol.findOne({num : index}, function(err, result) {
           if(err) throw err;
           boardCol.update({num : index}, {$inc : {count : 1}});
           res.render('read',{
               writing:result
           });
        });
    });
    app.get('/main/new', function(req, res) {
        sess = req.session;
        if(!sess.userId) {
            res.redirect('/');
        }else{
            res.render('write',{
            
            });
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
                res.redirect('/main?pos=1');
            });
        });
    });
    app.get('/signup', function(req, res) {
        res.render('signUp');
    });
    app.post('/dupcheck', function(req, res) {
        let userId = req.body.userId;
        let password = req.body.password;
        console.log(userId, password);
        let userInfoCol = dbo.collection('userInfo');
        userInfoCol.findOne({userId : userId}, function(err, result){
            if(err) {
                console.error(err);
                throw err;
            }
            console.log('result ',result);
            if(!result) {
                userInfoCol.insertOne({userId : userId, password : password}, function(err,result) {
                    if(err) throw err;
                    res.redirect('/?isSignUp=1');
                });
            } else {
                res.redirect('/?isSignUp=-1');
            }

        });
    })
}
