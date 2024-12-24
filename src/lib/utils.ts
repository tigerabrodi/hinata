import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export async function handleDownload({
  url,
  imageDescription,
}: {
  url: string
  imageDescription: string
}) {
  const response = await fetch(url)
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const formattedFilename = formatImageFilename({ imageDescription })

  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `${formattedFilename}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

// Matches one or more whitespace characters (spaces, tabs, newlines)
const WHITESPACE_REGEX = /\s+/g
// Matches any character that is NOT a lowercase letter, number, or underscore
const NON_ALPHANUMERIC_UNDERSCORE_REGEX = /[^a-z0-9_]/g

export function formatImageFilename({
  imageDescription,
}: {
  imageDescription: string
}) {
  const lowercased = imageDescription.toLowerCase()
  const joinedViaUnderscore = lowercased.replace(WHITESPACE_REGEX, '_')
  const sanitized = joinedViaUnderscore.replace(
    NON_ALPHANUMERIC_UNDERSCORE_REGEX,
    ''
  )

  return sanitized
}
