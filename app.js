const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');

const mongoose = require('mongoose');



const app = express();
app.use(bodyParser.json());

const graphqlSchema = require ('./graphql/schema/index');
const graphqlResolvers = require ('./graphql/resolvers/index');

// const events=[];
app.use('/graphql',graphqlHttp({

    schema: graphqlSchema,       //Schema
    rootValue: graphqlResolvers, //Resolvers
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


