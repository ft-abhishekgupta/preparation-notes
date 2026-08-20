## Background Tasks

Separate process that runs outside main process to process task asynchronously

- Improves UX, Automatic retry mechanism
- Example - Email processing, Image processing

## Task Queues

Example - RabbitMQ, Service Bus, Redis PubSub

_Broker_ Temporarily holds tasks in queue and assigns to proper consumers
_Visibility Timeout_ - Time for which message is invisible to other consumers. If ACK not received, message is made visible again

**Task Types**

- One Off Tasks
- Recurring Tasks
- Chained Tasks
- Batch Tasks

### Best Practices

- Small and focussed tasks
- Error handling and logging
- Monitor queue length and worker health
