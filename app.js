const express= require("express");
const app= express();
const fs = require("fs");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cookieParser= require("cookie-parser");
const User=require("./models/Users");
const Image= require("./models/image");
const dotenv = require("dotenv");
const path = require("path");
const crypto = require("crypto");


app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON payloads
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.set("view engine", "ejs"); // Set EJS as the template engine
app.set("views", path.join(__dirname, "views")); // Define views folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));






//multer
const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads")
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12,function(err,bytes){
      const fn=bytes.toString("hex")+path.extname(file.originalname);
      cb(null, fn);
    })
   
  }
})
const upload = multer({ storage: storage });



//io connections
const{createServer} = require("http");
const {Server} = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
    socket.on('user-message',(message)=>{
      io.emit('message',message);
    });
  });


// Load environment variables
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");


// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

    app.use("/", authRoutes);
    app.use("/", searchRoutes);


    app.get("/", (req, res) => {
        res.redirect("/login"); // Redirect to login page
    });

    app.get('/uploadimages', async(req, res) => {
      try{
        const username = req.params.username; // Assume the username is passed as a route parameter
        console.log(username);

        // Query the Image model for all images associated with the username
        const images = await Image.find({ username });

        if (!images) {
            return res.status(404).send('No images found for this username');
        }

        // Respond with the images
        res.render("uploadimages",{images});
        
      }
      catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
  });

  app.post("/uploadprofile", upload.single("profileimage"), async (req, res) => {
    try {
      const { username } = req.body; // Assume username is sent in the request body
      const file = req.file;
  
      if (!file) {
        return res.status(400).send("No file uploaded");
      }
  
      const imageBuffer = fs.readFileSync(file.path); // Read the file from the local storage
      const contentType = file.mimetype;
  
      // Find the user
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      // Create and save the image
      const image = new Image({
        img: {
          data: imageBuffer,
          contentType: contentType,
        },
        username: username,
      });
  
      await image.save();
  
      // Optionally, add the image to the user's images array
      if (!user.images) user.images = [];
      user.images.push(image._id);
      await user.save();
  
      // Retrieve all images for the user
      const userImages = await Image.find({ username });
  
      // Render the uploadimages page with user images
      res.render("uploadimages", { images: userImages });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  });
    
    // Handle 404 errors
    app.use((req, res) => {
        res.status(404).send("Page not found");
    });
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));