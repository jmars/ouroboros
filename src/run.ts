import { main } from './bootstrap.js';
import * as fs from 'fs';

main(fs.readFileSync, (...v) => console.log(...v), true);