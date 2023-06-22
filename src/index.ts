// Core SDK imports latest version OK
import { Config, ImmutableX, WalletConnection, createStarkSigner, generateLegacyStarkPrivateKey } from '@imtbl/core-sdk'

// Wallet provider
import { Wallet } from '@ethersproject/wallet';

//Input type for wallet creation
import { BytesLike } from 'ethers';

//Get env vars
import * as dotenv from 'dotenv'

// Http client for API interactions
import { InfuraProvider } from '@ethersproject/providers';


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

//Set constants from env vars
const ETH_PRIVATE_KEY: string = requireEnvironmentVariable('ETH_PRIVATE_KEY') as string;
const ETH_ADDRESS: string = requireEnvironmentVariable('ETH_ADDRESS') as string;
const ETH_NETWORK: string = requireEnvironmentVariable('ETH_NETWORK') as string;
const INFURA_API_KEY: string = requireEnvironmentVariable('INFURA_API_KEY') as string;

const provider = new InfuraProvider(
  'goerli',
  INFURA_API_KEY,
);

(async () => {
  // Create ETH signer with ETH provate key as BytesLike
  const ETH_SIGNER = new Wallet(ETH_PRIVATE_KEY as BytesLike).connect(provider);

  //Generate Stark Private Key in legacy mode. Supported in latest 1.0.0 release
  const STARK_PRIVATE_KEY = await generateLegacyStarkPrivateKey(ETH_SIGNER)

  //Create a Stark Signer
  const STARK_SIGNER = createStarkSigner(STARK_PRIVATE_KEY)

  //Get public key from stark signer
  const STARK_PUBLIC_KEY = STARK_SIGNER.getAddress()

  console.log('STARK_PUBLIC_KEY :>> ', STARK_PUBLIC_KEY);

  const walletConnection: WalletConnection = {
    ethSigner: ETH_SIGNER,
    starkSigner: STARK_SIGNER,
  };

  const imxClient = new ImmutableX(Config.SANDBOX);

  const batchTransferResponse = await imxClient.batchNftTransfer(
      walletConnection,
      [
        {
        receiver: '0xED1a1BaC4f0E02dD04Ddd33ff1338d14e3F67e25',
        tokenId: '2',
        tokenAddress: '0xEd539C94d14Af10654b6A32cD12b5548b0d158B3',
      },
    ],
  );

  // Throw Error
  // [Error]: unable to verify stark signature 0x03a04cafc5f16ee15039358514467192fa0d68e2bc57043f1dfa120b723b570f0218d2a95ab328f66feb3652f5d7d1e162790ff175e5bbc04043bc035dc1ca6b

  console.log('batchTransferResponse :>> ', batchTransferResponse);;

});

