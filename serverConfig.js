module.exports = {
    server: {
        port: "3000"
    },

    db: {
        client: "mysql2",
        connection: {
            host: "127.0.0.1",
            user: "root",
            password: "",
            database: "mydb",
            timezone: '+00:00'
        }
    },

    cors: {
        credentials: true,
        origin: true
    },

    session: {
        maxAge: 15000,
        secret: "C!dH}4bA7+w=![m.B;MS(bLf!LU<<p)MY;%qQXW7sE]y"
    }
}