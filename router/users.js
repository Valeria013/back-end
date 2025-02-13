import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

const userRouter = Router()
const prisma = new PrismaClient()

userRouter.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({});
  res.json(users)
})

export default userRouter