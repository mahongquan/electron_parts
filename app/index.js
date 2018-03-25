import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import DbMain from './components/DbMain';


render(
  <DbMain></DbMain>,
  document.getElementById('root')
);

// if (module.hot) {
//   module.hot.accept('./containers/Root', () => {
//     const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
//     render(
//       <AppContainer>
//         <NextRoot store={store} history={history} />
//       </AppContainer>,
//       document.getElementById('root')
//     );
//   });
// }
