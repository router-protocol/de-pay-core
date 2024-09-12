// DePay.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DePay from './DePay.js'; // Adjust the path according to your project structure
import {
  sendErc20Transfer,
  waitForTransaction,
} from '../utils/sendTransaction.js';

// Mock fetch globally
// global.fetch = vi.fn();

describe('DePay Integration Tests', () => {
  let dePay: DePay;

  beforeEach(() => {
    dePay = new DePay({
      partnerId: 123,
      transactionUrl: 'http://localhost:9019',
    }); // Initialize with a sample partnerId
    vi.clearAllMocks(); // Clear all mocks before each test
  });

  it('should fetch a quote successfully', async () => {
    const quoteQueryParams = {
      fromTokenAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      amount: '1000000',
      fromTokenChainId: '137',
      toTokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      toTokenChainId: '42161',
      toAddress: '0x40d5250D1ce81fdD1F0E0FB4F471E57AA0c1FaD3',
    };

    // Mock the fetch response
    // (global.fetch as any).mockResolvedValueOnce({
    //     ok: true,
    //     // json: async () => ,
    // });

    // Act
    const quote = await dePay.getQuote(quoteQueryParams);

    // Assert
    expect(quote).toBeDefined();
    expect(quote.fromTokenAddress.toLowerCase()).toBe(
      quoteQueryParams.fromTokenAddress.toLowerCase(),
    );
    expect(quote.toTokenAddress.toLowerCase()).toBe(
      quoteQueryParams.toTokenAddress.toLowerCase(),
    );
    expect(quote.source.asset.address.toLowerCase()).toBe(
      quoteQueryParams.fromTokenAddress.toLowerCase(),
    );
    expect(quote.source.tokenAmount).toBe(quoteQueryParams.amount);
    expect(quote.destination.asset.address.toLowerCase()).toBe(
      quoteQueryParams.toTokenAddress.toLowerCase(),
    );
    expect(quote.source.chainId).toBe(quoteQueryParams.fromTokenChainId);
    expect(quote.destination.chainId).toBe(quoteQueryParams.toTokenChainId);
    expect(quote.destination.tokenAmount).toBeDefined();

    // Act2
    const transaction = await dePay.createTransaction(
      quote,
      quoteQueryParams.toAddress,
    );
    expect(transaction).toBeDefined();
    expect(transaction.receiverAddress.toLowerCase()).toBe(
      quoteQueryParams.toAddress.toLowerCase(),
    );
    expect(transaction.senderAddress.toLowerCase()).toBe(
      quoteQueryParams.toAddress.toLowerCase(),
    );
    const { depositAddress } = transaction.depositMeta ?? {};
    expect(depositAddress).toBeDefined();
    // expect(transaction.transactionId).toBeDefined();
    // expect(transaction.status).toBe('pending');
    // if (depositAddress) {
    //   // Act3
    //   const hash = await sendErc20Transfer(
    //     quote.source.asset.address,
    //     depositAddress,
    //     BigInt(quote.source.tokenAmount),
    //   );
    //   expect(hash).toBeDefined();
    //   expect(hash).toBeTypeOf('string');
    //   if (hash) {
    //     const receipt = await waitForTransaction(hash);
    //     expect(receipt).toBeDefined();
    //     expect(receipt.status).toBe('success');

    //     // Act4
    //     const transaction = await dePay.waitForTransaction({ depositAddress });
    //     console.log(transaction);
    //     expect(transaction).toBeDefined();
    //   }
    // }

    // expect(global.fetch).toHaveBeenCalledWith(
    //     `${dePay.quoteUrl}?fromTokenAddress=${quoteQueryParams.fromTokenAddress}&amount=${quoteQueryParams.amount}&fromTokenChainId=${quoteQueryParams.fromTokenChainId}&partnerId=${dePay.partnerId}&toTokenAddress=${quoteQueryParams.toTokenAddress}&toTokenChainId=${quoteQueryParams.toTokenChainId}&slippageTolerance=1`
    // );
  }, 100000);

  // it('should create a transaction successfully', async () => {
  //     // Arrange
  //     const mockQuote = {
  //         fromTokenAddress: '0xTokenAddress1',
  //         amount: '100',
  //         fromTokenChainId: 1,
  //         toTokenAddress: '0xTokenAddress2',
  //         toTokenChainId: 2,
  //         receiverAddress: '0xReceiverAddress',
  //     };

  //     const mockTransactionData = {
  //         transactionId: '0xTransactionId',
  //         status: 'pending',
  //     };

  //     // Mock the fetch response
  //     (global.fetch as any).mockResolvedValueOnce({
  //         ok: true,
  //         json: async () => mockTransactionData,
  //     });

  //     // Act
  //     const transaction = await dePay.createTransaction(mockQuote);

  //     // Assert
  //     expect(transaction).toEqual(mockTransactionData);
  //     expect(global.fetch).toHaveBeenCalledWith(
  //         'https://btc-testnet.poap-nft.routernitro.com/internal/transaction',
  //         {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({
  //                 ...mockQuote,
  //                 senderAddress: '0xReceiverAddress',
  //                 receiverAddress: '0xReceiverAddress',
  //             }),
  //         }
  //     );
  // });

  // it('should throw an error when quote fetching fails', async () => {
  //     // Arrange
  //     (global.fetch as any).mockResolvedValueOnce({
  //         ok: false,
  //     });

  //     // Act & Assert
  //     await expect(
  //         dePay.getQuote({
  //             fromTokenAddress: '0xTokenAddress1',
  //             amount: '100',
  //             fromTokenChainId: 1,
  //             toTokenAddress: '0xTokenAddress2',
  //             toAddress: '0xReceiverAddress',
  //             toTokenChainId: 2,
  //         })
  //     ).rejects.toThrow('Failed to fetch quote');
  // });

  // it('should throw an error when transaction creation fails', async () => {
  //     // Arrange
  //     const mockQuote = {
  //         fromTokenAddress: '0xTokenAddress1',
  //         amount: '100',
  //         fromTokenChainId: 1,
  //         toTokenAddress: '0xTokenAddress2',
  //         toTokenChainId: 2,
  //         receiverAddress: '0xReceiverAddress',
  //     };

  //     (global.fetch as any).mockResolvedValueOnce({
  //         ok: false,
  //     });

  //     // Act & Assert
  //     await expect(dePay.createTransaction(mockQuote)).rejects.toThrow('Failed to fetch quote');
  // });
});
