// DePay.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DePay from './DePay'; // Adjust the path according to your project structure

// Mock fetch globally
global.fetch = vi.fn();

describe('DePay Integration Tests', () => {
  let dePay: DePay;

  beforeEach(() => {
    dePay = new DePay({ partnerId: 123 }); // Initialize with a sample partnerId
    vi.clearAllMocks(); // Clear all mocks before each test
  });

  it('should fetch a quote successfully', async () => {
    // Arrange
    const mockQuoteData = {
      fromTokenAddress: '0xTokenAddress1',
      amount: '100',
      fromTokenChainId: 1,
      toTokenAddress: '0xTokenAddress2',
      toTokenChainId: 2,
      receiverAddress: '0xReceiverAddress',
    };

    // Mock the fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuoteData,
    });

    // Act
    const quote = await dePay.getQuote({
      fromTokenAddress: '0xTokenAddress1',
      amount: '100',
      fromTokenChainId: 1,
      toTokenAddress: '0xTokenAddress2',
      toAddress: '0xReceiverAddress',
      toTokenChainId: 2,
    });

    // Assert
    expect(quote).toEqual(mockQuoteData);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api-beta.pathfinder.routerprotocol.com/api/v2/quote?fromTokenAddress=0xTokenAddress1&amount=100&fromTokenChainId=1&partnerId=123&toTokenAddress=0xTokenAddress2&toTokenChainId=2&slippageTolerance=1',
    );
  });

  it('should create a transaction successfully', async () => {
    // Arrange
    const mockQuote = {
      fromTokenAddress: '0xTokenAddress1',
      amount: '100',
      fromTokenChainId: 1,
      toTokenAddress: '0xTokenAddress2',
      toTokenChainId: 2,
      receiverAddress: '0xReceiverAddress',
    };

    const mockTransactionData = {
      transactionId: '0xTransactionId',
      status: 'pending',
    };

    // Mock the fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactionData,
    });

    // Act
    const transaction = await dePay.createTransaction(
      mockQuote,
      '0xReceiverAddress',
    );

    // Assert
    expect(transaction).toEqual(mockTransactionData);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://btc-testnet.poap-nft.routernitro.com/internal/transaction',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...mockQuote,
          senderAddress: '0xReceiverAddress',
          receiverAddress: '0xReceiverAddress',
        }),
      },
    );
  });

  it('should throw an error when quote fetching fails', async () => {
    // Arrange
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    // Act & Assert
    await expect(
      dePay.getQuote({
        fromTokenAddress: '0xTokenAddress1',
        amount: '100',
        fromTokenChainId: 1,
        toTokenAddress: '0xTokenAddress2',
        toAddress: '0xReceiverAddress',
        toTokenChainId: 2,
      }),
    ).rejects.toThrow('Failed to fetch quote');
  });

  it('should throw an error when transaction creation fails', async () => {
    // Arrange
    const mockQuote = {
      fromTokenAddress: '0xTokenAddress1',
      amount: '100',
      fromTokenChainId: 1,
      toTokenAddress: '0xTokenAddress2',
      toTokenChainId: 2,
      receiverAddress: '0xReceiverAddress',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    // Act & Assert
    await expect(
      dePay.createTransaction(mockQuote, '0xReceiverAddress'),
    ).rejects.toThrow('Failed to create transaction');
  });
});
