import { Open_Sans, Neuton, Hind } from 'next/font/google';

export const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const neuton = Neuton({
  subsets: ["latin"],
  weight: "400",
});

export const hind = Hind({
  subsets: ["latin"],
  weight: "400"
});
