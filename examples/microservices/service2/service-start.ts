// On service start
import { repository } from '../repository'

// Connect to RabbitMQ
async function init() {
  try {
    await repository.connect('amqp://guest:guest@localhost:5672')
  } catch (error) {
    console.error(error)
  }
}

init()
