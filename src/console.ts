import 'dotenv/config';

import fs from 'fs';
import repl from 'repl';

import * as SpreedlyService from './spreedly';

const pjson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const replServer = repl.start({ prompt: `${pjson.name}> ` });

replServer.context.SpreedlyService = SpreedlyService;
