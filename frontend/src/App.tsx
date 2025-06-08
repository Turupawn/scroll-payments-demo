import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Payments } from './components/Payments'

function App() {
  const account = useAccount()
  const { connectors, connect, error } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <h2>Wallet</h2>
        {account.status === 'connected' ? (
          <>
            <p>Connected: {account.addresses?.[0]}</p>
            <button onClick={() => disconnect()}>Disconnect</button>
          </>
        ) : (
          <>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                style={{ marginRight: '10px' }}
              >
                Connect {connector.name}
              </button>
            ))}
            {error && <p style={{ color: 'red' }}>{error.message}</p>}
          </>
        )}
      </div>

      <Payments />
    </div>
  )
}

export default App
