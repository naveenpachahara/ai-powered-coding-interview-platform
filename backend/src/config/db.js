const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.DB_CONNECT_STRING);

    // Purana galat index hatao (signup fail hone ki wajah)
    try {
        await mongoose.connection.collection('users').dropIndex('problemSolved_1');
        console.log("Old index problemSolved_1 dropped");
    } catch (err) {
        // Index pehle se nahi hai toh koi dikkat nahi
        console.log("Index problemSolved_1 not found, skipping");
    }
}

module.exports = main;
