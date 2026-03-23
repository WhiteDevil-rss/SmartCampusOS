const { io } = require("socket.io-client");

const socket = io("http://localhost:5001/timetables", {
    transports: ["websocket", "polling"],
    auth: { token: "fake-token" } // It doesn't have auth middleware yet so it should connect
});

socket.on("connect", () => {
    console.log("SUCCESS: Connected to /timetables");
    process.exit(0);
});

socket.on("connect_error", (err) => {
    console.error("FAILURE: Connection error:", err.message);
    process.exit(1);
});

setTimeout(() => {
    console.error("FAILURE: Connection timeout");
    process.exit(1);
}, 5000);
