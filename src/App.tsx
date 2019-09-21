import React from 'react';
import { } from '@blueprintjs/icons';
import { Icon } from '@blueprintjs/core';

import { IconLibrary, tick20, tick16 } from '@blueprintjs/icons';

IconLibrary.add(tick20);
IconLibrary.add(tick16);

alert(JSON.stringify(tick20));

const App = () => (
    <div>
        <Icon icon='tick' />
    </div>
);
export default App;