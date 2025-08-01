import { useMemo } from 'react';
import { Theme } from './settings/types';
import SignInPage from './components/generated/SignInPage';

let theme: Theme = 'light';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  // THIS IS WHERE THE TOP LEVEL GENRATED COMPONENT WILL BE RETURNED!
  return <SignInPage />;
}

export default App;
