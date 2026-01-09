import { Router } from 'express';
import dotenv from 'dotenv';
import { addRecord, updateCell, readData } from '../controllers/excelController.js';

const router = Router();

router.post('/addStock', async (req,res)=>{
    try{
        const body = req.body
        const payload = Object.values(body);
        const result = await addRecord(payload)
        res.status(200).json(result)
    }catch(err){
        res.status(500).send(err)
    }
})
router.get('/stock', async (req,res)=>{
    try{
        const result = await readData()
        res.status(200).json(result)
    }catch(err){
        res.status(500).send(err)
    }
})

export default router;