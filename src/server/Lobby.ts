import { Client } from "../client/Utils/Communication";
import App from "./App";

export default class Lobby {
    id: string;
    app: App;

    clients: Client[] = [];
    

    constructor(id: string, app: App) {
        this.app = app;
        this.id = id;
    }


    
}