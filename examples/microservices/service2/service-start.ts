// On service start
import { repository } from '../repository'

// Connect to RabbitMQ
repository.connect('amqp://guest:guest@localhost:5672')
