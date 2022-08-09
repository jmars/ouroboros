import { main } from './bootstrap';
import * as fs from 'fs';

main(fs.readFileSync, (...v) => console.log(...v), true);