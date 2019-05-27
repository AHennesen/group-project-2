module.exports = (app,db) => {
    const Op = db.Sequelize.Op;


    
    //mlogin
    app.get('/loginStatus', (req, res) => {
        console.log('is auth ',res.isAuthenticated())
        if(res.isauthenticted())
            res.send(res.user)
        else
            res.sendStatus(400)
       
    });
    
    app.get('/logout', (req, res) => {
        req.logout();
        req.session.destroy();
        res.redirect('/');
    });

    app.get('/api/user/:id', (req, res) => {
        let id = req.params.id
        db.User.findOne({where : { id: id } }).then(result => {
            console.log(result)
            
            res.send(result);
            
        });
    });
    // app.get('/api/user/:id/image', (req,res) => {
    //     let id = req.params.id;
    //     db.User.findOne({where: { id: id } , attributes: ['picture_ref'] } ).then(result => {
    //         console.log(result)
    //         let options = {
    //             root: __dirname + '/../client/public/images/upload_images/'
    //         }
    //         res.sendFile(result.picture_ref, options);

    //     })
        
        
    // })



    // name and id of all users for searching to add user
    app.get('/api/search/users', (req, res) => {
        console.log('requested user id');
        db.User.findAll({attributes: ['user_name','id']}).then(result => {
            let userArray = new Array; 
            result.forEach(item => {
               userArray.push(item.get())
            })
            console.table(userArray);
            res.json(userArray);
        });
    });

    //get for group page - all users in group
    app.get('/api/group/:uid/:id', (req, res) => {
        console.log('requested group')
        let id = req.params.id
        let uid = req.params.uid
        db.UserGroup.findAll({
            where: { GroupId: id }, 
            include: {
                model: db.User,
                attributes: ['user_name','status','id', 'phone_number','picture_ref'],
                where: {
                    id: {
                        [Op.ne]: uid
                    }
                }
            }   
        }).then(result => {
            let userArrayActive = new Array();
            let userArrayInactive = new Array();
            result.forEach(userGroup => {
            // console.log(userGroup.User.get());
            if (userGroup.User.status)
                userArrayActive.push(userGroup.User.get())
            else    
                userArrayInactive.push(userGroup.User.get())
            });
            let userArray = userArrayActive.concat(userArrayInactive);
            console.table(userArray);
            res.json(userArray);
        })
    
    });
  
    //get for groups page - 
    //all groups of user and all status/ids of members in each group
    app.get('/api/groups/:id', (req,res) => {
        console.log('requested user groups')
        let id = req.params.id;
        db.UserGroup.findAll({
            where: { UserId: id }, 
            include: {
                model: db.Group,
                attributes: ['name','id'],
                include: {
                    model: db.UserGroup,
                    attributes: ['GroupId'],
                    include: {
                        model: db.User,
                        attributes: ['status','id'],
                        order: ['status','DESC'],
                        where: {
                            id: {
                                [Op.ne]: id
                            }
                        }
                    }   
                }
            } 
        })
        .then(result => {
            let groupsArray = new Array;
            result.forEach(item => {
                let statusArray = new Array;
                item.Group.UserGroups.forEach(userGroup => {
                    let user = userGroup.User
                    statusArray.push(user.status)
                    console.log('Status:',user.status)
                })
                let group = {
                    name: item.Group.name,
                    id: item.Group.id,
                    memberStatusArray: statusArray
                }
                groupsArray.push(group) 
            })
            console.table(groupsArray)
            res.json(groupsArray)

        });

    });
}