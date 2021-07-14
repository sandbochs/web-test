import * as bodyParser from 'body-parser'
import morgan from 'morgan'
import { Server } from '@overnightjs/core'
import cors from 'cors'
import * as controllers from './controllers/index'
import Logger from './logger'
import * as middlewares from './middlewares'

export class RouterServer extends Server {
  constructor() {
    super(process.env.NODE_ENV === 'development')
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(
      cors({
        origin: '*',
      })
    )
    this.app.use(morgan('combined'))
    this.setupControllers()

    this.app.use(middlewares.errorMiddleware)
  }

  private setupControllers(): void {
    type Controllers = {}
    const ctlrInstances: any = []

    for (const ctrlName in controllers) {
      if (controllers.hasOwnProperty(ctrlName)) {
        const controller = new (<Controllers>controllers)[ctrlName]()
        ctlrInstances.push(controller)
      } else {
        Logger.error(`${ctrlName} does not exist`)
      }
    }
    return super.addControllers(ctlrInstances)
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      Logger.info(`Server listening on port: ${port}`)
    })
  }

  public getApp() {
    return this.app;
  }
}
