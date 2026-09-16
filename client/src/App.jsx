import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [selectedView, setSelectedView] = useState('player_prices')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [message, setMessage] = useState('')

  // Load data when view changes
  useEffect(() => {
    loadData()
  }, [selectedView])

  const loadData = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      let endpoint = ''
      
      switch (selectedView) {
        case 'player_prices':
          endpoint = '/api/prices'
          break
        case 'player_projections':
          endpoint = '/api/projections'
          break
        default:
          endpoint = '/api/prices'
      }
      
      const response = await axios.get(endpoint)
      setData(response.data)
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrices = async () => {
    setFetchingData(true)
    setMessage('Fetching prices from Fantasy Nerds API...')
    
    try {
      const response = await axios.post('/api/prices/fetch')
      setMessage(response.data.message + ` (${response.data.count} players)`)
      
      // Reload data if we're viewing prices
      if (selectedView === 'player_prices') {
        await loadData()
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
      setMessage('Error fetching prices: ' + error.message)
    } finally {
      setFetchingData(false)
    }
  }

  const generateProjections = async () => {
    setFetchingData(true)
    setMessage('Generating projections...')
    
    try {
      const response = await axios.post('/api/projections/generate')
      setMessage(response.data.message + ` (${response.data.count} players)`)
      
      // Reload data if we're viewing projections
      if (selectedView === 'player_projections') {
        await loadData()
      }
    } catch (error) {
      console.error('Error generating projections:', error)
      setMessage('Error generating projections: ' + error.message)
    } finally {
      setFetchingData(false)
    }
  }

  const renderTable = () => {
    if (loading) {
      return <div className="loading">Loading...</div>
    }

    if (data.length === 0) {
      return <div className="no-data">No data available. Click "Fetch" buttons to load data.</div>
    }

    switch (selectedView) {
      case 'player_prices':
        return renderPricesTable()
      case 'player_projections':
        return renderProjectionsTable()
      default:
        return <div>Select a view</div>
    }
  }

  const renderPricesTable = () => (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Team</th>
            <th>Position</th>
            <th>Opponent</th>
            <th>Platform</th>
            <th>Salary</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, idx) => (
            <tr key={idx}>
              <td>{player.playerName}</td>
              <td>{player.team}</td>
              <td>{player.position}</td>
              <td>{player.opponent}</td>
              <td>{player.platform}</td>
              <td>${player.salary?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderProjectionsTable = () => (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Team</th>
            <th>Position</th>
            <th>Opponent</th>
            <th>Projected Pts</th>
            <th>FanDuel Salary</th>
            <th>FanDuel Value</th>
            <th>Yahoo Salary</th>
            <th>Yahoo Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, idx) => (
            <tr key={idx}>
              <td>{player.playerName}</td>
              <td>{player.team}</td>
              <td>{player.position}</td>
              <td>{player.opponent}</td>
              <td><strong>{player.projectedPoints?.toFixed(1)}</strong></td>
              <td>{player.fanduelSalary ? `$${player.fanduelSalary.toLocaleString()}` : '-'}</td>
              <td>{player.fanduelValue ? player.fanduelValue.toFixed(2) : '-'}</td>
              <td>{player.yahooSalary ? `$${player.yahooSalary.toLocaleString()}` : '-'}</td>
              <td>{player.yahooValue ? player.yahooValue.toFixed(2) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="App">
      <header className="header">
        <h1>DFS Projections</h1>
        <p>NFL Daily Fantasy Sports Projections based on Betting Odds</p>
      </header>

      <div className="controls">
        <div className="view-selector">
          <label htmlFor="view-select">View: </label>
          <select 
            id="view-select"
            value={selectedView} 
            onChange={(e) => setSelectedView(e.target.value)}
          >
            <option value="player_prices">Player Prices</option>
            <option value="player_projections">Player Projections</option>
          </select>
        </div>

        <div className="fetch-buttons">
          <button 
            onClick={fetchPrices} 
            disabled={fetchingData}
            className="fetch-btn"
          >
            Fetch Prices
          </button>
          <button 
            onClick={generateProjections} 
            disabled={fetchingData}
            className="fetch-btn generate-btn"
          >
            Generate Projections
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="content">
        {renderTable()}
      </div>
    </div>
  )
}

export default App

