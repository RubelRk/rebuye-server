const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-leabwa6-shard-00-00.nzbu8kl.mongodb.net:27017,ac-leabwa6-shard-00-01.nzbu8kl.mongodb.net:27017,ac-leabwa6-shard-00-02.nzbu8kl.mongodb.net:27017/?ssl=true&replicaSet=atlas-8a48sm-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//jwt token function.

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access1" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Assess" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const userCollection = client.db("Phone").collection("Product");
    const bookingsCollection = client.db("Phone").collection("bookings");
    const CreateUserCollection = client.db("Phone").collection("users");

    //jwt token create
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await CreateUserCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1d",
        });
        return res.send({ token: token });
      }

      res.status(403).send({ token: " " });
    });

    //get all Product
    app.get("/AllProduct", async (req, res) => {
      const query = {};
      const cursors = userCollection.find(query);
      const user = await cursors.toArray();
      res.send(user);
    });
    //get MyProduct data by email
    app.get("/myProduct", verifyJwt, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "Forbidden Assess" });
      }
      const query = { email: email };
      const booking = await userCollection.find(query).toArray();
      res.send(booking);
    });

    //get product by Categories
    app.get("/ProductCategoriesDetails/:Product_Id", async (req, res) => {
      const id = parseInt(req.params.Product_Id);
      const query = { Product_Id: id };
      const Product = await userCollection
        .find(query)
        .toArray(function (err, result) {
          if (err) throw err;
          res.send(result);
        });
    });

    //booking data save to mongoDB
    app.post("/ProductBooking", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    //booking data get to mongoDB
    app.get("/ProductBooking", verifyJwt, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: "Forbidden Assess" });
      }
      const query = { email: email };
      const booking = await bookingsCollection.find(query).toArray();
      res.send(booking);
    });

    //get Product by Id then Booking...(not use)
    app.get("/ProductBooking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await userCollection.findOne(query);
      res.send(product);
    });

    //create user and save to mongoDB
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await CreateUserCollection.insertOne(user);
      res.send(result);
    });
    //get data by user role
    app.get("/users/:role", async (req, res) => {
      const role = req.params.role;
      const query = { role };
      const Product = await CreateUserCollection.find(query).toArray();
      res.send(Product);
    });

    //Review api Update.
    app.patch("/reviewData/:id", verifyJwt, async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const email = req.body.email;
      const serviceName = req.body.serviceName;
      const query = { _id: ObjectId(id) };
      const updatedUser = {
        $set: {
          status: status,
          email: email,
          serviceName: serviceName,
        },
      };
      const result = await reviewCollection.updateOne(query, updatedUser);
      res.send(result);
    });

    //Review api delete.
    app.delete("/reviewData/:id", verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Ghost Is Coming Soon....");
});
app.get("/Ghost-Bikers/add", (req, res) => {
  res.send("I am Ghost-Bikers add data");
});

app.listen(port, () => {
  console.log(`I Am Ghost ${port}`);
});
