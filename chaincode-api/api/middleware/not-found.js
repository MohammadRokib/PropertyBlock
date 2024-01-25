const notFound = (req, res) => {
    res.status(404).json({ success: false, msg: 'Route does not exist' });
};

module.exports = notFound;
