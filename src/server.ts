import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
app.options('*', cors())
app.use(express.json())

const prisma = new PrismaClient()

const port = 5678

const SECRET = process.env.SECRET!

function getToken (id: number) {
  return jwt.sign({ id: id }, SECRET, {
    expiresIn: '2 days'
  })
}

async function getCurrentUser (token: string) {
  // check if the token is valid
  // if it is, return the user this token belongs to

  const decodedData = jwt.verify(token, SECRET)
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: decodedData.id },
    include: { items: true }
  })
  return user
}

app.get('/users', async (req, res) => {})

app.post('/sign-up', async (req, res) => {
  try {
    const match = await prisma.user.findUnique({
      where: { email: req.body.email }
    })

    if (match) {
      res.status(400).send({ error: 'This account already exists.' })
    } else {
      const user = await prisma.user.create({
        data: {
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password)
        },
        include: { items: true }
      })

      res.send({ user: user, token: getToken(user.id) })
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message })
  }
})

app.post('/sign-in', async (req, res) => {
  // 1. check if a user with this email actually exists
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
    include: { items: true }
  })
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    // 2. check if the password matches
    res.send({ user: user, token: getToken(user.id) })
  } else {
    res.status(400).send({ error: 'Invalid email/password combination.' })
  }
})

app.get('/validate', async (req, res) => {
  try {
    if (req.headers.authorization) {
      const user = await getCurrentUser(req.headers.authorization)
      // @ts-ignore
      res.send({ user, token: getToken(user.id) })
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message })
  }
})

app.get('/items', async (req, res) => {
  try {
    // @ts-ignore
    const user = await getCurrentUser(req.headers.authorization)
    // @ts-ignore
    res.send(user.items)
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`App running: http:/localhost:${port}`)
})
