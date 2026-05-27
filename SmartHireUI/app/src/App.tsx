import React from 'react'
import { Provider } from 'react-redux'
import { store } from '@store/store'
import { AppRouter } from '@navigation/AppRouter'

/**
 * Main App component
 */
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  )
}

export default App
