import crypto from 'crypto';
import { RSA_PKCS1_PADDING } from 'constants';

const ENCODING_CYPHER = 'base64';
const ENCODING_TEXT = 'utf8';

export class RsaService {
  constructor(private readonly privateKey: string, private readonly publicKey: string) {}

  encrypt(plaintext: string): string {
    const buffer = new Buffer(plaintext, ENCODING_TEXT);
    const encrypted = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: RSA_PKCS1_PADDING
      },
      buffer
    );
    return encrypted.toString(ENCODING_CYPHER);
  }

  decrypt(cypher: string): string {
    const buffer = Buffer.from(cypher, ENCODING_CYPHER);
    const plaintext = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: RSA_PKCS1_PADDING
      },
      buffer
    );
    return plaintext.toString(ENCODING_TEXT);
  }
}
