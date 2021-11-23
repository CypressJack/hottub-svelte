const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

let data = {
    curTemp: 70,
    timeOnSeconds: 1200
}
app.use(cors());

app.get('/getCurTemp', (req, res) => {
    res.json(data.curTemp)
})

app.get('/setCurTemp', (req, res) => {
    data.curTemp = 80;
    res.json('Temp successfully set');
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


