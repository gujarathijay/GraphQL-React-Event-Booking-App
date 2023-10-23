const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event')

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

        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery{
            events: [Event!]!   
        }

        type RootMutation{
            createEvent(eventInput: EventInput): Event
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
                date: new Date(args.eventInput.date) //Convert into Date 
            })
            return event.save().then(
                result=>{
                  console.log(result);
                  return {...result._doc}  
                }
            ).catch(err => {
                console.error(err);
                throw err;
            })
            // return event;
        }
    },

    graphiql: true


}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@atlascluster.aillio9.mongodb.net/${process.env.MOMGO_DB}?retryWrites=true&w=majority`)
.then(()=>{
    app.listen(3000);
    // console.log("here")
})
.catch(err =>{
    console.log("Error connecting",err);
});


