function buildSchedule(sessions) {
  const results = [];

  function dfs(path, visited) {
    results.push([...path]);

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      session.index = i;

      if (visited.has(i)) continue;

      visited.add(i);
      path.push(session);

      dfs(path, visited);

      path.pop();
      visited.delete(i);
    }
  }

  dfs([], new Set());

  for (const combo of results) {
    // const formatted = combo
    //   .map((s) => `TA ${s.taId} (${s.day} ${s.start} - ${s.end})`)
    //   .join(",");

    const formatted = combo
      .map((s) => `${s.index}`)
      .join(",");
    console.log("it has been formatted", formatted);
  }
  return results;
}

export { buildSchedule };
