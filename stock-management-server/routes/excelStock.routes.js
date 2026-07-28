import { Router } from 'express';
import dotenv from 'dotenv';
import { addRecord, updateCell, readData } from '../controllers/excelController.js';
import { Auth, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/addStock', Auth, authorize('manager', 'owner', 'super_admin'), async (req,res)=>{
    try{
        const body = req.body
        const payload = Object.values(body);
        const result = await addRecord(payload)
        res.status(200).json(result)
    }catch(err){
        res.status(500).send(err)
    }
})
router.get('/stock', Auth, authorize('manager', 'owner', 'super_admin'), async (req,res)=>{
    try{
        const result = await readData()
        res.status(200).json(result)
    }catch(err){
        res.status(500).send(err)
    }
})

export default router;