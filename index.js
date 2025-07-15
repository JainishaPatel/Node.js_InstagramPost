require('dotenv').config();
const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
let port = 8080;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');



app.use(methodOverride('_method'));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname , "/views") );

app.use(express.urlencoded( {extended: true} ) );
app.use(express.json());

app.use(express.static( path.join(__dirname , "/public") ) );



const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


// --------------------------------------
// ROUTES
// --------------------------------------


// Route: Show all posts
app.get("/posts", (req , res)=>{
    let query1 = `SELECT * FROM post`;
    let query2 = `SELECT COUNT(*) FROM post`;
    
    try{
        connection.query(query1, (err , posts)=>{
            if(err) throw err;
            // console.log(posts);

            connection.query(query2, (err , result)=>{
                if(err) throw err;
                let count = result[0]["COUNT(*)"];

                res.render("showPost.ejs" , { posts , count } );
        });
           
    });

    } catch(err) {
        res.send("Post will not showing...")
    }

    try{
        

    } catch(err) {
        res.send("Post will not showing...")
    }
});



// Route: Show edit page for a post
app.get("/posts/:id/edit" , (req , res)=>{

    let { id } = req.params;
    let query = `SELECT * FROM post WHERE id = "${id}"`;

    try{
        connection.query(query, (err , result)=>{
            if(err) throw err;
            let post = result[0];
            res.render("editPost.ejs" , { post } );
        })
    } catch(err){
        res.send("Post will not showing...")
    }

});



// Route: Handle update logic (PATCH)
app.patch("/posts/:id" , (req , res)=>{

    let { id } = req.params;
    let { username: newUsername, password: formPassword, image: newImage } = req.body;

    let query = `SELECT * FROM post WHERE id = "${id}" `;
    
    try{
        connection.query(query, (err , result)=>{
            if(err) throw err;
            let post = result[0];
            
            if( formPassword != post.password ){
                res.send("You entered WRONG password !");
            } else {

                let query2 = `UPDATE post SET username = "${newUsername}", image = "${newImage}" WHERE id = "${id}"`
                    
                connection.query(query2, (err , result)=>{
                        if(err) throw err;
                        // console.log(result);
                        res.redirect("/posts");
                });
               
            }
        });
    } catch(err){
        res.send("Post will not showing...")
    }
});



// Route: Show form to create a new post
app.get("/posts/newPost" , (req , res)=>{
    res.render("newPost.ejs");
});

// Route: Handle new post creation (POST)
app.post("/posts/newPost" , (req , res)=>{
    let id = uuidv4();
    let { username, password, email, image } = req.body;
    
    let query = `INSERT INTO post ( id, username, password, email, image ) VALUES ( "${id}" , "${username}", "${password}", "${email}", "${image}" )`;

    try{
        connection.query( query, (err , result)=>{
            if(err) throw err;
            res.redirect("/posts");
        });
    } catch(err){
        res.send("Post will not showing...")
    }
});



// Route: Show delete confirmation page
app.get("/posts/:id/delete" , (req , res)=>{

    let { id } = req.params;
    let query = `SELECT * FROM post WHERE id = "${id}"`;

    try{
        connection.query(query, (err , result)=>{
            if(err) throw err;
            let post = result[0];
            res.render("deletePost.ejs" , { post } );
        })
    } catch(err){
        res.send("Post will not showing...")
    }

});

// Route: Handle actual delete logic (DELETE)
app.delete("/posts/:id" , (req , res)=>{

    let { id } = req.params;
    let { password } = req.body;

    let query = `SELECT * FROM post WHERE id = "${id}" `;
    
    try{
        connection.query(query, (err , result)=>{
            if(err) throw err;
            let post = result[0];  // Here, post = object
            
            if( password != post.password ){
                res.send("You entered WRONG password !");
            } else {

                let query2 = `DELETE FROM post WHERE id = "${id}"`;
                    
                connection.query(query2, (err , result)=>{
                        if(err) throw err;
                        // console.log(result);
                        res.redirect("/posts");
                });
               
            }
        });
    } catch(err){
        res.send("Post will not showing...")
    }
});


app.listen(port , ()=>{
    console.log(`Listening on port: ${port}`);
})





// --------------------------------------------------
// Sample Data Insert Block (commented out)
// --------------------------------------------------

/*
let query = `INSERT INTO post (id, username, email, password, image) VALUES ?`;

let data =  [ ["101", "Jack@101", "jack@gmail.com", "jack101", "thor.jpg"],
              ["102", "Jenny@102", "jenny@gmail.com", "jenny102", "blackwidow.jpg"],
              ["103", "Jems@103", "jemas@gmail.com", "jems103", "captainamerica.jpg"]
            ]
try{
    connection.query( query, [data], (err , result)=>{
        if(err) throw err;
        console.log(result);
    });
} catch(err){
    console.log(err);
}

connection.end();

*/


// --------------------------------------------------
// Random User Generator using faker (commented out)
// --------------------------------------------------

/*
let getRandomUser = ()=>{
    return {
        userId: faker.string.uuid(),
        username: faker.internet.username(), // before version 9.1.0, use userName()
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        password: faker.internet.password(),
  };
}

console.log( getRandomUser() );
*/