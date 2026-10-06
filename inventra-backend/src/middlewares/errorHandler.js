const multer = require('multer');

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (process.env.NODE_ENV !== 'production') console.error('Error:', err.message);

  const send = (status, message) => res.status(status).json({ success: false, message });

  if (err instanceof multer.MulterError) {
    return send(400, err.code === 'LIMIT_FILE_SIZE'
      ? 'File size too large! Maximum allowed size is 2MB per image.'
      : err.message);
  }
  if (err.code === '23505') return send(409, 'Duplicate record! A record with this SKU, name or email already exists.');
  if (err.code === '23503') return send(400, 'Invalid reference: the selected category or supplier does not exist.');
  if (err.code === '23514') return send(400, 'A value violates a database rule (e.g. negative price or stock).');
  if (err.code === '22P02') return send(400, 'Invalid ID or value format.');
  if (err.type === 'entity.parse.failed') return send(400, 'Malformed JSON body.');

  const status = err.status || 500;
  send(status, status === 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message || 'Internal Server Error');
};

module.exports = errorHandler;
