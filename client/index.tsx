import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import store from './store'

import App from './components/App'

const root = createRoot(document.getElementById('app') as HTMLElement)
root.render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>
)
