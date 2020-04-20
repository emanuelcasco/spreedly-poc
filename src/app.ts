import 'dotenv/config';

import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';

import * as SpreedlyService from './spreedly';
import { RsaService } from './rsa';
import config from './config';

const app = express();
const rsaService = new RsaService(config.rsaPrivateKey, config.rsaPublicKey);

app.use(bodyParser.text());
app.use(bodyParser.json({ limit: config.bodySizeLimit }));
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: config.parameterLimit }));
app.use(express.static(path.join(__dirname, './public')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

app.get('/', (req: express.Request, res: express.Response) =>
  res.render('register_card.pug', { spreedlyEnvKey: config.spreedlyEnviromentKey })
);

app.post('/payments', (req: express.Request, res: express.Response) => res.end());

app.get('/payment_methods', async (req: express.Request, res: express.Response) => {
  const { payment_methods } = await SpreedlyService.listPaymentMethods();
  return res.render('payment_methods.pug', { payment_methods });
});

app.post('/payment_methods', async (req: express.Request, res: express.Response) => {
  const { token } = req.body;
  // Get Gateway token (we are using first for testing)
  const { gateways } = await SpreedlyService.listGateways();
  const testGateway = gateways[0];
  // Verify payment method
  await SpreedlyService.verifyPaymentMethodByToken(testGateway.token, token);
  const { payment_methods } = await SpreedlyService.listPaymentMethods();
  return res.render('payment_methods.pug', { payment_methods });
});

app.get('/create_payment', async (req: express.Request, res: express.Response) => {
  const { payment_methods } = await SpreedlyService.listPaymentMethods();
  return res.render('create_payment.pug', { payment_methods });
});

const generatePayload = <T extends {}>(payload: T): string =>
  `{{#base64}}{{#rsa}}${config.rsaPublicKey},pkcs1,${JSON.stringify(payload)}{{/rsa}}{{/base64}}`;

app.post('/create_payment', async (req: express.Request, res: express.Response) => {
  const { token, amount, cvv } = req.body;

  try {
    const payload = { amount, card_number: '{{credit_card_number}}', cvv };
    const { receivers } = await SpreedlyService.listReceivers();
    const receiver = receivers[receivers.length - 1];
    const { payment_method } = await SpreedlyService.getPaymentMethodByToken(token);
    console.log('payload', generatePayload(payload));
    const { transaction } = await SpreedlyService.deliverPayment(
      receiver.token,
      payment_method.token,
      `${receiver.hostnames}/im_a_receiver/payment`,
      generatePayload(payload)
    );
    console.log('transaction', transaction);
    return res.render('payment.pug', { transaction });
  } catch (error) {
    return res.send({ error });
  }
});

function sleep(ms: number): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}

app.post('/im_a_receiver/payment', async (req: express.Request, res: express.Response) => {
  console.log('rawPayload', req.body);
  try {
    const payload = JSON.parse(rsaService.decrypt(req.body));
    console.log('payload', payload);
    switch (String(payload.cvv)) {
      case '200':
        return res.status(200).send({ payload });
      case '400':
        return res.status(400).send({ payload, error: 'Bad Request' });
      case '408':
        console.log('Wait...');
        await sleep(65000);
        console.log('Timeout');
        return res.status(408).send({ payload, error: 'Timeout' });
      case '500':
        return res.status(500).send({ payload, error: 'Internal server error' });
      default:
        console.log('no response');
        return true;
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send('failed');
  }
});

export default app;
