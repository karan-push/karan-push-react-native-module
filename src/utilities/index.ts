/**
 * @description Contains a set of utilities to abstract several code
 * @version 1.0
 */
import FormatBody from './parseMessage';

const IPFS_BASE_URL = 'https://ipfs.io/ipfs/';
/**
 * @description extract the ipfs HASH from the name of an image i.e www.xyz.com/abc/ipfshash.jpg => ipfshash
 * @param notificationBody
 * @returns the ipfs hash extracted from the image name
 */
export function extractIPFSHashFromImageURL(imageURL: string | undefined) {
  if (!imageURL) return { type: 'http', url: '' };
  if (imageURL.includes('ipfs')) return { type: 'ipfs', url: imageURL };
  if (imageURL.includes('base64')) return { type: 'base64', url: imageURL };
  const match = imageURL.match(/(\w+).jpg/);
  const output = match ? `${IPFS_BASE_URL}${match[1]}` : '';
  return { type: 'http', url: output };
}

/**
 * @description parse and extract the timestamp from the body of the notification and remove the text from the body
 * @param notificationBody the text which would represent the body of the notification
 * @returns
 */
export function extractTimeStamp(notificationBody: string): {
  notificationBody: string;
  timeStamp: string;
  originalBody: string;
} {
  let parsedBody = {
    notificationBody: FormatBody(notificationBody),
    timeStamp: '',
    originalBody: notificationBody,
  };
  const matches = notificationBody.match(/\[timestamp:(.*?)\]/);
  if (matches) {
    parsedBody.timeStamp = matches[1] || '';
    const textWithoutTimeStamp = notificationBody.replace(
      / *\[timestamp:[^)]*\] */g,
      ''
    );
    parsedBody.notificationBody = FormatBody(textWithoutTimeStamp);
    parsedBody.originalBody = textWithoutTimeStamp;
  }
  return parsedBody;
}

export async function httpRequest(
  url: RequestInfo,
  options?: RequestInit
): Promise<Response> {
  const { body, ...customConfig } = options ?? {};
  const headers = { 'Content-Type': 'application/json' };
  const config: RequestInit = {
    method: options?.method,
    ...customConfig,
    headers: {
      ...(body ? headers : {}),
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let data!: Response;
  try {
    const response = await fetch(url, config);
    data = await response.json();
    if (response.ok) {
      return data;
    }
    throw new Error(response.statusText);
  } catch (err: any) {
    return Promise.reject(err.message ? err.message : data);
  }
}
