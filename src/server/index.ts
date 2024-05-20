import express from 'express';
import { Server, Socket } from 'socket.io';
import http from "http";
import path from "path";
import { Vector2 } from '../client/Utils/Vector2';

const port: number = 3000;

interface CityData {
    id: number;
    x: number;
    y: number;
    ownerId?: string;
    ownerSlot?: number;
}

interface Client {
    slot: number;
    id: string;
}

class App {
    private server: http.Server;
    private port: number;

    private io: Server;
    private clients: Client[] = [];
    private currentHighestSlot: number = 0;

    private cityData: CityData[] = [];
    private cityRadius: number = 20;
    private cityPadding: number = 20;
    private cityNumber: number = 10;

    constructor(port: number) {
        this.port = port;

        // Start server
        const app = express();
        app.use(express.static(path.join(__dirname, 'dist/client')));

        this.server = http.createServer(app);
        this.io = new Server(this.server)
        
        // Set up world
        this.generateCities(this.cityNumber);

        // Client communication
        this.io.on("connection", (socket: Socket) => {
            console.log("Client with id " + socket.id.toString() + "has connected.");

            // Initialize client
            this.currentHighestSlot += 1;
            this.clients.push({
                slot: this.currentHighestSlot,
                id: socket.id
            });

            this.io.emit("clientUpdate", this.clients);
            socket.emit("initializeWorld", this.cityData);

            // Give this client a starting city and let everyone know
            // Find a city which isn't taken already
            let clientAssignedCity: CityData;
            do {
                clientAssignedCity = this.randomChoice(this.cityData);
            } while (clientAssignedCity.ownerId != undefined)
            clientAssignedCity.ownerId = socket.id;

            clientAssignedCity.ownerSlot = this.currentHighestSlot;

            this.io.emit("cityUpdate", clientAssignedCity);

            socket.on("disconnect", () => {
                console.log("Client with id " + socket.id.toString() + "has disconnected.");
            });
        });
        
    }

    public Start() {
        this.server.listen(this.port, () => {
           console.log("Server listening on port " + this.port); 
        });
    }

    cityIntersectsOther(cityToCheck: CityData) {
        for (var city of this.cityData) {
          if (cityToCheck != city) {
            let dist = Vector2.Subtract(new Vector2(cityToCheck.x, cityToCheck.y), 
                                        new Vector2(city.x, city.y)).magnitude();
            if (dist < this.cityRadius + this.cityPadding) {
              return true;
            }
          }
        }
    
        return false;
    }

    private generateCities(quantity: number) {
        // Create a number of ServerCity instances
        for (let i = 0; i < quantity; i ++) {
            let city: CityData;
            
            // Generate possible positions until once is found that doesn't overlap with another city
            do {
            let x = Math.random() * 600 + 10;
            let y = Math.random() * 420 + 10;
            city = {id: i, x: x, y: y, ownerId: undefined};
            } while (this.cityIntersectsOther(city))
            
            // Once it's been found, add this city to the list of cities
            this.cityData.push(city)
        }
    }

    private randomChoice<Type>(array: Type[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

new App(port).Start();
