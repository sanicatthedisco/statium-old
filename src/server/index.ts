import App from "./App";

const port: number = +(process.env.PORT || 5001);

let prod = false;
if (process.argv[2] == "--prod") {
    prod = true;
    console.log("Running server in production mode");
}

new App(port).initializer.Start();
