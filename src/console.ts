import 'dotenv/config';

import fs from 'fs';
import repl from 'repl';

import * as SpreedlyService from './spreedly';
import { RsaService } from './rsa';

const pjson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const replServer = repl.start({ prompt: `${pjson.name}> ` });

replServer.context.SpreedlyService = SpreedlyService;
replServer.context.rsa = new RsaService(
  process.env.RSA_PRIVATE_KEY as string,
  process.env.RSA_PUBLIC_KEY as string
);
