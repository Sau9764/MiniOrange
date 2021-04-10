const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const app = express()

// accepting server json data
app.use(express.json())

const PORT = 4000
const ACCESS_SECRET = 'this_is_secret_key_for_jwt_encryption'

// Hardcoded data for login
const users = [
    {
        user: 'root',
        password: '$2a$04$Uut0CK4IfLQZsQjcKjIGA.Igk41IOT2FiuysrGv9PER6C9rmKppTG'  //root123
    },
    {
        user: 'test',
        password: '$2a$04$LJ.obmFCwRVYXswIOzZ./e8k03nn8UKVKKxsjvYfs7WKHZfAtB61i'  // test123
    }
]

// comes 2nd time and get direct access without login
app.get('/callback', authToken, (req, res) => {
    res.json(users.filter((user) => user.user === req.user.user))
})

// middleware to verify the token
function authToken(req, res, next) {
    const authHeader = req.headers['authorization'] // bearer
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null){
        res.send("Token not found")
    }else{
        jwt.verify(token, ACCESS_SECRET, (err, user) => {
            if(err) return res.send('Incorrect Token')
            req.user = user
            next()
        })
    }
}

// Login route
app.post('/login', async (req, res) => {
    const user1 = users.find(user => user.user == req.body.user)
    if(user1 == null){
        res.send("Can't find user")
    }else{
        try {
            if(await bcrypt.compare(req.body.password, user1.password)){
                const token = jwt.sign({user: req.body.user}, ACCESS_SECRET, {expiresIn: '5m'})
                res.send({id_token: token})
            }else{
                res.send('Incorrect Password')
            }
        }catch {
            res.send('Something went wrong')
        }
    }
})

// Server listening
app.listen(PORT, (err) => {
    if(err){
        console.log('Server not started. ')
    }else{
        console.log('Server running on PORT ', PORT)
    }
})
