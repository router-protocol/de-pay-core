import {
  createWalletClient,
  http,
  parseAbi,
  encodeFunctionData,
  parseEther,
  toHex,
  createPublicClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// 1. Set up the wallet client
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const client = createWalletClient({
  account,
  chain: polygon,
  transport: http(),
});

// 2. Define the ERC20 contract ABI (only the transfer function)
const erc20Abi = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
]);

// 5. Send the transaction
async function sendErc20Transfer(
  tokenAddress: string,
  recipientAddress: string,
  amount: bigint,
) {
  try {
    // 4. Encode the function call
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipientAddress as `0x${string}`, amount],
    });
    const hash = await client.sendTransaction({
      to: tokenAddress as `0x${string}`,
      data,
    });
    console.log('Transaction hash:', hash);
    return hash;
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
}

// New function to wait for transaction
async function waitForTransaction(hash: `0x${string}`) {
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(),
  });

  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Transaction confirmed:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
}

export { sendErc20Transfer, waitForTransaction };
