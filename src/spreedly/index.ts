/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import config from '../config';

const Spreedly = axios.create({
  timeout: 80000,
  baseURL: 'https://core.spreedly.com',
  auth: {
    username: config.spreedlyEnviromentKey,
    password: config.spreedlyApiKey
  }
});

export async function listGateways(): Promise<any> {
  const { data: gateways } = await Spreedly.get('/v1/gateways.json');
  return gateways;
}

export async function listPaymentMethods(): Promise<any> {
  const { data: paymentMethods } = await Spreedly.get('/v1/payment_methods.json');
  return paymentMethods;
}

export async function verifyPaymentMethodByToken(gateway: string, token: string): Promise<any> {
  const { data: paymentMethod } = await Spreedly.post(`/v1/gateways/${gateway}/verify.json`, {
    transaction: {
      payment_method_token: token,
      retain_on_success: true
    }
  });
  return paymentMethod;
}

export async function getPaymentMethodByToken(token: string): Promise<any> {
  const { data: paymentMethod } = await Spreedly.get(`/v1/payment_methods/${token}.json`);
  return paymentMethod;
}

export async function listReceivers(): Promise<any> {
  const { data: receivers } = await Spreedly.get('/v1/receivers.json');
  return receivers;
}

export async function listSupportedReceivers(): Promise<any> {
  const { data: receivers } = await Spreedly.get('/v1/receivers_options.json');
  return receivers;
}

export async function getReceiverByToken(token: string = 'XCf3a958rxcpTyCzvqkUwLzuJmz'): Promise<any> {
  const { data: receiver } = await Spreedly.get(`/v1/receivers/${token}.json`);
  return receiver;
}

export async function createReceiver(hostnames: string, receiver_type: string): Promise<any> {
  const { data: receiver } = await Spreedly.post('/v1/receivers.json', {
    receiver: {
      receiver_type,
      hostnames
    }
  });
  return receiver;
}

export async function deliverPayment(
  receiver: string,
  token: string,
  url: string,
  body: string
): Promise<any> {
  const { data: payment } = await Spreedly.post(`/v1/receivers/${receiver}/deliver.json`, {
    delivery: {
      payment_method_token: token,
      headers: 'Content-Type: text/plain',
      url,
      body
    }
  });
  return payment;
}
