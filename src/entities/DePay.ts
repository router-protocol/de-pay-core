// import type { DepositMeta, DeQuote, DeQuoteQueryParams, DeTransaction } from "../types/index.js";
import {
  BASE_DEPAY_QUOTE_URL,
  BASE_DEPAY_TRANSACTION_URL,
} from '../constants.js';
import { sleep } from '../utils/utils.js';

type DePayConfig = {
  quoteUrl?: string;
  transactionUrl?: string;
  partnerId: number;
};

/**
 * @title DePay
 * @notice DePay is a payment infrastructure that allows users to send and receive payments in a decentralized manner.
 */
export default class DePay {
  quoteUrl: string;
  transactionUrl: string;
  partnerId: number;

  /**
   * @notice Constructor for DePay
   * @param config - The configuration object for DePay
   */
  constructor(config: DePayConfig) {
    const { quoteUrl, transactionUrl, partnerId } = config;
    this.partnerId = partnerId;
    this.quoteUrl = quoteUrl ?? BASE_DEPAY_QUOTE_URL;
    this.transactionUrl = transactionUrl ?? BASE_DEPAY_TRANSACTION_URL;
  }

  /**
   * @notice Get a quote for a transaction
   * @param quoteQueryParams - The parameters for the quote request
   * @returns The quote data
   */
  async getQuote(quoteQueryParams: DeQuoteQueryParams) {
    try {
      const {
        fromTokenAddress,
        amount,
        fromTokenChainId,
        toTokenAddress,
        toAddress,
        toTokenChainId,
      } = quoteQueryParams;
      if (!fromTokenAddress || !amount || !fromTokenChainId) {
        throw new Error('Invalid quote data');
      }
      if (!toAddress) {
        throw new Error('Invalid sender or receiver address');
      }
      if (!toTokenAddress || !toTokenChainId) {
        throw new Error('Invalid destination token address or chain id');
      }
      const params = new URLSearchParams({
        fromTokenAddress,
        amount: amount.toString(),
        fromTokenChainId: fromTokenChainId.toString(),
        partnerId: this.partnerId.toString(),
        toTokenAddress,
        toTokenChainId: toTokenChainId.toString(),
        slippageTolerance: '1',
      });

      const url = `${this.quoteUrl}?${params.toString()}`;
      const quoteRes = await fetch(url);
      if (!quoteRes.ok) {
        throw new Error('Failed to fetch quote');
      }
      const quoteData = (await quoteRes.json()) as DeQuote;
      if (!quoteData) {
        throw new Error('Failed to fetch quote');
      }
      return quoteData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * @notice Create a transaction
   * @param quote - The quote data
   * @param receiverAddress - The receiver address
   * @param senderAddress - The sender address
   * @returns The transaction data
   */
  async createTransaction(
    quote: DeQuote,
    receiverAddress: string,
    senderAddress?: string,
  ) {
    try {
      if (!receiverAddress) {
        throw new Error('receiver address is required');
      }
      const url = `${this.transactionUrl}/transaction`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...quote,
          senderAddress: senderAddress ?? receiverAddress,
          receiverAddress: receiverAddress,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to create transaction');
      }
      const transactionData = (await res.json()) as DeTransaction;
      if (!transactionData) {
        throw new Error('Failed to fetch quote');
      }
      return transactionData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * @notice Get a quote and create a transaction
   * @param quoteQueryParams - The parameters for the quote request
   * @param receiverAddress - The receiver address
   * @param senderAddress - The sender address
   * @returns The transaction data
   */
  async getQuoteAndCreateTransaction(
    quoteQueryParams: DeQuoteQueryParams,
    receiverAddress: string,
    senderAddress?: string,
  ) {
    try {
      const quote = await this.getQuote(quoteQueryParams);
      const transaction = await this.createTransaction(quote, receiverAddress);
      return transaction;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * @notice Wait for a transaction to be confirmed
   * @param depositMeta - The deposit metadata
   * @param option - The options for the wait
   * @returns The transaction hash
   */
  async waitForTransaction(
    depositMeta: DepositMeta,
    option: { timeout: number; sleepInterval: number } = {
      timeout: 20000,
      sleepInterval: 2000,
    },
  ) {
    const startTime = Date.now();
    const { sleepInterval, timeout } = option; // 2 seconds between retries

    while (Date.now() - startTime < timeout) {
      try {
        const res = await fetch(
          `${this.transactionUrl}/txnHash?da=${depositMeta.depositAddress}`,
        );
        if (!res.ok) {
          throw new Error('Failed to fetch txn hash');
        }
        const txnHash = (await res.json()) as { txnHash: string | null };
        if (txnHash && txnHash.txnHash) {
          return txnHash;
        }
        // If txnHash is null, wait and retry
        await sleep(sleepInterval);
      } catch (error) {
        console.error('Error fetching transaction hash:', error);
        // Wait and retry on error
        await sleep(sleepInterval);
      }
    }
    throw new Error('Timeout exceeded while waiting for transaction hash');
  }
}
