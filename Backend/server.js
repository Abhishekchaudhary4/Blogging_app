const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require("path")

const IndexRoute = require("./Routers/index")
const connectDatabase = require("./Helpers/database/connectDatabase")
const customErrorHandler = require("./Middlewares/Errors/customErrorHandler")
const { processChatbotQuery } = require('./Controllers/chatbot')

dotenv.config({
    path:  './config/config.env'
})

connectDatabase()

const app = express() ;

app.use(express.json())
app.use(cors())

app.use("/",IndexRoute)

app.post('/api/summarize', processChatbotQuery)

app.use(customErrorHandler)


app.get("/*", function (req,res){
    res.sendFile(
        path.join(__dirname, "../Frontend/public/index.html"),
        function(err){
            if(err){
                res.status(500).send(err);
            }
        }
    )
});

const PORT = process.env.PORT || 5000 ;

app.use(express.static(path.join(__dirname , "public") ))

const server = app.listen(PORT,()=>{

    console.log(`Server running on port  ${PORT} : ${process.env.NODE_ENV}`)

})

process.on("unhandledRejection",(err , promise) =>{
    console.log(`Logged Error : ${err}`)

    server.close(()=>process.exit(1))
})