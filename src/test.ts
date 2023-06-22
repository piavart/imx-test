import { Config, ImmutableX, WalletConnection, createStarkSigner, generateLegacyStarkPrivateKey } from '@imtbl/core-sdk';
import { BytesLike } from 'ethers';
import { Wallet } from '@ethersproject/wallet';
import { InfuraProvider } from '@ethersproject/providers';
import * as dotenv from 'dotenv'
import {Web3} from 'web3'
export const COLLECTION_ADDRESS = '0xEd539C94d14Af10654b6A32cD12b5548b0d158B3';


// Env variable functions
dotenv.config()

function getEnv(name: string, defaultValue = undefined) {
  const value = process.env[name];

  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable '${name}' not set`);
}

function requireEnvironmentVariable(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Please ensure a value exists for ${key}`);
  }
  return value;
}

const ETH_NETWORK: string = requireEnvironmentVariable('ETH_NETWORK') as string;
const INFURA_API_KEY: string = requireEnvironmentVariable('INFURA_API_KEY') as string;

const provider = new InfuraProvider(
  ETH_NETWORK,
  INFURA_API_KEY,
);

const createWalletConnection = async (privateKey: string) => {
  const ethSigner = new Wallet(privateKey as BytesLike).connect(provider);
  const starkPrivateKey = await generateLegacyStarkPrivateKey(ethSigner)
  const starkSigner = createStarkSigner(starkPrivateKey)

   //Get public key from stark signer
   const starkPublicKey = starkSigner.getAddress()

   console.log('starkPublicKey :>> ', starkPublicKey);

  const walletConnection: WalletConnection = {
    ethSigner,
    starkSigner,
  };

  return walletConnection;
}


(async () => {
  // create web3 account
  const web3 = new Web3();
  const {privateKey, address} = web3.eth.accounts.create();

  console.log('publicKey :>> ', address);
  console.log('privateKey :>> ', privateKey);

  const imxClient = new ImmutableX(Config.SANDBOX);

  const walletConnection = await createWalletConnection(privateKey);

  // register user
  const res = await imxClient.registerOffchain(walletConnection);

  console.log('res :>> ', res);

  const batchTransferResponse = await imxClient.batchNftTransfer(
    walletConnection,
    [
      {
        receiver: '0xED1a1BaC4f0E02dD04Ddd33ff1338d14e3F67e25',
        tokenId: '4',
        tokenAddress: COLLECTION_ADDRESS,
      },
    ],
  );

  console.log('batchTransferResponse :>> ', batchTransferResponse);
})()

