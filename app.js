const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Event = require('./models/event')
const User = require('./models/user')


const app = express();
app.use(bodyParser.json());


// const events=[];
app.use('/graphql',graphqlHttp({
    // "!" :- Non Nullable
    //events: [Event!]!  :- array of events that has type Event
    schema: buildSchema(`
        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput{
            email: String!
            password: String!
        }

        type RootQuery{
            events: [Event!]!   
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),

    //Resolvers
    rootValue: {
        // queries and mutations should match resolver name
        events:()=>{
            return Event.find().then(
                events=>{
                  return events.map(event =>{
                    return {...event._doc}
                  }) 
                }
            ).catch(err => {
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
                    
                    createdEvent = {...result._doc,_id:result._doc._id.toString()};
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
    },

    graphiql: true


}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@atlascluster.aillio9.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(()=>{
    app.listen(3000);
    // console.log("here")
})
.catch(err =>{
    console.log("Error connecting",err);
});


