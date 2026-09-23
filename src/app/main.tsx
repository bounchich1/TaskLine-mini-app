import '@maxhub/max-ui/styles.css';
import '@/shared/styles/main.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { Providers } from './providers';

const root = document.getElementById('root');
if (!root) {
  throw new Error('The #root element is missing from index.html.');
}
createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
