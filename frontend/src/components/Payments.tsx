import { useAccount, useWriteContract } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { scroll } from 'viem/chains'
import { useState, useEffect } from 'react'

const PAYMENT_PROCESSOR_ADDRESS = import.meta.env.VITE_PAYMENT_PROCESSOR_ADDRESS as `0x${string}`
const USDT_ADDRESS = '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df'

// Connect your client to Scroll Mainnet
const publicClient = createPublicClient({
  chain: scroll,
  transport: http()
})

// ABI for both the PaymentProcessor and USDT
const paymentProcessorABI = [
  {
    inputs: [],
    name: "processPurchase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "ITEM_PRICE",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

const usdtABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

// Custom hook for payment functionality
function usePayment() {
  const { address } = useAccount()
  const [itemPrice, setItemPrice] = useState<bigint | null>(null)
  const [allowance, setAllowance] = useState<bigint | null>(null)
  const { writeContract: writePaymentProcessor, isPending: isProcessing } = useWriteContract()
  const { writeContract: writeUSDT, isPending: isApproving } = useWriteContract()

  const fetchItemPrice = async () => {
    try {
      const result = await publicClient.readContract({
        address: PAYMENT_PROCESSOR_ADDRESS,
        abi: paymentProcessorABI,
        functionName: 'ITEM_PRICE',
      })
      setItemPrice(result)
    } catch (error) {
      console.error('Error reading item price:', error)
    }
  }

  const fetchAllowance = async () => {
    if (!address) return
    try {
      const result = await publicClient.readContract({
        address: USDT_ADDRESS,
        abi: usdtABI,
        functionName: 'allowance',
        args: [address, PAYMENT_PROCESSOR_ADDRESS],
      })
      setAllowance(result)
    } catch (error) {
      console.error('Error reading allowance:', error)
    }
  }

  useEffect(() => {
    fetchItemPrice()
    fetchAllowance()
  }, [address])

  const approveUSDT = () => {
    if (!itemPrice) return
    writeUSDT({
      address: USDT_ADDRESS,
      abi: usdtABI,
      functionName: 'approve',
      args: [PAYMENT_PROCESSOR_ADDRESS, itemPrice],
    }, {
      onSuccess: (txHash) => {
        publicClient.waitForTransactionReceipt({ hash: txHash })
          .then(() => fetchAllowance())
          .catch(console.error)
      },
    })
  }

  const processPurchase = () => {
    writePaymentProcessor({
      address: PAYMENT_PROCESSOR_ADDRESS,
      abi: paymentProcessorABI,
      functionName: 'processPurchase',
    }, {
      onSuccess: (txHash) => {
        publicClient.waitForTransactionReceipt({ hash: txHash })
          .then(() => fetchAllowance())
          .catch(console.error)
      },
    })
  }

  return {
    itemPrice,
    allowance,
    isProcessing,
    isApproving,
    approveUSDT,
    processPurchase,
    refreshAllowance: fetchAllowance
  }
}

// Payment Component
export function Payments() {
  const account = useAccount()
  const { 
    itemPrice, 
    allowance, 
    isProcessing, 
    isApproving, 
    approveUSDT, 
    processPurchase 
  } = usePayment()

  const needsApproval = allowance !== null && itemPrice !== null && allowance < itemPrice

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Purchase Item</h2>
      <p>Price: {itemPrice ? Number(itemPrice) / 1e6 : '...'} USDT</p>
      {account.status === 'connected' && (
        <>
          {needsApproval ? (
            <button
              onClick={approveUSDT}
              disabled={isApproving}
            >
              {isApproving ? 'Approving...' : 'Approve USDT'}
            </button>
          ) : (
            <button
              onClick={processPurchase}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Purchase Item'}
            </button>
          )}
        </>
      )}
    </div>
  )
}