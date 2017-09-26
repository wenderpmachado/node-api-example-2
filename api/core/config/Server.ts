import { useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer as ormUseContainer } from 'typeorm';
import { Container } from 'typedi';
import * as http from 'http';
import * as express from 'express';

export class Server {
    private defaultPort: number = 3000;
    private static instance: http.Server;

    constructor(app: express.Application) {
        Server.instance = http.createServer(app);
        app.set('port', this.obterPorta());
        this.configuraInjecaoDeDependencias();
    }

    /**
     * Starta o servidor express
     * 
     * @memberof Server
     */
    start() {
        Server.instance.on('error', this.onError);
        Server.instance.on('listening', this.onListening);
        Server.instance.listen(this.obterPorta());
    }

    /**
     * Realiza a configuração das Injeções de Dependências necessárias
     * para o sistema de rotas e o ORM funcionar
     * 
     * @memberof Server
     */
    configuraInjecaoDeDependencias() {
        routingUseContainer(Container);
        ormUseContainer(Container);
    }

    /**
     * Obtem uma instância do servidor
     * 
     * @returns {http.Server} 
     * @memberof Server
     */
    obterInstancia(): http.Server {
        return Server.instance;
    }

    /**
     * Obtem a porta que está sendo utilizada ou a que foi definida
     * 
     * @returns {(string|number|boolean)} 
     * @memberof Server
     */
    obterPorta(): string|number|boolean {
        return this.normalizarPorta(process.env.PORT || process.env.SERVER_PORT || this.defaultPort);
    }

    /**
     * Normaliza o valor da porta informada, retornando um valor
     * aceito para o express
     * 
     * @param {(number|string)} val 
     * @returns {(number|string|boolean)} 
     * @memberof Server
     */
    normalizarPorta(val: number|string): number|string|boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) { 
            return port;
        } else {
            return false;
        }
    }

    /**
     * Realiza o tratamento dos erros que ocorrerem durante a execução 
     * do servidor
     * 
     * @param {NodeJS.ErrnoException} error 
     * @memberof Server
     */
    onError(error: NodeJS.ErrnoException): void {
        let port = this.obterPorta();
        if (error.syscall !== 'listen') throw error;

        let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
        switch(error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Realiza tarefas ao startar o servidor
     * 
     * @memberof Server
     */
    onListening(): void {
        let addr = Server.instance.address();
        let bind: string = (typeof addr === 'string') ? `pipe ${addr}` : `porta ${addr.port}`;
        console.log(`O servidor Node.js + Express está funcionando na ${bind}`);
    }
}