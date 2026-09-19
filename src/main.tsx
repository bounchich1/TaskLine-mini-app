import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { MaxUI } from '@maxhub/max-ui';
import '@maxhub/max-ui/styles.css';
import './style.css';
import { App } from './App';
const client=new QueryClient({defaultOptions:{queries:{retry:1,staleTime:10000,refetchOnWindowFocus:true},mutations:{retry:false}}});
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><MaxUI><QueryClientProvider client={client}><App/></QueryClientProvider></MaxUI></React.StrictMode>);
