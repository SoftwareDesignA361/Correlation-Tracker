const pdf = require("pdf-creator-node")
const fs = require("fs")

const question = fs.readFileSync("./question/question.html", "uft-8")
const options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm"
}

const document = {
    html: question,
    data: {
            message:"dynamic message"
    },
    path:"./pdfs/mynewpdf.pdf",
};


pdf
    .create(document,options)
    .then((res)=>{console.log(res);
})
    .catch((err)=>{
        console.log(err);
    });