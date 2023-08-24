const DB_interact = require('./mongoose');
const Spotify_API = require('./spotify');
const querystring = require('querystring');
const path = require('path');
const express = require('express');
const app = express();

app.use(express.static('../public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => { res.redirect('/create_account.html'); })

// route to get only for development purposes - Clears database
app.get('/delete_all', (req, res) => { DB_interact.clear_db(); res.redirect('/'); });

// route to homepage for user - all user groups will be displayed
app.get('/home/:username', (req, res) => {

    cur_path = path.join(__dirname.replace('server', 'public'), 'home.html');

    res.sendFile(cur_path);
    
});

// redirect to get method for home after successful login attempt
app.post('/home/:username', (req, res) => { res.redirect("/home/" + req.params.username); })

// route to login page
app.get('/login', (req, res) => {

    res.redirect('/login.html');

})

// route will verify a users spotify account
app.get('/spotify_redirect', (req, res) => { 
    res.redirect( Spotify_API.makeAuthURL() );
});

// route will create an account and link the user with their api verification key
app.get('/create_account', (req, res) => {

    res.redirect('/create_account.html?' + querystring.stringify({
        code: req.query.code
    }));

})

// route will add the user to the database
app.post('/create_account', async (req, res) => {

    const USER = await DB_interact.create_user(req.body.email.toLowerCase(), req.body.username, req.body.pass, req.body.code);
    await DB_interact.add_user( USER );
    
    res.redirect("/");
});

// route will validate that a given email is in the database
app.post('/validate_email', async (req, res) => {

    email = req.body.email.toLowerCase();
    const email_exists = await DB_interact.email_exists(email);

    res.json({ email_exists });
});

// route will validate that a given username is in the database
app.post('/validate_username', async (req, res) => {

    username = req.body.username.toLowerCase();
    const username_exists = await DB_interact.username_exists(username);

    res.json({ username_exists });
});

// route will get all groups from a user
app.post('/get_groups', async (req, res) => {

    user = req.body.user;
    const groups = await DB_interact.get_users_groups(user);

    res.json({ groups });
})

app.listen(3000);