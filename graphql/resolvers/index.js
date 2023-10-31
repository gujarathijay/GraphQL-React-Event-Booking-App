const Event = require('../../models/event')
const User = require('../../models/user')
const bcrypt = require('bcryptjs');


//events function
const events = eventIds=>{
    return Event.find({_id:{$in: eventIds}}).then(
        events=>{
            return events.map(event=>{
                return {...event._doc, _id:event.id, date: new Date(event._doc.date).toISOString(), creator: user.bind(this,event.creator)};
            })
        }
    ).catch(err=>{
        throw err;
    })
}
//user function
const user = userId =>{
    return User.findById(userId)
    .then(user =>{
        return {...user._doc, _id:user.id,createdEvents: events.bind(this,user._doc.createdEvents)};
    })
}


module.exports = {
        // queries and mutations should match resolver name
        events:()=>{
            return Event.find().then(
                events=>{
                  return events.map(event =>{
                    return {...event._doc, _id: event.id, date: new Date(event._doc.date).toISOString(), creator: user.bind(this, event._doc.creator)}; //binding the creator through user function defined above
                  }) 
                }).catch(err => {
                console.error(err);
                throw err;
            })
        },

        // we can have args in queries as well for eg. events(args)
        //args hold all the variables of input type
        createEvent: (args) =>{            
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,  //+ is used to convert value to a number
                date: new Date(args.eventInput.date), //Convert into Date
                creator: '653779a0ac629a91e655de7f'
            })
            let createdEvent;
            return event.save().then(
                result=>{
                    
                    createdEvent = {...result._doc,_id:result._doc._id.toString(), date: new Date(event._doc.date).toISOString(),creator: user.bind(this,result._doc.creator)};
                    // console.log(createdEvent)
                    return User.findById('653779a0ac629a91e655de7f')
                    // console.log(result);
                    // return {...result._doc}  
                }).then(
                    user=>{
                        if(!user){
                    throw new Error("User Not Found!!")
                        }
                    user.createdEvents.push(event);
                    return user.save();
                })
                .then(result=>{
                    return createdEvent;
                }).catch(err => {
                console.error(err);
                throw err;
            });
            // return event;
        },

        createUser: args =>{
            //if we do not add return it will give null 
            return User.findOne({email: args.userInput.email}).then(user=>{
                if(user){
                    throw new Error("User Exists Already!!")
                }
                return bcrypt.hash(args.userInput.password,12) 
            }).then(hashedPassword => {
                    const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return user.save();
            }).then(result =>{
                // console.log(result);
                return {...result._doc, password:null, _id: result.id};
            }).catch(err => {
                throw err;
            })
        }
    }