//imports
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();
//Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cd) => {
    cd(null, file.originalname);
  }
});
const upload = multer({ storage: storage }).single("avater");
app.set("view engine", "ejs");
//Public folder to recognize styles
app.use(express.static("public"));

//Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, err => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("this is error", err);

      worker
        .recognize(data, "eng", { tessjs_create_pdf: "1" })
        .progress(progress => {
          console.log(progress);
        })
        .then(result => {
          // outputing the result as text in the bbroswer
          // res.send(result.text);
          res.redirect("/download");
        })
        .finally(() => worker.terminate());
    });
  });
});

app.get("/download", (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.download(file);
});

//Start up server
const port = 5000 || process.env.PORT;
app.listen(port, () => console.log(`Hey am running on port ${port}`));
