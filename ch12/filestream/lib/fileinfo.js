// fetch file information
import { constants as fsConstants } from 'fs';
import { access, stat } from 'fs/promises';

export async function getFileInfo(file) {

  const fileInfo = {};

  try {
    const info = await stat(file);
    fileInfo.isFile = info.isFile();
    fileInfo.isDir = info.isDirectory();
  }
  catch (e) {
    return { new: true };
  }

  try {
    await access(file, fsConstants.R_OK);
    fileInfo.canRead = true;
  }
  catch (e) {}

  try {
    await access(file, fsConstants.W_OK);
    fileInfo.canWrite = true;
  }
  catch (e) {}

  return fileInfo;

}
