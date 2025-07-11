function fallbackSchedule(sessions, budget) {
  let fallback = null;

  for (let session of sessions) {
    if (session.rate <= budget) {
      if (
        !fallback ||
        session.rate > fallback.rate ||
        (session.rate == fallback.rate && session.rating > fallback.rating)
      ) {
        fallback = session;
      }
    }
  }
  if (fallback) {
    return {
      session: [fallback],
      totalCost: fallback.rate,
      totalRating: fallback.rating,
      fallbackUsed: true,
    };
  }
  return null;
}

export { fallbackSchedule };
