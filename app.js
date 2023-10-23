const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const app = express();

app.use(bodyParser.json());
const events=[];
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

            return events;
        },

        // we can have args in queries as well for eg. events(args)
        //args hold all the variables of input type
        createEvent: (args) =>{            
            const event  = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,  //+ is used to convert value to a number
                date: args.eventInput.date

            }
            events.push(event);
            return event;
        }
    },

    graphiql: true


}));



app.listen(3000);
