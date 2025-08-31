import React from 'react';

export const useD3 = (renderFn, id, options, matrix, theme, styles) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderFn(ref.current);
    return () => {};
  }, [renderFn, id, options, matrix, theme, styles]);
  return ref;
};
