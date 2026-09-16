const AppError = require('./appError');

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

exports.validateImageBuffer = async (buffer) => {
  // file-type is an ESM dependency loaded dynamically at runtime.
  // eslint-disable-next-line import/no-unresolved
  const { fileTypeFromBuffer } = await import('file-type');
  const detected = await fileTypeFromBuffer(buffer);

  // detected is undefined if the file's signature doesn't match ANY known type
  if (!detected || !ALLOWED_IMAGE_MIMES.includes(detected.mime)) {
    throw new AppError(
      'Upload rejected: file content does not match an allowed image type (jpeg/ png/ webp).',
      400,
    );
  }

  return detected;
};
