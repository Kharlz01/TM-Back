import path from 'path';
import nodemon from "nodemon";

nodemon({
    script: path.resolve('src', 'server.js'),
    watch: ['src'],
    ext: 'js ts',
    exec: 'node',
});