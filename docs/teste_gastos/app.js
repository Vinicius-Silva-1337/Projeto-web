const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

const gastosRoutes = require("./routes/gastos");

app.use("/gastos", gastosRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando");
});