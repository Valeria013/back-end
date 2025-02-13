import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import { Router } from 'express';
import jwt from 'jsonwebtoken';
const saltRounds = 10;


const authRouter = Router()
const prisma = new PrismaClient()

authRouter.post('/login', async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if (!user) {
    console.log('email não cadastrado: ', email)
    res.status(400).send('Usuário ou email invalidos')
  }


  const passwordIsValid = bcrypt.compareSync(password, user.password)

  if (passwordIsValid) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })
    delete user.password
    res.send({
      user,
      token
    })
  } else {
    res.status(400).send('Usuário ou email invalidos')
  }

})


authRouter.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  try {
    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

export default authRouter;