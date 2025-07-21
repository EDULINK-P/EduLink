const verifySession = (req, res, next) => {
  if(!req.session.userId) {
    return res.status(401).send('You must be logged in to view this page.');
  }
  next();
};


export default verifySession;
