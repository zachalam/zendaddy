import { headers } from "next/headers";

export function currentURL(pathname: string): URL {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";

  try {
    return new URL(pathname, `${protocol}://${host}`);
  } catch (error) {
    return new URL("http://localhost:3000");
  }
}

export function vercelURL() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
}


export function getRandomSubarray(arr: any, size: any) {
  // Handle cases where the array is too small
  if (size > arr.length) {
    throw new Error('Subarray size cannot be greater than the original array length');
  }

  // Create a copy to avoid modifying the original array
  const shuffledArr = arr.slice();

  // Fisher-Yates shuffle (modern and efficient)
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index between 0 and i (inclusive)
    [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]]; // swap elements
  }

  // Slice the first 'size' elements to get the random subarray
  return shuffledArr.slice(0, size);
}