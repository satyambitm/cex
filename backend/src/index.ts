import express from "express";
import { prisma } from './db'
import type{Request,Response} from 'express'
import authRoutes from './routes/auth'
import {authenticateToken} from './middleware/auth'
import balanceRoutes from './routes/balance'
import orderRoutes from './routes/order'

const app = express();
app.use(express.json());



app.use('/api/balance',balanceRoutes);

app.use('/api/orders',orderRoutes)

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });

} catch(error){
    res.status(500).json({status:'error',database:'disconnect'})
}
})
// auth routes

app.use('/api/auth',authRoutes)
app.get('/api/me',authenticateToken,(req,res)=>{
    res.json({userId:req.user?.userId});
})




const BALANCES = {



}

const ORDERBOOKS = {
    SOL: {},
    BTC: {}
}

/*
    body = {
        type:           "market" | "limit",
        price:          number | null,
        qty:            number,
        market_id:      string,
        side:           "buy" | "sell"
    }

    @returns {
        orderId: string,
        filledQty: number,
        averagePrice
    }
*/

// 50.01

// // 500001
// app.post("/order", (req, res) => {

// })
// /*
//     returns the status of an order (partially filled, success, cancellled)
//     ALSO RETURNS THE INDIVIDUAL FILLS OF THIS ORDER 
// */
// app.get("/order/:orderId")
// app.delete("/order/:orderId")
// app.get("/depth/:symbol");
// app.get("/orders");
// app.get("/fills");

// app.get("/balance/usd");

/*  
    Returns the balance of all stocks
*/
// app.get("/balance")

app.post("/order", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
})

app.get("/order/:orderId", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
})

app.delete("/order/:orderId", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
})

app.get("/depth/:symbol", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
})

app.get("/orders", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
})

app.get("/fills", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
})

app.get("/balance/usd", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
})

app.get("/balance", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
})







const PORT=3000;


app.listen(PORT,()=>{
    console.log(`server running on localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Signup: POST http://localhost:${PORT}/api/auth/signup`);
    console.log(`Signin: POST http://localhost:${PORT}/api/auth/signin`);
})