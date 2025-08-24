// import React, { useEffect, useRef } from 'react';
// import { loadRemote } from '@module-federation/runtime';
// import { loadReactVersion } from './loadReactVersion';

// interface RemoteReactProps {
//   remote: string;       // remote name
//   expose: string;       // exposed module, e.g. "./Button"
//   reactVersion: '17' | '18' | '19';
//   props?: Record<string, any>;
// }

// export function RemoteReact({ remote, expose, reactVersion, props }: RemoteReactProps) {
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     let root: any;
//     (async () => {
//       const { React, ReactDOM } = await loadReactVersion(reactVersion);
//       const mod = await loadRemote(`${remote}${expose}`);
//       const Comp = mod?.default;

//       if (ref.current && Comp) {
//         if (reactVersion === '18' || reactVersion === '19') {
//           root = ReactDOM.createRoot(ref.current);
//           root.render(React.createElement(Comp, props));
//         } else {
//           ReactDOM.render(React.createElement(Comp, props), ref.current);
//         }
//       }
//     })();

//     return () => {
//       if (root && root.unmount) root.unmount();
//       else if (ref.current) ref.current.innerHTML = '';
//     };
//   }, [remote, expose, reactVersion, props]);

//   return <div ref={ref} />;
// }
