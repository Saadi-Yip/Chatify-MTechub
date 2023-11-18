const cors = require("cors");

// Middleware for parsing JSON
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

let corsOptions = {
  origin: ["http://localhost:3000", "*", "https://chatify-m-techub.vercel.app"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"], // Add any other headers you need
};

app.use(cors(corsOptions));
app.use(express.json());
// Middleware for handling file uploads (images)
