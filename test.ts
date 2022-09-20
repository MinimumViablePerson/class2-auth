import jwt from 'jsonwebtoken'

// A secure way to SIGN a message
// Still easy to decode, so don't put anything sensible
// But, we can trust that the message is valid

const token = jwt.sign({ id: 1, creditCard: '12341234512341235' }, 'SHHH', {
  expiresIn: '2 days'
})

setTimeout(() => {
  const result = jwt.verify(token, 'SHHH')

  console.log(result)

  // @ts-ignore
  console.log(`Your are user: ${result.id}`)
}, 3000)
