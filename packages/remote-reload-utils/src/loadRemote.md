useEffect(() => {
  (async () => {
    // 加载稳定版
    const stableScope = await loadRemoteMultiVersion({
      name: "react_mf_lib",
      pkg: "react-mf-lib",
      version: "1.2.3",  // 固定版本
    });

    // 加载最新灰度版
    const betaScope = await loadRemoteMultiVersion({
      name: "react_mf_lib",
      pkg: "react-mf-lib",
      version: "latest", // 自动走灰度策略
    });

    // 从稳定版取 Button
    const StableButton = await loadRemote(`${stableScope}/Button`);
    setStableButton(() => StableButton.default);

    // 从灰度版取 Button
    const BetaButton = await loadRemote(`${betaScope}/Button`);
    setBetaButton(() => BetaButton.default);
  })();
}, []);
